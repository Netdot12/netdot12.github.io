const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();

const fs = require('fs');

// Serve all static files from the 'comment' folder
app.use(express.static(path.join(__dirname, 'comment')));

// Route to handle homepage or index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'comment', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on port ${port}`);
});
