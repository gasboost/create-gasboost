/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_PROJECT_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
