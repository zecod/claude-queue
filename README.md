# claude-queue

A Claude Code plugin with one command, `/queue:next`. Type it while Claude is busy and your message waits until Claude has finished the whole job. Then it runs.

## The problem

When you type a message while Claude is working and press Enter, Claude Code queues it. It doesn't wait for the job to end, though. Claude reads it as soon as the current tool call finishes, so a message you meant as "do this afterwards" lands in the middle of the work.

![A plain queued message is read after one tool call, while the first task is still running](docs/images/problem.png)

Claude Code has no setting that changes this.

## The fix

Claude Code treats queued slash commands differently. It holds them until the turn is over, then runs them one at a time, in the order you sent them. `/queue:next` is a slash command that hands your text to Claude unchanged, so your message gets that later timing.

![Messages queued with /queue:next wait until the job is done, then run in order](docs/images/solution.png)

## Install

Inside Claude Code:

```
/plugin marketplace add zecod/claude-queue
/plugin install queue@zecod
```

The first line adds this repo as a plugin source. You do it once per machine. After that you can also find `queue` by opening `/plugin` and searching the Discover tab.

The same thing from a terminal:

```
claude plugin marketplace add zecod/claude-queue
claude plugin install queue@zecod
```

If `/queue:next` doesn't show up in the command list, restart Claude Code.

## Usage

While Claude is working, queue the next jobs:

```
/queue:next update the changelog
/queue:next commit and push
```

Each one waits until Claude is done with everything, then arrives as a normal message. Several queued messages run one after another.

| You want to | Do this |
|---|---|
| Correct Claude while it works | Type a normal message and press Enter. Claude reads it after the current tool call. |
| Line up the next job for after this one | `/queue:next <message>` |
| Stop Claude now | Press Esc |

To change or drop what you queued, press Up in the empty input box. Claude Code puts the whole queue back in the box, where you can edit it or clear it.

## How it works

The whole plugin is one skill file, [`skills/next/SKILL.md`](skills/next/SKILL.md):

```markdown
---
name: next
description: Queue a message that runs only after Claude finishes the whole turn, not after the current tool call.
argument-hint: <message>
disable-model-invocation: true
---
$ARGUMENTS
```

`$ARGUMENTS` becomes whatever you type after `/queue:next`. `disable-model-invocation: true` means only you can run it. Claude never calls it by itself.

The timing comes from Claude Code itself. Its [interactive mode docs](https://code.claude.com/docs/en/interactive-mode.md#when-claude-code-sends-what-you-queued) say queued commands are held until the turn ends, while plain messages go to Claude after the current tool calls.

## Want plain `/next` instead?

Claude Code always puts the plugin's name in front of a plugin command, so a plugin can't give you a bare `/next`. A personal skill can. Copy the skill file into your user folder.

macOS or Linux:

```sh
mkdir -p ~/.claude/skills/next
curl -fsSL -o ~/.claude/skills/next/SKILL.md https://raw.githubusercontent.com/zecod/claude-queue/main/skills/next/SKILL.md
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$HOME\.claude\skills\next" | Out-Null
Invoke-WebRequest https://raw.githubusercontent.com/zecod/claude-queue/main/skills/next/SKILL.md -OutFile "$HOME\.claude\skills\next\SKILL.md"
```

Then use `/next <message>`. If it doesn't show up, restart Claude Code.

## Update or remove

```
claude plugin update queue@zecod
claude plugin uninstall queue@zecod
```

Restart Claude Code after an update.

## Limits

- A `/queue:next` message reaches Claude as a new turn, so it can't steer the job that's already running. Use a plain message for that.
- Tested with Claude Code 2.1.318 on Windows 11.

## License

MIT
