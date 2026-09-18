import { SheetsStub, SpreadsheetAppStub } from "@gasboost/sheetorm";
import { gasboost } from "@gasboost/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const { build, dev } = gasboost({
  entry: "src/backend/app.ts",
  envDir: ".",
  template: {
    variables: JSON.stringify({
      dbId: "dummy-spreadsheet-id",
      schema: "dummy-schema",
      sheetName: "dummy-sheet-name",
    }),
  },
  runtime: {
    SpreadsheetApp: SpreadsheetAppStub,
    Sheets: SheetsStub,
  },
});

export default defineConfig(({ mode }) => {
  if (mode === "server") {
    return {
      plugins: [build],
      build: {
        outDir: "dist",
        emptyOutDir: false,
      },
    };
  }

  return {
    plugins: [react(), viteSingleFile(), dev],
    build: {
      outDir: "dist",
    },
  };
});
