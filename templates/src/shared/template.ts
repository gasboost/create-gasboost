export type Template = {
  dbId: string;
  schema: string;
  sheetName: string;
};

declare global {
  interface Window {
    __Template__: Template;
  }
}
