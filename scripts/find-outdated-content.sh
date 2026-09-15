#!/usr/bin/env bash
#
# Find outdated translations by comparing the `published_at` frontmatter of
# source markdown files against their translated counterparts.
#
# Usage: ./check-translations.sh [DOCS_DIR] [OUTPUT_FILE]
# Defaults: DOCS_DIR=./docs  OUTPUT_FILE=to-translate.md

set -euo pipefail

DOCS_DIR="${1:-./docs}"
OUTPUT_FILE="${2:-to-translate.md}"
LANGS=(ja fr)

DOCS_DIR="${DOCS_DIR%/}"

if [[ ! -d "$DOCS_DIR" ]]; then
    echo "Error: directory not found: $DOCS_DIR" >&2
    exit 1
fi

# Extract the `published_at` value from the YAML frontmatter block.
# Prints nothing if the file has no frontmatter or no published_at key.
get_published_at() {
    awk '
        NR == 1 {
            sub(/\r$/, "")
            if ($0 !~ /^---[[:space:]]*$/) exit   # no frontmatter at all
            next
        }
        {
            sub(/\r$/, "")
            if ($0 ~ /^(---|\.\.\.)[[:space:]]*$/) exit   # end of frontmatter
            if ($0 ~ /^published_at[[:space:]]*:/) {
                sub(/^published_at[[:space:]]*:[[:space:]]*/, "")
                gsub(/^["\047]+|["\047]+$/, "")           # strip quotes
                sub(/[[:space:]]+$/, "")
                print
                exit
            }
        }
    ' "$1"
}

# Convert a date string to a Unix timestamp. Prints nothing on failure.
to_epoch() {
    local value="$1"
    [[ -z "$value" ]] && return 0
    date -d "$value" +%s 2>/dev/null && return 0          # GNU date
    date -j -f "%Y-%m-%d" "${value:0:10}" +%s 2>/dev/null && return 0  # BSD date
    return 0
}

# Build the find expression that prunes the translation folders.
prune_args=()
for lang in "${LANGS[@]}"; do
    prune_args+=(-path "$DOCS_DIR/$lang" -o)
done
unset 'prune_args[${#prune_args[@]}-1]'   # drop the trailing -o

outdated=()
warnings=()

while IFS= read -r -d '' source_file; do
    rel_path="${source_file#"$DOCS_DIR"/}"
    source_date="$(get_published_at "$source_file")"
    source_epoch="$(to_epoch "$source_date")"

    if [[ -z "$source_date" ]]; then
        warnings+=("$source_file: no published_at in frontmatter, skipped")
        continue
    fi
    if [[ -z "$source_epoch" ]]; then
        warnings+=("$source_file: unparsable published_at ($source_date), skipped")
        continue
    fi

    needs_work=0
    for lang in "${LANGS[@]}"; do
        translated_file="$DOCS_DIR/$lang/$rel_path"

        if [[ ! -f "$translated_file" ]]; then
            needs_work=1
            continue
        fi

        translated_date="$(get_published_at "$translated_file")"
        translated_epoch="$(to_epoch "$translated_date")"

        if [[ -z "$translated_epoch" ]]; then
            # Missing or unreadable date on the translation: treat as outdated.
            needs_work=1
        elif (( translated_epoch < source_epoch )); then
            needs_work=1
        fi
    done

    # One entry per source file, however many locales are behind.
    if (( needs_work )); then
        outdated+=("$source_file")
    fi
done < <(find "$DOCS_DIR" \( "${prune_args[@]}" \) -prune -o -type f -name '*.md' -print0)

# Write the report: one path per line.
if (( ${#outdated[@]} > 0 )); then
    printf '%s\n' "${outdated[@]}" | LC_ALL=C sort > "$OUTPUT_FILE"
else
    : > "$OUTPUT_FILE"
fi

# Summary on stderr so stdout/the file stays clean.
for warning in "${warnings[@]+"${warnings[@]}"}"; do
    echo "warning: $warning" >&2
done
echo "${#outdated[@]} file(s) to translate -> $OUTPUT_FILE" >&2