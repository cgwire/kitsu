#!/usr/bin/env bash
set -euo pipefail

declare -A lang_files=(
  [fr]="batch_output_fr.jsonl"
  [ja]="batch_output_ja.jsonl"
)

for lang in "${!lang_files[@]}"; do
  input_file="${lang_files[$lang]}"

  if [[ ! -f "$input_file" ]]; then
    echo "Skipping $lang: $input_file not found"
    continue
  fi

  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" ]] && continue

    custom_id=$(jq -r '.custom_id' <<<"$line")
    status_code=$(jq -r '.response.status_code // "none"' <<<"$line")
    body_status=$(jq -r '.response.body.status // "none"' <<<"$line")

    if [[ "$status_code" != "200" || "$body_status" != "completed" ]]; then
      echo "Skipping $lang $custom_id: status_code=$status_code, body.status=$body_status" >&2
      continue
    fi

    # Strip any leading slash so it doesn't get treated as an absolute path
    rel_path="${custom_id#/}"
    path="docs/$lang/$rel_path/index.md"
    mkdir -p "$(dirname "$path")"

    # Pick the message item(s), skip reasoning, and join all output_text parts.
    # -j writes the raw text with no added newline, so the content is kept exactly.
    jq -j '
      [ .response.body.output[]
        | select(.type == "message")
        | .content[]
        | select(.type == "output_text")
        | .text
      ] | join("")
    ' <<<"$line" > "$path"

    if [[ ! -s "$path" ]]; then
      echo "Warning: empty output for $lang $custom_id" >&2
      rm -f "$path"
      continue
    fi

    echo "Written: $path"
  done < "$input_file"
done