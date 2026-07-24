// BookmarkManager - Main Application
class BookmarkManager {
    constructor() {
        this.groups = [];
        this.settings = this.loadSettings();
        this.currentEditingGroupId = null;
        this.currentEditingBookmarkId = null;
        this.draggedItem = null;
        this.dragSource = null;
        this.loadData();
        this.init();
    }

    init() {
        this.applySettings();
        this.render();
        this.setupEventListeners();
    }

    loadSettings() {
        const defaults = {
            tileSize: 120,
            displayMode: 'icon-left',
            columns: 'auto'
        };
        const saved = localStorage.getItem('bm-settings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveSettings() {
        localStorage.setItem('bm-settings', JSON.stringify(this.settings));
    }

    applySettings() {
        document.documentElement.style.setProperty('--tile-size', this.settings.tileSize + 'px');
        document.getElementById('tileSize').value = this.settings.tileSize;
        document.getElementById('displayMode').value = this.settings.displayMode;
        document.getElementById('columns').value = this.settings.columns;
    }

    loadData() {
        const saved = localStorage.getItem('bm-data');
        if (saved) {
            this.groups = JSON.parse(saved);
        } else {
            this.createDefaultGroups();
        }
    }

    createDefaultGroups() {
        this.groups = [
            {
                id: 'group-' + Date.now(),
                name: 'Quick Links',
                bookmarks: []
            }
        ];
        this.saveData();
    }

    saveData() {
        localStorage.setItem('bm-data', JSON.stringify(this.groups));
    }

    setupEventListeners() {
        document.addEventListener('dragstart', (e) => this.handleDragStart(e));
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
        document.addEventListener('dragend', (e) => this.handleDragEnd(e));
        document.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        document.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    }

    handleDragStart(e) {
        const bookmark = e.target.closest('[data-bookmark-id]');
        const group = e.target.closest('[data-group-id]');
        
        if (bookmark) {
            this.draggedItem = {
                type: 'bookmark',
                bookmarkId: bookmark.dataset.bookmarkId,
                groupId: group.dataset.groupId
            };
            bookmark.classList.add('dragging');
        } else if (e.target.closest('.group-header')) {
            const groupElement = e.target.closest('[data-group-id]');
            this.draggedItem = {
                type: 'group',
                groupId: groupElement.dataset.groupId
            };
            groupElement.querySelector('.group-header').classList.add('dragging');
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        if (this.draggedItem) {
            e.dataTransfer.dropEffect = 'move';
        }
    }

    handleDragEnter(e) {
        if (!this.draggedItem) return;
        
        const group = e.target.closest('[data-group-id]');
        if (group && this.draggedItem.type === 'bookmark') {
            group.classList.add('dragging-over');
        }
    }

    handleDragLeave(e) {
        const group = e.target.closest('[data-group-id]');
        if (group && !group.contains(e.relatedTarget)) {
            group.classList.remove('dragging-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        if (!this.draggedItem) return;

        const targetGroup = e.target.closest('[data-group-id]');
        const targetBookmark = e.target.closest('[data-bookmark-id]');

        if (this.draggedItem.type === 'bookmark' && targetGroup) {
            const sourceGroup = this.getGroup(this.draggedItem.groupId);
            const destGroup = this.getGroup(targetGroup.dataset.groupId);
            
            if (sourceGroup && destGroup) {
                const bookmark = sourceGroup.bookmarks.find(b => b.id === this.draggedItem.bookmarkId);
                if (bookmark) {
                    sourceGroup.bookmarks = sourceGroup.bookmarks.filter(b => b.id !== this.draggedItem.bookmarkId);
                    destGroup.bookmarks.push(bookmark);
                    this.saveData();
                    this.render();
                }
            }
        } else if (this.draggedItem.type === 'group' && targetGroup && targetGroup.dataset.groupId !== this.draggedItem.groupId) {
            const sourceIndex = this.groups.findIndex(g => g.id === this.draggedItem.groupId);
            const destIndex = this.groups.findIndex(g => g.id === targetGroup.dataset.groupId);
            
            if (sourceIndex !== -1 && destIndex !== -1) {
                [this.groups[sourceIndex], this.groups[destIndex]] = [this.groups[destIndex], this.groups[sourceIndex]];
                this.saveData();
                this.render();
            }
        }
    }

    handleDragEnd(e) {
        document.querySelectorAll('.dragging, .dragging-over').forEach(el => {
            el.classList.remove('dragging', 'dragging-over');
        });
        this.draggedItem = null;
    }

    getGroup(groupId) {
        return this.groups.find(g => g.id === groupId);
    }

    addGroup(name) {
        const newGroup = {
            id: 'group-' + Date.now(),
            name: name,
            bookmarks: []
        };
        this.groups.push(newGroup);
        this.saveData();
        this.render();
    }

    deleteGroup(groupId) {
        if (this.groups.length <= 1) {
            alert('You must have at least one group!');
            return;
        }
        this.groups = this.groups.filter(g => g.id !== groupId);
        this.saveData();
        this.render();
    }

    updateGroupName(groupId, newName) {
        const group = this.getGroup(groupId);
        if (group) {
            group.name = newName;
            this.saveData();
            this.render();
        }
    }

    addBookmark(title, url, icon, groupId) {
        const group = this.getGroup(groupId);
        if (!group) return;

        const newBookmark = {
            id: 'bookmark-' + Date.now(),
            title: title,
            url: url,
            icon: icon || null,
            addedDate: new Date().toISOString()
        };

        group.bookmarks.push(newBookmark);
        this.saveData();
        this.render();

        if (!icon) {
            this.fetchFavicon(newBookmark, group);
        }
    }

    deleteBookmark(bookmarkId, groupId) {
        const group = this.getGroup(groupId);
        if (group) {
            group.bookmarks = group.bookmarks.filter(b => b.id !== bookmarkId);
            this.saveData();
            this.render();
        }
    }

    fetchFavicon(bookmark, group) {
        try {
            const url = new URL(bookmark.url);
            const faviconUrl = `${url.origin}/favicon.ico`;
            
            const img = new Image();
            img.onload = () => {
                bookmark.icon = faviconUrl;
                this.saveData();
                this.render();
            };
            img.onerror = () => {
                bookmark.icon = '🔗';
                this.saveData();
                this.render();
            };
            img.src = faviconUrl;
        } catch (e) {
            bookmark.icon = '🔗';
            this.saveData();
            this.render();
        }
    }

    exportBookmarks() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            groups: this.groups
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importBookmarks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.groups && Array.isArray(data.groups)) {
                    if (confirm('This will replace all existing bookmarks. Continue?')) {
                        this.groups = data.groups;
                        this.saveData();
                        this.render();
                        alert('Bookmarks imported successfully!');
                    }
                } else {
                    alert('Invalid bookmark file format.');
                }
            } catch (err) {
                alert('Error importing bookmarks: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    render() {
        const container = document.getElementById('groupsContainer');
        
        if (this.groups.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📁</div><p>No groups yet. Create one to get started!</p></div>';
            return;
        }

        container.innerHTML = this.groups.map(group => this.renderGroup(group)).join('');
    }

    renderGroup(group) {
        const bookmarkHTML = group.bookmarks.length === 0 
            ? '<div class="empty-state" style="padding: 20px;"><p>No bookmarks in this group</p></div>'
            : `<div class="bookmarks-grid">${group.bookmarks.map(bookmark => this.renderBookmark(bookmark, group.id)).join('')}</div>`;

        return `
            <div class="group" data-group-id="${group.id}" draggable="false">
                <div class="group-header" draggable="true">
                    <span class="group-title">${this.escapeHtml(group.name)}</span>
                    <div class="group-controls">
                        <button type="button" onclick="app.openEditGroupModal('${group.id}')" style="background: rgba(255,255,255,0.2);">✏️</button>
                        <button type="button" onclick="app.deleteGroup('${group.id}')" style="background: rgba(255,255,255,0.2);">🗑️</button>
                    </div>
                </div>
                <div class="group-content">
                    ${bookmarkHTML}
                    <button type="button" class="add-bookmark-btn" onclick="app.openAddBookmarkModal('${group.id}')">+ Add Bookmark</button>
                </div>
            </div>
        `;
    }

    renderBookmark(bookmark, groupId) {
        const iconHtml = bookmark.icon
            ? (bookmark.icon.startsWith('http') 
                ? `<img src="${bookmark.icon}" alt="icon" onerror="this.style.display='none'">`
                : `<span>${bookmark.icon}</span>`)
            : '<span>🔗</span>';

        return `
            <div class="bookmark" data-bookmark-id="${bookmark.id}" data-group-id="${groupId}" draggable="true">
                <div class="bookmark-icon">
                    ${iconHtml}
                </div>
                <div class="bookmark-info">
                    <a href="${this.escapeHtml(bookmark.url)}" target="_blank" rel="noopener noreferrer" class="bookmark-title" title="${this.escapeHtml(bookmark.title)}">
                        ${this.escapeHtml(bookmark.title)}
                    </a>
                    <div class="bookmark-url" title="${this.escapeHtml(bookmark.url)}">${this.getDomainFromUrl(bookmark.url)}</div>
                </div>
                <div class="bookmark-actions">
                    <button type="button" onclick="app.openEditBookmarkModal('${bookmark.id}', '${groupId}')">✏️</button>
                    <button type="button" class="delete" onclick="app.deleteBookmark('${bookmark.id}', '${groupId}')">🗑️</button>
                </div>
            </div>
        `;
    }

    getDomainFromUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (e) {
            return url;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    openAddBookmarkModal(groupId) {
        this.currentEditingGroupId = groupId;
        this.currentEditingBookmarkId = null;
        document.getElementById('bookmarkTitle').value = '';
        document.getElementById('bookmarkUrl').value = '';
        document.getElementById('bookmarkIcon').value = '';
        document.getElementById('iconPreview').textContent = '';
        document.querySelector('#bookmarkModal .modal-header').textContent = 'Add Bookmark';
        this.updateGroupSelect();
        document.getElementById('bookmarkGroup').value = groupId;
        document.getElementById('bookmarkModal').classList.add('active');
    }

    openEditBookmarkModal(bookmarkId, groupId) {
        const group = this.getGroup(groupId);
        const bookmark = group.bookmarks.find(b => b.id === bookmarkId);
        
        if (bookmark) {
            this.currentEditingBookmarkId = bookmarkId;
            this.currentEditingGroupId = groupId;
            document.getElementById('bookmarkTitle').value = bookmark.title;
            document.getElementById('bookmarkUrl').value = bookmark.url;
            document.getElementById('bookmarkIcon').value = bookmark.icon || '';
            document.getElementById('iconPreview').textContent = bookmark.icon || '';
            document.querySelector('#bookmarkModal .modal-header').textContent = 'Edit Bookmark';
            this.updateGroupSelect();
            document.getElementById('bookmarkGroup').value = groupId;
            document.getElementById('bookmarkModal').classList.add('active');
        }
    }

    openAddGroupModal() {
        this.currentEditingGroupId = null;
        document.getElementById('groupName').value = '';
        document.getElementById('groupModal').classList.add('active');
    }

    openEditGroupModal(groupId) {
        const group = this.getGroup(groupId);
        if (group) {
            this.currentEditingGroupId = groupId;
            document.getElementById('editGroupName').value = group.name;
            document.getElementById('editGroupModal').classList.add('active');
        }
    }

    updateGroupSelect() {
        const select = document.getElementById('bookmarkGroup');
        select.innerHTML = this.groups.map(g => `<option value="${g.id}">${this.escapeHtml(g.name)}</option>`).join('');
    }
}

// Global app instance
let app;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    app = new BookmarkManager();
});

// Modal and form handlers
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function saveBookmark(e) {
    e.preventDefault();
    const title = document.getElementById('bookmarkTitle').value;
    const url = document.getElementById('bookmarkUrl').value;
    const icon = document.getElementById('bookmarkIcon').value;
    const groupId = document.getElementById('bookmarkGroup').value;

    if (app.currentEditingBookmarkId) {
        const group = app.getGroup(app.currentEditingGroupId);
        const bookmark = group.bookmarks.find(b => b.id === app.currentEditingBookmarkId);
        if (bookmark) {
            bookmark.title = title;
            bookmark.url = url;
            bookmark.icon = icon || null;
        }
    } else {
        app.addBookmark(title, url, icon, groupId);
    }

    app.saveData();
    app.render();
    closeModal('bookmarkModal');
}

function saveGroup(e) {
    e.preventDefault();
    const name = document.getElementById('groupName').value;
    app.addGroup(name);
    closeModal('groupModal');
}

function updateGroup(e) {
    e.preventDefault();
    const name = document.getElementById('editGroupName').value;
    app.updateGroupName(app.currentEditingGroupId, name);
    closeModal('editGroupModal');
}

function toggleSettings() {
    document.getElementById('settingsPanel').classList.toggle('active');
}

function updateSettings() {
    app.settings.tileSize = parseInt(document.getElementById('tileSize').value) || 120;
    app.settings.displayMode = document.getElementById('displayMode').value;
    app.settings.columns = document.getElementById('columns').value;
    app.saveSettings();
    app.applySettings();
}

function exportBookmarks() {
    app.exportBookmarks();
}

function importBookmarks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        if (e.target.files[0]) {
            app.importBookmarks(e.target.files[0]);
        }
    };
    input.click();
}

function resetAllData() {
    if (confirm('This will delete all bookmarks and groups. Are you sure?')) {
        if (confirm('This action cannot be undone. Continue?')) {
            localStorage.removeItem('bm-data');
            localStorage.removeItem('bm-settings');
            location.reload();
        }
    }
}

// Update icon preview on input change
document.addEventListener('DOMContentLoaded', () => {
    const iconInput = document.getElementById('bookmarkIcon');
    if (iconInput) {
        iconInput.addEventListener('input', (e) => {
            document.getElementById('iconPreview').textContent = e.target.value || '';
        });
    }
});
