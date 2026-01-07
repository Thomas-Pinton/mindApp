import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mindApp.db');

export interface Reflection {
    id: number;
    prompt: string;
    answer: string;
    date: string;
}

export const initDatabase = () => {
    db.execSync(`
    CREATE TABLE IF NOT EXISTS reflections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt TEXT NOT NULL,
      answer TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `);
};

export const saveReflection = (prompt: string, answer: string) => {
    const date = new Date().toISOString();
    db.runSync(
        'INSERT INTO reflections (prompt, answer, date) VALUES (?, ?, ?)',
        [prompt, answer, date]
    );
};

export const getReflections = (): Reflection[] => {
    const allRows = db.getAllSync('SELECT * FROM reflections ORDER BY date DESC');
    return allRows as Reflection[];
}
