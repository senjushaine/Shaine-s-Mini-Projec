// Data Structure: [{id, title, content, lastEdited}]
let notes = JSON.parse(localStorage.getItem('ZenNotes_v4')) || [];
let activeId = null;
let saveTimeout = null;

// Initial Setup
window.onload = () => {
    const savedTheme = localStorage.getItem('ZenTheme');
    if (savedTheme === 'light') document.getElementById('appBody').classList.remove('dark-mode');
    
    if (notes.length === 0) {
        createNewNote();
    } else {
        activeId = notes[0].id;
        loadNote(activeId);
    }
    renderNoteList();
};

function createNewNote() {
    const newNote = {
        id: Date.now(),
        title: "Untitled Note",
        content: "",
        lastEdited: new Date().toISOString()
    };
    notes.unshift(newNote);
    saveToStorage();
    activeId = newNote.id;
    loadNote(activeId);
    renderNoteList();
}

function loadNote(id) {
    activeId = id;
    const note = notes.find(n => n.id === id);
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('editor').innerHTML = note.content;
    document.getElementById('lastEditedText').innerText = `Last edited: ${new Date(note.lastEdited).toLocaleString()}`;
    updateWordCount();
    
    // Auto-focus editor on load
    document.getElementById('editor').focus();
    renderNoteList();
}

function handleInput() {
    document.getElementById('statusIndicator').innerText = "Typing...";
    
    // Debounce saving to improve performance
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveData();
    }, 500);
}

function saveData() {
    const index = notes.findIndex(n => n.id === activeId);
    if (index === -1) return;

    notes[index].title = document.getElementById('noteTitle').value || "Untitled Note";
    notes[index].content = document.getElementById('editor').innerHTML;
    notes[index].lastEdited = new Date().toISOString();

    saveToStorage();
    document.getElementById('statusIndicator').innerText = "Saved";
    updateWordCount();
    renderNoteList();
}

function renderNoteList() {
    const list = document.getElementById('noteList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = notes.filter(n => n.title.toLowerCase().includes(searchTerm));

    list.innerHTML = filtered.map(n => `
        <div class="note-item ${n.id === activeId ? 'active' : ''}" onclick="loadNote(${n.id})">
            <div style="font-weight:600; margin-bottom:5px;">${n.title}</div>
            <div style="font-size:0.75rem; opacity:0.6;">${new Date(n.lastEdited).toLocaleDateString()}</div>
        </div>
    `).join('');
}

function deleteCurrentNote() {
    if (confirm("Delete this note? This cannot be undone.")) {
        notes = notes.filter(n => n.id !== activeId);
        saveToStorage();
        if (notes.length === 0) {
            createNewNote();
        } else {
            loadNote(notes[0].id);
        }
        renderNoteList();
    }
}

function downloadTxt() {
    const note = notes.find(n => n.id === activeId);
    const date = new Date().toISOString().split('T')[0];
    const filename = `zen-note-${date}.txt`;
    const blob = new Blob([document.getElementById('editor').innerText], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

function updateWordCount() {
    const text = document.getElementById('editor').innerText;
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('wordCount').innerText = `${count} words`;
}

function toggleTheme() {
    const body = document.getElementById('appBody');
    body.classList.toggle('dark-mode');
    localStorage.setItem('ZenTheme', body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function saveToStorage() {
    localStorage.setItem('ZenNotes_v4', JSON.stringify(notes));
}

function toggleSidebar() {
    document.getElementById('appBody').classList.toggle('sidebar-open');
}

function enterFocusMode() {
    document.getElementById('appBody').classList.toggle('focus-mode');
}
