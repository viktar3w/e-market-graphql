import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "lib/graphql/schema/schema.graphql",
  documents: "documents/graphql/**/*.graphql",
  generates: {
    "documents/generates/hooks/apollo.ts": {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true
      }
    },
  },
};

export default config;
