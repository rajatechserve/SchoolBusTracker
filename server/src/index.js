require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this_secret';
const DB_FILE = path.join(__dirname, '..', 'app.db');
const db = new sqlite3.Database(DB_FILE);
const initDb = require('./dbInit');

function runSql(sql, params = [])
{
    return new Promise((resolve, reject) =>
    {
        db.run(sql, params, function (err)
        {
            if (err) reject(err);
            else resolve(this);
        });
    });
}
function allSql(sql, params = [])
{
    return new Promise((resolve, reject) =>
    {
        db.all(sql, params, (err, rows) =>
        {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}
function getSql(sql, params = [])
{
    return new Promise((resolve, reject) =>
    {
        db.get(sql, params, (err, row) =>
        {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Initialize database schema & seed default admin.
initDb(db);

// Verify tables exist; create if somehow missing (defensive for older db files).
const REQUIRED_TABLES = ['admins','drivers','students','parents','buses','routes','attendance','assignments','schools'];
function ensureTables() {
    db.serialize(() => {
        REQUIRED_TABLES.forEach(tbl => {
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tbl], (err, row) => {
                if (err) {
                    console.error('Table check error for', tbl, err.message);
                    return;
                }
                if (!row) {
                    console.warn(`Missing table '${tbl}', creating now.`);
                    switch (tbl) {
                        case 'admins': db.run(`CREATE TABLE IF NOT EXISTS admins(id TEXT PRIMARY KEY, username TEXT UNIQUE, passwordHash TEXT)`); break;
                        case 'drivers': db.run(`CREATE TABLE IF NOT EXISTS drivers(id TEXT PRIMARY KEY, name TEXT, phone TEXT, license TEXT)`); break;
                        case 'students': db.run(`CREATE TABLE IF NOT EXISTS students(id TEXT PRIMARY KEY, name TEXT, cls TEXT, parentId TEXT, busId TEXT)`); break;
                        case 'parents': db.run(`CREATE TABLE IF NOT EXISTS parents(id TEXT PRIMARY KEY, name TEXT, phone TEXT)`); break;
                        case 'buses': db.run(`CREATE TABLE IF NOT EXISTS buses(id TEXT PRIMARY KEY, number TEXT, driverId TEXT, driverName TEXT, driverPhone TEXT, started INTEGER DEFAULT 0, lat REAL, lng REAL)`); break;
                        case 'routes': db.run(`CREATE TABLE IF NOT EXISTS routes(id TEXT PRIMARY KEY, name TEXT, stops TEXT)`); break;
                        case 'attendance': db.run(`CREATE TABLE IF NOT EXISTS attendance(id TEXT PRIMARY KEY, studentId TEXT, busId TEXT, timestamp INTEGER, status TEXT)`); break;
                        case 'assignments': db.run(`CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY, driverId TEXT, busId TEXT, routeId TEXT)`); break;
                        case 'schools': db.run(`CREATE TABLE IF NOT EXISTS schools(id TEXT PRIMARY KEY, name TEXT, address TEXT)`); break;
                    }
                }
            });
        });
    });
}
ensureTables();

// Add a cache to store validated tokens
const tokenCache = new Map();

function authenticateToken(req, res, next)
{
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Malformed Authorization header' });

    const token = parts[1];

    // Check if the token is already cached
    if (tokenCache.has(token))
    {
        const cachedUser = tokenCache.get(token);
        // Check if the cached token is still valid
        if (cachedUser.exp > Date.now() / 1000)
        {
            req.user = cachedUser;
            return next();
        } else
        {
            tokenCache.delete(token); // Remove expired token from cache
        }
    }

    jwt.verify(token, JWT_SECRET, (err, user) =>
    {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        // Cache the token with its expiration time
        tokenCache.set(token, user);
        next();
    });
}

// Serve swagger UI
try
{
    const swaggerDoc = YAML.load(path.join(__dirname, '..', 'docs', 'swagger.yaml'));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, { explorer: true }));
    console.log('Swagger UI available at /api/docs');
} catch (e)
{
    console.error('Failed to load swagger.yaml:', e.message);
}

// ------------------ AUTH endpoints ------------------
app.post('/api/auth/login', async (req, res) =>
{
    try
    {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ error: 'username and password required' });
        const row = await getSql('SELECT * FROM admins WHERE username=?', [username]);
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });
        const match = await bcrypt.compare(password, row.passwordHash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: row.id, username: row.username, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

// Driver login / auto-registration by phone
app.post('/api/auth/driver-login', async (req, res) => {
    try {
        const { id, phone, name, bus } = req.body || {};
        if (!phone && !id) return res.status(400).json({ error: 'phone or id required' });
        let row = null;
        if (id) row = await getSql('SELECT * FROM drivers WHERE id=?', [id]);
        else if (phone) row = await getSql('SELECT * FROM drivers WHERE phone=?', [phone]);
        if (!row) {
            if (!name || !phone) return res.status(404).json({ error: 'Driver not found. Provide name and phone to create.' });
            const newId = uuidv4();
            await runSql('INSERT INTO drivers(id,name,phone,license) VALUES(?,?,?,?)', [newId, name, phone, null]);
            row = await getSql('SELECT * FROM drivers WHERE id=?', [newId]);
        }
        const token = jwt.sign({ id: row.id, name: row.name, role: 'driver', bus: bus || null }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, driver: { id: row.id, name: row.name, phone: row.phone } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Parent login / auto-registration by phone
app.post('/api/auth/parent-login', async (req, res) => {
    try {
        const { phone, id, name } = req.body || {};
        if (!phone && !id) return res.status(400).json({ error: 'phone or id required' });
        let row = null;
        if (id) row = await getSql('SELECT * FROM parents WHERE id=?', [id]);
        else if (phone) row = await getSql('SELECT * FROM parents WHERE phone=?', [phone]);
        if (!row) {
            if (!name || !phone) return res.status(404).json({ error: 'Parent not found. Provide name and phone to create.' });
            const newId = uuidv4();
            await runSql('INSERT INTO parents(id,name,phone) VALUES(?,?,?)', [newId, name, phone]);
            row = await getSql('SELECT * FROM parents WHERE id=?', [newId]);
        }
        const token = jwt.sign({ id: row.id, name: row.name, role: 'parent' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, parent: { id: row.id, name: row.name, phone: row.phone } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ DRIVERS CRUD ------------------
app.get('/api/drivers', async (req, res) =>
{
    try
    {
        const rows = await allSql('SELECT id,name,phone,license FROM drivers');
        res.json(rows);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/drivers/:id', async (req, res) =>
{
    try
    {
        const row = await getSql('SELECT id,name,phone,license FROM drivers WHERE id=?', [req.params.id]);
        if (!row) return res.status(404).json({ error: 'not found' });
        res.json(row);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/drivers', authenticateToken, async (req, res) =>
{
    try
    {
        const { name, phone, license } = req.body || {};
        if (!name) return res.status(400).json({ error: 'name is required' });
        const id = uuidv4();
        await runSql('INSERT INTO drivers(id,name,phone,license) VALUES(?,?,?,?)', [id, name, phone || null, license || null]);
        const row = await getSql('SELECT id,name,phone,license FROM drivers WHERE id=?', [id]);
        res.json(row);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/drivers/:id', authenticateToken, async (req, res) =>
{
    try
    {
        const { name, phone, license } = req.body || {};
        await runSql('UPDATE drivers SET name=?,phone=?,license=? WHERE id=?', [name, phone, license, req.params.id]);
        const row = await getSql('SELECT id,name,phone,license FROM drivers WHERE id=?', [req.params.id]);
        res.json(row);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/drivers/:id', authenticateToken, async (req, res) =>
{
    try
    {
        await runSql('DELETE FROM drivers WHERE id=?', [req.params.id]);
        res.json({ deleted: true });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ STUDENTS CRUD ------------------
app.get('/api/students', async (req, res) => {
    try {
        const rows = await allSql('SELECT id,name,cls,parentId,busId FROM students');
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/students', authenticateToken, async (req, res) => {
    try {
        const { name, cls, parentId, busId } = req.body || {};
        if (!name) return res.status(400).json({ error: 'name is required' });
        const id = uuidv4();
        await runSql('INSERT INTO students(id,name,cls,parentId,busId) VALUES(?,?,?,?,?)', [id, name, cls || null, parentId || null, busId || null]);
        const row = await getSql('SELECT id,name,cls,parentId,busId FROM students WHERE id=?', [id]);
        res.json(row);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/students/:id', authenticateToken, async (req, res) => {
    try {
        const { name, cls, parentId, busId } = req.body || {};
        await runSql('UPDATE students SET name=?,cls=?,parentId=?,busId=? WHERE id=?', [name, cls, parentId, busId, req.params.id]);
        const row = await getSql('SELECT id,name,cls,parentId,busId FROM students WHERE id=?', [req.params.id]);
        res.json(row);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/students/:id', authenticateToken, async (req, res) =>
{
    try
    {
        await runSql('DELETE FROM students WHERE id=?', [req.params.id]);
        res.json({ deleted: true });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ PARENTS CRUD ------------------
app.get('/api/parents', async (req, res) =>
{
    try
    {
        const rows = await allSql('SELECT id,name,phone FROM parents');
        res.json(rows);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/parents', authenticateToken, async (req, res) =>
{
    try
    {
        const { name, phone } = req.body || {};
        if (!name) return res.status(400).json({ error: 'name is required' });
        const id = uuidv4();
        await runSql('INSERT INTO parents(id,name,phone) VALUES(?,?,?)', [id, name, phone || null]);
        const row = await getSql('SELECT id,name,phone FROM parents WHERE id=?', [id]);
        res.json(row);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});
// Fetch students belonging to a parent
app.get('/api/parents/:id/students', async (req, res) => {
    try {
        const parentId = req.params.id;
        const rows = await allSql('SELECT id,name,cls,parentId,busId FROM students WHERE parentId=?', [parentId]);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ BUSES CRUD + LOCATION ------------------
app.get('/api/buses', async (req, res) =>
{
    try
    {
        const rows = await allSql('SELECT * FROM buses');
        res.json(rows.map(r => ({ id: r.id, number: r.number, driverId: r.driverId, driverName: r.driverName, driverPhone: r.driverPhone, started: !!r.started, location: r.lat !== null && r.lng !== null ? { lat: r.lat, lng: r.lng } : null })));
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/buses', authenticateToken, async (req, res) =>
{
    try
    {
        const { number, driverId, driverName, driverPhone } = req.body || {};
        if (!number) return res.status(400).json({ error: 'number is required' });
        const id = uuidv4();
        await runSql('INSERT INTO buses(id,number,driverId,driverName,driverPhone,started) VALUES(?,?,?,?,?,0)', [id, number, driverId || null, driverName || null, driverPhone || null]);
        const row = await getSql('SELECT * FROM buses WHERE id=?', [id]);
        res.json(row);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/buses/:id', authenticateToken, async (req, res) =>
{
    try
    {
        const { number, driverId, driverName, driverPhone, started } = req.body || {};
        await runSql('UPDATE buses SET number=?,driverId=?,driverName=?,driverPhone=?,started=? WHERE id=?', [number, driverId, driverName, driverPhone, started ? 1 : 0, req.params.id]);
        const row = await getSql('SELECT * FROM buses WHERE id=?', [req.params.id]);
        res.json(row);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/buses/:id', authenticateToken, async (req, res) =>
{
    try
    {
        await runSql('DELETE FROM buses WHERE id=?', [req.params.id]);
        res.json({ deleted: true });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/buses/:id/location', authenticateToken, async (req, res) =>
{
    try
    {
        const id = req.params.id;
        const { lat, lng } = req.body || {};
        if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ error: 'lat and lng numeric required' });
        if (!req.user) return res.status(403).json({ error: 'Unauthorized' });
        if (req.user.role !== 'driver' && req.user.role !== 'admin') return res.status(403).json({ error: 'Only drivers/admins can update location' });
        await runSql('UPDATE buses SET lat=?, lng=? WHERE id=? OR number=?', [lat, lng, id, id]);
        const row = await getSql('SELECT * FROM buses WHERE id=? OR number=?', [id, id]);
        if (!row) return res.status(404).json({ error: 'Bus not found' });
        res.json({ id: row.id, number: row.number, driverName: row.driverName, location: row.lat !== null ? { lat: row.lat, lng: row.lng } : null });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ ROUTES CRUD ------------------
app.get('/api/routes', async (req, res) =>
{
    try
    {
        const rows = await allSql('SELECT id,name,stops FROM routes');
        const parsed = rows.map(r => ({ id: r.id, name: r.name, stops: r.stops ? JSON.parse(r.stops) : [] }));
        res.json(parsed);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/routes', authenticateToken, async (req, res) =>
{
    try
    {
        const { name, stops } = req.body || {};
        if (!name) return res.status(400).json({ error: 'name is required' });
        const id = uuidv4();
        await runSql('INSERT INTO routes(id,name,stops) VALUES(?,?,?)', [id, name, JSON.stringify(stops || [])]);
        const row = await getSql('SELECT id,name,stops FROM routes WHERE id=?', [id]);
        res.json({ id: row.id, name: row.name, stops: row.stops ? JSON.parse(row.stops) : [] });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/routes/:id', authenticateToken, async (req, res) =>
{
    try
    {
        const { name, stops } = req.body || {};
        await runSql('UPDATE routes SET name=?,stops=? WHERE id=?', [name, JSON.stringify(stops || []), req.params.id]);
        const row = await getSql('SELECT id,name,stops FROM routes WHERE id=?', [req.params.id]);
        res.json({ id: row.id, name: row.name, stops: row.stops ? JSON.parse(row.stops) : [] });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/routes/:id', authenticateToken, async (req, res) =>
{
    try
    {
        await runSql('DELETE FROM routes WHERE id=?', [req.params.id]);
        res.json({ deleted: true });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ ASSIGNMENTS ------------------
app.post('/api/assignments', authenticateToken, async (req, res) =>
{
    try
    {
        const { driverId, busId, routeId } = req.body || {};
        if (!driverId || !busId) return res.status(400).json({ error: 'driverId and busId required' });
        const id = uuidv4();
        await runSql('INSERT INTO assignments(id,driverId,busId,routeId) VALUES(?,?,?,?)', [id, driverId, busId, routeId || null]);
        const row = await getSql('SELECT * FROM assignments WHERE id=?', [id]);
        res.json(row);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/assignments', authenticateToken, async (req, res) =>
{
    try
    {
        const rows = await allSql('SELECT * FROM assignments');
        res.json(rows);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/assignments/:id', authenticateToken, async (req, res) =>
{
    try
    {
        await runSql('DELETE FROM assignments WHERE id=?', [req.params.id]);
        res.json({ deleted: true });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ ATTENDANCE ------------------
app.post('/api/attendance', authenticateToken, async (req, res) =>
{
    try
    {
        const { studentId, busId, timestamp, status } = req.body || {};
        if (!studentId) return res.status(400).json({ error: 'studentId required' });
        const id = uuidv4();
        await runSql('INSERT INTO attendance(id,studentId,busId,timestamp,status) VALUES(?,?,?,?,?)', [id, studentId, busId || null, timestamp || Date.now(), status || 'present']);
        const row = await getSql('SELECT * FROM attendance WHERE id=?', [id]);
        res.json(row);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/attendance', authenticateToken, async (req, res) =>
{
    try
    {
        const rows = await allSql('SELECT * FROM attendance');
        res.json(rows);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ SCHOOLS ------------------
app.get('/api/schools', async (req, res) =>
{
    try
    {
        const rows = await allSql('SELECT * FROM schools');
        res.json(rows);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/schools', authenticateToken, async (req, res) =>
{
    try
    {
        const { name, address } = req.body || {};
        if (!name) return res.status(400).json({ error: 'name required' });
        const id = uuidv4();
        await runSql('INSERT INTO schools(id,name,address) VALUES(?,?,?)', [id, name, address || null]);
        const row = await getSql('SELECT * FROM schools WHERE id=?', [id]);
        res.json(row);
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ NOTIFICATIONS ------------------
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'localhost', port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 25, secure: false, tls: { rejectUnauthorized: false } });
app.post('/api/notifications/email', authenticateToken, async (req, res) =>
{
    try
    {
        const { to, subject, text } = req.body || {};
        if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });
        await transporter.sendMail({ from: process.env.EMAIL_FROM || 'no-reply@example.com', to, subject, text });
        res.json({ sent: true });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

// ------------------ DASHBOARD/HEALTH ------------------
app.get('/api/dashboard/summary', authenticateToken, async (req, res) =>
{
    try
    {
        const buses = await getSql('SELECT COUNT(*) as c FROM buses');
        const drivers = await getSql('SELECT COUNT(*) as c FROM drivers');
        const students = await getSql('SELECT COUNT(*) as c FROM students');
        res.json({ buses: buses.c || 0, drivers: drivers.c || 0, students: students.c || 0 });
    } catch (e)
    {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/health', (req, res) => res.json({ ok: true, now: Date.now() }));

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
