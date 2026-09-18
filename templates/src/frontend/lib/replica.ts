import { createReplica } from "@gasboost/replica";
import { appTables, authTables } from "../../shared/tables";

const tables = [
  appTables.tutorial,
  authTables.user,
  authTables.account,
  authTables.passwordReset,
] as const;

export const replica = createReplica({
  name: "create-gasboost",
  tables: tables,
});
