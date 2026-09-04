import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { loyalty } from "./loyalty/resource";

/**
 * Loyalty program data.
 *
 * The central rule here: **no client can write a stamp.** Both models are
 * read-only to every caller, and every mutation goes through the `loyalty`
 * Lambda, which is the only principal with write access (granted at the schema
 * level by `allow.resource` — Amplify does not allow function access to be
 * configured per-model). Without that, a customer holding a valid Cognito token
 * could simply call `LoyaltyCard.update` and hand themselves a free salad.
 */
const schema = a
  .schema({
    /**
     * One card per customer, keyed by the Cognito `sub` so the customer's own
     * card is a primary-key lookup rather than a scan. `memberCode` is the
     * short human-readable string the customer shows at the counter; it gets a
     * secondary index because that is how staff find the card.
     */
    LoyaltyCard: a
      .model({
        customerSub: a.id().required(),
        memberCode: a.string().required(),
        email: a.string(),
        /** Stamps on the current card, 0..STAMP_GOAL. Reset on redemption. */
        stamps: a.integer().required(),
        /** Completed cards, kept across resets so the history is not lost. */
        rewardsRedeemed: a.integer().required(),
        lastStampAt: a.datetime(),
      })
      .identifier(["customerSub"])
      .secondaryIndexes((index) => [
        index("memberCode").queryField("listCardByMemberCode"),
      ])
      .authorization((allow) => [
        // `identityClaim("sub")` is required: the default owner claim is
        // `sub::username`, which never equals the bare sub stored here.
        allow.ownerDefinedIn("customerSub").identityClaim("sub").to(["read"]),
        // Staff need to look a card up by code before punching it.
        allow.groups(["ADMINS", "EDITORS"]).to(["read"]),
      ]),

    /**
     * Append-only audit trail. This is what makes the count trustworthy — the
     * customer can see when each stamp was given and by whom, which a bare
     * counter cannot show.
     */
    LoyaltyStamp: a
      .model({
        customerSub: a.id().required(),
        memberCode: a.string().required(),
        kind: a.enum(["WELCOME", "EARNED", "REDEEMED"]),
        note: a.string(),
        /** The staff account that issued it; empty for WELCOME. */
        staffEmail: a.string(),
      })
      .secondaryIndexes((index) => [
        index("customerSub").queryField("listStampsByCustomer"),
      ])
      .authorization((allow) => [
        allow.ownerDefinedIn("customerSub").identityClaim("sub").to(["read"]),
        allow.groups(["ADMINS", "EDITORS"]).to(["read"]),
      ]),

    /**
     * Called by the loyalty page on first visit. Idempotent: returns the
     * existing card if there is one, otherwise mints a member code and opens a
     * card with the welcome stamp already on it.
     */
    ensureLoyaltyCard: a
      .mutation()
      .returns(a.ref("LoyaltyCard"))
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(loyalty)),

    /** Staff action: add one stamp to the card holding `memberCode`. */
    punchLoyaltyCard: a
      .mutation()
      .arguments({ memberCode: a.string().required(), note: a.string() })
      .returns(a.ref("LoyaltyCard"))
      .authorization((allow) => [allow.groups(["ADMINS", "EDITORS"])])
      .handler(a.handler.function(loyalty)),

    /** Staff action: hand over the free salad and reset the card. */
    redeemLoyaltyReward: a
      .mutation()
      .arguments({ memberCode: a.string().required() })
      .returns(a.ref("LoyaltyCard"))
      .authorization((allow) => [allow.groups(["ADMINS", "EDITORS"])])
      .handler(a.handler.function(loyalty)),
  })
  .authorization((allow) => [allow.resource(loyalty)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: { defaultAuthorizationMode: "userPool" },
});
