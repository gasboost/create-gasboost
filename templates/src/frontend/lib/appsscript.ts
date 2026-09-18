import { appsScriptClient } from "@gasboost/client";
import { AppType } from "../../backend/app";
import { Template } from "../../shared/template";

export const client = appsScriptClient<AppType>();

export const template: Template = {
  dbId: window.__Template__.dbId,
  schema: window.__Template__.schema,
  sheetName: window.__Template__.sheetName,
};
