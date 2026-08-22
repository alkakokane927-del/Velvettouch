import { getDb } from './_lib/db.js';
import { verifyToken } from './_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      const services = await db.execute('SELECT * FROM custom_services ORDER BY createdAt DESC');
      return res.status(200).json(services.rows);
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
      const { id, name, desc, icon, image } = req.body;
      const createdAt = new Date().toISOString();

      await db.execute({
        sql: `
          INSERT INTO custom_services (id, name, desc, icon, image, createdAt)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [id, name, desc, icon, image, createdAt]
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  if (req.method === 'PUT') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const user = await verifyToken(authHeader.split('Bearer ')[1]);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const { id, name, desc, icon, image } = req.body;
      await db.execute({
        sql: `UPDATE custom_services SET name = ?, desc = ?, icon = ?, image = ? WHERE id = ?`,
        args: [name, desc, icon, image, id]
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  if (req.method === 'DELETE') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const user = await verifyToken(authHeader.split('Bearer ')[1]);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const id = new URL(req.url, `http://${req.headers.host}`).searchParams.get('id') || req.body?.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await db.execute({
        sql: `DELETE FROM custom_services WHERE id = ?`,
        args: [id]
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
