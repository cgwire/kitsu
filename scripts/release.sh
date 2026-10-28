#!/usr/bin/env bash
# Bump the version, commit, tag and push the release.
# Usage: scripts/release.sh [patch|minor|major] (patch by default).
# Portable across macOS (BSD tools) and Linux (GNU tools).
set -euo pipefail

fail() {
    echo "Error: $*" >&2
    exit 1
}

# Checked before anything else, so a typo fails before pulling.
usage="usage: $0 [patch|minor|major]"
[ $# -le 1 ] || fail "${usage}"
case "${1-patch}" in
    major) bumped_field=1 ;;
    minor) bumped_field=2 ;;
    patch) bumped_field=3 ;;
    *) fail "${usage}" ;;
esac

cd "$(git rev-parse --show-toplevel)" || fail "not inside a git repository."

[ -f package.json ] || fail "package.json not found."
command -v npm >/dev/null || fail "npm not found."

current_branch=$(git rev-parse --abbrev-ref HEAD)
[ "${current_branch}" = "main" ] ||
    fail "releases are made from main (current branch: ${current_branch})."

# Untracked files are ignored: only uncommitted changes to tracked files
# could leak into, or be lost by, the release commit.
[ -z "$(git status --porcelain --untracked-files=no)" ] ||
    fail "working tree has uncommitted changes."

git pull --rebase origin main || fail "git pull --rebase failed."

last_release_number=$(npm pkg get version | tr -d '"')
echo "${last_release_number}" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' ||
    fail "cannot parse a version from package.json" \
        "(got '${last_release_number}')."

# Bump the chosen field and reset the next ones: 1.0.73 gives 1.0.74
# (patch), 1.1.0 (minor) or 2.0.0 (major).
release_number=$(
    echo "${last_release_number}" |
        awk -F. -v OFS=. -v field="${bumped_field}" \
            '{$field += 1; for (i = field + 1; i <= NF; i++) $i = 0; print}'
)
tag="v${release_number}"

if git rev-parse -q --verify "refs/tags/${tag}" >/dev/null; then
    fail "tag ${tag} already exists locally, aborting."
fi
# ls-remote exits with 2 when the ref is missing, anything else but 0 is
# a failure (network, auth) that must not be mistaken for a missing tag.
remote_status=0
git ls-remote --exit-code --tags origin "refs/tags/${tag}" >/dev/null ||
    remote_status=$?
case "${remote_status}" in
    0) fail "tag ${tag} already exists on origin, aborting." ;;
    2) ;;
    *) fail "cannot query tags on origin (git ls-remote exit ${remote_status})." ;;
esac

echo "Releasing ${last_release_number} -> ${release_number}"

# npm version updates package.json and package-lock.json, then commits them
# as "<version>" and creates the annotated tag "v<version>".
npm version "${release_number}" -m "%s"
git push --atomic origin main "${tag}"
