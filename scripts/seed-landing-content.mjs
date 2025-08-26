#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import process from 'process'
import url from 'url'
import dotenv from 'dotenv'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env: .env.local first (overrides), then .env
try {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') })
} catch (e) {
  // .env.local is optional in many environments; only warn in debug mode
  if (process.env.DEBUG) {
    console.warn('[seed] Optional .env.local could not be loaded:', e)
  }
}
dotenv.config()

const TABLE_PREFIX = process.env.TABLE_PREFIX || 'allset_'
const SITE_SETTINGS_TABLE = `${TABLE_PREFIX}site_settings`

const provider = process.env.DB_PROVIDER || 'sqlite'

async function readLandingContent() {
  const filePath = path.join(process.cwd(), 'data', 'landingContent.json')
  const raw = await fs.readFile(filePath, 'utf-8')
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse landingContent.json')
    throw e
  }
}

async function seedSqlite(content) {
  const dbDir = process.env.SQLITE_DB_DIR || 'database'
  const dbName = process.env.SQLITE_DB_NAME || 'allset.sqlite'
  const dbPath = process.env.SQLITE_DB_PATH || path.join(dbDir, dbName)

  const betterSqlite3 = await import('better-sqlite3')
  const db = new betterSqlite3.default(dbPath)
  try {
    // Ensure schema exists by running schema.sql (idempotent CREATE TABLE IF NOT EXISTS)
    const schemaPath = process.env.SQLITE_SCHEMA_FILE || path.join(dbDir, 'schema.sql')
    try {
      const schema = await fs.readFile(schemaPath, 'utf-8')
      db.exec(schema)
    } catch (e) {
      console.warn('[seed] Could not apply SQLite schema:', e.message || e)
    }
    // Ensure table exists (schema should handle this in app startup)
    // Ensure single row exists
    db.prepare(
      `INSERT OR IGNORE INTO ${SITE_SETTINGS_TABLE} (id, whatsapp_enabled, whatsapp_phone, whatsapp_message, whatsapp_position, assistant_enabled, booking_widget_enabled, site_language)
       VALUES (1, 0, '', '', 'bottom-right', 0, 1, 'en-us')`
    ).run()

    // Update landing_content (stored as TEXT)
    db.prepare(
      `UPDATE ${SITE_SETTINGS_TABLE} SET landing_content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`
    ).run(JSON.stringify(content))
  } finally {
    db.close()
  }
}

async function seedSupabase(content) {
  const { createClient } = await import('@supabase/supabase-js')
  const urlEnv = process.env.SUPABASE_URL
  const keyEnv = process.env.SUPABASE_KEY
  if (!urlEnv || !keyEnv) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY are required to seed Supabase')
  }
  const supabase = createClient(urlEnv, keyEnv)

  // Upsert row id=1 with landing_content
  const { error } = await supabase
    .from(SITE_SETTINGS_TABLE)
    .upsert({ id: 1, landing_content: content })
  if (error) throw error
}

async function main() {
  console.log(`[seed] Provider: ${provider}`)
  const content = await readLandingContent()

  if (provider === 'supabase') {
    await seedSupabase(content)
  } else {
    await seedSqlite(content)
  }

  console.log('[seed] Landing content seeded successfully')
}

main().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
