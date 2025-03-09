const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const { put } = require('@vercel/blob');
const formidable = require('formidable');
const fs = require('fs');

// Serve all static files from the 'comment' folder
app.use(express.static(path.join(__dirname, 'comment')));

// Route to handle homepage or index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'comment', 'index.html'));
});
module.exports.config = {
  api: {
    bodyParser: false, // Disable bodyParser to handle files
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'File parsing error' });
    }

    const file = files.file[0]; // Extract uploaded file
    const fileStream = fs.createReadStream(file.filepath);

    try {
      const blob = await put(`uploads/${file.originalFilename}`, fileStream, {
        access: 'public', // Change to 'private' if needed
      });

      return res.status(200).json({ url: blob.url });
    } catch (error) {
      return res.status(500).json({ error: 'Upload failed', details: error.message });
    }
  });
};

app.listen(PORT, () => {
    console.log(`Server running on port ${port}`);
});
