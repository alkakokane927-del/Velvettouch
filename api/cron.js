export default function handler(req, res) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // TODO: Add your scheduled task logic here (e.g., database cleanup, sending emails)
  console.log("Cron job executed successfully!");

  res.status(200).json({ message: "Cron job executed successfully!" });
}
