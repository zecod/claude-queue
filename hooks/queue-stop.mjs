#!/usr/bin/env node
// Stop hook for the queue plugin.
// After /queue:run, each time Claude finishes, it hands Claude the next task
// from .claude-queue.md, until the list is empty or MAX_TASKS is reached.
//
// Task lines in .claude-queue.md:
//   - [ ] waiting
//   - [>] handed to Claude, in progress
//   - [x] done

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const MAX_TASKS = Number.parseInt(process.env.CLAUDE_QUEUE_MAX_TASKS ?? "", 10) || 20;

const LINE = /^(\s*[-*]\s+)\[( |>|x|X)\]\s+(.*\S)\s*$/;

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

function reply(payload) {
  if (payload) process.stdout.write(`${JSON.stringify(payload)}\n`);
  process.exit(0);
}

const input = readInput();
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const queueFile = path.join(root, ".claude-queue.md");
const startFile = path.join(root, ".claude-queue.start");
const sessionKey = String(input.session_id || "default").replace(/[^\w-]/g, "");
const countFile = path.join(os.tmpdir(), `claude-queue-${sessionKey}.count`);

const readCount = () => {
  try {
    return Number.parseInt(fs.readFileSync(countFile, "utf8"), 10) || 0;
  } catch {
    return 0;
  }
};
const endRun = (payload) => {
  fs.rmSync(countFile, { force: true });
  reply(payload);
};

// A run starts when /queue:run leaves the start file. It keeps going only while
// Claude is continuing because of this hook (stop_hook_active). A turn you start
// yourself, for example after pressing Esc, doesn't pick up the next task.
const starting = fs.existsSync(startFile);
const running = input.stop_hook_active === true && fs.existsSync(countFile);
if (!starting && !running) reply();

if (starting) {
  fs.rmSync(startFile, { force: true });
  fs.writeFileSync(countFile, "0");
}

if (!fs.existsSync(queueFile)) {
  endRun({ systemMessage: "The queue is empty. Add tasks with /queue:add." });
}

const text = fs.readFileSync(queueFile, "utf8");
const eol = text.includes("\r\n") ? "\r\n" : "\n";
const lines = text.split(/\r?\n/);

// The task handed out last time is finished now that Claude has stopped again.
if (running) {
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(LINE);
    if (m && m[2] === ">") lines[i] = `${m[1]}[x] ${m[3]}`;
  }
}

// An interrupted task ([>]) goes first, then the waiting ones.
let next = lines.findIndex((l) => l.match(LINE)?.[2] === ">");
if (next === -1) next = lines.findIndex((l) => l.match(LINE)?.[2] === " ");

const count = readCount();

if (next === -1) {
  fs.writeFileSync(queueFile, lines.join(eol));
  endRun({
    systemMessage: count > 0
      ? `Queue finished: ${count} task${count === 1 ? "" : "s"} done.`
      : "The queue is empty. Add tasks with /queue:add.",
  });
}

if (count >= MAX_TASKS) {
  fs.writeFileSync(queueFile, lines.join(eol));
  endRun({ systemMessage: `Queue paused after ${count} tasks. Run /queue:run to continue.` });
}

const m = lines[next].match(LINE);
const task = m[3];
lines[next] = `${m[1]}[>] ${task}`;
fs.writeFileSync(queueFile, lines.join(eol));
fs.writeFileSync(countFile, String(count + 1));

const waiting = lines.filter((l) => l.match(LINE)?.[2] === " ").length;
const left = waiting === 0 ? "this is the last one" : `${waiting} more waiting after this`;

reply({
  decision: "block",
  reason:
    `Next task from the queue (task ${count + 1}, ${left}):\n\n${task}\n\n` +
    "Do this task now. When it's done, end your turn and the queue will hand you the next one. " +
    "Don't edit .claude-queue.md yourself.",
});
