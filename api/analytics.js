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
      const sessions = await db.execute('SELECT * FROM sessions ORDER BY startTime DESC');
      const clicks = await db.execute('SELECT * FROM clicks ORDER BY time DESC');
      
      // Parse JSON strings back to objects
      const parsedSessions = sessions.rows.map(row => ({
        ...row,
        sectionsViewed: JSON.parse(row.sectionsViewed || '[]'),
        isNew: row.isNew === 1
      }));

      return res.status(200).json({
        sessions: parsedSessions,
        clicks: clicks.rows
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  if (req.method === 'POST') {
    // Public endpoint for saving tracking data
    try {
      const { type, data } = req.body;

      if (type === 'session') {
        const {
          id, date, startTime, referrer, os, browser, device,
          isNew, duration, scrollDepth, clickCount, sectionsViewed
        } = data;
        
        // Upsert session
        await db.execute({
          sql: `
            INSERT INTO sessions (
              id, date, startTime, referrer, os, browser, device,
              isNew, duration, scrollDepth, clickCount, sectionsViewed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              duration=excluded.duration,
              scrollDepth=excluded.scrollDepth,
              clickCount=excluded.clickCount,
              sectionsViewed=excluded.sectionsViewed
          `,
          args: [
            id, date, startTime, referrer, os, browser, device,
            isNew ? 1 : 0, duration, scrollDepth, clickCount, JSON.stringify(sectionsViewed || [])
          ]
        });
      } else if (type === 'click') {
        const { x, y, w, h, el, time, session } = data;
        await db.execute({
          sql: 'INSERT INTO clicks (x, y, w, h, el, time, session) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [x, y, w, h, el, time, session]
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
