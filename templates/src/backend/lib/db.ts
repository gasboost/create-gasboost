import { SheetDB, SheetGateway, SheetTable } from "@gasboost/sheetorm";
import { appTables, authTables } from "../../shared/tables";

export const spreadsheetId = SpreadsheetApp.getActive().getId();

export const userTable = new SheetTable({
  ...authTables.user,
  dbId: spreadsheetId,
});

export const accountTable = new SheetTable({
  ...authTables.account,
  dbId: spreadsheetId,
});

export const passwordResetTable = new SheetTable({
  ...authTables.passwordReset,
  dbId: spreadsheetId,
});

export const tutorialSheetTable = new SheetTable({
  ...appTables.tutorial,
  dbId: spreadsheetId,
  autoNumbering: "uuid",
});

const tables = [
  userTable,
  accountTable,
  passwordResetTable,
  tutorialSheetTable,
] as const;

export const db = new SheetDB({
  tables: tables,
  gateway: new SheetGateway(Sheets!),
  cacheService: CacheService,
  utilities: Utilities,
});

export type DB = typeof db;
