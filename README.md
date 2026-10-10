# 📚 Bookmark Manager

A single-page, browser-based bookmark manager with client-side storage and no external dependencies.

## Features

### Core Functionality
- ✅ Create custom bookmark groups
- ✅ Add bookmarks with title and URL
- ✅ Automatic favicon fetching from bookmark URLs
- ✅ Custom icon support (emoji or URLs)
- ✅ Delete bookmarks and groups

### Layout & Customization
- ✅ **Multi-column group layout** - Groups are organized in columns that automatically wrap
- ✅ **Directional movement buttons** (⬆️⬇️⬅️➡️):
  - **Up/Down** - Reorder groups within the same column
  - **Left/Right** - Move groups to adjacent columns (creates new columns as needed)
- ✅ Drag-and-drop to reorder bookmarks within groups
- ✅ Drag-and-drop to move bookmarks between groups
- ✅ Adjustable bookmark height (tile size: 80-200px)
- ✅ Multiple display modes:
  - Icon + Title (default)
  - Icon on Top
  - Icon Only

### Data Management
- ✅ **Export** bookmarks as JSON file
- ✅ **Import** bookmarks from JSON file
- ✅ **Bulk Import** from plain text format (new!)
- ✅ LocalStorage persistence
- ✅ Settings persist between sessions

## Bulk Import Feature

The bulk import feature allows you to quickly add multiple bookmarks to a group by pasting plain text.

### Format

Enter bookmarks as **title and URL on alternate lines**, with blank lines ignored:

```
Google
https://google.com

Facebook
https://facebook.com

Twitter
https://twitter.com
```

### How to Use

1. Click **📋 Bulk Import** in the header
2. Select the target group
3. Paste your bookmark list in the text area
4. The preview section shows how many bookmarks will be imported
5. Click **Import Bookmarks** to add them all at once

### Features
- Validates URLs before importing
- Shows live preview of parsed bookmarks
- Invalid URLs are skipped automatically
- Blank lines are automatically handled
- Imported bookmarks get automatic favicon fetching

## Usage

### Basic Operations

1. **Open** `index.html` in your browser
2. **Create a group** - Click "➕ Group" or "Add New Group"
3. **Add bookmark** - Click "Add Bookmark" in a group
4. **Organize** - Drag bookmarks to reorder or move between groups

### Settings

Access the **⚙️ Settings** panel to:
- Adjust tile size (80-200px)
- Change display mode
- Customize columns per group
- Reset all data

### Backup & Restore

- **Export** - Download all bookmarks as JSON file
- **Import** - Restore from a previously exported JSON file
- **Bulk Import** - Add multiple bookmarks from plain text

## Technical Details

- **Architecture**: Single-file HTML + embedded CSS & JavaScript
- **Storage**: Browser's LocalStorage (no server needed)
- **Data Format**: JSON (compatible across browsers)
- **Dependencies**: None (pure vanilla JavaScript)
- **Browser Support**: All modern browsers with LocalStorage support

## Group Layout & Movement

Groups are organized in a multi-column layout that automatically wraps and adapts to your screen size.

### Movement Buttons

Each group has 4 directional buttons in the header:

- **⬆️ Up** - Swap with the group above in the same column
- **⬇️ Down** - Swap with the group below in the same column
- **⬅️ Left** - Move to the previous column (or stay in column 0)
- **➡️ Right** - Move to the next column (creates new column if needed)

### Layout Example

With 4 groups, you might arrange them like:

```
Column 0          Column 1          Column 2
┌─────────┐      ┌─────────┐      ┌─────────┐
│ Work    │      │ Social  │      │ Dev     │
│ (4 rows)│      │ (2 rows)│      │ (1 row) │
└─────────┘      └─────────┘      └─────────┘
│ Personal│
│ (3 rows)│
└─────────┘
```

Use the directional buttons to reorganize groups into the layout you prefer!

- `index.html` - Main application file (HTML + CSS)
- `app.js` - JavaScript application logic
- `README.md` - This file

## How It Works

All data is stored in your browser's LocalStorage:
- `bm-data` - Bookmarks and groups
- `bm-settings` - User preferences

No data is sent to any server. Everything happens locally in your browser.

## Tips

- Use emoji as quick custom icons
- Drag group headers to reorder entire groups
- Hover over bookmarks to see edit and delete buttons
- Use the favicon will auto-fetch from the website
- Export regularly to create backups

---

Enjoy organizing your bookmarks! 🚀
