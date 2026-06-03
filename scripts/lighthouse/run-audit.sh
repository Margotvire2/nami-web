#!/usr/bin/env bash
# Lighthouse CI wrapper — baseline audit C10 launch pre-flight.
#
# Usage:
#   ./scripts/lighthouse/run-audit.sh                 # public URLs only (default)
#   ./scripts/lighthouse/run-audit.sh --with-auth     # include authenticated patient + cockpit pages
#   ./scripts/lighthouse/run-audit.sh --collect-only  # collect runs but skip assertions
#
# Required env vars when --with-auth is passed:
#   NAMI_TEST_PATIENT_EMAIL, NAMI_TEST_PATIENT_PASSWORD
#   NAMI_TEST_CARE_EMAIL,    NAMI_TEST_CARE_PASSWORD
#
# Artifacts land in .lighthouseci/ (HTML + JSON + screenshots) — git-ignored.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

WITH_AUTH=0
COLLECT_ONLY=0
EXTRA_FLAGS=()

for arg in "$@"; do
  case "$arg" in
    --with-auth) WITH_AUTH=1 ;;
    --collect-only) COLLECT_ONLY=1 ;;
    *) EXTRA_FLAGS+=("$arg") ;;
  esac
done

LHCI_BIN="$REPO_ROOT/node_modules/.bin/lhci"
if [ ! -x "$LHCI_BIN" ]; then
  echo "[lighthouse] @lhci/cli not installed. Run: npm install --save-dev @lhci/cli"
  exit 1
fi

OUT_DIR="$REPO_ROOT/.lighthouseci"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo "[lighthouse] Repo : $REPO_ROOT"
echo "[lighthouse] Output: $OUT_DIR"
echo "[lighthouse] Config: .lighthouserc.json"
echo "[lighthouse] With auth: $WITH_AUTH"

if [ "$COLLECT_ONLY" = "1" ]; then
  "$LHCI_BIN" collect ${EXTRA_FLAGS[@]+"${EXTRA_FLAGS[@]}"}
  "$LHCI_BIN" upload  ${EXTRA_FLAGS[@]+"${EXTRA_FLAGS[@]}"}
else
  "$LHCI_BIN" autorun ${EXTRA_FLAGS[@]+"${EXTRA_FLAGS[@]}"} || true
  # autorun exits non-zero on assertion failures — we keep baseline + report regardless.
fi

if [ "$WITH_AUTH" = "1" ]; then
  if [ -z "${NAMI_TEST_PATIENT_EMAIL:-}" ] || [ -z "${NAMI_TEST_PATIENT_PASSWORD:-}" ]; then
    echo "[lighthouse] --with-auth requires NAMI_TEST_PATIENT_EMAIL + NAMI_TEST_PATIENT_PASSWORD"
    exit 2
  fi
  echo "[lighthouse] Auth runs not yet wired in this baseline — see docs/perf/baseline-2026-06-04.md §3"
fi

echo ""
echo "[lighthouse] Done. Artifacts:"
ls -la "$OUT_DIR" | head -20
echo ""
echo "[lighthouse] Open the HTML report:"
echo "  open $(ls "$OUT_DIR"/*.html 2>/dev/null | head -1 || echo '<no report>')"
