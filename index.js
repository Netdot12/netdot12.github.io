// Import necessary modules
import { Octokit } from '@octokit/rest';  // Import Octokit for GitHub API
import fs from 'fs';  // Import fs to read the file content

// Instantiate Octokit with your GitHub token
const octokit = new Octokit({
  auth: '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',  // Replace with your GitHub token
});

// Path to the file you want to upload
const filePath = './okay.js';  // Adjust the path to the file you want to upload
const content = fs.readFileSync(filePath, 'utf8');  // Read the file content

// Function to upload file to GitHub repository
async function uploadFile() {
  try {
    // Upload file to GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: 'Netdot12',  // Replace with your GitHub username
      repo: 'netdot12.github.io',  // Replace with your repository name
      path: 'uploads/okay.js',  // Path in the repo where the file will be uploaded
      message: 'Upload okay.js file',  // Commit message
      content: Buffer.from(content).toString('base64'),  // Convert content to base64
      committer: {
        name: 'Netdot12',  // Committer name
        email: 'netdot1234@gmail.com',  // Committer email
      },
      author: {
        name: 'Netdot12',  // Author name
        email: 'netdot1234@gmail.com',  // Author email
      },
      mode: '100644',  // File permissions
    });

    // Log the response to confirm upload
    console.log('File uploaded successfully:', response.data);
  } catch (error) {
    // Log any errors that occur
    console.error('Error uploading file:', error);
  }
}

// Call the upload function
uploadFile();