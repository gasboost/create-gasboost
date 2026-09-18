import { column, eq, principal, RowLevelSecurity } from "@gasboost/rls";
import { z } from "zod";
import { tutorialTable } from "../../shared/tables";

export const principalSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const tutorialRls = new RowLevelSecurity({
  table: tutorialTable,

  select: {
    using: eq(
      column(tutorialTable, "userId"),
      principal(principalSchema, "id"),
    ),
  },
});
