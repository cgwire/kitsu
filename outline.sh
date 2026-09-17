#!/usr/bin/env bash
# extract_toc.sh — Extract table of contents from a Markdown file
# Usage: ./extract_toc.sh <file.md>

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <file.md>" >&2
  exit 1
fi

FILE="$1"

if [[ ! -f "$FILE" ]]; then
  echo "Error: file '$FILE' not found." >&2
  exit 1
fi

# Convert a heading text to a GitHub-style anchor
make_anchor() {
  local text="$1"
  echo "$text" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9 _-]//g' \
    | tr ' ' '-'
}

in_code_block=0
FENCE_REGEX='^[[:space:]]*(`{3,}|~{3,})'

while IFS= read -r line; do
  # Toggle fenced code block tracking (``` or ~~~)
  if [[ "$line" =~ $FENCE_REGEX ]]; then
    in_code_block=$(( !in_code_block ))
    continue
  fi

  # Skip lines inside code blocks
  [[ "$in_code_block" -ne 0 ]] && continue

  # Match ATX headings: # through ######
  if [[ "$line" =~ ^(#{1,6})[[:space:]]+(.+)$ ]]; then
    hashes="${BASH_REMATCH[1]}"
    title="${BASH_REMATCH[2]}"

    # Strip trailing hashes and spaces (e.g. "## Heading ##")
    title=$(echo "$title" | sed 's/[[:space:]]*#*[[:space:]]*$//')

    level="${#hashes}"
    indent=""
    for (( i=1; i<level; i++ )); do
      indent+="  "
    done

    anchor=$(make_anchor "$title")
    echo "${indent}- ${title}"
  fi
done < "$FILE"
