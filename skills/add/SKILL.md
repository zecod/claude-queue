---
name: add
description: Add tasks to this project's queue file (.claude-queue.md). /queue:run then works through them one by one.
argument-hint: <task>; <task>; ...
disable-model-invocation: true
---
Add the tasks below to the queue file `.claude-queue.md` in the project root. Create the file if it doesn't exist.

- Add each task as a new line at the end of the file, written exactly like this: `- [ ] <task>`
- If the text holds several tasks (separated by `;`, numbered, or one per line), add each one as its own line, in the same order.
- Keep the user's wording. Don't change the lines already in the file.
- Don't start any of the tasks.

Then reply with one line: how many tasks you added, how many are waiting now, and that `/queue:run` starts them.

Tasks:
$ARGUMENTS
