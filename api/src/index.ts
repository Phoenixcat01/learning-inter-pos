import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = CloudflareBindings

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for Expo Web PWA and Native requests
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Helper: Hash password with SHA-256 (Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Helper: Ensure D1 tables exist
async function ensureTables(db: D1Database) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'kasir',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `),
    db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    `),
    db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    `),
  ])
}

// Helper: Get DB instance from environment
function getDB(c: { env: Bindings }): D1Database {
  return c.env.MY_DB
}

// ----------------------------------------------------
// Health Check & Database Init
// ----------------------------------------------------
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Belajar POS Hono API is running',
    endpoints: ['/api/login', '/api/me', '/api/logout', '/api/register', '/api/init-db'],
  })
})

app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

app.post('/api/init-db', async (c) => {
  try {
    const db = getDB(c)
    await ensureTables(db)

    // Check if default user exists, if not seed one
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind('kasir@pos.com').first()
    if (!existing) {
      const defaultPasswordHash = await hashPassword('password123')
      await db.prepare('INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)')
        .bind('Kasir Utama', 'kasir@pos.com', defaultPasswordHash, 'kasir')
        .run()
    }

    return c.json({
      success: true,
      message: 'Database tables initialized successfully',
      defaultAccount: 'kasir@pos.com / password123',
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal inisialisasi database' }, 500)
  }
})

// ----------------------------------------------------
// Register Endpoint
// ----------------------------------------------------
const handleRegister = async (c: any) => {
  try {
    const db = getDB(c)
    await ensureTables(db)

    const body = await c.req.json().catch(() => ({}))
    const { nama, email, password, role = 'kasir' } = body

    if (!nama || !email || !password) {
      return c.json({ success: false, message: 'Nama, email, dan password wajib diisi' }, 400)
    }

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase().trim()).first()
    if (existing) {
      return c.json({ success: false, message: 'Email sudah terdaftar' }, 400)
    }

    const password_hash = await hashPassword(password)
    const result = await db.prepare('INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .bind(nama.trim(), email.toLowerCase().trim(), password_hash, role)
      .run()

    const newId = result.meta.last_row_id

    return c.json({
      success: true,
      message: 'Registrasi berhasil',
      user: {
        id: newId,
        nama: nama.trim(),
        email: email.toLowerCase().trim(),
        role,
      },
    }, 201)
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Terjadi kesalahan saat registrasi' }, 500)
  }
}
app.post('/api/register', handleRegister)
app.post('/api/auth/register', handleRegister)

// ----------------------------------------------------
// Login Endpoint
// ----------------------------------------------------
const handleLogin = async (c: any) => {
  try {
    const db = getDB(c)
    await ensureTables(db)

    const body = await c.req.json().catch(() => ({}))
    const { email, password } = body

    if (!email || !password) {
      return c.json({ success: false, message: 'Email dan password wajib diisi' }, 400)
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await db.prepare('SELECT id, nama, email, password_hash, role FROM users WHERE email = ?')
      .bind(cleanEmail)
      .first<{ id: number; nama: string; email: string; password_hash: string; role: string }>()

    if (!user) {
      return c.json({ success: false, message: 'Email atau password salah' }, 401)
    }

    // Verify password (hash or fallback plain text for dev safety)
    const hashed = await hashPassword(password)
    const isPasswordValid = user.password_hash === hashed || user.password_hash === password

    if (!isPasswordValid) {
      return c.json({ success: false, message: 'Email atau password salah' }, 401)
    }

    // Create session token (expires in 30 days)
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)')
      .bind(user.id, token, expiresAt)
      .run()

    return c.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal memproses login' }, 500)
  }
}
app.post('/api/login', handleLogin)
app.post('/api/auth/login', handleLogin)

// ----------------------------------------------------
// Current User / Session Check (/api/me)
// ----------------------------------------------------
const handleMe = async (c: any) => {
  try {
    const db = getDB(c)
    const authHeader = c.req.header('Authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim()

    if (!token) {
      return c.json({ success: false, message: 'Token otentikasi tidak ditemukan' }, 401)
    }

    await ensureTables(db)

    // Find session and user
    const row = await db.prepare(`
      SELECT u.id, u.nama, u.email, u.role, s.expires_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
    `).bind(token).first<{ id: number; nama: string; email: string; role: string; expires_at: string }>()

    if (!row) {
      // Session invalid or expired - delete expired session if exists
      await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run().catch(() => {})
      return c.json({ success: false, message: 'Sesi tidak valid atau telah berakhir' }, 401)
    }

    return c.json({
      success: true,
      user: {
        id: row.id,
        nama: row.nama,
        email: row.email,
        role: row.role,
      },
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal memeriksa sesi' }, 500)
  }
}
app.get('/api/me', handleMe)
app.get('/api/auth/me', handleMe)

// ----------------------------------------------------
// Logout Endpoint (/api/logout)
// ----------------------------------------------------
const handleLogout = async (c: any) => {
  try {
    const db = getDB(c)
    const authHeader = c.req.header('Authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim()

    if (token) {
      await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run().catch(() => {})
    }

    return c.json({
      success: true,
      message: 'Berhasil logout',
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal logout' }, 500)
  }
}
app.post('/api/logout', handleLogout)
app.post('/api/auth/logout', handleLogout)

export default app
