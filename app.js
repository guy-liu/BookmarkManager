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
            columns: 'auto',
            showUrlInTile: false,
            theme: 'indigo'
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
        document.getElementById('showUrlInTile').checked = !!this.settings.showUrlInTile;
        document.getElementById('themeSelect').value = this.settings.theme || 'indigo';

        this.applyTheme();

        if (!this.settings.showUrlInTile) {
            document.documentElement.classList.add('compact-tiles');
        } else {
            document.documentElement.classList.remove('compact-tiles');
        }
    }

    applyTheme() {
        const themeKey = this.settings.theme || 'indigo';
        const themeMap = {
            indigo: {
                bg1: '#6366f1', bg2: '#7c3aed', header: '#4338ca', headerAlt: '#5b4ae8', headerText: '#ffffff', button: '#4f46e5', buttonHover: '#4338ca', panelBg: '#f9f7ff', panelAlt: '#efeaff', panelMuted: '#e5dcff', text: '#2e2440', textMuted: '#60507c', border: '#d9cff8', tileBg: '#ffffff', tileBorder: '#d9cff8', shadow: 'rgba(67, 56, 202, 0.14)'
            },
            sunset: {
                bg1: '#f97316', bg2: '#fb7185', header: '#d9485f', headerAlt: '#c2410c', headerText: '#fff7ed', button: '#e11d48', buttonHover: '#be123c', panelBg: '#fff8f3', panelAlt: '#ffe8dd', panelMuted: '#ffd3c1', text: '#4a2c23', textMuted: '#7a4a3f', border: '#f6c4b3', tileBg: '#fffdfb', tileBorder: '#f5d0be', shadow: 'rgba(217, 73, 95, 0.12)'
            },
            ocean: {
                bg1: '#0ea5e9', bg2: '#14b8a6', header: '#0f766e', headerAlt: '#0b4f78', headerText: '#ecfeff', button: '#0f766e', buttonHover: '#0b5b58', panelBg: '#effcff', panelAlt: '#dff9ff', panelMuted: '#d1f2ff', text: '#123246', textMuted: '#49657d', border: '#afd8ea', tileBg: '#f9feff', tileBorder: '#cfeaf8', shadow: 'rgba(8, 145, 178, 0.14)'
            },
            forest: {
                bg1: '#22c55e', bg2: '#0f766e', header: '#166534', headerAlt: '#14532d', headerText: '#f0fdf4', button: '#166534', buttonHover: '#14532d', panelBg: '#f2fbf4', panelAlt: '#e0f5e8', panelMuted: '#cfeedd', text: '#1c2d25', textMuted: '#45675d', border: '#bfdcc5', tileBg: '#fbfffc', tileBorder: '#d1ebdd', shadow: 'rgba(22, 101, 52, 0.14)'
            },
            plum: {
                bg1: '#a855f7', bg2: '#ec4899', header: '#7c3aed', headerAlt: '#5b21b6', headerText: '#f5f3ff', button: '#8b5cf6', buttonHover: '#7c3aed', panelBg: '#faf7ff', panelAlt: '#f0e7ff', panelMuted: '#e6d8ff', text: '#2d1b3d', textMuted: '#644b7d', border: '#d9c3f3', tileBg: '#fffdfd', tileBorder: '#ddc8f5', shadow: 'rgba(124, 58, 237, 0.14)'
            },
            coral: {
                bg1: '#ff7a59', bg2: '#ffbf69', header: '#e53935', headerAlt: '#b91c1c', headerText: '#fff7ed', button: '#ef4444', buttonHover: '#dc2626', panelBg: '#fffaf6', panelAlt: '#ffe7dd', panelMuted: '#ffd5c2', text: '#3a2632', textMuted: '#6c5156', border: '#f0c0b4', tileBg: '#fffdfb', tileBorder: '#f7d4c7', shadow: 'rgba(229, 57, 53, 0.12)'
            },
            slate: {
                bg1: '#475569', bg2: '#64748b', header: '#334155', headerAlt: '#1e293b', headerText: '#f8fafc', button: '#475569', buttonHover: '#334155', panelBg: '#f9fafb', panelAlt: '#edf2f7', panelMuted: '#e2e8f0', text: '#1f2937', textMuted: '#4b5563', border: '#d0d7e1', tileBg: '#ffffff', tileBorder: '#dfe6ee', shadow: 'rgba(30, 41, 59, 0.14)'
            },
            emerald: {
                bg1: '#10b981', bg2: '#14b8a6', header: '#047857', headerAlt: '#065f46', headerText: '#ecfdf5', button: '#047857', buttonHover: '#065f46', panelBg: '#f3fff9', panelAlt: '#e0f5ed', panelMuted: '#cdeee1', text: '#123d31', textMuted: '#476b60', border: '#b7ddd0', tileBg: '#ffffff', tileBorder: '#cfeae0', shadow: 'rgba(5, 150, 105, 0.14)'
            }
        };

        const palette = themeMap[themeKey] || themeMap.indigo;

        document.documentElement.style.setProperty('--bg-1', palette.bg1);
        document.documentElement.style.setProperty('--bg-2', palette.bg2);
        document.documentElement.style.setProperty('--panel-bg', palette.panelBg);
        document.documentElement.style.setProperty('--panel-alt', palette.panelAlt);
        document.documentElement.style.setProperty('--panel-muted', palette.panelMuted);
        document.documentElement.style.setProperty('--text', palette.text);
        document.documentElement.style.setProperty('--text-muted', palette.textMuted);
        document.documentElement.style.setProperty('--border', palette.border);
        document.documentElement.style.setProperty('--tile-bg', palette.tileBg);
        document.documentElement.style.setProperty('--tile-border', palette.tileBorder);
        document.documentElement.style.setProperty('--header-accent', palette.header);
        document.documentElement.style.setProperty('--header-accent-2', palette.headerAlt);
        document.documentElement.style.setProperty('--header-text', palette.headerText);
        document.documentElement.style.setProperty('--button-primary', palette.button);
        document.documentElement.style.setProperty('--button-primary-hover', palette.buttonHover);
        document.documentElement.style.setProperty('--button-secondary', palette.panelMuted);
        document.documentElement.style.setProperty('--button-secondary-hover', palette.border);
        document.documentElement.style.setProperty('--shadow', palette.shadow);
        document.documentElement.dataset.theme = 'custom';
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
                bookmarks: [],
                column: 0,
                row: 0
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
            if (e.dataTransfer) {
                e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedItem));
            }
            return;
        }

        if (group && group.classList.contains('group')) {
            this.draggedItem = {
                type: 'group',
                groupId: group.dataset.groupId
            };
            group.classList.add('dragging');
            if (e.dataTransfer) {
                e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedItem));
            }
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        if (this.draggedItem && this.draggedItem.type === 'bookmark') {
            const targetBookmark = e.target.closest('[data-bookmark-id]');
            if (!targetBookmark) return;

            const sourceBookmark = document.querySelector(`.bookmark[data-bookmark-id="${this.draggedItem.bookmarkId}"]`);
            if (!sourceBookmark || sourceBookmark === targetBookmark) return;

            const sourceGroupId = sourceBookmark.dataset.groupId;
            const targetGroupId = targetBookmark.dataset.groupId;
            if (sourceGroupId !== targetGroupId) return;

            const container = sourceBookmark.parentNode;
            const before = e.clientY < targetBookmark.getBoundingClientRect().top + targetBookmark.offsetHeight / 2;
            container.insertBefore(sourceBookmark, before ? targetBookmark : targetBookmark.nextSibling);

            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
            }
        } else if (this.draggedItem) {
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
            }
        }
    }

    handleDragEnter(e) {
        if (!this.draggedItem) return;

        const group = e.target.closest('[data-group-id]');
        const column = e.target.closest('.groups-column');

        if (group && this.draggedItem.type === 'bookmark') {
            group.classList.add('dragging-over');
        }

        if (column && this.draggedItem.type === 'group') {
            column.classList.add('dragging-over');
        }
    }

    handleDragLeave(e) {
        const group = e.target.closest('[data-group-id]');
        const column = e.target.closest('.groups-column');

        if (group && !group.contains(e.relatedTarget)) {
            group.classList.remove('dragging-over');
        }

        if (column && !column.contains(e.relatedTarget)) {
            column.classList.remove('dragging-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        if (!this.draggedItem) return;

        const targetGroup = e.target.closest('[data-group-id]');
        const targetColumn = e.target.closest('.groups-column');
        const targetBookmark = e.target.closest('[data-bookmark-id]');

        if (this.draggedItem.type === 'bookmark' && targetGroup) {
            const sourceGroup = this.getGroup(this.draggedItem.groupId);
            const destGroup = this.getGroup(targetGroup.dataset.groupId);

            if (sourceGroup && destGroup) {
                const sourceBookmark = document.querySelector(`.bookmark[data-bookmark-id="${this.draggedItem.bookmarkId}"]`);

                if (sourceGroup.id === destGroup.id && sourceBookmark) {
                    const orderedIds = Array.from(sourceBookmark.parentNode.querySelectorAll('.bookmark')).map(el => el.dataset.bookmarkId);
                    const bookmarkMap = new Map(destGroup.bookmarks.map(bookmark => [bookmark.id, bookmark]));
                    const sanitized = Array.from(new Map(destGroup.bookmarks.map(bookmark => [bookmark.id, bookmark])).values());
                    const nextBookmarks = orderedIds
                        .map(id => bookmarkMap.get(id))
                        .filter(Boolean)
                        .filter((bookmark, index, arr) => arr.findIndex(item => item.id === bookmark.id) === index);

                    destGroup.bookmarks = nextBookmarks.length ? nextBookmarks : sanitized;
                } else {
                    const bookmark = sourceGroup.bookmarks.find(b => b.id === this.draggedItem.bookmarkId);
                    if (bookmark) {
                        sourceGroup.bookmarks = this.dedupeBookmarks(sourceGroup.bookmarks.filter(b => b.id !== this.draggedItem.bookmarkId));
                        destGroup.bookmarks = this.dedupeBookmarks(destGroup.bookmarks);
                        destGroup.bookmarks.push(bookmark);
                    }
                }

                this.saveData();
                this.render();
            }
            return;
        }

        if (this.draggedItem.type === 'group') {
            const sourceGroup = this.getGroup(this.draggedItem.groupId);
            if (!sourceGroup) return;

            const dropTargetGroup = targetGroup && targetGroup.dataset.groupId !== this.draggedItem.groupId ? this.getGroup(targetGroup.dataset.groupId) : null;
            const container = e.target.closest('#groupsContainer');
            let targetColumnIndex = sourceGroup.column || 0;

            if (targetColumn) {
                targetColumnIndex = parseInt(targetColumn.dataset.columnIndex, 10);
            } else if (container && !dropTargetGroup) {
                targetColumnIndex = this.groups.reduce((max, group) => Math.max(max, group.column || 0), -1) + 1;
            } else if (dropTargetGroup) {
                targetColumnIndex = dropTargetGroup.column || 0;
            }

            const targetBeforeId = dropTargetGroup ? dropTargetGroup.id : null;
            this.moveGroupToColumn(this.draggedItem.groupId, targetColumnIndex, targetBeforeId, e.clientY, targetGroup, targetColumn);
        }
    }

    handleDragEnd(e) {
        document.querySelectorAll('.dragging, .dragging-over').forEach(el => {
            el.classList.remove('dragging', 'dragging-over');
        });
        document.querySelectorAll('.groups-column.dragging-over').forEach(el => {
            el.classList.remove('dragging-over');
        });
        this.draggedItem = null;
    }

    dedupeBookmarks(bookmarks) {
        const seen = new Set();
        return bookmarks.filter(bookmark => {
            if (!bookmark || !bookmark.id || seen.has(bookmark.id)) {
                return false;
            }
            seen.add(bookmark.id);
            return true;
        });
    }

    moveGroupToColumn(groupId, targetColumn, targetBeforeId, clientY, targetGroupElement, targetColumnElement) {
        const sourceGroup = this.getGroup(groupId);
        if (!sourceGroup) return;

        const targetColumnValue = Number.isFinite(targetColumn) ? targetColumn : (sourceGroup.column || 0);
        const otherGroups = this.groups.filter(g => g.id !== groupId);
        const columnGroups = otherGroups.filter(g => (g.column || 0) === targetColumnValue);

        let insertIndex = columnGroups.length;
        if (targetBeforeId && targetBeforeId !== groupId) {
            const beforeIndex = columnGroups.findIndex(g => g.id === targetBeforeId);
            if (beforeIndex !== -1) {
                insertIndex = beforeIndex;
            }
        } else if (targetGroupElement && targetColumnElement && clientY !== undefined) {
            const rect = targetGroupElement.getBoundingClientRect();
            if (clientY < rect.top + rect.height / 2) {
                insertIndex = 0;
            }
        }

        const groupsByColumn = {};
        const columnKeys = [...new Set(otherGroups.map(g => g.column || 0).concat([targetColumnValue]))].sort((a, b) => a - b);

        for (const column of columnKeys) {
            let columnItems = otherGroups.filter(g => (g.column || 0) === column);
            if (column === targetColumnValue) {
                if (targetBeforeId && targetBeforeId !== groupId) {
                    const beforeIndex = columnItems.findIndex(g => g.id === targetBeforeId);
                    if (beforeIndex !== -1) {
                        columnItems.splice(beforeIndex, 0, sourceGroup);
                    } else {
                        columnItems.push(sourceGroup);
                    }
                } else {
                    columnItems.push(sourceGroup);
                }
            }
            groupsByColumn[column] = columnItems;
        }

        for (const column of columnKeys) {
            const columnItems = groupsByColumn[column] || [];
            columnItems.forEach((group, index) => {
                group.column = column;
                group.row = index;
            });
        }

        // Ensure the source group is always positioned in the target column even when the target column is empty
        sourceGroup.column = targetColumnValue;
        sourceGroup.row = (groupsByColumn[targetColumnValue] || []).findIndex(g => g.id === groupId);

        this.saveData();
        this.render();
    }

    getGroup(groupId) {
        return this.groups.find(g => g.id === groupId);
    }

    addGroup(name) {
        const maxCol = Math.max(0, ...this.groups.map(g => g.column || 0));
        const maxRow = Math.max(0, ...this.groups.filter(g => (g.column || 0) === maxCol).map(g => g.row || 0));
        
        const newGroup = {
            id: 'group-' + Date.now(),
            name: name,
            bookmarks: [],
            column: maxCol,
            row: maxRow + 1
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

    moveGroupUp(groupId) {
        const group = this.getGroup(groupId);
        if (!group || group.row === 0) return;

        const sibling = this.groups.find(g => g.column === group.column && g.row === group.row - 1);
        if (sibling) {
            [group.row, sibling.row] = [sibling.row, group.row];
            this.saveData();
            this.render();
        }
    }

    moveGroupDown(groupId) {
        const group = this.getGroup(groupId);
        if (!group) return;

        const sibling = this.groups.find(g => g.column === group.column && g.row === group.row + 1);
        if (sibling) {
            [group.row, sibling.row] = [sibling.row, group.row];
            this.saveData();
            this.render();
        }
    }

    moveGroupLeft(groupId) {
        const group = this.getGroup(groupId);
        if (!group || group.column === 0) return;

        const targetColumn = group.column - 1;
        const maxRowInTarget = Math.max(-1, ...this.groups.filter(g => g.column === targetColumn).map(g => g.row || 0));
        
        group.column = targetColumn;
        group.row = maxRowInTarget + 1;
        this.saveData();
        this.render();
    }

    moveGroupRight(groupId) {
        const group = this.getGroup(groupId);
        if (!group) return;

        const targetColumn = group.column + 1;
        const maxRowInTarget = Math.max(-1, ...this.groups.filter(g => g.column === targetColumn).map(g => g.row || 0));
        
        group.column = targetColumn;
        group.row = maxRowInTarget + 1;
        this.saveData();
        this.render();
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

        // Ensure all groups have column and row properties
        this.groups.forEach(group => {
            if (group.column === undefined) group.column = 0;
            if (group.row === undefined) group.row = 0;
        });

        // Group by columns
        const columns = {};
        this.groups.forEach(group => {
            const col = group.column || 0;
            if (!columns[col]) columns[col] = [];
            columns[col].push(group);
        });

        // Sort each column by row
        Object.keys(columns).forEach(col => {
            columns[col].sort((a, b) => (a.row || 0) - (b.row || 0));
        });

        // Render columns
        const html = Object.keys(columns)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(col => {
                const groupsInCol = columns[col];
                return `<div class="groups-column" data-column-index="${col}" aria-label="Column ${parseInt(col) + 1}">${groupsInCol.map(group => this.renderGroup(group)).join('')}</div>`;
            })
            .join('');

        container.innerHTML = html;
    }

    renderGroup(group) {
        const bookmarkHTML = group.bookmarks.length === 0 
            ? '<div class="empty-state" style="padding: 20px;"><p>No bookmarks in this group</p></div>'
            : `<div class="bookmarks-grid">${group.bookmarks.map(bookmark => this.renderBookmark(bookmark, group.id)).join('')}</div>`;

        return `
            <div class="group" data-group-id="${group.id}" draggable="true">
                <div class="group-header" draggable="false">
                    <span class="group-title">${this.escapeHtml(group.name)}</span>
                    <div class="group-controls">
                        <div class="group-move-buttons">
                            <button type="button" title="Move Up" onclick="app.moveGroupUp('${group.id}')">⬆️</button>
                            <button type="button" title="Move Down" onclick="app.moveGroupDown('${group.id}')">⬇️</button>
                            <button type="button" title="Move Left" onclick="app.moveGroupLeft('${group.id}')">⬅️</button>
                            <button type="button" title="Move Right" onclick="app.moveGroupRight('${group.id}')">➡️</button>
                        </div>
                        <button type="button" onclick="openEditGroupModal('${group.id}')" style="background: rgba(255,255,255,0.2);">✏️</button>
                        <button type="button" onclick="app.deleteGroup('${group.id}')" style="background: rgba(255,255,255,0.2);">🗑️</button>
                    </div>
                </div>
                <div class="group-content">
                    ${bookmarkHTML}
                    <button type="button" class="add-bookmark-btn" onclick="openAddBookmarkModal('${group.id}')">+ Add Bookmark</button>
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

        const urlHtml = this.settings.showUrlInTile
            ? `<div class="bookmark-url" title="${this.escapeHtml(bookmark.url)}">${this.getDomainFromUrl(bookmark.url)}</div>`
            : '';

        return `
            <div class="bookmark" data-bookmark-id="${bookmark.id}" data-group-id="${groupId}" draggable="true">
                <div class="bookmark-icon">
                    ${iconHtml}
                </div>
                <div class="bookmark-info">
                    <a href="${this.escapeHtml(bookmark.url)}" target="_blank" rel="noopener noreferrer" class="bookmark-title" title="${this.escapeHtml(bookmark.title)}">
                        ${this.escapeHtml(bookmark.title)}
                    </a>
                    ${urlHtml}
                </div>
                <div class="bookmark-actions">
                    <button type="button" onclick="openEditBookmarkModal('${bookmark.id}', '${groupId}')">✏️</button>
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

function openAddGroupModal() {
    if (app) app.openAddGroupModal();
}

function openEditGroupModal(groupId) {
    if (app) app.openEditGroupModal(groupId);
}

function openAddBookmarkModal(groupId) {
    if (app) app.openAddBookmarkModal(groupId);
}

function openEditBookmarkModal(bookmarkId, groupId) {
    if (app) app.openEditBookmarkModal(bookmarkId, groupId);
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
    app.settings.showUrlInTile = document.getElementById('showUrlInTile').checked;
    app.settings.theme = document.getElementById('themeSelect').value || 'indigo';
    app.saveSettings();
    app.applySettings();
    app.render();
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

function parseBulkImportText(text) {
    // Split by lines and filter out empty lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const entries = [];
    for (let i = 0; i < lines.length; i += 2) {
        if (i + 1 < lines.length) {
            const title = lines[i];
            const url = lines[i + 1];
            
            // Validate URL format
            try {
                new URL(url);
                entries.push({ title, url });
            } catch (e) {
                // Skip invalid URLs
                console.warn(`Invalid URL: ${url}`);
            }
        }
    }
    
    return entries;
}

function openBulkImportModal() {
    app.updateGroupSelect();
    const groupSelect = document.getElementById('bulkImportGroup');
    groupSelect.innerHTML = app.groups.map(g => `<option value="${g.id}">${app.escapeHtml(g.name)}</option>`).join('');
    
    document.getElementById('bulkImportText').value = '';
    document.getElementById('importPreview').innerHTML = '';
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('bulkImportModal').classList.add('active');
}

function updateBulkImportPreview() {
    const text = document.getElementById('bulkImportText').value;
    if (!text.trim()) {
        document.getElementById('importPreview').style.display = 'none';
        return;
    }
    
    const entries = parseBulkImportText(text);
    const preview = document.getElementById('importPreview');
    
    if (entries.length === 0) {
        preview.innerHTML = '<div style="color: #999;">No valid bookmarks found</div>';
        preview.style.display = 'block';
        return;
    }
    
    preview.innerHTML = entries.map(entry => `
        <div class="import-preview-item">
            <div class="import-preview-title">${app.escapeHtml(entry.title)}</div>
            <div class="import-preview-url">${app.escapeHtml(entry.url)}</div>
        </div>
    `).join('');
    preview.style.display = 'block';
}

function bulkImportBookmarks(e) {
    e.preventDefault();
    
    const text = document.getElementById('bulkImportText').value;
    const groupId = document.getElementById('bulkImportGroup').value;
    
    const entries = parseBulkImportText(text);
    
    if (entries.length === 0) {
        alert('No valid bookmarks found. Please check the format.');
        return;
    }
    
    const group = app.getGroup(groupId);
    if (!group) {
        alert('Group not found');
        return;
    }
    
    let addedCount = 0;
    entries.forEach(entry => {
        app.addBookmark(entry.title, entry.url, null, groupId);
        addedCount++;
    });
    
    alert(`Successfully imported ${addedCount} bookmark(s) to ${group.name}`);
    closeModal('bulkImportModal');
}

// Update icon preview on input change
document.addEventListener('DOMContentLoaded', () => {
    const iconInput = document.getElementById('bookmarkIcon');
    if (iconInput) {
        iconInput.addEventListener('input', (e) => {
            document.getElementById('iconPreview').textContent = e.target.value || '';
        });
    }
    
    // Add event listener for bulk import text preview
    const bulkImportText = document.getElementById('bulkImportText');
    if (bulkImportText) {
        bulkImportText.addEventListener('input', updateBulkImportPreview);
    }
});
