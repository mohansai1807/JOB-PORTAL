import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'careerlink-secret-key-123';
const PORT = 3000;

// Initialize Database
async function setupDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'fresher',
      profile_data TEXT
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT,
      location TEXT,
      experience TEXT,
      salary TEXT,
      employer_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER,
      user_id INTEGER,
      resume_url TEXT,
      status TEXT DEFAULT 'applied',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  return db;
}

// Seeding logic
async function seedDb(db: any) {
  const users = await db.all('SELECT * FROM users');
  if (users.length === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const employerPassword = await bcrypt.hash('employer123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    const admin = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@careerlink.com', adminPassword, 'admin']
    );
    const employer = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Tech Corp', 'hiring@techcorp.com', employerPassword, 'employee']
    );
    const student = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Jane Doe', 'jane@student.com', studentPassword, 'fresher']
    );

    await db.run(
      'INSERT INTO jobs (title, description, category, location, experience, salary, employer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        'Frontend Developer',
        'We are looking for a talented React developer to join our team. You will be responsible for building high-quality user interfaces and collaborating with backend teams.',
        'Development',
        'New York, NY',
        '2+ years',
        '$90,000 - $120,000',
        employer.lastID
      ]
    );

    await db.run(
      'INSERT INTO jobs (title, description, category, location, experience, salary, employer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        'Product Designer',
        'Help us design the next generation of creative tools. Experience with Figma and prototyping is required.',
        'Design',
        'Remote',
        '3+ years',
        '$100,000 - $140,000',
        employer.lastID
      ]
    );
    
    console.log('Database seeded with sample data.');
  }
}

// Multer setup for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const db = await setupDb();
  await seedDb(db);

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static('uploads'));

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role || 'fresher']
      );
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // Jobs Routes
  app.get('/api/jobs', async (req, res) => {
    const { category, location, search } = req.query;
    let query = 'SELECT jobs.*, users.name as employer_name FROM jobs JOIN users ON jobs.employer_id = users.id WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (location) {
      query += ' AND location = ?';
      params.push(location);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const jobs = await db.all(query, params);
    res.json(jobs);
  });

  app.get('/api/jobs/:id', async (req, res) => {
    const job = await db.get('SELECT jobs.*, users.name as employer_name FROM jobs JOIN users ON jobs.employer_id = users.id WHERE jobs.id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  });

  app.post('/api/jobs', authenticate, async (req: any, res) => {
    if (req.user.role !== 'employee' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only employers/admins can post jobs' });
    }
    const { title, description, category, location, experience, salary } = req.body;
    const result = await db.run(
      'INSERT INTO jobs (title, description, category, location, experience, salary, employer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, category, location, experience, salary, req.user.id]
    );
    res.status(201).json({ id: result.lastID });
  });

  app.put('/api/jobs/:id', authenticate, async (req: any, res) => {
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.employer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to edit this job' });
    }
    const { title, description, category, location, experience, salary } = req.body;
    await db.run(
      'UPDATE jobs SET title = ?, description = ?, category = ?, location = ?, experience = ?, salary = ? WHERE id = ?',
      [title, description, category, location, experience, salary, req.params.id]
    );
    res.json({ success: true });
  });

  app.delete('/api/jobs/:id', authenticate, async (req: any, res) => {
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.employer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this job' });
    }
    await db.run('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    await db.run('DELETE FROM applications WHERE job_id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Applications Routes
  app.post('/api/applications', authenticate, upload.single('resume'), async (req: any, res) => {
    const { job_id } = req.body;
    const resume_url = req.file ? `/uploads/${req.file.filename}` : null;
    try {
      const result = await db.run(
        'INSERT INTO applications (job_id, user_id, resume_url) VALUES (?, ?, ?)',
        [job_id, req.user.id, resume_url]
      );
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/applications/my', authenticate, async (req: any, res) => {
    const applications = await db.all(
      'SELECT applications.*, jobs.title as job_title, users.name as employer_name FROM applications JOIN jobs ON applications.job_id = jobs.id JOIN users ON jobs.employer_id = users.id WHERE applications.user_id = ?',
      [req.user.id]
    );
    res.json(applications);
  });

  app.get('/api/applications/job/:job_id', authenticate, async (req: any, res) => {
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [req.params.job_id]);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.employer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const applications = await db.all(
      'SELECT applications.*, users.name as applicant_name, users.email as applicant_email FROM applications JOIN users ON applications.user_id = users.id WHERE applications.job_id = ?',
      [req.params.job_id]
    );
    res.json(applications);
  });

  app.patch('/api/applications/:id/status', authenticate, async (req: any, res) => {
    const { status } = req.body;
    const application = await db.get('SELECT applications.*, jobs.employer_id FROM applications JOIN jobs ON applications.job_id = jobs.id WHERE applications.id = ?', [req.params.id]);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.employer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await db.run('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  });

  // Admin / Dashboard Stats
  app.get('/api/admin/stats', authenticate, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    const jobsCount = await db.get('SELECT COUNT(*) as count FROM jobs');
    const appsCount = await db.get('SELECT COUNT(*) as count FROM applications');
    res.json({ users: usersCount.count, jobs: jobsCount.count, applications: appsCount.count });
  });

  app.get('/api/admin/users', authenticate, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const users = await db.all('SELECT id, name, email, role FROM users');
    res.json(users);
  });

  app.patch('/api/admin/users/:id/role', authenticate, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { role } = req.body;
    await db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true });
  });

  app.delete('/api/admin/users/:id', authenticate, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
