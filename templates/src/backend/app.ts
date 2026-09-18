import { AppsScript, type InferAppsScript } from "@gasboost/app";
import {
  AuthenticatedInput,
  authentication,
  type AuthState,
  handlers,
} from "@gasboost/auth-app";
import { auth } from "./lib/auth";
import { db, spreadsheetId } from "./lib/db";

const app = new AppsScript<AuthState>()
  .get(() => {
    const template = HtmlService.createTemplateFromFile("index");
    template.dbId = spreadsheetId;
    return template.evaluate().setTitle("gasboost Setup");
  })
  .calls(handlers(auth))

  .call("setup", (_input, context) => {
    const isSetupCompleted =
      PropertiesService.getScriptProperties().getProperty("setupCompleted");
    if (isSetupCompleted) {
      Logger.log("Setup already completed");
      return;
    }

    db.migrate();

    // チュートリアルでDBにユーザーのIDを入れたいけど、まだサインアップしてないからできない、、、
    db.table("tutorial").upsert([
      {
        id: Utilities.getUuid(),
        userId: Utilities.getUuid(),
        step: 1,
        task: "initialization",
        description: "Database migration",
        completed: true,
        completedAt: new Date(),
      },
    ]);

    PropertiesService.getScriptProperties().setProperty(
      "setupCompleted",
      "true",
    );
  })
  .use(authentication(auth))
  .call("initializeTutorial", (_input, context) => {
    const session = context.state.get("session");

    db.table("tutorial").upsert([
      {
        id: Utilities.getUuid(),
        userId: session.userId,
        step: 1,
        task: "initialization",
        description: "Database migration",
        completed: true,
        completedAt: new Date(),
      },
    ]);
  })
  .call(
    "completeTask",
    (input: AuthenticatedInput<{ id: string }>, context) => {
      const session = context.state.get("session");

      const task = db
        .table("tutorial")
        .find(db.query("tutorial").and("id", "=", [input.id]))[0];

      if (!task) {
        throw new Error("Task not found");
      }

      db.table("tutorial").update([
        {
          ...task,
          completed: true,
          completedAt: new Date(),
        },
      ]);
    },
  );

export default app;

export type AppType = InferAppsScript<typeof app>;
