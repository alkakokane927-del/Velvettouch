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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS frontend_content (
      id TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  try {
    const countRes = await db.execute('SELECT COUNT(*) as c FROM custom_services');
    if (countRes.rows[0].c === 0) {
      const defaults = [
        { id: 'sl-head', name: 'Head Massage', desc: 'Relieves tension headaches, improves scalp circulation, and deeply relaxes your mind.', icon: '🧖‍♀️', image: 'images/head_massage.png' },
        { id: 'sl-face', name: 'Face Massage', desc: 'Glow-inducing facial massage that tones, lifts, and radiates natural beauty.', icon: '✨', image: 'images/face_massage.png' },
        { id: 'sl-foot', name: 'Foot Massage', desc: 'Reflexology-based foot massage to release full-body stress through pressure points.', icon: '🦶', image: 'images/foot_massage.png' },
        { id: 'sl-fullbody', name: 'Full Body Massage', desc: 'Head-to-toe therapeutic massage using warm herbal oils for complete body relaxation.', icon: '💆‍♀️', image: 'images/full_body_massage.png' },
        { id: 'sl-steamer', name: 'Full Body Steamer', desc: 'Open pores, detox deep, and emerge glowing. Steam therapy for ultimate skin renewal and muscle relief.', icon: '🌫️', image: 'images/steamer.png' },
        { id: 'sl-cupping', name: 'Cupping Therapy', desc: 'Ancient healing technique using suction cups to boost circulation and release deep muscle tension.', icon: '🫙', image: 'images/cupping.png' },
        { id: 'sl-scrub', name: 'Body Scrub with Steam', desc: 'Exfoliate dead skin cells with herbal scrub followed by deep steam detox — silky smooth skin guaranteed.', icon: '🫧', image: 'images/body_scrub.png' }
      ];
      for (const s of defaults) {
        await db.execute({
          sql: `INSERT INTO custom_services (id, name, desc, icon, image, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [s.id, s.name, s.desc, s.icon, s.image, new Date().toISOString()]
        });
      }
    }

    const fcCount = await db.execute('SELECT COUNT(*) as c FROM frontend_content');
    if (fcCount.rows[0].c === 0) {
      const fcDefaults = [
        { id: 'hero_eyebrow', value: 'Your Journey to Serenity Begins Here' },
        { id: 'hero_title', value: 'Prioritise Your<br><em>Wellbeing</em>' },
        { id: 'hero_subtitle', value: 'A sacred sanctuary crafted exclusively for women. Relax, re-energise, and rediscover yourself with our signature therapies.' },
        { id: 'hero_bg_url', value: 'images/spa_hero_bg.png' }
      ];
      for (const fc of fcDefaults) {
        await db.execute({
          sql: `INSERT INTO frontend_content (id, value) VALUES (?, ?)`,
          args: [fc.id, fc.value]
        });
      }
    }
  } catch (e) {
    console.error("Seed error:", e);
  }
}
