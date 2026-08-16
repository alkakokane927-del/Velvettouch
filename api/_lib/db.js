import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

let client;

export function getDb() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:local.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

// Function to initialize tables if they don't exist
export async function initDb() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      date TEXT,
      startTime TEXT,
      referrer TEXT,
      os TEXT,
      browser TEXT,
      device TEXT,
      isNew INTEGER,
      duration INTEGER DEFAULT 0,
      scrollDepth INTEGER DEFAULT 0,
      clickCount INTEGER DEFAULT 0,
      sectionsViewed TEXT DEFAULT '[]'
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      x INTEGER,
      y INTEGER,
      w INTEGER,
      h INTEGER,
      el TEXT,
      time TEXT,
      session TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      joinedAt TEXT,
      bookings TEXT DEFAULT '[]'
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS custom_services (
      id TEXT PRIMARY KEY,
      name TEXT,
      desc TEXT,
      icon TEXT,
      image TEXT,
      createdAt TEXT
    )
  `);
}
