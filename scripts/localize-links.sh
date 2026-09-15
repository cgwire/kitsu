#!/usr/bin/env bash
#
# Add the language prefix to every internal (absolute) path in translated
# doc files, including image/asset paths — e.g. /guides/production becomes
# /fr/guides/production inside docs/fr/**, and /ja/guides/production inside
# docs/ja/**. Paths that are already prefixed with a known language code are
# left alone, so the script is safe to re-run.
#
# Usage: ./localize-links.sh [DOCS_DIR] [--dry-run]
# Default: DOCS_DIR=./docs
#
# Requires: bash, find, perl (for lookaround-safe regex replacement).

set -euo pipefail

DOCS_DIR="./docs"
DRY_RUN=0

for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=1 ;;
        *) DOCS_DIR="$arg" ;;
    esac
done

LANGS=(fr ja)
DOCS_DIR="${DOCS_DIR%/}"
LANGS_CSV="$(IFS=,; echo "${LANGS[*]}")"

if [[ ! -d "$DOCS_DIR" ]]; then
    echo "Error: directory not found: $DOCS_DIR" >&2
    exit 1
fi

if ! command -v perl >/dev/null 2>&1; then
    echo "Error: perl is required but not found in PATH" >&2
    exit 1
fi

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

# ---------------------------------------------------------------------------
# Perl helper: rewrites one file in place.
#
# Matches any "/..." token that:
#   - is not glued to another path/word char on the left (so it won't fire
#     mid-URL, e.g. the /path in https://example.com/path, or mid-word)
#   - is not itself "//..." (protocol-relative URLs are left alone)
#   - stops at whitespace, quotes, parens, angle brackets, backticks, "#" or
#     "?" (so markdown/HTML link and image syntax, and anchors/query
#     strings, are handled correctly)
#
# Then, unless the path already starts with a known language segment
# (/fr/... or /ja/...), prepends /<lang>.
# ---------------------------------------------------------------------------

perl_helper="$workdir/localize.pl"
cat > "$perl_helper" <<'PERL_EOF'
use strict;
use warnings;

my ($target_lang, $all_langs_csv, $target_file, $dry_run) = @ARGV;
my @all_langs = split(/,/, $all_langs_csv);
my $lang_alt = join('|', map { quotemeta($_) } @all_langs);

open(my $fh, '<', $target_file) or die "cannot open $target_file: $!";
local $/;
my $content = <$fh>;
close $fh;

my $count = 0;
$content =~ s{
    (?:(?<=[\s"'(`])|^)     # preceded by a real delimiter, or start of file
    /(?!/)                  # a single "/", not "//..."
    ([^\s"'()<>`#?]*)       # the path body, stops at delimiters
    (?=[\s)"'`#?]|$)        # followed by a real delimiter, never "<" or ">"
}{
    my $path = $1;
    my $full = "/$path";
    if ($full =~ m{^/(?:$lang_alt)(?:/|$)}) {
        $full;                          # already localized, leave as-is
    } else {
        $count++;
        "/$target_lang/$path";
    }
}gex;

if ($count > 0 && !$dry_run) {
    open(my $out, '>', $target_file) or die "cannot write $target_file: $!";
    print $out $content;
    close $out;
}

print "$count\n";
PERL_EOF

# ---------------------------------------------------------------------------
# Apply to every file under each language folder.
# ---------------------------------------------------------------------------

grand_total=0

for lang in "${LANGS[@]}"; do
    lang_dir="$DOCS_DIR/$lang"
    if [[ ! -d "$lang_dir" ]]; then
        echo "note: no $lang_dir directory, skipping" >&2
        continue
    fi

    lang_total=0
    lang_files=0

    while IFS= read -r -d '' tfile; do
        n="$(perl "$perl_helper" "$lang" "$LANGS_CSV" "$tfile" "$DRY_RUN")"
        if (( n > 0 )); then
            lang_files=$((lang_files + 1))
            lang_total=$((lang_total + n))
            echo "  ${tfile#"$DOCS_DIR"/}: $n path(s) localized" >&2
        fi
    done < <(find "$lang_dir" -type f \( -name '*.md' -o -name '*.mdx' \) -print0)

    grand_total=$((grand_total + lang_total))
    echo "[$lang] $lang_total path(s) localized across $lang_files file(s)" >&2
done

if (( DRY_RUN )); then
    echo "dry run: $grand_total path(s) would be localized (no files changed)" >&2
else
    echo "$grand_total path(s) localized" >&2
fi