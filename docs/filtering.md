# Search filtering DSL

Kitsu's list pages (Shots, Assets, Sequences, Episodes, Edits, ...) share a
search-box syntax mixing free-text name search with `key=value` filter
expressions. This describes the syntax as implemented by
`src/lib/filtering.js` (filter extraction/evaluation) and
`src/lib/indexing.js` (name index for free-text and exclusion matches).
`src/lib/query.js` is unrelated — it only builds HTTP query strings.

## Pipeline

A query string is processed in four steps (see e.g.
`src/store/modules/shots.js`):

1. `getKeyWords(query)` — plain search words, after stripping `key=value` and
   `[...]` expressions.
2. `getFilters({ ..., query })` — one filter object per `key=value`
   expression, plus one per `-name` exclusion.
3. `indexSearch(entryIndex, keywords)` — entries whose name (and, depending
   on the page, sequence/episode name) match every keyword as a
   case-insensitive substring.
4. `applyFilters(entries, filters, taskMap)` — narrows the result further,
   evaluating every filter against each entry.

Filters are ANDed by default. Wrapping a group in `+(...)` switches it to OR
(see [Unions](#unions-or)).

## Free-text keywords

A word that isn't part of a recognized expression matches as a substring of
the entry's name. Multiple keywords are ANDed. Quote a phrase to include
spaces: `"my sequence"`.

## Name exclusion

`-word` excludes entries whose name matches `word`.

## Task type = status

`task-type=status` filters by the status of one task type, matched
**exactly** (case-insensitive) — `fx=wip` never also matches `cfx`. Statuses
can be OR'd with a comma; brackets quote names/values containing spaces or
commas:

```
modeling=wip
modeling=wip,wfa
[modeling facial]=wip
```

`modeling=assigned` / `modeling=unassigned` bypass status entirely.
`status=<status>` (the literal word `status`) matches across **all** task
types instead of one, and also accepts a comma list: `status=wip,done`.

A leading `-` excludes every listed status: `modeling=-wip`,
`modeling=[-wip,wfa]` (neither wip nor wfa), `status=-wip`. These negated
statuses and `modeling=unassigned` keep only the entries that have the
task: an entry without a Modeling task is left out, and `status=-wip`
leaves out the entries without any task.

## Asset type

```
type=chars
type=-chars
```

Single value only (no comma list); `-` excludes.

## Department

Filters people by department. Comma list and exclusion supported:

```
department=fx
department=[fx,anim]
department=-fx
```

## Metadata (descriptors)

Any custom metadata field is filtered by its display name. String descriptors
match case-insensitive substrings, number descriptors match by exact numeric
equality; both accept a comma list of alternatives:

```
family=big
family=[blue,red]
```

Checklist descriptors use an `itemname:true` / `itemname:false` value to
check one checklist item:

```
checklist=done:true
```

## Ready for / assets ready

`readyfor=<task-type>` matches entries whose `ready_for` points at that task
type (single value, no exclusion). `assetsready=<task-type>` matches entries
where every sub-entity needing that task type is ready (exclusion
supported):

```
readyfor=animation
assetsready=modeling
assetsready=-modeling
```

## Priority

`priority-<task-type>=<digit>` filters by priority level, a single digit
(0-9):

```
priority-animation=3
```

## Assigned to

The task type is required but can be left empty (`[]`) to match any task
type; an unknown task type drops the filter. `-` on the person name
excludes instead of matches:

```
assignedto[Modeling]=[John Doe]
assignedto[]=[John Doe]
assignedto[Modeling]=[-John Doe]
```

Excluding a person keeps only the entries that have a task of that type
(any task with `assignedto[]`).

## Thumbnail presence

```
withthumbnail
-withthumbnail
```

## Unions (OR)

Wrap several `key=value` expressions in `+(...)` to OR them:

```
+(layout=wip animation=wfa)
```

Outside the group, only plain words count: they still narrow the list by
name, while `key=value` expressions, `-word` exclusions, and
`withthumbnail` are ignored, so `layout=wip +(animation=wip)` filters like
`+(animation=wip)`. The filter builder puts the whole query in the group
when "Match one of the following filters" is picked.

## Task list page: `[a,b,c]` name union

The Task list page (`TaskType.vue`) additionally treats a standalone bracket
list of names as "match any of these names" — `[SH01,SH02,SH03]`. This goes
through `getTaskFilters`/`getMultipleKeyWords`, a separate code path from the
general `getFilters` pipeline above.

## Examples

| Query | Meaning |
|---|---|
| `bunny` | Name contains "bunny" |
| `-bunnyfat` | Name does not contain "bunnyfat" |
| `modeling=wip` | Modeling task is in "wip" status |
| `modeling=wip,wfa` | Modeling task is "wip" or "wfa" |
| `modeling=unassigned` | Modeling task has no assignee |
| `status=wip` | Any task is in "wip" status |
| `type=chars` | Asset type is "chars" |
| `department=fx` | Person is in the fx department |
| `family=big` | "Family" metadata equals "big" |
| `checklist=done:true` | Checklist item "done" is ticked |
| `readyfor=animation` | Ready for the Animation task type |
| `assetsready=modeling` | All sub-entities ready for Modeling |
| `priority-animation=3` | Animation task priority is 3 |
| `assignedto[Modeling]=[John Doe]` | John Doe assigned on Modeling |
| `withthumbnail` | Entry has a preview thumbnail |
| `+(layout=wip animation=wfa)` | Layout wip OR Animation wfa |
