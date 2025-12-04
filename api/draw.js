export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // call your draw logic here
  const result = simulateDraw(); // your function

  res.status(200).json(result);
}