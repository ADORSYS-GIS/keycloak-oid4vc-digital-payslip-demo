#!/bin/sh
set -eu

str_escape() {
  jq -n --arg v "${1:-}" '$v'
}

cat <<EOF > /usr/share/nginx/html/assets/runtime-config.js
window.runtimeConfig = {
  VITE_API_BASE_URL: $(str_escape "${VITE_API_BASE_URL:-}"),
  VITE_KEYCLOAK_URL: $(str_escape "${VITE_KEYCLOAK_URL:-}"),
  VITE_KEYCLOAK_REALM: $(str_escape "${VITE_KEYCLOAK_REALM:-}"),
  VITE_KEYCLOAK_CLIENT_ID: $(str_escape "${VITE_KEYCLOAK_CLIENT_ID:-}"),
  VITE_OID4VC_DEFAULT_CREDENTIAL_CONFIGURATION_ID: $(str_escape "${VITE_OID4VC_DEFAULT_CREDENTIAL_CONFIGURATION_ID:-}")
};
EOF

exec "$@"
