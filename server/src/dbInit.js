const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = function initDb(db){
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS admins(id TEXT PRIMARY KEY, username TEXT UNIQUE, passwordHash TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS drivers(id TEXT PRIMARY KEY, name TEXT, phone TEXT, license TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS students(id TEXT PRIMARY KEY, name TEXT, cls TEXT, parentId TEXT, busId TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS parents(id TEXT PRIMARY KEY, name TEXT, phone TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS buses(id TEXT PRIMARY KEY, number TEXT, driverId TEXT, driverName TEXT, driverPhone TEXT, started INTEGER DEFAULT 0, lat REAL, lng REAL)`);
    db.run(`CREATE TABLE IF NOT EXISTS routes(id TEXT PRIMARY KEY, name TEXT, stops TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS attendance(id TEXT PRIMARY KEY, studentId TEXT, busId TEXT, timestamp INTEGER, status TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY, driverId TEXT, busId TEXT, routeId TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS schools(id TEXT PRIMARY KEY, name TEXT, address TEXT)`);
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone)');
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone)');
    db.get("SELECT id FROM admins WHERE username='admin'", (err,row)=>{
      if(!row){
        bcrypt.hash('admin123',10,(e,h)=>{ if(!e) db.run(`INSERT INTO admins (id, username, passwordHash) VALUES (?,?,?)`, [uuidv4(),'admin',h]); });
      }
    });
  });
};
