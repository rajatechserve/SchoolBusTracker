import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb() {
  if (!db) {
    db = SQLite.openDatabase('schoolbustracker.db');
  }
  return db;
}

export function initStorage() {
  const database = getDb();
  database.transaction((tx: any) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS kv_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        schoolId TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updatedAt INTEGER NOT NULL,
        UNIQUE(schoolId, key)
      );`
    );
  });
}

export function setCache(schoolId: string, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const val = JSON.stringify(value ?? null);
    const now = Date.now();
    database.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO kv_cache (schoolId, key, value, updatedAt) VALUES (?, ?, ?, ?)
         ON CONFLICT(schoolId, key) DO UPDATE SET value=excluded.value, updatedAt=excluded.updatedAt;`,
        [schoolId, key, val, now],
        () => resolve(),
        (_tx: any, err: any) => { reject(err); return true; }
      );
    });
  });
}

export function getCache<T = any>(schoolId: string, key: string): Promise<{ value: T | null, updatedAt: number | null }> {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.transaction((tx: any) => {
      tx.executeSql(
        `SELECT value, updatedAt FROM kv_cache WHERE schoolId = ? AND key = ? LIMIT 1;`,
        [schoolId, key],
        (_tx: any, res: any) => {
          if (res.rows.length) {
            const row = res.rows.item(0) as any;
            try {
              const parsed = JSON.parse(row.value);
              resolve({ value: parsed, updatedAt: row.updatedAt });
            } catch {
              resolve({ value: null, updatedAt: row.updatedAt });
            }
          } else {
            resolve({ value: null, updatedAt: null });
          }
        },
        (_tx: any, err: any) => { reject(err); return true; }
      );
    });
  });
}

export function clearCacheForSchool(schoolId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.transaction((tx: any) => {
      tx.executeSql(
        `DELETE FROM kv_cache WHERE schoolId = ?;`,
        [schoolId],
        () => resolve(),
        (_tx: any, err: any) => { reject(err); return true; }
      );
    });
  });
}
