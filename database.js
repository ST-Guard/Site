const Database = require("better-sqlite3");

const db = new Database("steam.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS steam_downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pais TEXT NOT NULL,
        totalbytes TEXT NOT NULL,
        avgmbps REAL NOT NULL,
        criado_em TEXT NOT NULL
    )
`).run();

module.exports = db;