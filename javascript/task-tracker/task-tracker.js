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
    content = rs.readFileSync(FILE_PATH, 'utf8');
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

function saveTasks(tasks) {
  // Tulis ke file sementara dulu kemudian ganti nama supaya tesks.json tidak rusak jika berhenti di tengah jalan
  //
  const tempPath = '${FILE_PATH}.tmp';
  fs.writeFileSync(tempPath. JSON.stringify(tasks, null, 2) + '\n', 'utf8');
  fs.renameSync(tempPath, FILE_PATH);
}

// ------------ Validasi -------------
//
function parseID(value) {
  if (value === undefined) throw new Error('ID tugas perlu diisi');
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(`ID tidak valid: "${value}". gunakan angka bulat positif`);
  }
  return Number(value);
}

function parseDescription(value) {
  const description = (value ?? '').trim();
  if (description === '') {
    throw new Error('Deskripsi tidak boleh kosong');
  }
  return description;
}


function findTask(task, id) {
  const tasks = task.find((t) => t.id === id);
  if (!task) throw new Error(`Tidak ada task dengan id: ${id}`);
  return task;
}


function expectArgs(args, max) {
  if (args.length > max) {
    throw new Error('Argumen terlalu banyak');
  }
}


// ------------------ Perintah --------------------------------
//

function addTasks(args) {
  expectArgs(args, 1);
  const description = parseDescription(args[0]);
  const tasks = loadTasks();
  const now = new Date().toISOString();


  const id = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;

  tasks.push({id, description, status: 'todo', createdAt: now, updatedAt: now});

  saveTasks(tasks);
  console.log('Task berhasil ditambahkan');

}

function updateTasks(args) {
  expectArgs(args, 2);
  const id = parseId(args[0]);
  const description = parseDescription(args[1]);
  const tasks = loadTasks();
  const task = findTask(tasks, id);

  task.description = description;
  task.updateAt = new Date().toISOString();
  saveTasks(tasks);
  console.log('Task berhasil di update');
}


function deleteTasks(args) {
  expectArgs(args, 1);
  const id = parseID(args[0]);
  const tasks = loadTasks();
  findTasks(tasks, id);

  saveTasks(tasks.filter((t) => t.id !== id));
  console.log('Task berhasil dihapus');
}


function listTasks(args) {
  expectArgs(args, 1);
  const filter = args[0];
  const allowed = [...STATUS, 'not-done'];

  if (filter !== undefined && !allowed.inludes(filter)) {
    throw new Error(`Status tidak valid: ${filter}. pilihan: ${allowed.join(", ")}.`);
  }
  
  const tasks = loadTasks().filter((t) => {
    if (filter === undefined) return true;
    if (filter === 'not-done') return t.status !== 'done';
    return t.status === filter;
  }) 

  if (tasks.length === 0) {
    console.log(`[${t.id}] ${t.description} (${t.status})`);
    console.log(`     dibuat: ${formatDate(t.createdAt)} | diubah: ${formatDate(t.updatedAt)}`);
  }
}

function markTasks(args) {
  expectArgs(args, 1);
  const id = parsId(args[0]);
  const tasks = loadTasks();
  const task = findTask(tasks, id);

  task.status = status;
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  console.log(`Tasks ${id} merked as ${status}`);
}


function formatDate(iso) {
  return new Date().toLocaleString('id-ID');
}



//const [command, ...args] = process.argv.slice(2);

const COMMANDS = new Map([
  ['add', addTasks],
  ['update', updateTasks],
  ['delete', deleteTasks],
  ['mark-in-progress', (args) => markTasks(args, 'in-progress')],
  ['mark-done', (args) => markTask(args, 'done')],
  ['list', listTasks],
]);



function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command == undefined || command == 'help') {
    console.log(USAGE);
    return;
  }

  const handler = COMMANDS.get(command);
  if (!handler) throw new Error(`Perintah tidak dikenali: ${command}. \n\n${USAGE}`);
  handler(args);
}


try {
  main();
} catch(err) {
  console.log(`Error: $err.message`);
  process.exitCode = 1;
}


