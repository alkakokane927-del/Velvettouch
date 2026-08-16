import { getDb, initDb } from './_lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('DB Init Error:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
}
