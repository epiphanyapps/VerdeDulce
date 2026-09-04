import type { PreSignUpTriggerHandler } from "aws-lambda";
import {
  AdminLinkProviderForUserCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type UserType,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({});

/**
 * Providers whose asserted email address is trusted enough to take over an
 * existing account.
 *
 * Linking on an email match alone is an account-takeover primitive: anyone who
 * can make a provider assert `someone-elses@address` inherits that account,
 * including its group membership. Only providers that verify ownership of the
 * address belong here, and adding one is a security decision, not a
 * configuration change.
 *
 * The names are Cognito's provider names, which prefix the federated username.
 */
const PROVIDERS_THAT_VERIFY_EMAIL = new Set(["Google", "SignInWithApple"]);

/**
 * Links a federated sign-in to an existing native account with the same email.
 *
 * Cognito does not do this on its own. Someone who registered with a password
 * and later chooses "Sign in with Google" is otherwise created as a second
 * user, with a different `sub` — which means a second, empty loyalty record and
 * an order history split across two accounts they cannot see.
 *
 * The link has to happen here, before the user is created: once two accounts
 * exist there is no supported way to merge them.
 */
export const handler: PreSignUpTriggerHandler = async (event) => {
  // Native email sign-ups are untouched — there is nothing to link them to.
  if (event.triggerSource !== "PreSignUp_ExternalProvider") {
    return event;
  }

  const email = event.request.userAttributes.email;
  if (!email) {
    // No email means no way to match an existing account. Let the sign-up
    // through as a new user rather than blocking it.
    return event;
  }

  // Cognito passes mapped IdP claims as strings, so this is "true", not true.
  // An unverified address proves nothing about who is signing in: without this
  // check, registering with a provider under a victim's address would silently
  // hand over their account. Falling through creates a separate new user, which
  // is the safe outcome.
  if (event.request.userAttributes.email_verified !== "true") {
    return event;
  }

  // `userName` for a federated sign-up is "<Provider>_<subject>", e.g.
  // "Google_11223344556677889900".
  const separator = event.userName.indexOf("_");
  if (separator < 1) return event;
  const providerName = event.userName.slice(0, separator);
  const providerUserId = event.userName.slice(separator + 1);

  // A provider added later must be reviewed and added deliberately, rather than
  // inheriting the ability to link into existing accounts by default.
  if (!PROVIDERS_THAT_VERIFY_EMAIL.has(providerName)) {
    return event;
  }

  // The pool id arrives on the event, so the function needs no configuration
  // and no environment variable to keep in sync.
  const userPoolId = event.userPoolId;

  const existing = await findNativeUserByEmail(userPoolId, email);
  if (!existing?.Username) {
    // First time this person has signed in at all — nothing to link.
    return event;
  }

  await cognito.send(
    new AdminLinkProviderForUserCommand({
      UserPoolId: userPoolId,
      // The account that already exists and owns the history.
      DestinationUser: {
        ProviderName: "Cognito",
        ProviderAttributeValue: existing.Username,
      },
      // The federated identity being attached to it.
      SourceUser: {
        ProviderName: providerName,
        ProviderAttributeName: "Cognito_Subject",
        ProviderAttributeValue: providerUserId,
      },
    }),
  );

  // Safe only because both sides of the link are verified: the destination
  // account verified this address when it was created, and the checks above
  // established that the provider asserts the same verified address.
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  return event;
};

/**
 * Finds a *native* Cognito user with this email.
 *
 * Users created by a previous federated sign-in are skipped: linking a
 * federated identity to another federated identity is not supported, and
 * attempting it fails the sign-in rather than degrading quietly.
 */
async function findNativeUserByEmail(
  userPoolId: string,
  email: string,
): Promise<UserType | undefined> {
  const { Users = [] } = await cognito.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      // Quoting matters — an unquoted filter breaks on the "@".
      Filter: `email = "${email.replace(/"/g, '\\"')}"`,
      Limit: 10,
    }),
  );

  return Users.find((user) => {
    // Federated users are named "<Provider>_<subject>"; native ones are a UUID.
    const identities = user.Attributes?.find((a) => a.Name === "identities");
    return !identities;
  });
}
