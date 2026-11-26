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

// Helper: Ensure all 5 D1 tables exist
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
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Semua',
        price INTEGER NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        sku TEXT,
        barcode TEXT,
        image TEXT,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS "transaction" (
        id TEXT PRIMARY KEY,
        invoice_number TEXT NOT NULL,
        date TEXT NOT NULL DEFAULT (datetime('now')),
        subtotal INTEGER NOT NULL DEFAULT 0,
        tax INTEGER NOT NULL DEFAULT 0,
        discount INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL DEFAULT 0,
        payment_method TEXT NOT NULL DEFAULT 'Cash',
        cash_received INTEGER DEFAULT 0,
        change INTEGER DEFAULT 0,
        customer_name TEXT DEFAULT 'Pelanggan Umum',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 1,
        subtotal INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (transaction_id) REFERENCES "transaction"(id) ON DELETE CASCADE
      );
    `),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_trx_items_trx_id ON transaction_items(transaction_id);`),
  ])
}

// Helper: Get DB instance from environment
function getDB(c: { env: Bindings }): D1Database {
  return c.env.MY_DB
}

// Initial 11 dummy products
const DUMMY_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Kopi Susu Gula Aren',
    category: 'Minuman',
    price: 18000,
    stock: 50,
    sku: 'MNM-001',
    barcode: '8991002100018',
    description: 'Espresso dengan susu segar dan sirup gula aren pilihan',
  },
  {
    id: 'prod-2',
    name: 'Americano Ice',
    category: 'Minuman',
    price: 15000,
    stock: 45,
    sku: 'MNM-002',
    barcode: '8991002100025',
    description: 'Double shot espresso dingin segar',
  },
  {
    id: 'prod-3',
    name: 'Matcha Latte',
    category: 'Minuman',
    price: 22000,
    stock: 30,
    sku: 'MNM-003',
    barcode: '8991002100032',
    description: 'Pure Uji Matcha dengan steamed fresh milk',
  },
  {
    id: 'prod-4',
    name: 'Nasi Goreng Spesial',
    category: 'Makanan',
    price: 28000,
    stock: 25,
    sku: 'MKN-001',
    barcode: '8991002100049',
    description: 'Nasi goreng bumbu tradisional dengan telur mata sapi & ayam suwir',
  },
  {
    id: 'prod-5',
    name: 'Mie Goreng Jawa',
    category: 'Makanan',
    price: 25000,
    stock: 20,
    sku: 'MKN-002',
    barcode: '8991002100056',
    description: 'Mie telur gurih dengan sayur segar dan potongan bakso',
  },
  {
    id: 'prod-6',
    name: 'Ayam Geprek Sambal Bawang',
    category: 'Makanan',
    price: 24000,
    stock: 35,
    sku: 'MKN-003',
    barcode: '8991002100063',
    description: 'Ayam krispi gurih dengan sambal bawang pedas nampol + nasi',
  },
  {
    id: 'prod-7',
    name: 'Kentang Goreng Truffle',
    category: 'Cemilan',
    price: 18000,
    stock: 40,
    sku: 'CML-001',
    barcode: '8991002100070',
    description: 'French fries renyah dengan taburan bumbu truffle & keju parmesan',
  },
  {
    id: 'prod-8',
    name: 'Roti Bakar Coklat Keju',
    category: 'Cemilan',
    price: 16000,
    stock: 25,
    sku: 'CML-002',
    barcode: '8991002100087',
    description: 'Roti panggang mentega dengan topping coklat leleh dan keju parut',
  },
  {
    id: 'prod-9',
    name: 'Cireng Krispi Bumbu Rujak',
    category: 'Cemilan',
    price: 14000,
    stock: 30,
    sku: 'CML-003',
    barcode: '8991002100094',
    description: 'Cireng renyah di luar kenyal di dalam dengan saus rujak pedas manis',
  },
  {
    id: 'prod-10',
    name: 'Paket Hemat Nongkrong',
    category: 'Paket',
    price: 32000,
    stock: 20,
    sku: 'PKT-001',
    barcode: '8991002100100',
    description: 'Kopi Susu Gula Aren + Kentang Goreng Krispi',
  },
  {
    id: 'prod-11',
    name: 'Paket Kenyang Siang',
    category: 'Paket',
    price: 38000,
    stock: 15,
    sku: 'PKT-002',
    barcode: '8991002100117',
    description: 'Nasi Goreng Spesial + Americano Ice',
  },
]

// ----------------------------------------------------
// Health Check & Database Init
// ----------------------------------------------------
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Belajar POS Hono API is running',
    endpoints: [
      '/api/login',
      '/api/me',
      '/api/logout',
      '/api/register',
      '/api/init-db',
      '/api/products',
      '/api/transactions',
    ],
  })
})

