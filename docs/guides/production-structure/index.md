---
path: "/guides/production-structure"
slug: "production-structure"
published_at: 2026-09-10
---

# Production Structure

Kitsu's data model organizes work around a hierarchy of production entities (production → episode/sequence/shot, or → asset) crossed with a task-tracking system (task type, task status, department).

## Table of Content

1. [Manage Productions](/guides/production-structure/manage-productions/) - Create, configure, and organize the productions (projects) tracked in Kitsu.
2. [Manage Episodes](/guides/production-structure/manage-episodes/) - Add, edit, and organize episodes within a production.
3. [Manage Sequences](/guides/production-structure/manage-sequences/) - Add, edit, and organize sequences within a production or episode.
4. [Manage Shots](/guides/production-structure/manage-shots/) - Add, edit, and organize the shots that make up a sequence.
5. [Manage Studio Labels](/guides/production-structure/manage-studios/) - For multi-site and multi-studio productions. Create and organize the studio labels used to identify which studio is responsible for each task.

## Data Model

```mermaid
flowchart TD
    PRODUCTION -->|contains| EPISODE
    PRODUCTION -->|contains, non-episodic| SEQUENCE
    EPISODE -->|contains| SEQUENCE
    SEQUENCE -->|contains| SHOT
```

- **Department** - A functional group within a studio (e.g. Modeling, Animation, Lighting, Compositing). Departments group related task types.
- **Production** - A project (film, series, game, etc.) managed by the studio. Productions contain episodes (if episodic), sequences, shots, and assets.
- **Episode** - A subdivision of a production, used for series-style projects. Optional for feature-style productions.
- **Sequence** - A subdivision of an episode (or directly of a production for non-episodic work), grouping related shots.
- **Shot** - A unit of filmed/animated action within a sequence; the main container for shot-based tasks.
