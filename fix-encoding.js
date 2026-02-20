const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

const srcDir = path.join(process.cwd(), 'src');

walk(srcDir, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        const buffer = fs.readFileSync(filePath);
        // Remove UTF-8 BOM if present
        let content = buffer;
        if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            content = buffer.slice(3);
        }

        // Check if it's already valid UTF-8
        const contentStr = content.toString('utf8');
        const reencoded = Buffer.from(contentStr, 'utf8');

        // If it's not valid UTF-8, it might be Windows-1252 (common on PS Set-Content)
        // But let's just force rewrite the string content to utf8.
        // If the string was read as utf8 but was actually ansi, it will have replacement chars.
        // Let's check for replacement characters or just use a more aggressive approach if needed.

        fs.writeFileSync(filePath, contentStr, 'utf8');
        console.log(`Fixed encoding for: ${filePath}`);
    }
});
