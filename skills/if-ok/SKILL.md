---
name: if-ok
description: Queue a message that runs after Claude finishes the whole turn, but only if the work before it succeeded.
argument-hint: <message>
disable-model-invocation: true
---
This message was queued to run only if the work you just finished went well.

First look back at that work in this conversation. Skip the message if any of these happened:

- a test, build, lint or other check failed
- a command you ran returned an error that you didn't fix
- you stopped before finishing, or said something is still broken or left to do

If you skip it, do none of it. Reply with one line that starts with "Skipped:" and gives the reason.
If the work succeeded, do what the message asks.

Message:
$ARGUMENTS
