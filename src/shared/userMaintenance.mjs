import { getTursoClient } from './tursoClient.mjs'

function normalizeEmail (email) {
  if (!email || typeof email !== 'string') return null
  return email.trim().toLowerCase()
}

function getDefaultUserRecord (email, nowIso) {
  const normalizedEmail = normalizeEmail(email)
  return {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    emailVerified: 0,
    name: normalizedEmail,
    image: null,
    roles: '["user"]',
    disabled: 0,
    disabledAt: null,
    disabledBy: null,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastSignInAt: nowIso
  }
}

async function getUserByEmail (email) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null

  const db = getTursoClient()
  const result = await db.execute({
    sql: 'SELECT * FROM user WHERE email = ?',
    args: [normalized]
  })

  if (!result.rows || result.rows.length === 0) return null
  return result.rows[0]
}

async function upsertUser (email, updates) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null

  const nowIso = new Date().toISOString()
  const existing = await getUserByEmail(normalized)

  if (existing) {
    const fields = []
    const args = []
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`)
      args.push(value)
    }
    fields.push('updated_at = ?')
    args.push(nowIso)
    args.push(normalized)

    const db = getTursoClient()
    await db.execute({
      sql: `UPDATE user SET ${fields.join(', ')} WHERE email = ?`,
      args
    })

    return getUserByEmail(normalized)
  }

  const record = { ...getDefaultUserRecord(normalized, nowIso), ...updates }
  const db = getTursoClient()
  await db.execute({
    sql: `INSERT INTO user (id, email, email_verified, name, image, roles, disabled, disabled_at, disabled_by, created_at, updated_at, last_sign_in_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      record.id, record.email, record.emailVerified, record.name, record.image,
      record.roles, record.disabled, record.disabledAt, record.disabledBy,
      record.createdAt, record.updatedAt, record.lastSignInAt
    ]
  })

  return getUserByEmail(normalized)
}

async function listUsers (limit = 100, offset = 0) {
  const db = getTursoClient()
  const result = await db.execute({
    sql: 'SELECT * FROM user ORDER BY created_at DESC LIMIT ? OFFSET ?',
    args: [limit, offset]
  })

  return result.rows || []
}

async function searchUsers (query, limit = 20) {
  const db = getTursoClient()
  const result = await db.execute({
    sql: `SELECT * FROM user WHERE email LIKE ? OR name LIKE ? ORDER BY email ASC LIMIT ?`,
    args: [`%${query}%`, `%${query}%`, limit]
  })

  return result.rows || []
}

async function disableUser (email, disabledBy) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null

  const nowIso = new Date().toISOString()
  const db = getTursoClient()
  await db.execute({
    sql: 'UPDATE user SET disabled = 1, disabled_at = ?, disabled_by = ?, updated_at = ? WHERE email = ?',
    args: [nowIso, disabledBy, nowIso, normalized]
  })

  return getUserByEmail(normalized)
}

async function enableUser (email) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null

  const nowIso = new Date().toISOString()
  const db = getTursoClient()
  await db.execute({
    sql: 'UPDATE user SET disabled = 0, disabled_at = NULL, disabled_by = NULL, updated_at = ? WHERE email = ?',
    args: [nowIso, normalized]
  })

  return getUserByEmail(normalized)
}

function mapUserForList (item) {
  return {
    email: item.email,
    displayName: item.name || item.email,
    disabled: Boolean(item.disabled),
    createdAt: item.created_at || null,
    updatedAt: item.updated_at || null,
    lastSignInAt: item.last_sign_in_at || null,
    disabledAt: item.disabled_at || null,
    disabledBy: item.disabled_by || null,
    roles: JSON.parse(item.roles || '["user"]')
  }
}

function mapUserForPicker (item) {
  return {
    email: item.email,
    displayName: item.name || item.email
  }
}

export {
  normalizeEmail,
  getDefaultUserRecord,
  getUserByEmail,
  upsertUser,
  listUsers,
  searchUsers,
  disableUser,
  enableUser,
  mapUserForList,
  mapUserForPicker
}
