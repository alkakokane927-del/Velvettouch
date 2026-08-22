export default function handler(req, res) {
  res.status(200).json({
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    tursoUrlStartsRight: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.startsWith("libsql://") : false,
    tursoUrlHasQuotes: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.includes("\"") : false,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasFirebaseKey: !!process.env.FIREBASE_PRIVATE_KEY
  });
}
