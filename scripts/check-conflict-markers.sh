#!/usr/bin/env bash
# Garde-fou local : refuse de laisser passer des markers de conflit non résolus.
# Symétrique au workflow CI .github/workflows/conflict-markers-guard.yml
# et à PR #104 sur le repo backend nami.
#
# Usage :
#   bash scripts/check-conflict-markers.sh           # scanne le tree
#   bash scripts/check-conflict-markers.sh --staged  # scanne uniquement les fichiers staged
#
# Câblage pre-commit (si husky installé un jour) :
#   echo 'bash scripts/check-conflict-markers.sh --staged' > .husky/pre-commit && chmod +x .husky/pre-commit

set -e

PATTERN='^<<<<<<<\|^=======\|^>>>>>>>'
EXTENSIONS_REGEX='\.(ts|tsx|js|jsx|json|yml|yaml|md|css|html)$'

if [ "${1:-}" = "--staged" ]; then
  FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E "$EXTENSIONS_REGEX" || true)
  if [ -z "$FILES" ]; then
    echo "✅ Aucun fichier staged à vérifier."
    exit 0
  fi
  HIT=0
  while IFS= read -r f; do
    [ -f "$f" ] || continue
    if grep -nH "$PATTERN" "$f" 2>/dev/null; then
      HIT=1
    fi
  done <<< "$FILES"
  if [ "$HIT" -eq 1 ]; then
    echo ""
    echo "❌ Conflict markers détectés dans les fichiers staged — résoudre avant commit."
    exit 1
  fi
  echo "✅ Aucun marker dans les fichiers staged."
  exit 0
fi

TARGETS=(src public .github)
for f in package.json tsconfig.json next.config.ts next.config.js next.config.mjs; do
  [ -f "$f" ] && TARGETS+=("$f")
done

if grep -rln "$PATTERN" \
    --include="*.ts" --include="*.tsx" \
    --include="*.js" --include="*.jsx" \
    --include="*.json" \
    --include="*.yml" --include="*.yaml" \
    --include="*.md" \
    --include="*.css" \
    --include="*.html" \
    "${TARGETS[@]}" 2>/dev/null; then
  echo ""
  echo "❌ Conflict markers détectés ci-dessus — résoudre avant push."
  exit 1
fi

echo "✅ Aucun marker de conflit non résolu."
