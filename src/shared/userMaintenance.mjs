const GLOBAL_SETTINGS_PK = 'SETTINGS#GLOBAL'
const USER_SK = 'PROFILE'

function normalizeEmail (email) {
  if (!email || typeof email !== 'string') return null
  return email.trim().toLowerCase()
}

function getUserPk (email) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null
  return `USER#${normalized}`
}

function getUserKey (email) {
  return {
    pk: getUserPk(email),
    sk: USER_SK
  }
}

function getSettingsKey () {
  return {
    pk: GLOBAL_SETTINGS_PK,
    sk: 'DEFAULT'
  }
}

function getDefaultUserRecord (email, nowIso) {
  const normalizedEmail = normalizeEmail(email)
  return {
    ...getUserKey(normalizedEmail),
    entityType: 'USER_PROFILE',
    email: normalizedEmail,
    emailLower: normalizedEmail,
    displayName: normalizedEmail,
    displayNameLower: normalizedEmail,
    disabled: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastSignInAt: nowIso
  }
}

function getDefaultSettingsRecord (updatedBy = null, nowIso = new Date().toISOString()) {
  return {
    ...getSettingsKey(),
    entityType: 'APP_SETTINGS',
    initialized: true,
    updatedAt: nowIso,
    updatedBy
  }
}

function mapUserForList (item) {
  return {
    email: item.email,
    displayName: item.displayName || item.email,
    disabled: Boolean(item.disabled),
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    lastSignInAt: item.lastSignInAt || null,
    disabledAt: item.disabledAt || null,
    disabledBy: item.disabledBy || null
  }
}

function mapUserForPicker (item) {
  return {
    email: item.email,
    displayName: item.displayName || item.email
  }
}

async function getDefaultSettingsInitialized (usersTable) {
  const settings = await usersTable.get(getSettingsKey())
  return Boolean(settings?.initialized)
}

export {
  GLOBAL_SETTINGS_PK,
  USER_SK,
  normalizeEmail,
  getUserPk,
  getUserKey,
  getSettingsKey,
  getDefaultUserRecord,
  getDefaultSettingsRecord,
  mapUserForList,
  mapUserForPicker,
  getDefaultSettingsInitialized
}
