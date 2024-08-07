import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname, __filename, import.meta.url);

// Define the directory to process
const distDir = join(__dirname, 'dist');

const fixImports = (filePath) => {
    let content = readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(/(import\s.*?from\s+['"])(.*?)(['"];?)/g, (match, p1, p2, p3) => {
        if (p2.endsWith('.js')) {
            return match;
        }
        return `${p1}${p2}.js${p3}`;
    });
    writeFileSync(filePath, updatedContent, 'utf8');
};

// Recursively process files in the directory
const processDirectory = (dir) => {
    readdirSync(dir).forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.js')) {
            fixImports(filePath);
        }
    });
};

// Start processing
processDirectory(distDir);
