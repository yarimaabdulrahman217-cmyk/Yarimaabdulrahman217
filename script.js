// script.js - NYSC 2026 SAED CLASS ATTENDANCE APP
// all logic in one file – works with the provided HTML structure

(function() {
  "use strict";

  // ---------- Department list (21 departments) ----------
  const DEPT_NAMES = [
    'ICT', 'Poultry', 'Makeup & Gele', 'Knitting', 'Cyber Security',
    'Photography & Filming', 'Fashion Design', 'Shoe Making', 'Event Decoration',
    'Construction Aluminium', 'Baking', 'Bag Making', 'Catering', 'Beads Making',
    'Automobile', 'Food Processing', 'Painting & Screeding', 'Barbing',
    'Power & Energy', 'Cosmetology', 'Tye & Dye'
  ];

  // ---------- State ----------
  let departments = [];

  // ---------- Helpers ----------
  function uid() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 8);
  }

  function defaultMeta() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10);
    const timeStr = now.toTimeString().slice(0,5);
    return {
      day: 'Monday',
      date: dateStr,
      time: timeStr,
      year: now.getFullYear().toString(),
      classTime: '09:30'
    };
  }

  function createDepartment(name) {
    return {
      id: uid(),
      name: name,
      participants: [],
      meta: defaultMeta()
    };
  }

  // ---------- Render ----------
  function render() {
    const grid = document.getElementById('deptGrid');
    if (!grid) return;
    grid.innerHTML = '';

    departments.forEach((dept) => {
      const card = document.createElement('div');
      card.className = 'dept-card';
      card.dataset.id = dept.id;

      // Header
      const header = document.createElement('div');
      header.className = 'dept-header';
      header.innerHTML = `
        <span class="dept-name"><i class="fas fa-users"></i> ${dept.name}</span>
        <div class="dept-actions">
          <button class="delete-dept" data-id="${dept.id}" title="Delete department"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
      card.appendChild(header);

      // Meta fields
      const metaDiv = document.createElement('div');
      metaDiv.className = 'attendance-meta';
      metaDiv.innerHTML = `
        <span class="meta-item"><i class="fas fa-calendar-day"></i> <input type="text" class="meta-day" value="${dept.meta.day}" placeholder="Day"></span>
        <span class="meta-item"><i class="fas fa-calendar-alt"></i> <input type="date" class="meta-date" value="${dept.meta.date}"></span>
        <span class="meta-item"><i class="fas fa-clock"></i> <input type="time" class="meta-time" value="${dept.meta.time}"></span>
        <span class="meta-item"><i class="fas fa-calendar"></i> <input type="number" class="meta-year" value="${dept.meta.year}" min="2020" max="2030" style="max-width:70px;"></span>
        <span class="meta-item"><i class="fas fa-hourglass-start"></i> <input type="time" class="meta-classtime" value="${dept.meta.classTime}"></span>
      `;
      card.appendChild(metaDiv);

      // Participant list
      const list = document.createElement('ul');
      list.className = 'participant-list';
      list.id = `list-${dept.id}`;
      dept.participants.forEach((p, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="snum">${i+1}</span>
          <span class="pname">${p}</span>
          <button class="del-btn" data-id="${dept.id}" data-index="${i}"><i class="fas fa-user-minus"></i></button>
        `;
        list.appendChild(li);
      });
      card.appendChild(list);

      // Add participant
      const addDiv = document.createElement('div');
      addDiv.className = 'add-participant';
      addDiv.innerHTML = `
        <input type="text" placeholder="Add name ..." class="add-input" data-id="${dept.id}">
        <button class="add-btn" data-id="${dept.id}"><i class="fas fa-user-plus"></i> Add</button>
      `;
      card.appendChild(addDiv);

      // Total + Serial
      const totalDiv = document.createElement('div');
      totalDiv.className = 'dept-total';
      const count = dept.participants.length;
      totalDiv.innerHTML = `
        <span><i class="fas fa-hashtag"></i> Serial: ${count}</span>
        <span><i class="fas fa-user-friends"></i> Total: ${count}</span>
      `;
      card.appendChild(totalDiv);

      grid.appendChild(card);
    });

    // Re-bind events after render
    attachEvents();
  }

  // ---------- Event Binding ----------
  function attachEvents() {
    // Delete department
    document.querySelectorAll('.delete-dept').forEach(btn => {
      btn.onclick = function(e) {
        e.stopPropagation();
        const id = this.dataset.id;
        const dept = departments.find(d => d.id === id);
        if (!dept) return;
        if (confirm(`Delete department "${dept.name}" ?`)) {
          departments = departments.filter(d => d.id !== id);
          render();
        }
      };
    });

    // Add participant
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.onclick = function() {
        const id = this.dataset.id;
        const input = document.querySelector(`.add-input[data-id="${id}"]`);
        const name = input.value.trim();
        if (name === '') return alert('Please enter a name');
        const dept = departments.find(d => d.id === id);
        if (dept) {
          dept.participants.push(name);
          render();
        }
      };
    });

    // Delete participant
    document.querySelectorAll('.del-btn').forEach(btn => {
      btn.onclick = function() {
        const id = this.dataset.id;
        const index = parseInt(this.dataset.index);
        const dept = departments.find(d => d.id === id);
        if (dept) {
          dept.participants.splice(index, 1);
          render();
        }
      };
    });

    // Meta updates (on change)
    document.querySelectorAll('.meta-day, .meta-date, .meta-time, .meta-year, .meta-classtime').forEach(el => {
      el.onchange = function() {
        const card = this.closest('.dept-card');
        if (!card) return;
        const id = card.dataset.id;
        const dept = departments.find(d => d.id === id);
        if (!dept) return;
        if (this.classList.contains('meta-day')) dept.meta.day = this.value;
        else if (this.classList.contains('meta-date')) dept.meta.date = this.value;
        else if (this.classList.contains('meta-time')) dept.meta.time = this.value;
        else if (this.classList.contains('meta-year')) dept.meta.year = this.value;
        else if (this.classList.contains('meta-classtime')) dept.meta.classTime = this.value;
      };
    });

    // Enter key on add input
    document.querySelectorAll('.add-input').forEach(inp => {
      inp.onkeypress = function(e) {
        if (e.key === 'Enter') {
          const btn = this.parentElement.querySelector('.add-btn');
          if (btn) btn.click();
        }
      };
    });
  }

  // ---------- Add new department ----------
  function addDepartment() {
    let name = prompt('Enter new department name:');
    if (name && name.trim() !== '') {
      departments.push(createDepartment(name.trim()));
      render();
    } else if (name !== null) {
      alert('Name cannot be empty');
    }
  }

  // ---------- Init ----------
  function init() {
    // Populate initial departments
    DEPT_NAMES.forEach(d => departments.push(createDepartment(d)));
    render();

    // Hook up "Add Department" button
    const addBtn = document.getElementById('addDeptBtn');
    if (addBtn) addBtn.addEventListener('click', addDepartment);

    // Mentor fields are pre-filled, but we can add a small sync if needed
    // (they are just UI, no extra logic required)
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();