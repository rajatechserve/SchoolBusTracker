const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = function initDb(db){
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS admins(id TEXT PRIMARY KEY, username TEXT UNIQUE, passwordHash TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS drivers(id TEXT PRIMARY KEY, name TEXT, phone TEXT, license TEXT, schoolId TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS students(id TEXT PRIMARY KEY, name TEXT, cls TEXT, parentId TEXT, busId TEXT, schoolId TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS parents(id TEXT PRIMARY KEY, name TEXT, phone TEXT, schoolId TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS buses(id TEXT PRIMARY KEY, number TEXT, driverId TEXT, routeId TEXT, started INTEGER DEFAULT 0, lat REAL, lng REAL, schoolId TEXT)`);
    db.all("PRAGMA table_info(buses)", (err, rows)=>{
      if(!err && rows && !rows.some(c=>c.name==='routeId')){
        db.run("ALTER TABLE buses ADD COLUMN routeId TEXT");
      }
      if(!err && rows && !rows.some(c=>c.name==='schoolId')){
        db.run("ALTER TABLE buses ADD COLUMN schoolId TEXT");
      }
    });
    db.run(`CREATE TABLE IF NOT EXISTS routes(id TEXT PRIMARY KEY, name TEXT, stops TEXT, schoolId TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS attendance(id TEXT PRIMARY KEY, studentId TEXT, busId TEXT, timestamp INTEGER, status TEXT, schoolId TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY, driverId TEXT, busId TEXT, routeId TEXT, schoolId TEXT)`);
    // Add schoolId to existing tables
    ['drivers','students','parents','routes','attendance','assignments'].forEach(tbl=>{
      db.all(`PRAGMA table_info(${tbl})`, (err, rows)=>{
        if(!err && rows && !rows.some(c=>c.name==='schoolId')){
          db.run(`ALTER TABLE ${tbl} ADD COLUMN schoolId TEXT`);
        }
      });
    });
    // Extended schools schema: add city,state,county,phone,mobile,username,passwordHash
    db.run(`CREATE TABLE IF NOT EXISTS schools(id TEXT PRIMARY KEY, name TEXT, address TEXT, city TEXT, state TEXT, county TEXT, phone TEXT, mobile TEXT, username TEXT UNIQUE, passwordHash TEXT, logo TEXT, photo TEXT)`);
    // Add missing columns for existing deployments
    db.all("PRAGMA table_info(schools)", (err, rows)=>{
      if(err||!rows) return;
      const have = (c)=> rows.some(r=>r.name===c);
      const toAdd = [
        ['city','TEXT'],['state','TEXT'],['county','TEXT'],['phone','TEXT'],['mobile','TEXT'],['username','TEXT'],['passwordHash','TEXT'],['logo','TEXT'],['photo','TEXT']
      ].filter(([c])=>!have(c));
      toAdd.forEach(([c,t])=>{ db.run(`ALTER TABLE schools ADD COLUMN ${c} ${t}`); });
      // Ensure username uniqueness if column exists
      if(have('username')) db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_username ON schools(username)');
    });
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone)');
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone)');
    db.get("SELECT id FROM admins WHERE username='admin'", (err,row)=>{
      if(!row){
        bcrypt.hash('admin123',10,(e,h)=>{ if(!e) db.run(`INSERT INTO admins (id, username, passwordHash) VALUES (?,?,?)`, [uuidv4(),'admin',h]); });
      }
    });
  });
};
