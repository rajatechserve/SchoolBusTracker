
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_strong_secret';
const DB_FILE = path.join(__dirname, '..', 'app.db');

const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, username TEXT UNIQUE, passwordHash TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS buses (
    id TEXT PRIMARY KEY,
    number TEXT,
    driverId TEXT,
    driverName TEXT,
    driverPhone TEXT,
    started INTEGER DEFAULT 0,
    lat REAL,
    lng REAL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT,
    cls TEXT,
    morningPickup INTEGER DEFAULT 0,
    morningDrop INTEGER DEFAULT 0,
    eveningPickup INTEGER DEFAULT 0,
    eveningDrop INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS pickups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    busId TEXT,
    studentId TEXT,
    type TEXT,
    whenTime TEXT
  )`);
  // default admin
  db.get("SELECT id FROM admins WHERE username = 'admin'", (err,row) => {
    if(!row){
      const pw = 'admin123';
      bcrypt.hash(pw, 10, (e, hash) => {
        db.run(`INSERT INTO admins (id, username, passwordHash) VALUES (?, ?, ?)`, [uuidv4(), 'admin', hash]);
        console.log('Created default admin: admin/admin123');
      });
    }
  });
});

function authenticateToken(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = auth.split(' ');
  if(parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Malformed Authorization header' });
  jwt.verify(parts[1], JWT_SECRET, (err, user) => {
    if(err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function rowToBus(row){
  return {
    id: row.id, number: row.number, driverId: row.driverId, driverName: row.driverName, driverPhone: row.driverPhone,
    started: !!row.started, location: row.lat !== null && row.lng !== null ? { lat: row.lat, lng: row.lng } : null
  };
}

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body||{};
  if(!username || !password) return res.status(400).json({ error: 'username and password required' });
  db.get(`SELECT * FROM admins WHERE username = ?`, [username], (err,row) => {
    if(err) return res.status(500).json({ error: err.message });
    if(!row) return res.status(401).json({ error: 'Invalid credentials' });
    bcrypt.compare(password, row.passwordHash, (e, match) => {
      if(e) return res.status(500).json({ error: e.message });
      if(!match) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET, { expiresIn: '12h' });
      res.json({ token });
    });
  });
});

app.post('/api/auth/register', authenticateToken, (req, res) => {
  const { username, password } = req.body||{};
  if(!username || !password) return res.status(400).json({ error: 'username and password required' });
  bcrypt.hash(password, 10, (e, hash) => {
    if(e) return res.status(500).json({ error: e.message });
    db.run(`INSERT INTO admins (id, username, passwordHash) VALUES (?, ?, ?)`, [uuidv4(), username, hash], function(err2){
      if(err2) return res.status(500).json({ error: err2.message });
      res.json({ username });
    });
  });
});

// Buses endpoints
app.get('/api/buses', authenticateToken, (req,res) => {
  db.all(`SELECT * FROM buses`, [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    const buses = rows.map(rowToBus);
    const promises = buses.map(b => new Promise(resolve => {
      db.get(`SELECT COUNT(*) as c FROM pickups WHERE busId = ? AND type = 'pickup'`, [b.id], (err2, r2) => {
        b.pickedCount = r2 ? r2.c : 0;
        resolve();
      });
    }));
    Promise.all(promises).then(() => res.json(buses));
  });
});

app.get('/api/buses/:id', authenticateToken, (req,res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM buses WHERE id = ? OR number = ?`, [id, id], (err,row) => {
    if (err) return res.status(500).json({error: err.message});
    if (!row) return res.status(404).send('Bus not found');
    res.json(rowToBus(row));
  });
});

app.post('/api/buses', authenticateToken, (req,res) => {
  const { number, driverId, driverName, driverPhone } = req.body||{};
  const id = uuidv4();
  db.run(`INSERT INTO buses (id, number, driverId, driverName, driverPhone) VALUES (?, ?, ?, ?, ?)`, [id, number, driverId, driverName, driverPhone], function(err){
    if(err) return res.status(500).json({ error: err.message });
    db.get(`SELECT * FROM buses WHERE id = ?`, [id], (e,row) => res.json(rowToBus(row)));
  });
});

app.put('/api/buses/:id', authenticateToken, (req,res) => {
  const id = req.params.id;
  const { number, driverId, driverName, driverPhone } = req.body||{};
  db.run(`UPDATE buses SET number = ?, driverId = ?, driverName = ?, driverPhone = ? WHERE id = ? OR number = ?`, [number, driverId, driverName, driverPhone, id, id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    db.get(`SELECT * FROM buses WHERE id = ? OR number = ?`, [id,id], (e,row) => res.json(rowToBus(row)));
  });
});

