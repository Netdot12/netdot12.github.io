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
const { format } = require('timeago.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('dotenv').config();

// Serve all static files from the 'comment' folder
app.use(express.static(path.join(__dirname, 'comment')));

// Route to handle homepage or index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'comment', 'index.html'));
});

// Initialize Firebase Admin SDK


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




// Endpoint to serve Google Client ID
app.get('/config/google', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

// Endpoint to serve Facebook App ID
app.get('/config/facebook', (req, res) => {
    res.json({ appId: process.env.FACEBOOK_APP_ID });
});


import { Octokit } from '@octokit/rest';  // Use import statement

// Instantiate Octokit with authentication token
const octokit = new Octokit({
  auth: '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',
});

// Upload the file to GitHub repository
async function uploadFile() {
  const filePath = './okay.js';
  const content = fs.readFileSync(filePath, 'utf8');

  try {
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: 'Netdot12',
      repo: 'netdot12.github.io',
      path: 'uploads/okay.js', // path in the repo for the new file
      message: 'Upload okay.js file',
      content: Buffer.from(content).toString('base64'),
      committer: {
        name: 'Netdot12',
        email: 'netdot1234@gmail.com',
      },
      author: {
        name: 'Netdot12',
        email: 'netdot1234@gmail.com',
      },
      mode: '100644', // setting file permissions
    });
    console.log('File uploaded successfully:', response.data);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

uploadFile();

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://Tuneflix:ZcjTP5jG4qyKkOZG@tuneflix.b1vcn.mongodb.net/?retryWrites=true&w=majority&appName=Tuneflix')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


app.get('/comments', async (req, res) => {
    const { pageUrl, page = 0, limit = 5, userId } = req.query; // Accept userId as a query parameter
    const skip = parseInt(page) * parseInt(limit);

    // Aggregate comments to prioritize user comments and calculate relevance
    const comments = await Comment.aggregate([
        { $match: { pageUrl } }, // Filter by page URL
        {
            $addFields: {
                relevanceScore: {
                    $add: [
                        { $size: "$replies" }, // Number of replies
                        { $size: "$likes" }    // Number of likes/reactions
                    ]
                },
                isUserComment: { $eq: ["$userId", userId] } // Check if the comment belongs to the user
            }
        },
        {
            $sort: {
                isUserComment: -1, // Prioritize user's comments (true = 1, false = 0)
                createdAt: -1, 
                relevanceScore: -1,        // Then sort by relevance score
                createdAt: -1              // Fallback to the newest comments
            }
        },
        { $skip: skip }, // Skip for pagination
        { $limit: parseInt(limit) } // Limit the results
    ]);

    res.json(comments);
});

// Set up your file storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads')); // Store uploaded files locally
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
  }
});

const upload = multer({ storage: storage });


// Route for handling comment uploads

