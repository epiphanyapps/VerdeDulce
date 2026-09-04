import { generateClient } from "aws-amplify/api";

/**
 * Loyalty data access.
 *
 * The operations are written out by hand rather than generated from the
 * backend's `Schema` type. `web/` is its own pnpm workspace and does not carry
 * `@aws-amplify/backend`, so importing `../../amplify/data/resource` would drag
 * a dependency the web build cannot resolve. The trade is that these documents
 * and the types below have to be kept in step with `amplify/data/resource.ts`
 * by hand — that file is the source of truth.
 */

/** Stamps for a free salad, including the welcome stamp. Mirrors STAMP_GOAL in the handler. */
export const STAMP_GOAL = 10;

export type StampKind = "WELCOME" | "EARNED" | "REDEEMED";

export type LoyaltyCard = {
  customerSub: string;
  memberCode: string;
  email: string | null;
  stamps: number;
  rewardsRedeemed: number;
  lastStampAt: string | null;
};

export type LoyaltyStamp = {
  id: string;
  kind: StampKind | null;
  note: string | null;
  staffEmail: string | null;
  createdAt: string;
};

const CARD_FIELDS = `customerSub memberCode email stamps rewardsRedeemed lastStampAt`;
const STAMP_FIELDS = `id kind note staffEmail createdAt`;

const ENSURE_CARD = `mutation EnsureLoyaltyCard { ensureLoyaltyCard { ${CARD_FIELDS} } }`;

const CARD_BY_CODE = `query CardByCode($memberCode: String!) {
  listCardByMemberCode(memberCode: $memberCode) { items { ${CARD_FIELDS} } }
}`;

const STAMPS_BY_CUSTOMER = `query StampsByCustomer($customerSub: ID!) {
  listStampsByCustomer(customerSub: $customerSub, limit: 60) { items { ${STAMP_FIELDS} } }
}`;

const PUNCH = `mutation Punch($memberCode: String!, $note: String) {
  punchLoyaltyCard(memberCode: $memberCode, note: $note) { ${CARD_FIELDS} }
}`;

const REDEEM = `mutation Redeem($memberCode: String!) {
  redeemLoyaltyReward(memberCode: $memberCode) { ${CARD_FIELDS} }
}`;

/**
 * `client.graphql` is typed as a union covering subscriptions, so every call
 * needs narrowing. Doing it once here keeps the cast out of the components,
 * and turns a GraphQL `errors` array into a thrown Error so callers only have
 * one failure path to handle.
 */
async function run<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const client = generateClient();
  const result = (await client.graphql({ query, variables })) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join("; "));
  }
  if (!result.data) throw new Error("No data returned");
  return result.data;
}

/** Idempotent — opens the card with its welcome stamp on first call. */
export async function ensureCard(): Promise<LoyaltyCard> {
  const data = await run<{ ensureLoyaltyCard: LoyaltyCard }>(ENSURE_CARD);
  return data.ensureLoyaltyCard;
}

export async function findCardByCode(memberCode: string): Promise<LoyaltyCard | null> {
  const data = await run<{ listCardByMemberCode: { items: LoyaltyCard[] } }>(CARD_BY_CODE, {
    memberCode,
  });
  return data.listCardByMemberCode.items[0] ?? null;
}

/** Newest first. The index has no sort key, so ordering happens here. */
export async function listStamps(customerSub: string): Promise<LoyaltyStamp[]> {
  const data = await run<{ listStampsByCustomer: { items: LoyaltyStamp[] } }>(
    STAMPS_BY_CUSTOMER,
    { customerSub },
  );
  return [...data.listStampsByCustomer.items].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function punchCard(memberCode: string, note?: string): Promise<LoyaltyCard> {
  const data = await run<{ punchLoyaltyCard: LoyaltyCard }>(PUNCH, {
    memberCode,
    note: note?.trim() || null,
  });
  return data.punchLoyaltyCard;
}

export async function redeemReward(memberCode: string): Promise<LoyaltyCard> {
  const data = await run<{ redeemLoyaltyReward: LoyaltyCard }>(REDEEM, { memberCode });
  return data.redeemLoyaltyReward;
}

/** Codes are minted from an unambiguous alphabet; accept either case on entry. */
export function normalizeMemberCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
