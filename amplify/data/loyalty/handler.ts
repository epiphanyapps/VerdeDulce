import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/loyalty";
import type { Schema } from "../resource";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

/**
 * `authMode: "iam"` is not optional here. The schema's default mode is
 * `userPool`, which a Lambda has no token for — without the override every call
 * below fails as unauthorized. The function's IAM access comes from
 * `allow.resource(loyalty)` on the schema.
 */
const client = generateClient<Schema>({ authMode: "iam" });

/** Stamps needed for a free salad, counting the welcome stamp. */
export const STAMP_GOAL = 10;

/**
 * The endowed-progress stamp, given at sign-up. It is what makes the published
 * promise literally true: with one stamp already on the card, the customer buys
 * nine salads and the tenth is free.
 */
const WELCOME_STAMPS = 1;

/**
 * Deliberately excludes 0/O, 1/I/L, 2/Z, 5/S and 8/B — the code gets read off a
 * phone screen and typed by staff mid-service, so the ambiguous glyphs cost
 * more than the lost entropy. 24^6 is ~191M, ample for one shop.
 */
const CODE_ALPHABET = "ACDEFGHJKMNPQRTUVWXY3469";
const CODE_LENGTH = 6;

function mintCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/**
 * AppSync's Cognito identity. Typed locally rather than pulled from
 * @types/aws-lambda, which is not a dependency of the backend package.
 */
type CognitoIdentity = {
  sub?: string;
  username?: string;
  claims?: Record<string, unknown>;
  groups?: string[] | null;
};

/**
 * `fieldName` sits at the top level of the event Amplify hands a
 * `a.handler.function()` resolver — not under `info`, which is the shape a
 * direct Lambda resolver gets and is `undefined` here. Reading the wrong one
 * threw `Cannot destructure property 'fieldName' of 'e.info'` on the first
 * line of every invocation, so the loyalty page could never open a card.
 *
 * Both are declared, and `resolveField` prefers the real one while still
 * accepting `info`, so this keeps working if the event shape is ever
 * normalised toward the AppSync standard.
 */
type LoyaltyEvent = {
  fieldName?: string;
  typeName?: string;
  info?: { fieldName?: string };
  arguments: { memberCode?: string; note?: string };
  identity?: CognitoIdentity;
};

function resolveField(event: LoyaltyEvent): string {
  const field = event.fieldName ?? event.info?.fieldName;
  if (!field) {
    // Keys only — the event carries the caller's email in its identity claims.
    throw new Error(
      `Could not determine the resolver field from event keys: ${Object.keys(event).join(", ")}`,
    );
  }
  return field;
}

type Card = Schema["LoyaltyCard"]["type"];

/** Surfaces the underlying GraphQL error instead of a bare "null" to the client. */
function unwrap<T>(result: { data?: T | null; errors?: { message: string }[] }, what: string): T {
  if (result.errors?.length) {
    throw new Error(`${what}: ${result.errors.map((e) => e.message).join("; ")}`);
  }
  if (!result.data) throw new Error(`${what}: no data returned`);
  return result.data;
}

async function findByCode(memberCode: string): Promise<Card> {
  const found = await client.models.LoyaltyCard.listCardByMemberCode({ memberCode });
  const card = unwrap(found, "card lookup")[0];
  if (!card) throw new Error(`No loyalty card with code ${memberCode}`);
  return card;
}

async function ensureCard(identity: CognitoIdentity | undefined): Promise<Card> {
  const sub = identity?.sub;
  if (!sub) throw new Error("ensureLoyaltyCard requires a signed-in caller");

  const existing = await client.models.LoyaltyCard.get({ customerSub: sub });
  if (existing.data) return existing.data;

  const email = typeof identity?.claims?.email === "string" ? identity.claims.email : undefined;

  // A collision is a ~1-in-191M event, but it would silently attach a second
  // customer to somebody else's card, so it is checked rather than assumed.
  let memberCode = mintCode();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const clash = await client.models.LoyaltyCard.listCardByMemberCode({ memberCode });
    if (!clash.data?.length) break;
    memberCode = mintCode();
  }

  const created = unwrap(
    await client.models.LoyaltyCard.create({
      customerSub: sub,
      memberCode,
      email,
      stamps: WELCOME_STAMPS,
      rewardsRedeemed: 0,
      lastStampAt: new Date().toISOString(),
    }),
    "card create",
  );

  await client.models.LoyaltyStamp.create({
    customerSub: sub,
    memberCode,
    kind: "WELCOME",
  });

  return created;
}

async function punch(memberCode: string, note: string | undefined, identity: CognitoIdentity | undefined): Promise<Card> {
  const card = await findByCode(memberCode);

  // The card is already full — the next staff action is a redemption, not
  // another stamp. Punching on would quietly discard the reward they earned.
  if (card.stamps >= STAMP_GOAL) return card;

  const updated = unwrap(
    await client.models.LoyaltyCard.update({
      customerSub: card.customerSub,
      stamps: card.stamps + 1,
      lastStampAt: new Date().toISOString(),
    }),
    "card punch",
  );

  await client.models.LoyaltyStamp.create({
    customerSub: card.customerSub,
    memberCode: card.memberCode,
    kind: "EARNED",
    note,
    staffEmail: typeof identity?.claims?.email === "string" ? identity.claims.email : undefined,
  });

  return updated;
}

async function redeem(memberCode: string, identity: CognitoIdentity | undefined): Promise<Card> {
  const card = await findByCode(memberCode);
  if (card.stamps < STAMP_GOAL) {
    throw new Error(`Card ${memberCode} has ${card.stamps} of ${STAMP_GOAL} stamps`);
  }

  const updated = unwrap(
    await client.models.LoyaltyCard.update({
      customerSub: card.customerSub,
      stamps: 0,
      rewardsRedeemed: card.rewardsRedeemed + 1,
      lastStampAt: new Date().toISOString(),
    }),
    "card redeem",
  );

  await client.models.LoyaltyStamp.create({
    customerSub: card.customerSub,
    memberCode: card.memberCode,
    kind: "REDEEMED",
    staffEmail: typeof identity?.claims?.email === "string" ? identity.claims.email : undefined,
  });

  return updated;
}

/**
 * One function serves all three mutations, so it dispatches on the field name
 * rather than taking a per-field handler type.
 */
export const handler = async (event: LoyaltyEvent): Promise<Card> => {
  const fieldName = resolveField(event);

  switch (fieldName) {
    case "ensureLoyaltyCard":
      return ensureCard(event.identity);
    case "punchLoyaltyCard":
      return punch(event.arguments.memberCode!, event.arguments.note ?? undefined, event.identity);
    case "redeemLoyaltyReward":
      return redeem(event.arguments.memberCode!, event.identity);
    default:
      throw new Error(`Unhandled field ${fieldName}`);
  }
};
