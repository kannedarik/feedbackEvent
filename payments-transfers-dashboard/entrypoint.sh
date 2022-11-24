JSON_STRING='window.configs = { \
  "NODE_ENV":"'"${NODE_ENV}"'", \
  "VUE_APP_KONG_URL":"'"${VUE_APP_KONG_URL}"'", \
  "VUE_APP_CORE_URI":"'"${VUE_APP_CORE_URI}"'", \
  "VUE_APP_PAY_HOST":"'"${VUE_APP_PAY_HOST}"'", \
  "VUE_APP_HOST":"'"${VUE_APP_HOST}"'", \
  "VUE_APP_LEDGER_URI":"'"${VUE_APP_LEDGER_URI}"'", \
  "VUE_APP_SENTRY_DSN":"'"${VUE_APP_SENTRY_DSN}"'", \
  "VUE_APP_SENTRY_ENABLE":"'"${VUE_APP_SENTRY_ENABLE}"'", \
  "VUE_APP_AGENT_ID":"'"${VUE_APP_AGENT_ID}"'", \
  "VUE_APP_ACCOUNT_ID":"'"${VUE_APP_ACCOUNT_ID}"'", \
  "VUE_APP_LICENSE_KEY":"'"${VUE_APP_LICENSE_KEY}"'", \
  "VUE_APP_TRUST_KEY":"'"${VUE_APP_TRUST_KEY}"'", \
}'
sed -i "s@// CONFIGURATIONS_PLACEHOLDER@${JSON_STRING}@" /usr/share/nginx/html/index.html
exec "$@"