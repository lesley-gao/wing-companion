/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SIGNALR_HUB_URL?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_ENABLE_DEBUG?: string;
  readonly VITE_ENABLE_MOCK_DATA?: string;
  readonly VITE_CDN_BASE_URL?: string;
  readonly VITE_CDN_STATIC_ASSETS_URL?: string;
  readonly VITE_CDN_APP_URL?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 