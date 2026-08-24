#!/usr/bin/env bash
#
# md_report.sh — Recursively scan a directory for Markdown files and report,
# for each file, its title (first H1), total word count, and level-2 heading
# ("## ") structure with a word count per section. Output is a single JSON
# document.
#
# Usage:
#   ./md_report.sh [directory]
#
# If no directory is given, the current directory (.) is used.
#
# Requires: jq

set -euo pipefail

TARGET_DIR="${1:-.}"

if ! command -v jq >/dev/null 2>&1; then
    echo '{"error": "jq is required but not installed"}' >&2
    exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
    jq -n --arg dir "$TARGET_DIR" '{"error": ("not a directory: " + $dir)}'
    exit 1
fi

# Find all Markdown files (.md and .markdown), null-delimited for safety
# with spaces/special characters in filenames.
mapfile -d '' -t md_files < <(find "$TARGET_DIR" -type f \( -iname '*.md' -o -iname '*.markdown' \) -print0 | sort -z)

if [[ ${#md_files[@]} -eq 0 ]]; then
    jq -n --arg dir "$TARGET_DIR" '{"directory": $dir, "file_count": 0, "files": []}'
    exit 0
fi

file_objects=()

for file in "${md_files[@]}"; do
    total_words=$(wc -w < "$file" | tr -d ' ')

    # Extract the page title: the first level-1 heading ("# Title", not ##).
    # Fenced code blocks are skipped so a "#" inside code isn't picked up.
    title=$(awk '
        BEGIN { in_code = 0 }
        {
            line = $0
            if (line ~ /^[[:space:]]*(```|~~~)/) {
                in_code = !in_code
                next
            }
            if (in_code) next

            if (line ~ /^#[[:space:]]+[^#]/) {
                sub(/^#[[:space:]]+/, "", line)
                gsub(/[[:space:]]+$/, "", line)
                print line
                exit
            }
        }
    ' "$file")

    if [[ -z "$title" ]]; then
        title="(untitled)"
    fi

    # awk emits one tab-separated "title<TAB>word_count" line per section.
    #   - Tracks fenced code blocks (``` or ~~~) so headings/words inside
    #     them aren't misinterpreted.
    #   - On each level-2 heading ("## Title", not ### etc.), flushes the
    #     previous section's count and starts a new one.
    #   - Words before the first H2 are reported under "(preamble)".
    #   - The heading line itself is excluded from word counts.
    sections_tsv=$(awk '
        BEGIN {
            in_code = 0
            section = "(preamble)"
            words = 0
        }
        {
            line = $0

            if (line ~ /^[[:space:]]*(```|~~~)/) {
                in_code = !in_code
                next
            }
            if (in_code) next

            if (line ~ /^##[[:space:]]+[^#]/ || line ~ /^##[[:space:]]*$/) {
                printf "%s\t%d\n", section, words
                title = line
                sub(/^##[[:space:]]+/, "", title)
                gsub(/[[:space:]]+$/, "", title)
                if (title == "") title = "(untitled)"
                section = title
                words = 0
                next
            }

            n = split(line, arr, /[[:space:]]+/)
            for (i = 1; i <= n; i++) {
                if (arr[i] != "") words++
            }
        }
        END {
            printf "%s\t%d\n", section, words
        }
    ' "$file")

    # Convert the TSV section list into a JSON array of {title, words}.
    sections_json=$(printf '%s\n' "$sections_tsv" | jq -R -s -c '
        split("\n")
        | map(select(length > 0))
        | map(split("\t"))
        | map({title: .[0], words: (.[1] | tonumber)})
    ')

    file_obj=$(jq -n \
        --arg path "$file" \
        --arg title "$title" \
        --argjson total_words "$total_words" \
        --argjson sections "$sections_json" \
        '{path: $path, title: $title, total_words: $total_words, sections: $sections}')

    file_objects+=("$file_obj")
done

# Combine everything into the final JSON document.
printf '%s\n' "${file_objects[@]}" | jq -s --arg dir "$TARGET_DIR" '{
    directory: $dir,
    file_count: length,
    files: .
}'