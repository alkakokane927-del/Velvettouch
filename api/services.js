
export default async function handler(req, res) {
  try {
    const { getDb } = await import('./_lib/db.js');
    const db = getDb();
    
    if (req.method === 'GET') {
      const services = await db.execute('SELECT * FROM custom_services ORDER BY createdAt DESC');
      return res.status(200).json(services.rows);
    }
    
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    return res.status(500).json({ error: 'Runtime error', details: error.message, stack: error.stack });
  }
}

