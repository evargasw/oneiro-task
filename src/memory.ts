import fs from 'fs';
import path from 'path';
import { Data } from './types';

const MEMORY_FILE = path.resolve(__dirname, 'memory.json');

const readFromMemory = (): Data => {
    if (!fs.existsSync(MEMORY_FILE)) return [] as unknown as Data;
    try {
        const data = fs.readFileSync(MEMORY_FILE, 'utf-8');
        return JSON.parse(data) as Data;
    } catch (error) {
        console.error('Error reading or parsing memory file:', error);
        return [] as unknown as Data;
    }
};

const writeToMemory = (calculations: Data): void => {
    fs.writeFileSync(
        MEMORY_FILE,
        JSON.stringify(calculations, null, 2),
        'utf-8',
    );
};

const clearMemory = (): void => {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify([], null, 2), 'utf-8');
};

export { readFromMemory, writeToMemory, clearMemory };
