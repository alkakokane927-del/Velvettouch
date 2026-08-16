import multiparty from 'multiparty';
import cloudinary from './_lib/cloudinary.js';
import { verifyToken } from './_lib/firebaseAdmin.js';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split('Bearer ')[1];
  const user = await verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error', err);
      return res.status(500).json({ error: 'File parsing failed' });
    }

    const fileArray = files.image || files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = fileArray[0];
    
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'velvet-touch',
      });

      // Cleanup temp file
      fs.unlinkSync(file.path);

      return res.status(200).json({ url: result.secure_url });
    } catch (uploadError) {
      console.error('Cloudinary upload error', uploadError);
      return res.status(500).json({ error: 'Upload to Cloudinary failed' });
    }
  });
}
