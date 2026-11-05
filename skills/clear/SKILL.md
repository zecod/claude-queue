---
name: clear
description: Empty this project's queue (.claude-queue.md). With "done", remove only the finished tasks.
argument-hint: [done]
disable-model-invocation: true
---
Clear the queue in `.claude-queue.md` in the project root.

- If the argument is `done`, remove only the finished tasks (`- [x]` lines) and keep everything else.
- Otherwise delete `.claude-queue.md`, and `.claude-queue.start` if it exists.

Reply with one line saying what you removed.

Argument: $ARGUMENTS
