/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_OWNDATA_API_URL: string
  readonly VITE_OWNDATA_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
