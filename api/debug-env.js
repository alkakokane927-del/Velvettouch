export default function handler(req, res) {
  res.status(200).json({
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasFirebaseKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
  });
}
