const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Comment = require('./models/Comment'); // Import Comment model
const PORT = process.env.PORT || 3000;
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const admin = require('firebase-admin');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'comment')));
require('dotenv').config();

// Serve all static files from the 'comment' folder
app.use(express.static(path.join(__dirname, 'comment')));

// Route to handle homepage or index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'comment', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});