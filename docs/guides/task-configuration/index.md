# Task Configuration

Kitsu's data model organizes work around a hierarchy of production entities (studio → production → episode/sequence/shot, or → asset) crossed with a task-tracking system (task type, task status, department).

## Table of Content

1. [Manage Asset Types](/guides/task-configuration/managing-asset-types/) - Create and organize categories (like Characters, Props, or Environments) used to group and classify assets across a production.
1. [Manage Task Types](/guides/task-configuration/managing-task-types/) - Define the pipeline stages (like Modeling, Rigging, or Compositing) that assets, shots, and other entities move through during production.
1. [Manage Task Statuses](/guides/task-configuration/managing-task-statuses/) - Configure the review and approval states (like To Do, Work in Progress, or Done) that track a task's progress through the workflow.

## Data Model

```mermaid
flowchart TD
    PRODUCTION -->|contains| ASSET
    ASSET_TYPE -->|categorizes| ASSET
    ASSET -->|cast in| SHOT

    SEQUENCE -->|tracked by| TASK
    SHOT -->|tracked by| TASK
    ASSET -->|tracked by| TASK
    DEPARTMENT -->|groups| TASK_TYPE
    TASK_TYPE -->|type of| TASK
    TASK_STATUS -->|current state of| TASK
```
- **Asset** - A reusable production element (character, prop, set, FX setup) that can be cast into one or more shots.
- **Asset Type** - A category for assets (e.g. Character, Prop, Environment, FX).
- **Task** - A unit of tracked work, always attached to either a shot or an asset, with an assigned task type and current status.
- **Task Type** - Defines the kind of work a task represents (e.g. Layout, Animation, Lighting); belongs to a department.
- **Task Status** - The current state of a task (e.g. Todo, Work in Progress, Done, Retake, Waiting For Approval).