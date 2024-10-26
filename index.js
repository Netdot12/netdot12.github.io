const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser'); // To parse POST request data
const app = express();

// Middleware to parse JSON and form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert({
  "type": "service_account",
  "project_id": "tuneflix-ea9b8",
  "private_key_id": "3f0123f58fbfa130abab4cebd4ff7667a6e104b7",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDJ+8NrzXsWxDDJ\n9Bsn4cz+F9SXixIk343k5QaUf5QpVcc9x46vp0QZpfQSJVJ1O47wyyb/dQPfsZRp\nHMp0CEMR1KXIZVTmPRcuxBVJ/jH45pqwRknvrR1ncrW4V8y8mTMVSFpIWu19EhzR\novMNH4pTG8D/ybkvGD5xgIx9syS6JDTwUb+ZlH7/aQKAdBwD6016CwttO1tmSDws\niRUOl/YXYapmdcHS+gImghMhEg8j/qYkAcGZ81I8eQNf7BP8sVdUdiPFK6dheL+J\nD58XPy0KB4qvf1zBURevIWCZoHsthaGI0ByOfQdw07eAQnQ7k7//3YcD6f6jomMv\nSOOPgDw5AgMBAAECggEAG+/1i/3oKlI5IFnh/q5x/Ow9ZLeg6xY7yV7vPc92pg/+\nBrrJLt0PI5ALdg4Q/XOfNgmXa4qbHk/w4+gOTaXN5xO3WYRAjbcB858+BZXCAjgd\nScfzFpJmiIY6gdStFiIHiYhQKoVfJ2c/srRb82L7LjsewxJ7CXtMOcVKyWEjsZYt\nAsPPJNx1iaLXM/FeMvixOxjwljqjJ190DwfWKAy+q2svKdIAZm8WHeAM4i4WJdul\nCiJiaAeq53wblFhUGdUSVfbmZs+o1llqQ0B9FBHOV1NeD/sClswXFBB+IRCb/jvF\n4PsuvzdsWe4sppCz2aP1uHj8ctKFErTeRYmh9/s/bQKBgQDssm4HWjNrFSs0M4AT\nswd+Q0SD2lnShXuIsX3IR//Ha2+lH3Gh8/ua+wu/ZcoF3TML5pNMb4lu9SccW29i\n1ELlIKC8jrakUy+AjJWm9l4dyc/Q3f6LK1kIV6YwfD8lWixODI8og12JVmj2kGXT\nMpyosiUugJAkjXvvuxwlNPN9hQKBgQDadJywPlE3U60zdbl9zA9msvDCWmnPJGDA\nNCsoZ3sNZEtcCp/j2Jj1fiJAqYaJ/NgonESNtbKMIPmasmRvLopxTDhoHhcXZ0Ro\nFGH0cPmBQdJQi9njwehGzZ6VOVNE++5hXacPaX5TKM/wmCmo07UhYzvuXA3dWyqc\nMcoRg5I4JQKBgAP5Cre839gQRuVdZ+zsuFd6MZA0/gT2kJg+wmm2K6jhOMKAwJuD\nSNnVFOFlh/qJN+4fNKG3zYq7OqjTMA9smKLX5VrE2nPvoYB625gt0m6VkJNk5nzX\ngWsObY+qxjSOSugUdeKsMcm4VZKt4celtdNvCgi5x7GVXlsrvNEzDlMxAoGAcoNC\nR5jDFg+E8T6611iKkjkmv5qJcI4PMXGnVey4slJqtnrTSaqWs8lEx0SWQ+sInHEd\n9nLSf2YhsZfl0epBpBZiUyHC1P/K+gwFNQ+rmrgYOSS2OQ/CZKsQgASmw7iUQvHG\nyutvzsPMDMCWxesEPdY46j/S/L/3XB01YWzozwkCgYBxElJIy0cafMVMOUDgc+7c\n+yDlF0gKO7SEdLpPNXoq82mmJVN66FxmRxMrDvsjdK3RdnkicG4PbblTMPu1/IBr\nO4Ldxy5VOCuO7GYvKlK9fSFGjux85hCUyAoBevlwUoTNxJqvG8RFlXcCKt2vhKAy\nzCTTmySEutGdl6hZYdsS+g==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-q9rni@tuneflix-ea9b8.iam.gserviceaccount.com",
  "client_id": "100336174921047863024",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q9rni%40tuneflix-ea9b8.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
})
});

// Route to send notification when the form is submitted
app.post('/send-notification', (req, res) => {
    const { title, body, token } = req.body; // Get title, body, and token from the form

    // Define the notification message dynamically based on form input
    const message = {
        notification: {
            title: title, // Use form title
            body: body,   // Use form body
            image: 'https://cdn.shopify.com/s/files/1/1061/1924/files/Eye_Roll_Emoji_large.png?v=1541768914'
        },
        webpush: {
            fcm_options: {
                link: 'https://google.com'
            }
        },
        token: token // Token from the form
    };

    // Send the notification using Firebase Admin SDK
    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
            res.json({ success: true, response });
        })
        .catch((error) => {
            console.log('Error sending message:', error);
            res.json({ success: false, error });
        });
});

// Serve the index.html fil
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});