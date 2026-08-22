import { getDb } from './_lib/db.js';
import { verifyToken } from './_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM frontend_content');
      const content = {};
      result.rows.forEach(row => {
        content[row.id] = row.value;
      });
      return res.status(200).json(content);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  if (req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];
    const user = await verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Invalid items array' });
      }

      // SQLite doesn't natively support bulk INSERT OR REPLACE easily without building a large query string
      // So we'll use a transaction or execute in a loop for simplicity, or just build the string.
      // Since it's only a few items, looping await is fine for now, or building a batch query.
      
      const stmts = items.map(item => ({
        sql: `INSERT OR REPLACE INTO frontend_content (id, value) VALUES (?, ?)`,
        args: [item.id, item.value]
      }));

      if (stmts.length > 0) {
        await db.batch(stmts, "write");
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
