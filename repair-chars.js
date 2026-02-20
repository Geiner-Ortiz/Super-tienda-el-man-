const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /S\uFFFDper/g, to: 'Súper' },
    { from: /S\uFFFDer/g, to: 'Súper' },
    { from: /agend\uFFFD/g, to: 'agendó' },
    { from: /continuaci\uFFFDn/g, to: 'continuación' },
    { from: /encontrar\uFFFDs/g, to: 'encontrarás' },
    { from: /Duraci\uFFFDn/g, to: 'Duración' },
    { from: /autom\uFFFDticamente/g, to: 'automáticamente' },
    { from: /Gesti\uFFFDn/g, to: 'Gestión' },
    { from: /Notificaci\uFFFDn/g, to: 'Notificación' },
    { from: /anticipaci\uFFFDn/g, to: 'anticipación' },
    { from: /Pr\uFFFDximo/g, to: 'Próximo' },
    { from: /S\uFFFD/g, to: 'Sí' },
    { from: /D\uFFFDa/g, to: 'Día' },
    { from: /¿Qu\uFFFD/g, to: '¿Qué' },
    { from: /est\uFFFDn/g, to: 'están' },
    { from: /borr\uFFFD/g, to: 'borró' },
    { from: /reg\uFFFDstralo/g, to: 'regístralo' },
    { from: /D\uFFFD/g, to: 'Dí' },
    { from: /envi\uFFFDndoles/g, to: 'enviándoles' },
    { from: /morosos/g, to: 'morosos' }, // just in case
];

function walk(dir, callback) {
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
            console.log(`Repaired characters in: ${filePath}`);
        }
    }
});
