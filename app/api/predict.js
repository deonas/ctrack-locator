// pages/api/predict.js
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

async function processImage(req: NextApiRequest) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);

      const file = files.image; // Assuming your frontend sends the file as 'image'
      if (!file) return reject(new Error('No image provided'));

      try {
        // Read the file
        const imageBuffer = fs.readFileSync(file.filepath);
      
        // Example: Send to Flask API
        const flaskResponse = await fetch('http://your-flask-service.onrender.com/predict', {
          method: 'POST',
          body: imageBuffer,
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
        
        if (!flaskResponse.ok) throw new Error('Flask API error');
        
        return resolve(await flaskResponse.json());
      } catch (error) {
        return reject(error);
      }
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const result = await processImage(req);
    res.status(200).json(result);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
}
