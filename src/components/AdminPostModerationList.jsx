import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const actionBtnBase = 'border-0 px-4 py-2 rounded text-sm cursor-pointer transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed';

const AdminPostModerationList = ({ user }) => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingReplies, setPendingReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const fetchPending = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/discussions/moderation/pending`, {
        headers: { 'user-id': user.id }
      });
      const data = await response.json();
      if (data.success) {
        setPendingPosts(data.pendingPosts);
        setPendingReplies(data.pendingReplies);
      }
    } catch (error) {
      console.error('Error fetching pending posts/replies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [user.id]);

  const handleApprovePost = async (postId) => {
    setProcessing({ ...processing, [postId]: 'approving' });
    try {
      const response = await fetch(`${API_BASE}/api/discussions/posts/${postId}/approve`, {
        method: 'POST',
        headers: { 'user-id': user.id }
      });
      const data = await response.json();
      if (data.success) {
        setPendingPosts(pendingPosts.filter(p => p._id !== postId));
      } else {
        alert(data.message || 'Failed to approve post');
      }
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Failed to approve post');
    } finally {
      setProcessing({ ...processing, [postId]: null });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Reject and delete this post?')) return;
    setProcessing({ ...processing, [postId]: 'deleting' });
    try {
      const response = await fetch(`${API_BASE}/api/discussions/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'user-id': user.id }
      });
      const data = await response.json();
      if (data.success) {
        setPendingPosts(pendingPosts.filter(p => p._id !== postId));
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setProcessing({ ...processing, [postId]: null });
    }
  };

  const handleApproveReply = async (postId, replyId) => {
    const key = `reply-${replyId}`;
    setProcessing({ ...processing, [key]: 'approving' });
    try {
      const response = await fetch(`${API_BASE}/api/discussions/posts/${postId}/replies/${replyId}/approve`, {
        method: 'POST',
        headers: { 'user-id': user.id }
      });
      const data = await response.json();
      if (data.success) {
        setPendingReplies(pendingReplies.filter(r => r.reply._id !== replyId));
      } else {
        alert(data.message || 'Failed to approve reply');
      }
    } catch (error) {
      console.error('Error approving reply:', error);
      alert('Failed to approve reply');
    } finally {
      setProcessing({ ...processing, [key]: null });
    }
  };

  const handleDeleteReply = async (postId, replyId) => {
    if (!window.confirm('Reject and delete this reply?')) return;
    const key = `reply-${replyId}`;
    setProcessing({ ...processing, [key]: 'deleting' });
    try {
      const response = await fetch(`${API_BASE}/api/discussions/posts/${postId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: { 'user-id': user.id }
      });
      const data = await response.json();
      if (data.success) {
        setPendingReplies(pendingReplies.filter(r => r.reply._id !== replyId));
      } else {
        alert(data.message || 'Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply');
    } finally {
      setProcessing({ ...processing, [key]: null });
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-5">Loading pending posts and replies...</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="font-semibold text-gray-800 mb-3">Pending Posts</h3>
      {pendingPosts.length === 0 ? (
        <p className="text-gray-500 text-sm italic text-center py-5">No pending posts.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {pendingPosts.map(post => (
            <div key={post._id} className="bg-white p-5 rounded-lg border border-gray-200 border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800 m-0 mb-1">{post.authorName}</h4>
                  <p className="text-sm text-gray-500 italic m-0">In: {post.topicName}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-500 border border-yellow-400 uppercase tracking-wide whitespace-nowrap">
                  Pending
                </span>
              </div>
              <p className="text-gray-700 text-sm my-3">{post.content}</p>
              <div className="text-xs text-gray-400 mb-3">
                Submitted: {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  className={`${actionBtnBase} bg-green-500 hover:bg-green-600 text-white`}
                  onClick={() => handleApprovePost(post._id)}
                  disabled={Boolean(processing[post._id])}
                >
                  {processing[post._id] === 'approving' ? 'Approving...' : 'Approve'}
                </button>
                <button
                  className={`${actionBtnBase} bg-red-500 hover:bg-red-600 text-white`}
                  onClick={() => handleDeletePost(post._id)}
                  disabled={Boolean(processing[post._id])}
                >
                  {processing[post._id] === 'deleting' ? 'Deleting...' : 'Reject & Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="font-semibold text-gray-800 mb-3">Pending Replies</h3>
      {pendingReplies.length === 0 ? (
        <p className="text-gray-500 text-sm italic text-center py-5">No pending replies.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {pendingReplies.map(({ postId, postContent, topicName, reply }) => {
            const key = `reply-${reply._id}`;
            return (
              <div key={reply._id} className="bg-white p-5 rounded-lg border border-gray-200 border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800 m-0 mb-1">{reply.authorName}</h4>
                    <p className="text-sm text-gray-500 italic m-0">
                      Reply in "{topicName}" to: {postContent.length > 80 ? `${postContent.slice(0, 80)}…` : postContent}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-500 border border-yellow-400 uppercase tracking-wide whitespace-nowrap">
                    Pending
                  </span>
                </div>
                <p className="text-gray-700 text-sm my-3">{reply.content}</p>
                <div className="text-xs text-gray-400 mb-3">
                  Submitted: {new Date(reply.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    className={`${actionBtnBase} bg-green-500 hover:bg-green-600 text-white`}
                    onClick={() => handleApproveReply(postId, reply._id)}
                    disabled={Boolean(processing[key])}
                  >
                    {processing[key] === 'approving' ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    className={`${actionBtnBase} bg-red-500 hover:bg-red-600 text-white`}
                    onClick={() => handleDeleteReply(postId, reply._id)}
                    disabled={Boolean(processing[key])}
                  >
                    {processing[key] === 'deleting' ? 'Deleting...' : 'Reject & Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPostModerationList;
