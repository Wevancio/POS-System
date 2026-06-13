import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'pos.db')

// Singleton: en dev con HMR el módulo se re-evalúa pero la conexión persiste
const g = globalThis as typeof globalThis & { _posDb?: Database.Database }

function openDb(): Database.Database {
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}

export const db: Database.Database = g._posDb ?? (g._posDb = openDb())

db.exec(`
  CREATE TABLE IF NOT EXISTS productos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT    NOT NULL,
    precio    REAL    NOT NULL,
    sku       TEXT    UNIQUE,
    stock     INTEGER NOT NULL DEFAULT 0,
    categoria TEXT,
    activo    INTEGER NOT NULL DEFAULT 1,
    creado_en TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ventas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    folio       TEXT    NOT NULL UNIQUE,
    subtotal    REAL    NOT NULL,
    descuento   REAL    NOT NULL DEFAULT 0,
    total       REAL    NOT NULL,
    metodo_pago TEXT    NOT NULL,
    efectivo    REAL,
    cambio      REAL,
    creado_en   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS items_venta (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id    INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER,
    nombre      TEXT    NOT NULL,
    precio      REAL    NOT NULL,
    qty         INTEGER NOT NULL,
    total       REAL    NOT NULL
  );
`)
