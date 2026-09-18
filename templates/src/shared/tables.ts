import { createAuthTables } from "@gasboost/auth";
import { defineTable } from "@gasboost/table";
import { z } from "zod";

export const authTables = createAuthTables();

export const tutorialTable = defineTable({
  name: "tutorial",
  schema: z.object({
    id: z.string(),
    userId: z.string(),
    step: z.number(),
    task: z.string(),
    description: z.string().optional(),
    completed: z.boolean().default(false),
    completedAt: z.date().optional(),
  }),
  primaryKey: "id",
});

export const appTables = {
  tutorial: tutorialTable,
};
