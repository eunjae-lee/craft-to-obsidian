#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

function renameFiles(folderPath) {
  const regex = /^(\d{4})\.(\d{2})\.(\d{2})\.md$/; // Regular expression to match "yyyy.mm.dd.md" format

  try {
    const files = fs.readdirSync(folderPath);

    files.forEach((filename) => {
      if (regex.test(filename)) {
        const source = path.join(folderPath, filename);
        const match = regex.exec(filename);
        const target = `${match[1]}-${match[2]}-${match[3]}.md`;

        fs.renameSync(source, path.join(folderPath, target));
        console.log(`File ${filename} renamed to ${target}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

function renameFolders(folderPath) {
  const regex = /^\d{4}\.\d{2}\.\d{2}\.assets$/; // Regular expression to match "yyyy.mm.dd.assets" format

  try {
    const folders = fs.readdirSync(folderPath, { withFileTypes: true });

    folders.forEach((folder) => {
      if (folder.isDirectory() && regex.test(folder.name)) {
        const source = path.join(folderPath, folder.name);
        const target = folder.name
          .replace(/\./g, "-")
          .replace("-assets", ".assets");

        fs.renameSync(source, path.join(folderPath, target));
        console.log(`Folder ${folder.name} renamed to ${target}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

function removeTitle(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    files.forEach((fileName) => {
      const filePath = path.join(folderPath, fileName);
      const isDirectory = fs.statSync(filePath).isDirectory();

      if (isDirectory) {
        removeTitle(filePath);
      } else {
        if (fileName.endsWith(".md")) {
          let fileContent = fs.readFileSync(filePath, "utf-8");
          const lines = fileContent.split("\n");

          if (lines.length > 0 && lines[0].trim().startsWith("# ")) {
            lines.shift(); // Remove the first line

            fileContent = lines.join("\n");

            fs.writeFileSync(filePath, fileContent);
            console.log(`Title removed from file ${fileName}`);
          } else {
            console.log(`No title found in file ${fileName}`);
          }
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}

function replaceAssetFolder(folderPath) {
  const regex = /\((\d{4})\.(\d{2})\.(\d{2})\.assets\//g; // Regular expression to match "(yyyy.mm.dd.assets/"

  try {
    const files = fs.readdirSync(folderPath);

    files.forEach((filename) => {
      if (filename.endsWith(".md")) {
        const filePath = path.join(folderPath, filename);

        let fileContent = fs.readFileSync(filePath, "utf-8");
        const updatedContent = fileContent.replace(regex, "($1-$2-$3.assets/");

        if (fileContent !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent);
          console.log(`Asset folder replaced in file ${filename}`);
        } else {
          console.log(`No asset folder found in file ${filename}`);
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}

function deletePreviewFiles(folderPath) {
  try {
    const contents = fs.readdirSync(folderPath);

    contents.forEach((content) => {
      const contentPath = path.join(folderPath, content);
      const isDirectory = fs.statSync(contentPath).isDirectory();

      if (isDirectory) {
        // Recursively call deletePreviewFiles for inner folder
        deletePreviewFiles(contentPath);
      } else if (content.endsWith("_preview.png")) {
        fs.unlinkSync(contentPath);
        console.log(`File ${contentPath} deleted`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

async function convertAllTiffToPng(folderPath) {
  try {
    const contents = fs.readdirSync(folderPath);

    for (const content of contents) {
      const contentPath = path.join(folderPath, content);
      const isDirectory = fs.statSync(contentPath).isDirectory();

      if (isDirectory) {
        // Recursively call convertAllTiffToPng for inner folder
        convertAllTiffToPng(contentPath);
      } else if (content.endsWith(".tiff") || content.endsWith(".tif")) {
        const pngFilePath = contentPath.replace(/\.tiff$|\.tif$/, ".png");

        try {
          await new Promise((resolve, reject) => {
            Jimp.read(contentPath, function (err, file) {
              file.write(pngFilePath);
              resolve();
            });
          });
          fs.unlinkSync(contentPath);
          console.log(
            `TIFF file ${content} converted to PNG. TIFF file removed.`
          );
        } catch (err) {
          console.error(
            `Failed to convert TIFF file ${content} to PNG: ${err.message}`
          );
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function replaceTiffWithPng(folderPath) {
  const markdownExtensionRegex = /\.md$/i; // Regular expression to match .md file extension

  try {
    const files = fs.readdirSync(folderPath);

    files.forEach((filename) => {
      const filePath = path.join(folderPath, filename);
      const stats = fs.statSync(filePath);

      if (stats.isFile() && markdownExtensionRegex.test(filename)) {
        let fileContent = fs.readFileSync(filePath, "utf-8");
        const lines = fileContent.split("\n");
        let updatedContent = "";

        lines.forEach((line) => {
          let updatedLine = line.replace(/\[([\w.-]+)\.tiff]/g, "[$1.png]");
          updatedLine = updatedLine.replace(/([\w.-]+)\.tiff/g, "$1.png");
          updatedContent += updatedLine + "\n";
        });

        if (fileContent !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent);
          console.log(
            `Replaced .tiff or .tif extensions with .png in file ${filename}`
          );
        }
      } else if (stats.isDirectory()) {
        replaceTiffWithPng(filePath); // Recursively call replaceTiffWithPng for inner folder
      }
    });
  } catch (err) {
    console.error(err);
  }
}

function replaceDailyNoteLink(folderPath) {
  // Read all files in the specified folder
  const files = fs.readdirSync(folderPath);

  files.forEach((fileName) => {
    const filePath = path.join(folderPath, fileName);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      replaceDailyNoteLink(filePath);
    } else {
      if (fileName.endsWith(".md")) {
        const filePath = path.join(folderPath, fileName);

        // Read file content
        let content = fs.readFileSync(filePath, "utf8");

        // Match and replace the daily note link format
        const regex = /\[(.+?)\]\(day:\/\/(\d{4})\.(\d{2})\.(\d{2})\)/g;
        const replacement = "[[$2-$3-$4]]";
        content = content.replace(regex, replacement);

        // Write the modified content back to the file
        fs.writeFileSync(filePath, content);
      }
    }
  });
}

async function main() {
  const folderPath = process.argv[2];
  if (!fs.existsSync(folderPath)) {
    console.error("[ERROR] Folder path is not given or invalid.");
    console.error("  e.g.> node craft-to-obsidian your-folder-path");
    process.exit(1);
  }

  renameFiles(folderPath);
  renameFolders(folderPath);
  removeTitle(folderPath);
  replaceAssetFolder(folderPath);
  deletePreviewFiles(folderPath);
  await convertAllTiffToPng(folderPath);
  replaceTiffWithPng(folderPath);
  replaceDailyNoteLink(folderPath);
}

main();
