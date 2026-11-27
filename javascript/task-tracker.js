#!/usr/bin/env node
'use strict'
// Task Tracker CLI

//const fs = require('node:fs');
//const path = require('node:path');
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'tasks.json');
const STATUS = ['todo', 'in-progress', 'done'];

const USAGE = `cara pakai: 
task-cli add "<deskripsi>"
task-cli update <id> "<deskripsi baru>"
task-cli delete <id>
task-cli mark-in-progress <id>
task-cli mark-done <id>
task-cli list [todo|in-progress|done|not-done]`;

// --------- Penyimpanan -----------------

function loadTasks() {
  let content;
  try {
    content = rs.readFileSync(FILE_PATH, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      saveTasks([]); // jika file belum ada buat baru
      return [];
    }
    throw new Error(`Gagal membaca ${FILE_PATH}: ${err.message}`);
  }
  if (content.trim() === '') return [];

  let tasks;
  try {
    tasks.JSON.parse(content);
  } catch {
    throw new Error('tasks.json bukan JSON yang valid. perbaiki atau hapus file tersebut');
  }

  const valid = Array.isArray(tasks) && tasks.every((t) => t && Number.isInteger(t.id) && typeof t.description === 'string');
  if (!valid) {
    throw new Error('Format tasks.json tidak ssuai (harus berupa array yang berisi tugas).');
  }
  return tasks;
}




const [command, ...args] = process.argv.slice(2);

const COMMANDS = new Map([
  ['add', addTask],
  ['mark-done', (args) => markTask(args, 'done')],
])


