# Craft to Obsidian

Craft allows you to export notes in Markdown format, but you may not want to move them to Obsidian immediately due to certain differences. This repository contains a script that can help you migrate Craft notes to Obsidian by performing various tasks.

- renames `yyyy.mm.dd.md` to `yyyy-mm-dd.md`.
- renames `yyyy.mm.dd.assets` folders to `yyyy-mm-dd.assets`.
- updates `yyyy.mm.dd.assets` to `yyyy-mm-dd.assets` inside daily notes.
- removes the title `# note title` because Obsidian takes filename as title by default.
- removes asset files whose name end with `_preview.png`.
- converts tiff to png and replaces the image link in markdown files
- converts `[22 Jul 2023](day://2023.07.22)` to `[[2023-07-22]]` in markdown files.

## Before Getting Started

This script is experimental and updates your Craft export. Make sure you have a copy of it, as unexpected results may occur. Also, before importing all of these into your Obsidian vault, make a copy of it. **Use it at your own risk.**

## Getting Started

Clone this repository and run the following:

```sh
npm install

node craft-to-obsidian your-folder-path
```
