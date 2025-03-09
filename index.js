const formidable = require('formidable');
const fs = require('fs');
const { put } = require('@vercel/blob'); // Assuming you're using Vercel Blob's client

module.exports.config = {
  api: {
    bodyParser: false, // Disable bodyParser to handle files manually
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'File parsing error', details: err.message });
    }

    const file = files.file[0]; // Extract uploaded file from formidable
    const fileStream = fs.createReadStream(file.filepath); // Create a readable stream of the file

    try {
      // Upload the file to Vercel Blob storage
      const blob = await put(`uploads/${file.originalFilename}`, fileStream, {
        access: 'public', // You can set to 'private' if needed
      });

      // Respond with the URL of the uploaded file
      return res.status(200).json({ url: blob.url });
    } catch (error) {
      return res.status(500).json({ error: 'Upload failed', details: error.message });
    }
  });
};
