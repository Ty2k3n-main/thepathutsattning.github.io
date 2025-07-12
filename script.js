let state = {
  people: [],
  boxes: {},
  titles: {},
  nextBoxId: 3
};
let isAdmin = false;

function loadState() {
  const saved = localStorage.getItem('dragDropApp');
  if (saved) {
    state = JSON.parse(saved);
  } else {
    state.boxes = { 1: [], 2: [] };
    state.titles = { 1: 'Ruta 1', 2: 'Ruta 2' };
    state.nextBoxId = 3;
  }
  render();
  loadVakthavande();
}

function saveState() {
  if (!isAdmin) return;
  document.querySelectorAll('.box').forEach(box => {
    const boxId = box.dataset.box;
    const title = box.querySelector('.box-title');
    if (title) {
      state.titles[boxId] = title.innerText;
    }
  });
  localStorage.setItem('dragDropApp', JSON.stringify(state));
}

function render() {
  renderPersonList();
  renderBoxes();
}

function renderPersonList() {
  const list = document.getElementById('personList');
  const search = document.getElementById('search').value.toLowerCase();
  list.innerHTML = '';
  
  list.ondrop = isAdmin ? drop : null;
  list.ondragover = isAdmin ? allowDrop : null;

  state.people.forEach((name, index) => {
    if (!search || name.toLowerCase().includes(search)) {
      const div = document.createElement('div');
      div.className = 'person';
      div.draggable = isAdmin;
      if (isAdmin) div.ondragstart = (e) => drag(e, name);
      div.textContent = name;

      if (isAdmin) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = () => removePerson(index);
        div.appendChild(removeBtn);
      }

      list.appendChild(div);
    }
  });

  document.querySelector('.controls').style.display = isAdmin ? 'flex' : 'none';
}

function renderBoxes() {
  const container = document.getElementById('boxesContainer');
  container.innerHTML = '';

  for (const boxId in state.boxes) {
    const box = document.createElement('div');
    box.className = 'box';
    box.dataset.box = boxId;
    if (isAdmin) {
      box.ondrop = drop;
      box.ondragover = allowDrop;
    }

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    const title = document.createElement('div');
    title.className = 'box-title';
    title.contentEditable = isAdmin;
    title.innerText = state.titles[boxId] || `Ruta ${boxId}`;
    if (isAdmin) title.oninput = saveState;

    header.appendChild(title);

    if (isAdmin) {
      const removeBoxBtn = document.createElement('button');
      removeBoxBtn.className = 'remove-box-btn';
      removeBoxBtn.innerHTML = '🗑️';
      removeBoxBtn.title = 'Ta bort ruta';
      removeBoxBtn.onclick = () => removeBox(boxId);
      header.appendChild(removeBoxBtn);
    }

    box.appendChild(header);

    state.boxes[boxId].forEach(name => {
      const div = document.createElement('div');
      div.className = 'person';
      div.textContent = name;
      if (isAdmin) {
        div.draggable = true;
        div.ondragstart = (e) => drag(e, name);
      }
      box.appendChild(div);
    });

    container.appendChild(box);
  }

  document.querySelector('.add-box-btn').style.display = isAdmin ? 'block' : 'none';
}

function addPerson() {
  const input = document.getElementById('newPerson');
  const name = input.value.trim();
  if (name && !state.people.includes(name)) {
    state.people.push(name);
    input.value = '';
    saveState();
    render();
  }
}

function removePerson(index) {
  const name = state.people[index];
  state.people.splice(index, 1);
  for (const boxId in state.boxes) {
    state.boxes[boxId] = state.boxes[boxId].filter(n => n !== name);
  }
  saveState();
  render();
}

function addBox() {
  const id = state.nextBoxId++;
  state.boxes[id] = [];
  state.titles[id] = `Ruta ${id}`;
  saveState();
  render();
}

function removeBox(boxId) {
  delete state.boxes[boxId];
  delete state.titles[boxId];
  saveState();
  render();
}

function drag(e, name) {
  e.dataTransfer.setData('text/plain', name);
  e.dataTransfer.setData('source', e.target.closest('.box') ? 'box' : 'list');
}

function allowDrop(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const name = e.dataTransfer.getData('text/plain');
  const source = e.dataTransfer.getData('source');
  const boxId = e.currentTarget.dataset.box;

  if (source === 'list') {
    // Från lista till ruta
    if (!state.boxes[boxId].includes(name)) {
      state.boxes[boxId].push(name);
      state.people = state.people.filter(n => n !== name); // Ta bort från listan
      saveState();
      render();
    }
  } else if (source === 'box') {
    // Från ruta till annan ruta eller till listan
    for (const id in state.boxes) {
      if (state.boxes[id].includes(name)) {
        state.boxes[id] = state.boxes[id].filter(n => n !== name);
      }
    }

    if (boxId) {
      // Flytta till annan ruta
      if (!state.boxes[boxId].includes(name)) {
        state.boxes[boxId].push(name);
      }
    } else {
      // Tillbaka till listan
      if (!state.people.includes(name)) {
        state.people.push(name);
      }
    }

    saveState();
    render();
  }
}

function login() {
  const pw = document.getElementById('passwordInput').value;
  if (pw === 'admin123') {
    isAdmin = true;
    localStorage.setItem('isAdmin', 'true');
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    updateVakthavandeAccess();
    render();
  } else {
    alert('Fel lösenord');
  }
}

function logout() {
  isAdmin = false;
  localStorage.removeItem('isAdmin');
  updateVakthavandeAccess();
  location.reload();
}

function guestAccess() {
  isAdmin = false;
  localStorage.removeItem('isAdmin');
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  updateVakthavandeAccess();
  render();
}

document.getElementById('search').addEventListener('input', render);

// Vakthavande Befäl funktioner

function loadVakthavande() {
  const vakthavande = localStorage.getItem('vakthavandeNamn') || '';
  const input = document.getElementById('vakthavandeInput');
  input.value = vakthavande;
  updateVakthavandeAccess();
}

function saveVakthavande() {
  const val = document.getElementById('vakthavandeInput').value.trim();
  localStorage.setItem('vakthavandeNamn', val);
}

function updateVakthavandeAccess() {
  const input = document.getElementById('vakthavandeInput');
  if (isAdmin) {
    input.removeAttribute('readonly');
    input.addEventListener('input', saveVakthavande);
  } else {
    input.setAttribute('readonly', true);
    input.removeEventListener('input', saveVakthavande);
  }
}

// Init

if (localStorage.getItem('isAdmin') === 'true') {
  isAdmin = true;
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
}


loadState();
