#!/usr/bin/env bash
#
# Copies every "images" and "screenshots" folder under the docs root
# into the matching path under each locale folder (fr, ja).
#
#   docs/start-here/getting-started/screenshots
#     -> docs/fr/start-here/getting-started/screenshots
#     -> docs/ja/start-here/getting-started/screenshots
#
# Usage: ./copy-assets-to-locales.sh [docs_dir] [--dry-run]

set -euo pipefail

DOCS_DIR="docs"
DRY_RUN=false
LOCALES=(fr ja)
FOLDER_NAMES=(images screenshots)

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    *) DOCS_DIR="${arg%/}" ;;
  esac
done

if [[ ! -d "$DOCS_DIR" ]]; then
  echo "Error: '$DOCS_DIR' is not a directory." >&2
  exit 1
fi

# Build the find expression that skips the locale folders entirely
prune_expr=()
for locale in "${LOCALES[@]}"; do
  [[ ${#prune_expr[@]} -gt 0 ]] && prune_expr+=(-o)
  prune_expr+=(-path "$DOCS_DIR/$locale")
done

# Build the expression matching the asset folder names
name_expr=()
for name in "${FOLDER_NAMES[@]}"; do
  [[ ${#name_expr[@]} -gt 0 ]] && name_expr+=(-o)
  name_expr+=(-name "$name")
done

count=0

# The trailing -prune stops find from descending into a matched folder,
# so nested images/screenshots inside one are copied once, not twice.
while IFS= read -r -d '' src; do
  rel="${src#"$DOCS_DIR"/}"

  for locale in "${LOCALES[@]}"; do
    dest="$DOCS_DIR/$locale/$rel"
    echo "$src -> $dest"

    if [[ "$DRY_RUN" == false ]]; then
      mkdir -p "$dest"
      # "src/." copies the contents, merging into dest if it already exists
      cp -R "$src/." "$dest/"
    fi
  done

  count=$((count + 1))
done < <(find "$DOCS_DIR" \( "${prune_expr[@]}" \) -prune -o \
              -type d \( "${name_expr[@]}" \) -print0 -prune)

if [[ "$DRY_RUN" == true ]]; then
  echo "Dry run: $count folder(s) would be copied to ${#LOCALES[@]} locale(s)."
else
  echo "Done: copied $count folder(s) to ${#LOCALES[@]} locale(s)."
fi