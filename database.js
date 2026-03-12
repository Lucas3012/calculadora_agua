const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = {
    save: (table, data) => {
        const filePath = path.join(DATA_DIR, `${table}.json`);
        let content = [];
        if (fs.existsSync(filePath)) {
            content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        const newEntry = { id: Date.now() + Math.random(), ...data };
        content.push(newEntry);
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        return newEntry;
    },
    findAll: (table) => {
        const filePath = path.join(DATA_DIR, `${table}.json`);
        if (!fs.existsSync(filePath)) return [];
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (e) {
            return [];
        }
    },
    findOne: (table, criteria) => {
        const data = db.findAll(table);
        return data.find(item => 
            Object.keys(criteria).every(key => item[key] === criteria[key])
        );
    }
};

module.exports = db;
