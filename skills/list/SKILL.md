---
name: list
description: Show the tasks in this project's queue (.claude-queue.md).
disable-model-invocation: true
---
Read `.claude-queue.md` in the project root and show the queue:

- the task in progress, if any (`- [>]`)
- the waiting tasks (`- [ ]`), numbered in order
- the finished tasks (`- [x]`), last

If the file doesn't exist or holds no tasks, say the queue is empty. Don't change the file and don't start any task.
