const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearBtn = document.getElementById('clearBtn');
const connectionStatus = document.getElementById('connectionStatus');
const installBtn = document.getElementById('installBtn');

const STORAGE_KEY = 'pwa-tasks-v1';
let deferredPrompt = null;
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function updateConnectionStatus() {
  const online = navigator.onLine;
  connectionStatus.textContent = online ? 'Online' : 'Offline';
  connectionStatus.className = online ? 'status online' : 'status offline';
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="task-item"><span style="color: var(--muted);">Nenhuma tarefa cadastrada.</span></li>';
  }

  tasks.forEach((task, index) => {
    const item = document.createElement('li');
    item.className = `task-item ${task.done ? 'completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggleTask(index));

    const label = document.createElement('label');
    label.appendChild(checkbox);
    const text = document.createElement('span');
    text.textContent = task.text;
    label.appendChild(text);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Remover';
    deleteBtn.addEventListener('click', () => removeTask(index));

    item.appendChild(label);
    item.appendChild(deleteBtn);
    taskList.appendChild(item);
  });

  taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? 'tarefa' : 'tarefas'}`;
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ text, done: false, createdAt: Date.now() });
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}

function removeTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function clearTasks() {
  if (!confirm('Deseja limpar todas as tarefas?')) return;
  tasks = [];
  saveTasks();
  renderTasks();
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addTask();
});
clearBtn.addEventListener('click', clearTasks);
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.hidden = false;
  installBtn.textContent = 'Instalar app';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  if (choice.outcome === 'accepted') {
    console.log('Usuário aceitou a instalação.');
  } else {
    console.log('Usuário rejeitou a instalação.');
  }
  deferredPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener('appinstalled', () => {
  installBtn.hidden = true;
  console.log('App instalado com sucesso.');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('sw.js');
      console.log('Service Worker registrado:', registration);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          console.log('Service Worker state:', newWorker.state);
        });
      });
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  });
}

updateConnectionStatus();
renderTasks();
