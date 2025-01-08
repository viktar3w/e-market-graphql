import { loadTypedefsSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { print } from "graphql";
import path from "path";
const schemaPath = path.join(process.cwd(), "lib", "graphql", "schema", "schema.graphql");
const loadedSchema = loadTypedefsSync(schemaPath, {
  loaders: [new GraphQLFileLoader()],
});

const typeDefs = loadedSchema
  .filter((s) => !!s?.document)
  .map((source) => print(source.document!))
  .join("\n");

export default typeDefs;
