
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const DB_FILE = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(DB_FILE);
db.serialize(()=>{
  console.log('Creating tables...');
  db.run(`CREATE TABLE IF NOT EXISTS admins(id TEXT PRIMARY KEY, username TEXT UNIQUE, passwordHash TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS drivers(id TEXT PRIMARY KEY, name TEXT, phone TEXT, license TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS students(id TEXT PRIMARY KEY, name TEXT, cls TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS parents(id TEXT PRIMARY KEY, name TEXT, phone TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS buses(id TEXT PRIMARY KEY, number TEXT, driverId TEXT, driverName TEXT, driverPhone TEXT, started INTEGER DEFAULT 0, lat REAL, lng REAL)`);
  db.run(`CREATE TABLE IF NOT EXISTS routes(id TEXT PRIMARY KEY, name TEXT, stops TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS attendance(id TEXT PRIMARY KEY, studentId TEXT, busId TEXT, timestamp INTEGER, status TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY, driverId TEXT, busId TEXT, routeId TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS schools(id TEXT PRIMARY KEY, name TEXT, address TEXT)`);
  db.get("SELECT id FROM admins WHERE username='admin'", (err,row)=>{ if(!row){ bcrypt.hash('admin123',10,(e,h)=>{ db.run(`INSERT INTO admins (id, username, passwordHash) VALUES (?,?,?)`, [uuidv4(),'admin',h]); console.log('Default admin created: admin/admin123'); }); } else { console.log('Admin already exists'); } });

  // Ensure students table has parentId & busId columns
  db.all('PRAGMA table_info(students)', (e, rows) => {
    if (e) { console.warn('Failed to inspect students table', e.message); return; }
    const cols = rows.map(r => r.name);
    if (!cols.includes('parentId')) {
      db.run('ALTER TABLE students ADD COLUMN parentId TEXT', [], err => { if (err) console.warn('Add parentId failed', err.message); else console.log('Added parentId column to students'); });
    }
    if (!cols.includes('busId')) {
      db.run('ALTER TABLE students ADD COLUMN busId TEXT', [], err => { if (err) console.warn('Add busId failed', err.message); else console.log('Added busId column to students'); });
    }
  });

  // Unique phone indexes for drivers & parents
  db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone)');
  db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone)');
  console.log('Done.');
  db.close();
});
