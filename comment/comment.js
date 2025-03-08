function replyToComment(commentId, replyId, commentOwner, commentOwnerId) {
    // Create or reuse the modal
    let modal = document.getElementById('reply-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'reply-modal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = '';
        modal.style.padding = '20px';
        modal.style.border = '1px solid #ccc';
        modal.style.boxShadow = '';
        modal.style.zIndex = 1000;
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <form id="reply-form">
            <h3>Reply to ${commentOwner}</h3>
            <textarea id="reply-content" placeholder="Write your reply..." rows="4" style="width: 100%;"></textarea>
            <br>
            <label>Attach Image/Video:</label>
            <input style="display: block;" type="file" id="reply-file" accept="image/*,video/*">
            <br><br>
            <button onclick="refreshmodal()" type="submit">Submit Reply</button>
            <button type="button" id="close-modal">Cancel</button>
        </form>
        <p id="reply-error" style="color: red; display: none;">Error submitting reply. Please try again.</p>
    `;

    const form = document.getElementById('reply-form');
    const fileInput = document.getElementById('reply-file');
    const errorMsg = document.getElementById('reply-error');

    // Check file size
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file && file.size > 50 * 1024 * 1024) { // 50 MB limit
            alert("The selected file exceeds the 50 MB size limit. Please choose a smaller file.");
            fileInput.value = ""; // Clear the input
        }
    };

    form.onsubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert("Please log in to reply.");
            return;
        }

        const replyContent = document.getElementById('reply-content').value.trim();
        if (!replyContent) {
            alert("Reply content cannot be empty.");
            return;
        }

        const file = fileInput.files[0];
        const user = currentUser.name;
        const userId = currentUser.sub || currentUser.id;
        const userImage = currentUser.picture.data.url || currentUser.picture;
        const currentToken = localStorage.getItem('fcmToken'); // Check if token is stored
        
        const formData = new FormData();
        formData.append('content', replyContent);
        formData.append('replyTo', commentOwner);
        formData.append('user', user);
        formData.append('userId', userId);
        formData.append('commentOwnerId', commentOwnerId);
        formData.append('userImage', userImage);
        formData.append('fcmtoken', currentToken);
        formData.append('replyId', replyId);

        if (file) formData.append('file', file);

        const url = `https://netdot12-github-io.vercel.app/comments/${commentId}/reply`;

        try {
            await fetch(url, { method: 'POST', body: formData });
            fetchComments(); // Refresh comments
            modal.style.display = 'none';
        } catch (error) {
            errorMsg.style.display = 'block';
        }
    };

    document.getElementById('close-modal').onclick = () => {
        modal.style.display = 'none';
    };

    modal.style.display = 'block';
}
function editComment(commentId, currentContent) {
    // Create an edit modal
    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = 'white';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    modal.style.zIndex = 1000;

    modal.innerHTML = `
        <h3>Edit Comment</h3>
        <textarea id="edit-content" style="width: 100%; height: 80px;">${currentContent}</textarea>
        <br>
        <button id="save-edit">Save</button>
        <button id="cancel-edit">Cancel</button>
    `;

    document.body.appendChild(modal);

    // Handle save action
    document.getElementById('save-edit').onclick = async () => {
        const updatedContent = document.getElementById('edit-content').value;

        if (!updatedContent.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        try {
            await fetch(`https://netdot12-github-io.vercel.app/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.sub || currentUser.id,
                    content: updatedContent,
                }),
            });

            alert('Comment updated successfully.');
            document.body.removeChild(modal);
            fetchComments(); // Refresh the comments after editing
        } catch (error) {
            console.error('Error updating comment:', error);
            alert('Failed to update the comment.');
        }
    };

    // Handle cancel action
    document.getElementById('cancel-edit').onclick = () => {
        document.body.removeChild(modal);
    };
}
async function deleteComment(commentId) {
    if (!currentUser) {
        alert("Please log in to delete a comment.");
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this comment and all its replies?");
    if (!confirmDelete) return;

    try {
        await fetch(`https://netdot12-github-io.vercel.app/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.sub || currentUser.id }),
        });

        alert('Comment deleted successfully.');
        fetchComments(); // Refresh the comments after deletion
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete the comment.');
    }
}

  
function renderMedia(mediaUrl) {
    if (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm')) {
        return `<video src="${mediaUrl}" controls width="300"></video>`;
    }
    return `<img src="${mediaUrl}" alt="uploaded media" width="300">`;
}
  
  async function toggleLike(commentId, isLiked) {
    if (!currentUser) {
        alert("Please log in to like a comment.");
        return;
    }

    const userId = currentUser.sub || currentUser.id;

    const url = isLiked
        ? `https://netdot12-github-io.vercel.app/comments/${commentId}/unlike`
        : `https://netdot12-github-io.vercel.app/comments/${commentId}/like`;

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });

    fetchComments(); // Refresh comments to update like counts
}
  
  async function toggleReplyLike(commentId, replyId, isLiked) {
    if (!currentUser) {
        alert("Please log in to like/unlike.");
        return;
    }

    await fetch(`https://netdot12-github-io.vercel.app/comments/${commentId}/replies/${replyId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
    });

    fetchComments(); // Refresh comments to reflect the like/unlike
}
  function replyToComment(commentId, replyId = null, commentOwner, commentOwnerId) {
    // Create the modal
    const modal = document.createElement('div');
    modal.id = 'reply-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = 'white';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    modal.style.zIndex = 1000;

    // Modal content
    modal.innerHTML = `
        <form id="reply-form">
            <h3>Reply to ${commentOwner}</h3>
            <textarea id="reply-content" placeholder="Write your reply..." rows="4" style="width: 100%;"></textarea>
            <br>
            <label>Attach Image/Video:</label>
            <input type="file" id="reply-file" accept="image/*,video/*">
            <br><br>
            <button type="submit">Submit Reply</button>
            <button type="button" id="close-modal">Cancel</button>
        </form>
    `;

    // Append the modal to the body
    document.body.appendChild(modal);

    // Handle form submission
    const form = document.getElementById('reply-form');
    form.onsubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert("Please log in to reply.");
            return;
        }

        const replyContent = document.getElementById('reply-content').value;
        const fileInput = document.getElementById('reply-file');
        const file = fileInput.files[0];
        const user = currentUser.name;
        const userId = currentUser.sub || currentUser.id;
        const userImage = currentUser.picture.data.url || currentUser.picture; // Include userImage

        const formData = new FormData();
        formData.append('content', replyContent);
        formData.append('replyTo', commentOwner);
        formData.append('user', user);
        formData.append('userId', userId);
        formData.append('commentOwnerId', commentOwnerId);
        formData.append('userImage', userImage); // Send userImage
        if (file) {
            formData.append('file', file);
        }

        const url = replyId
            ? `https://netdot12-github-io.vercel.app/comments/${commentId}/replies/${replyId}`
            : `https://netdot12-github-io.vercel.app/comments/${commentId}/reply`;

        await fetch(url, {
            method: 'POST',
            body: formData,
        }).then(fetchComments);

        // Close the modal after submission
        document.body.removeChild(modal);
    };

    // Close modal on cancel
    document.getElementById('close-modal').onclick = () => {
        document.body.removeChild(modal);
    };
}

