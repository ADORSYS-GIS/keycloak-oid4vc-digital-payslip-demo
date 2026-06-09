type RuntimeConfigKey =
  | 'VITE_API_BASE_URL'
  | 'VITE_KEYCLOAK_URL'
  | 'VITE_KEYCLOAK_REALM'
  | 'VITE_KEYCLOAK_CLIENT_ID'
  | 'VITE_KEYCLOAK_CLIENT_SECRET'
  | 'VITE_KEYCLOAK_USERNAME'
  | 'VITE_KEYCLOAK_USER_PASSWORD'
  | 'VITE_OID4VC_DEFAULT_CREDENTIAL_CONFIGURATION_ID';

type RuntimeConfig = Partial<Record<RuntimeConfigKey, string>>;

declare global {
  interface Window {
    runtimeConfig?: RuntimeConfig;
  }
}

export function getRuntimeConfig(key: RuntimeConfigKey, fallback = ''): string {
  return (
    window.runtimeConfig?.[key] ??
    (import.meta.env as Record<string, string | undefined>)[key] ??
    fallback
  );
}