app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

app.post('/api/init-db', async (c) => {
  try {
    const db = getDB(c)
    await ensureTables(db)

    // 1. Seed Default User if not exists
    const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').bind('kasir@pos.com').first()
    if (!existingUser) {
      const defaultPasswordHash = await hashPassword('password123')
      await db.prepare('INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)')
        .bind('Kasir Utama', 'kasir@pos.com', defaultPasswordHash, 'kasir')
        .run()
    }

    // 2. Seed Dummy Products if empty
    const productCountResult = await db.prepare('SELECT count(*) as count FROM products').first<{ count: number }>()
    const productCount = productCountResult?.count || 0
    if (productCount === 0) {
      const insertStatements = DUMMY_PRODUCTS.map((p) =>
        db.prepare(
          'INSERT INTO products (id, name, category, price, stock, sku, barcode, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(p.id, p.name, p.category, p.price, p.stock, p.sku, p.barcode, p.description)
      )
      await db.batch(insertStatements)
    }

    // 3. Seed Sample Transaction if empty
    const trxCountResult = await db.prepare('SELECT count(*) as count FROM "transaction"').first<{ count: number }>()
    const trxCount = trxCountResult?.count || 0
    if (trxCount === 0) {
      const sampleTrxId = 'trx-init-001'
      const invoiceNumber = 'INV-20261126-0001'
      const date = new Date().toISOString()
      const subtotal = 46000
      const tax = 4600
      const total = 50600

      await db.prepare(`
        INSERT INTO "transaction" (id, invoice_number, date, subtotal, tax, discount, total, payment_method, cash_received, change, customer_name)
        VALUES (?, ?, ?, ?, ?, 0, ?, 'Cash', 60000, 9400, 'Budi Santoso')
      `).bind(sampleTrxId, invoiceNumber, date, subtotal, tax, total).run()

      await db.batch([
        db.prepare(`
          INSERT INTO transaction_items (transaction_id, product_id, name, price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(sampleTrxId, 'prod-1', 'Kopi Susu Gula Aren', 18000, 1, 18000),
        db.prepare(`
          INSERT INTO transaction_items (transaction_id, product_id, name, price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(sampleTrxId, 'prod-4', 'Nasi Goreng Spesial', 28000, 1, 28000),
      ])
    }

    return c.json({
      success: true,
      message: 'Database tables and dummy data initialized successfully',
      seededProducts: productCount === 0 ? DUMMY_PRODUCTS.length : productCount,
      defaultAccount: 'kasir@pos.com / password123',
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal inisialisasi database' }, 500)
  }
})

// ----------------------------------------------------
// Authentication Endpoints
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

    const hashed = await hashPassword(password)
    const isPasswordValid = user.password_hash === hashed || user.password_hash === password

    if (!isPasswordValid) {
      return c.json({ success: false, message: 'Email atau password salah' }, 401)
    }

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

const handleMe = async (c: any) => {
  try {
    const db = getDB(c)
    const authHeader = c.req.header('Authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim()

    if (!token) {
      return c.json({ success: false, message: 'Token otentikasi tidak ditemukan' }, 401)
    }

    await ensureTables(db)

    const row = await db.prepare(`
      SELECT u.id, u.nama, u.email, u.role, s.expires_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
    `).bind(token).first<{ id: number; nama: string; email: string; role: string; expires_at: string }>()

    if (!row) {
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

// ----------------------------------------------------
// Products Endpoints
// ----------------------------------------------------

// GET /api/products
app.get('/api/products', async (c) => {
  try {
    const db = getDB(c)
    await ensureTables(db)

    const search = c.req.query('search')?.trim().toLowerCase() || ''
    const category = c.req.query('category')?.trim() || ''

    let query = 'SELECT * FROM products WHERE 1=1'
    const params: any[] = []

    if (category && category !== 'Semua') {
      query += ' AND category = ?'
      params.push(category)
    }

    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(sku) LIKE ? OR barcode LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    query += ' ORDER BY created_at ASC'

    const stmt = params.length > 0 ? db.prepare(query).bind(...params) : db.prepare(query)
    const { results } = await stmt.all()

    return c.json({
      success: true,
      data: results,
      products: results,
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal mengambil data produk' }, 500)
  }
})

// GET /api/products/:id
app.get('/api/products/:id', async (c) => {
  try {
    const db = getDB(c)
    await ensureTables(db)
    const id = c.req.param('id')

    const product = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first()
    if (!product) {
      return c.json({ success: false, message: 'Produk tidak ditemukan' }, 404)
    }

    return c.json({
      success: true,
      data: product,
      product,
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal mengambil detail produk' }, 500)
  }
})

// POST /api/products
app.post('/api/products', async (c) => {
  try {
    const db = getDB(c)
    await ensureTables(db)

    const body = await c.req.json().catch(() => ({}))
    const { name, category = 'Makanan', price = 0, stock = 0, sku, barcode, image = '', description = '' } = body

    if (!name || !name.trim()) {
      return c.json({ success: false, message: 'Nama produk wajib diisi' }, 400)
    }

    const id = body.id || `prod-${Date.now()}`
    const finalSku = sku || `${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
    const finalBarcode = barcode || `899${Math.floor(1000000000 + Math.random() * 9000000000)}`

    await db.prepare(`
      INSERT INTO products (id, name, category, price, stock, sku, barcode, image, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, name.trim(), category, Number(price), Number(stock), finalSku, finalBarcode, image, description)
      .run()

    const created = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first()

    return c.json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: created,
      product: created,
    }, 201)
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal menambah produk' }, 500)
  }
})

// PUT /api/products/:id
app.put('/api/products/:id', async (c) => {
  try {
    const db = getDB(c)
    await ensureTables(db)
    const id = c.req.param('id')

    const existing = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first()
    if (!existing) {
      return c.json({ success: false, message: 'Produk tidak ditemukan' }, 404)
    }

    const body = await c.req.json().catch(() => ({}))
    const name = body.name !== undefined ? body.name : existing.name
    const category = body.category !== undefined ? body.category : existing.category
    const price = body.price !== undefined ? Number(body.price) : existing.price
    const stock = body.stock !== undefined ? Number(body.stock) : existing.stock
    const sku = body.sku !== undefined ? body.sku : existing.sku
    const barcode = body.barcode !== undefined ? body.barcode : existing.barcode
    const image = body.image !== undefined ? body.image : existing.image
    const description = body.description !== undefined ? body.description : existing.description

    await db.prepare(`
      UPDATE products
      SET name = ?, category = ?, price = ?, stock = ?, sku = ?, barcode = ?, image = ?, description = ?
      WHERE id = ?
    `).bind(name, category, price, stock, sku, barcode, image, description, id)
      .run()

    const updated = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first()

    return c.json({
      success: true,
      message: 'Produk berhasil diperbarui',
      data: updated,
      product: updated,
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal memperbarui produk' }, 500)
  }
})

// DELETE /api/products/:id
app.delete('/api/products/:id', async (c) => {
  try {
    const db = getDB(c)
    await ensureTables(db)
    const id = c.req.param('id')

    await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run()

    return c.json({
      success: true,
      message: 'Produk berhasil dihapus',
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal menghapus produk' }, 500)
  }
})

// ----------------------------------------------------
// Transactions Endpoints
// ----------------------------------------------------

// Helper: Normalize Transaction object
function normalizeTransaction(row: any, items: any[] = []) {
  const normalizedItems = items.map((item) => ({
    id: item.id ? String(item.id) : (item.product_id || item.productId),
    productId: item.product_id || item.productId,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    subtotal: Number(item.subtotal),
  }))

  return {
    id: row.id,
    invoiceNumber: row.invoice_number || row.invoiceNumber,
    date: row.date,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    discount: Number(row.discount || 0),
    total: Number(row.total),
    paymentMethod: row.payment_method || row.paymentMethod || 'Cash',
    cashReceived: Number(row.cash_received || row.cashReceived || row.total),
    change: Number(row.change || 0),
    customerName: row.customer_name || row.customerName || 'Pelanggan Umum',
    items: normalizedItems,
  }
}

// Handler: Create Transaction
const handleCreateTransaction = async (c: any) => {
  try {
    const db = getDB(c)
    await ensureTables(db)

    const body = await c.req.json().catch(() => ({}))
    const items = body.items || []

    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ success: false, message: 'Daftar item belanja tidak boleh kosong' }, 400)
    }

    // 1. Verify and check stock for all items
    for (const item of items) {
      const pId = item.productId || item.product_id || item.id
      const qty = Number(item.quantity || 1)

      const product = await db.prepare('SELECT id, name, stock, price FROM products WHERE id = ?')
        .bind(pId)
        .first<{ id: string; name: string; stock: number; price: number }>()

      if (!product) {
        return c.json({ success: false, message: `Produk "${item.name || pId}" tidak ditemukan di database` }, 400)
      }

      if (product.stock < qty) {
        return c.json({
          success: false,
          message: `Stok untuk "${product.name}" tidak mencukupi (sisa ${product.stock}, diminta ${qty})`,
        }, 400)
      }
    }

    // 2. Prepare transaction data
    const transactionId = body.id || `trx-${Date.now()}`
    const invoiceCountRow = await db.prepare('SELECT count(*) as count FROM "transaction"').first<{ count: number }>()
    const nextSeq = (invoiceCountRow?.count || 0) + 1
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const generatedInvoice = `INV-${todayStr}-${String(nextSeq).padStart(4, '0')}`

    const invoiceNumber = body.invoiceNumber || body.invoice_number || generatedInvoice
    const date = body.date || new Date().toISOString()
    const paymentMethod = body.paymentMethod || body.payment_method || 'Cash'
    const customerName = (body.customerName || body.customer_name || 'Pelanggan Umum').trim()

    // Calculate subtotal from items if not provided
    const computedSubtotal = items.reduce((sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)), 0)
    const subtotal = body.subtotal !== undefined ? Number(body.subtotal) : computedSubtotal
    const tax = body.tax !== undefined ? Number(body.tax) : Math.round(subtotal * 0.1)
    const discount = body.discount !== undefined ? Number(body.discount) : 0
    const total = body.total !== undefined ? Number(body.total) : (subtotal + tax - discount)
    const cashReceived = Number(body.cashReceived || body.cash_received || total)
    const change = Number(body.change || Math.max(0, cashReceived - total))

    // 3. Batch insert transaction, items, and decrement stocks
    const batchStatements: any[] = [
      db.prepare(`
        INSERT INTO "transaction" (id, invoice_number, date, subtotal, tax, discount, total, payment_method, cash_received, change, customer_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(transactionId, invoiceNumber, date, subtotal, tax, discount, total, paymentMethod, cashReceived, change, customerName)
    ]

    for (const item of items) {
      const pId = item.productId || item.product_id || item.id
      const qty = Number(item.quantity || 1)
      const price = Number(item.price || 0)
      const itemSubtotal = Number(item.subtotal || price * qty)

      batchStatements.push(
        db.prepare(`
          INSERT INTO transaction_items (transaction_id, product_id, name, price, quantity, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(transactionId, pId, item.name, price, qty, itemSubtotal)
      )

      batchStatements.push(
        db.prepare(`
          UPDATE products
          SET stock = MAX(0, stock - ?)
          WHERE id = ?
        `).bind(qty, pId)
      )
    }

    await db.batch(batchStatements)

    const createdTrx = {
      id: transactionId,
      invoiceNumber,
      date,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      cashReceived,
      change,
      customerName,
      items: items.map((it: any) => ({
        id: it.id || it.productId || it.product_id,
        productId: it.productId || it.product_id || it.id,
        name: it.name,
        price: Number(it.price),
        quantity: Number(it.quantity),
        subtotal: Number(it.subtotal || it.price * it.quantity),
      })),
    }

    return c.json({
      success: true,
      message: 'Transaksi berhasil disimpan',
      data: createdTrx,
      transaction: createdTrx,
    }, 201)
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal memproses transaksi' }, 500)
  }
}
app.post('/api/transactions', handleCreateTransaction)
app.post('/api/transaction', handleCreateTransaction)

// Handler: Get Transactions List
const handleGetTransactions = async (c: any) => {
  try {
    const db = getDB(c)
    await ensureTables(db)

    const { results: trxRows } = await db.prepare('SELECT * FROM "transaction" ORDER BY date DESC').all()
    const { results: allItems } = await db.prepare('SELECT * FROM transaction_items').all()

    const transactions = trxRows.map((trx: any) => {
      const items = allItems.filter((it: any) => it.transaction_id === trx.id)
      return normalizeTransaction(trx, items)
    })

    return c.json({
      success: true,
      data: transactions,
      transactions,
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal mengambil riwayat transaksi' }, 500)
  }
}
app.get('/api/transactions', handleGetTransactions)
app.get('/api/transaction', handleGetTransactions)

// Handler: Get Transaction Detail
const handleGetTransactionDetail = async (c: any) => {
  try {
    const db = getDB(c)
    await ensureTables(db)
    const id = c.req.param('id')

    const trx = await db.prepare('SELECT * FROM "transaction" WHERE id = ?').bind(id).first()
    if (!trx) {
      return c.json({ success: false, message: 'Transaksi tidak ditemukan' }, 404)
    }

    const { results: items } = await db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').bind(id).all()
    const normalized = normalizeTransaction(trx, items)

    return c.json({
      success: true,
      data: normalized,
      transaction: normalized,
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal mengambil detail transaksi' }, 500)
  }
}
app.get('/api/transactions/:id', handleGetTransactionDetail)
app.get('/api/transaction/:id', handleGetTransactionDetail)

// Handler: Get Transaction Items
app.get('/api/transactions/:id/items', async (c) => {
  try {
    const db = getDB(c)
    await ensureTables(db)
    const id = c.req.param('id')

    const { results: items } = await db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').bind(id).all()

    return c.json({
      success: true,
      data: items,
      items,
    })
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'Gagal mengambil item transaksi' }, 500)
  }
})

export default app
