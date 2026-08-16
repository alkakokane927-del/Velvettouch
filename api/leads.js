import { getDb } from './_lib/db.js';
import { verifyToken } from './_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  const db = getDb();

  if (req.method === 'GET') {
    // Only authorized admin can fetch
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
      const leads = await db.execute('SELECT * FROM leads ORDER BY joinedAt DESC');
      
      const parsedLeads = leads.rows.map(row => ({
        ...row,
        bookings: JSON.parse(row.bookings || '[]')
      }));

      return res.status(200).json(parsedLeads);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  if (req.method === 'POST') {
    // Public endpoint for adding a lead (e.g. from chatbot)
    try {
      const { id, name, phone, joinedAt, bookings } = req.body;
      
      await db.execute({
        sql: `
          INSERT INTO leads (id, name, phone, joinedAt, bookings)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            phone=excluded.phone,
            bookings=excluded.bookings
        `,
        args: [id, name, phone, joinedAt, JSON.stringify(bookings || [])]
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
