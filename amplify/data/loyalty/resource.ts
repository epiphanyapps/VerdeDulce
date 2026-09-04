import { defineFunction } from "@aws-amplify/backend";

/**
 * The only principal allowed to write loyalty data.
 *
 * `resourceGroupName: "data"` puts the function in the data stack. It has to
 * be there: the schema references the function as a resolver *and* the
 * function is granted access to the schema's models, which across two stacks
 * is a circular CloudFormation dependency.
 */
export const loyalty = defineFunction({
  name: "loyalty",
  entry: "./handler.ts",
  resourceGroupName: "data",
  timeoutSeconds: 30,
});