app.delete('/api/buses/:id', authenticateToken, (req,res) => {
  const id = req.params.id;
  db.run(`DELETE FROM buses WHERE id = ? OR number = ?`, [id,id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Bus location endpoint (unprotected - called by mobile)
app.post('/api/buses/:id/location', (req,res) => {
  const id = req.params.id;
  const { lat, lng } = req.body || {};
  db.run(`UPDATE buses SET lat = ?, lng = ? WHERE id = ? OR number = ?`, [lat, lng, id, id], function(err){
    if (err) return res.status(500).json({error: err.message});
    db.get(`SELECT * FROM buses WHERE id = ? OR number = ?`, [id,id], (e,row) => {
      if (e || !row) return res.status(404).send('Bus not found');
      res.json(rowToBus(row));
    });
  });
});

// Students CRUD (protected)
app.get('/api/students', authenticateToken, (req,res) => {
  db.all(`SELECT * FROM students`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/students', authenticateToken, (req,res) => {
  const { id, name, cls } = req.body||{};
  const nid = id || uuidv4();
  db.run(`INSERT INTO students (id, name, cls) VALUES (?, ?, ?)`, [nid, name, cls], function(err){
    if(err) return res.status(500).json({ error: err.message });
    db.get(`SELECT * FROM students WHERE id = ?`, [nid], (e,row)=> res.json(row));
  });
});
app.put('/api/students/:id', authenticateToken, (req,res) => {
  const id = req.params.id;
  const { name, cls } = req.body||{};
  db.run(`UPDATE students SET name = ?, cls = ? WHERE id = ?`, [name, cls, id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    db.get(`SELECT * FROM students WHERE id = ?`, [id], (e,row)=> res.json(row));
  });
});
app.delete('/api/students/:id', authenticateToken, (req,res) => {
  const id = req.params.id;
  db.run(`DELETE FROM students WHERE id = ?`, [id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Pickups / drops (protected)
app.post('/api/buses/:id/pickup', authenticateToken, (req,res) => {
  const busId = req.params.id;
  const { studentId, shift } = req.body;
  if (!studentId || !shift) return res.status(400).send('studentId and shift required');
  const col = shift === 'morning' ? 'morningPickup' : 'eveningPickup';
  db.run(`UPDATE students SET ${col} = 1 WHERE id = ?`, [studentId], function(err){
    if (err) return res.status(500).json({error: err.message});
    db.run(`INSERT INTO pickups (busId, studentId, type, whenTime) VALUES (?, ?, 'pickup', datetime('now'))`, [busId, studentId], function(e2){
      if (e2) console.error(e2);
      db.get(`SELECT * FROM students WHERE id = ?`, [studentId], (e3,row) => {
        if (e3) return res.status(500).json({ error: e3.message });
        res.json(row);
      });
    });
  });
});
app.post('/api/buses/:id/drop', authenticateToken, (req,res) => {
  const busId = req.params.id;
  const { studentId, shift } = req.body;
  if (!studentId || !shift) return res.status(400).send('studentId and shift required');
  const col = shift === 'morning' ? 'morningDrop' : 'eveningDrop';
  db.run(`UPDATE students SET ${col} = 1 WHERE id = ?`, [studentId], function(err){
    if (err) return res.status(500).json({error: err.message});
    db.run(`INSERT INTO pickups (busId, studentId, type, whenTime) VALUES (?, ?, 'drop', datetime('now'))`, [busId, studentId], function(e2){
      if (e2) console.error(e2);
      db.get(`SELECT * FROM students WHERE id = ?`, [studentId], (e3,row) => {
        if (e3) return res.status(500).json({ error: e3.message });
        res.json(row);
      });
    });
  });
});

app.get('/api/buses/:id/pickups', authenticateToken, (req,res) => {
  const id = req.params.id;
  db.all(`SELECT * FROM pickups WHERE busId = ? ORDER BY whenTime DESC LIMIT 200`, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.get('/api/buses/:id/students', authenticateToken, (req,res) => {
  const id = req.params.id;
  db.all(`SELECT s.*, (SELECT whenTime FROM pickups p WHERE p.studentId = s.id AND p.busId = ? AND p.type = 'pickup' ORDER BY whenTime DESC LIMIT 1) as lastPickup, (SELECT whenTime FROM pickups p WHERE p.studentId = s.id AND p.busId = ? AND p.type = 'drop' ORDER BY whenTime DESC LIMIT 1) as lastDrop FROM students s`, [id,id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Drivers list + CRUD (stored via buses table)
app.get('/api/drivers', authenticateToken, (req,res) => {
  db.all(`SELECT DISTINCT driverId, driverName, driverPhone FROM buses`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/drivers', authenticateToken, (req,res) => {
  const { driverId, driverName, driverPhone } = req.body||{};
  if(!driverId) return res.status(400).json({ error: 'driverId required' });
  db.run(`INSERT INTO buses (id, number, driverId, driverName, driverPhone) VALUES (?, ?, ?, ?, ?)`, [uuidv4(), driverId+'-bus', driverId, driverName, driverPhone], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ driverId, driverName, driverPhone });
  });
});
app.put('/api/drivers/:driverId', authenticateToken, (req,res) => {
  const driverId = req.params.driverId;
  const { driverName, driverPhone } = req.body||{};
  db.run(`UPDATE buses SET driverName = ?, driverPhone = ? WHERE driverId = ?`, [driverName, driverPhone, driverId], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ driverId, driverName, driverPhone });
  });
});
app.delete('/api/drivers/:driverId', authenticateToken, (req,res) => {
  const driverId = req.params.driverId;
  db.run(`DELETE FROM buses WHERE driverId = ?`, [driverId], function(err){
    if(err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Swagger UI
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '..', 'docs', 'swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
  console.log('Swagger UI available at /api/docs');
} catch (e) {
  console.warn('Could not load swagger docs:', e.message);
}

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