// Define the route for handling comments and file uploads
app.post('/comments', upload.fields([{ name: 'image' }, { name: 'video' }]), async (req, res) => {
    try {
        const { pageUrl, content, user, userId, userImage, fcmtoken } = req.body;

        // Ensure files exist before accessing them
        const imagePath = req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : null;
        const videoPath = req.files?.video?.[0] ? `/uploads/${req.files.video[0].filename}` : null;

        const newComment = new Comment({
            pageUrl,
            content,
            user,
            userId,
            userImage,
            fcmtoken,
            image: imagePath,
            video: videoPath,
            likes: [],
            replies: [],
            createdAt: new Date(),
        });

        await newComment.save();
    
        res.status(201).json({ ...newComment.toObject()});
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Error saving comment', error });
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Like a comment
app.post('/comments/:commentId/like', async (req, res) => {

    const { commentId } = req.params;
    const { userId } = req.body; // User ID of the liker

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        // Check if the user has already liked the comment
        if (!comment.likes.includes(userId)) {
            comment.likes.push(userId); // Add userId to likes
            await comment.save();
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unlike a comment
app.post('/comments/:commentId/unlike', async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.body; // User ID of the liker

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        // Remove userId from likes
        comment.likes = comment.likes.filter(id => id !== userId);
        await comment.save();

        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like/Unlike a reply or nested reply
app.post('/comments/:commentId/replies/:replyId/like', async (req, res) => {
    const { commentId, replyId } = req.params;
    const { userId } = req.body;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        // Find the reply
        const reply = findReply(comment.replies, replyId);
        if (!reply) return res.status(404).json({ error: 'Reply not found' });

        // Like or unlike logic
        if (reply.likes.includes(userId)) {
            reply.likes = reply.likes.filter((id) => id !== userId); // Unlike
        } else {
            reply.likes.push(userId); // Like
        }

        await comment.save();
        res.json(reply);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Reply to a comment and notify the owner
app.post('/comments/:commentId/reply', upload.single('file'), async (req, res) => {
    const { commentId } = req.params;
    const { content, replyTo, user, userId, userImage, fcmtoken, replyId } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    console.log('File received:', req.file);
    
    try {
        // Find the comment being replied to
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (replyId) {
            var reply = findReply(comment.replies, replyId);
        }
        
        
        // Add the reply
        const replyField = {
            content,
            replyTo,
            user,
            userId,
            userImage,
            fcmtoken,
            replyId,
            media: fileUrl,
            createdAt: new Date(),
        };
        comment.replies.push(replyField);
        await comment.save();
        // Send notification to the comment owner
        if (comment.fcmtoken) {
                    const message = {
                        notification: {
                            title: "New Reply to Your Comment",
                            body: `${user} replied: ${content}`,
                            image: userImage || null, // Optionally include the reply author's image
                        },
                       webpush: {
                           fcm_options: {
                               link: `https://netdot12-github-io.vercel.app/#comment-${commentId}`
                           }
                       },
                        token: comment.fcmtoken,
                    };            
            // Use Firebase Admin SDK to send the notification
            admin.messaging().send(message)
                .then((response) => console.log('Notification sent:', response))
                .catch((error) => console.error('Error sending notification:', error));
        }
        

        
        res.json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error replying to comment' });
    }
});


// Delete a comment and its nested replies
app.delete('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const userId = req.body.userId; // Get the user ID from the request body

    try {
        // Find the comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if the user is the owner of the comment
        if (comment.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
        }

        // Delete associated media if it exists
        if (comment.image || comment.video) {
            const mediaPath = path.join(__dirname, '', comment.image || comment.video);
            fs.unlink(mediaPath, (err) => {
                if (err) {
                    console.error('Error deleting media file:', err);
                } else {
                    console.log('Media file deleted:', comment.image || comment.video);
                }
            });
        }

        // Delete the comment
        await Comment.deleteOne({ _id: commentId });

        res.json({ message: 'Comment and associated media deleted successfully.' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Edit a comment
app.put('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { userId, content } = req.body;

    try {
        // Find the comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if the user is the owner of the comment
        if (comment.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this comment.' });
        }

        // Update the comment content
        comment.content = content;
        await comment.save();

        res.json({ message: 'Comment updated successfully.', comment });
    } catch (error) {
        console.error('Error editing comment:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Delete a reply
app.delete('/comments/:commentId/replies/:replyId', async (req, res) => {
    const { commentId, replyId } = req.params;
    const { userId } = req.body; // Get the user ID from the request body

    try {
        // Find the parent comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Helper function to find and delete the reply recursively
        const deleteNestedReply = (replies, replyId) => {
            for (let i = 0; i < replies.length; i++) {
                const reply = replies[i];
                if (reply._id.toString() === replyId) {
                    // Check user authorization
                    if (reply.userId !== userId) {
                        throw new Error('Unauthorized');
                    }

                    // Delete associated media if it exists
                    if (reply.media) {
                        const mediaPath = path.join(__dirname, 'uploads', reply.media);
                        fs.unlink(mediaPath, (err) => {
                            if (err) {
                                console.error('Error deleting media file:', err);
                            } else {
                                console.log('Media file deleted:', reply.media);
                            }
                        });
                    }

                    // Remove the reply
                    replies.splice(i, 1);
                    return true;
                }

                // Recursively search in nested replies
                if (reply.replies && reply.replies.length > 0) {
                    const foundAndDeleted = deleteNestedReply(reply.replies, replyId);
                    if (foundAndDeleted) {
                        return true;
                    }
                }
            }
            return false;
        };

        // Start deleting the reply
        const deleted = deleteNestedReply(comment.replies, replyId);

        if (!deleted) {
            return res.status(404).json({ message: 'Reply not found.' });
        }

        // Save the updated comment
        await comment.save();

        res.json({ message: 'Reply and associated media deleted successfully.' });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return res.status(403).json({ message: 'You are not authorized to delete this reply.' });
        }
        console.error('Error deleting reply:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
// Editing a reply
app.put('/comments/:commentId/replies/:replyId', async (req, res) => {
    const { commentId, replyId } = req.params;
    const { userId, content } = req.body; // Get userId and content from request body

    try {
        // Find the parent comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Find the reply 
        const reply = findReply(comment.replies, replyId);
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found.' });
        }

        // Check if the user is the owner of the reply
        if (reply.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this reply.' });
        }

        // Update the reply content
        reply.content = content;
        await comment.save();

        res.json({ message: 'Reply updated successfully.', reply });
    } catch (error) {
        console.error('Error editing reply:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Recursive function to find a reply by ID
function findReply(replies, replyId) {
    if (!Array.isArray(replies)) return null; // Ensure replies is an array

    for (const reply of replies) {
        if (reply && reply._id && reply._id.toString() === replyId) {
            return reply;
        }
        // Recursively search nested replies
        const nestedReply = reply?.replies ? findReply(reply.replies, replyId) : null;
        if (nestedReply) return nestedReply;
    }
    return null;
}



app.listen(PORT, () => {
    console.log(`Server running on port ${port}`);
});