// Function to edit a reply
function editReply(commentId, replyId, currentContent) {
    // Create an edit modal
    const modal = document.createElement('div');
    modal.id = 'edit-reply-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = 'white';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #ccc';
    modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    modal.style.zIndex = 1000;

    modal.innerHTML = `
        <h3>Edit Reply</h3>
        <textarea id="edit-reply-content" style="width: 100%; height: 80px;">${currentContent}</textarea>
        <br>
        <button id="save-reply-edit">Save</button>
        <button id="cancel-reply-edit">Cancel</button>
    `;

    document.body.appendChild(modal);

    // Handle save action
    document.getElementById('save-reply-edit').onclick = async () => {
        const updatedContent = document.getElementById('edit-reply-content').value;

        if (!updatedContent.trim()) {
            alert('Reply cannot be empty.');
            return;
        }

        try {
            await fetch(`https://netdot12-github-io.vercel.app/comments/${commentId}/replies/${replyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.sub || currentUser.id,
                    content: updatedContent,
                }),
            });

            alert('Reply updated successfully.');
            document.body.removeChild(modal);
            fetchComments(); // Refresh the comments after editing
        } catch (error) {
            console.error('Error updating reply:', error);
            alert('Failed to update the reply.');
        }
    };

    // Handle cancel action
    document.getElementById('cancel-reply-edit').onclick = () => {
        document.body.removeChild(modal);
    };
}

// Function to delete a reply
async function deleteReply(commentId, replyId) {
    if (!currentUser) {
        alert("Please log in to delete a reply.");
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this reply and all its nested replies?");
    if (!confirmDelete) return;

    try {
        await fetch(`https://netdot12-github-io.vercel.app/comments/${commentId}/replies/${replyId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.sub || currentUser.id }),
        });

        alert('Reply deleted successfully.');
        fetchComments(); // Refresh the comments after deletion
    } catch (error) {
        console.error('Error deleting reply:', error);
        alert('Failed to delete the reply.');
    }
}

// Extend the renderReplies function
function renderReplies(replies, commentId) {
    return replies.map(reply => `
        <div>
            <p>
                ↳ 
                <img src="${reply.userImage || 'default-avatar.png'}" alt="${reply.user}" width="20" height="20">
                <strong>${reply.user}</strong>: 
                <span style="color: blue;">@${reply.replyTo}</span>
                ${reply.content}
                <div 
                    onclick="toggleReplyLike('${commentId}', '${reply._id}', ${reply.likes.includes(currentUser?.id)})" 
                    style="cursor: pointer; color: ${reply.likes.includes(currentUser?.id) ? 'blue' : 'gray'};">
                    ❤️ ${reply.likes.length} Like
                </div>
                <button onclick="editReply('${commentId}', '${reply._id}', '${reply.content}')">Edit</button>
                <button onclick="deleteReply('${commentId}', '${reply._id}')">Delete</button>
            </p>
            ${reply.media ? renderMedia(reply.media) : ''}
            <div>
                <button onclick="replyToComment('${commentId}', '${reply._id}', '${reply.user}', '${reply.userId}')">Reply</button>
            </div>
            <div style="margin-left: 20px;">
                ${renderReplies(reply.replies, commentId)}
            </div>
        </div>
    `).join('');
}
  
      window.onload = fetchComments;
  function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;

    interval = Math.floor(seconds / 604800);
    if (interval >= 1) return interval === 1 ? "1 week ago" : `${interval} weeks ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;

  }