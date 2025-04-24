export const config = {
  api: {
    bodyParser: false, // Disable default parsing to handle file uploads
  },
};

export default async function handler(req, res) {
  try {
    // Forward the request to Flask (running on same service)
    const flaskResponse = await fetch('http://localhost:8080/predict', {
      method: 'POST',
      body: req.body,
      headers: {
        'Content-Type': req.headers['content-type'],
      },
    });

    const data = await flaskResponse.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process image' });
  }
}
