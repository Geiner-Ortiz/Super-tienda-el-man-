const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /u003e/g, to: '>' },
    { from: /u003c/g, to: '<' },
    { from: /u0026/g, to: '&' },
    { from: /\uFFFD/g, to: 'u' }, // Fallback for unknown corruption
];

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (f === 'node_modules' || f === '.next' || f === '.git') return;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

const srcDir = path.join(process.cwd(), 'src');

walk(srcDir, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        replacements.forEach(r => {
            content = content.replace(r.from, r.to);
        });

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed escapes in: ${filePath}`);
        }
    }
});
