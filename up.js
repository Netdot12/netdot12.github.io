const { Octokit } = require("@octokit/rest");
const fs = require('fs');

// Instantiate Octokit with authentication token
const octokit = new Octokit({
  auth: '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', // your GitHub token
});

// Path to your file
const filePath = './okay.js';
const content = fs.readFileSync(filePath, 'utf8');

// Upload the file to GitHub repository
async function uploadFile() {
  try {
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: 'Netdot12',
      repo: 'netdot12.github.io',
      path: 'uploads/okay.js', // path in the repo for the new file
      message: 'Upload okay.js file', // commit message
      content: Buffer.from(content).toString('base64'), // base64 encoded content
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
