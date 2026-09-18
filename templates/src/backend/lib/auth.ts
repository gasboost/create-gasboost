import { AppsScriptAuth } from "@gasboost/auth";
import { SheetOrmAuthRepository } from "@gasboost/auth-sheetorm";
import { authTables } from "../../shared/tables";
import { db } from "./db";
import { firebase } from "./firebase";

const repository = new SheetOrmAuthRepository({
  db: db,
  schema: authTables.schema,
});

export const auth = new AppsScriptAuth({
  repository,
  appsScript: {
    enabled: true,
    isSignupEnabled: true,
  },
  runtime: {
    cacheService: CacheService,
    propertiesService: PropertiesService,
    session: Session,
    utilities: Utilities,
  },
  session: {
    storageType: "cache",
  },
  hooks: {
    afterSignIn: firebase.afterSignIn,
  },
});
