const fs = require('fs');
const path = require('path');

const replacements = [
    { from: /LexAgenda/g, to: 'Tu Súper Tienda' },
    { from: /Abogado/g, to: 'Personal' },
    { from: /Abogados/g, to: 'Personal' },
    { from: /abogado/g, to: 'personal' },
    { from: /abogados/g, to: 'personal' },
    { from: /Lawyer/g, to: 'Personal' },
    { from: /Lawyers/g, to: 'Personal' },
    { from: /lawyer/g, to: 'personal' },
    { from: /lawyers/g, to: 'personal' },
    { from: /Cita/g, to: 'Turno' },
    { from: /Citas/g, to: 'Turnos' },
    { from: /cita/g, to: 'turno' },
    { from: /citas/g, to: 'turnos' },
    { from: /Appointment/g, to: 'Turno' },
    { from: /Appointments/g, to: 'Turnos' },
    { from: /appointment/g, to: 'turno' },
    { from: /appointments/g, to: 'turnos' },
    { from: /Jurídica/g, to: 'Tienda' },
    { from: /Consulta/g, to: 'Reserva' },
    { from: /Consultas/g, to: 'Reservas' },
    { from: /Variante/g, to: 'Tipo' },
    { from: /variante/g, to: 'tipo' },
];

const pathsToRemove = [
    'src/features/lawyers',
    'src/features/projects',
    'src/app/(main)/lawyers',
    'src/app/(main)/projects',
];

function deleteFolderRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
        console.log(`Deleted folder: ${directoryPath}`);
    }
};

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

// 1. Rename content
walk(srcDir, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.md')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        replacements.forEach(r => {
            content = content.replace(r.from, r.to);
        });

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated terms in: ${filePath}`);
        }
    }
});

// 2. Cleanup legacy
pathsToRemove.forEach(p => {
    deleteFolderRecursive(path.join(process.cwd(), p));
});

console.log('Rebranding and cleanup complete.');
