export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req, res) {
  try {
    // Process image here or forward to Flask
    const result = await processImage(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process image' });
  }
}
