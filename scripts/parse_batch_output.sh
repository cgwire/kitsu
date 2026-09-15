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

  while IFS= read -r line; do
    custom_id=$(echo "$line" | jq -r '.custom_id')
    # Strip any leading slash so it doesn't get treated as an absolute path
    custom_id="${custom_id#/}"

    path="docs/$lang/$custom_id/index.md"
    text=$(echo "$line" | jq -r '.response.body.output[0].content[0].text')
    mkdir -p "$(dirname "$path")"
    printf '%s' "$text" > "$path"
    echo "Written: $path"
  done < "$input_file"
done