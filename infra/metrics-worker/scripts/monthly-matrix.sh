#!/usr/bin/env bash
set -euo pipefail

CONFIG_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/wrangler.jsonc"

npx --yes wrangler d1 execute cco-metrics --remote --config "$CONFIG_PATH" --command \
  "SELECT month, COUNT(*) AS active_installations FROM monthly_active_users GROUP BY month ORDER BY month"

npx --yes wrangler d1 execute cco-metrics --remote --config "$CONFIG_PATH" --command \
  "SELECT month, app_version, COUNT(*) AS active_installations FROM monthly_active_users GROUP BY month, app_version ORDER BY month, active_installations DESC, app_version"

npx --yes wrangler d1 execute cco-metrics --remote --config "$CONFIG_PATH" --command \
  "SELECT month, harness, COUNT(*) AS active_installations FROM monthly_active_users GROUP BY month, harness ORDER BY month, active_installations DESC, harness"
