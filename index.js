const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;
const app = express();


// Serve the HTML file from the public folder
app.use(express.static(path.join(__dirname, 'comment')));


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
