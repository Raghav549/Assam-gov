// ============================================
// SOCIAL FEED (Twitter-like)
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createPost, getAllPosts, likePost, unlikePost, addComment, getCommentsByPost } from '../../services/firebase';
import { uploadImage } from '../../services/storageService';
import { FiMessageSquare, FiHeart, FiSend, FiImage, FiUser } from 'react-icons/fi';
import { getRelativeTime, truncateText } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SocialFeed = () => {
  const { user, userData } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState({}); // postId -> [comments]
  const [commentInputs, setCommentInputs] = useState({}); // postId -> string

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
      
      // Fetch comments for each post
      const commentPromises = fetchedPosts.map(async (post) => {
        const postComments = await getCommentsByPost(post.id);
        return { [post.id]: postComments };
      });
      
      const allComments = await Promise.all(commentPromises);
      const combinedComments = allComments.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setComments(combinedComments);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() && !selectedFile) return;
    
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile, 'posts');
      }

      await createPost({
        userId: user.uid,
        userName: userData.displayName,
        userAvatar: userData.profilePicture,
        content: newPostContent,
        image: imageUrl,
        category: 'General'
      });

      setNewPostContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success('Post created successfully!');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId, hasLiked) => {
    if (hasLiked) {
      await unlikePost(postId, user.uid);
    } else {
      await likePost(postId, user.uid);
    }
    fetchPosts();
  };

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      await addComment(postId, {
        userId: user.uid,
        userName: userData.displayName,
        userAvatar: userData.profilePicture,
        content
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Create Post */}
        <div className="card mb-6 animate-fade-in-up">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {userData?.profilePicture ? (
                <img src={userData.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  {userData?.displayName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                className="w-full border-none focus:ring-0 resize-none text-gray-900 placeholder-gray-500"
                rows="3"
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              
              {previewUrl && (
                <div className="relative mt-2 mb-2 inline-block">
                  <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg object-cover" />
                  <button
                    onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <label className="cursor-pointer p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                    <FiImage className="w-5 h-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <button
                  onClick={handleSubmitPost}
                  disabled={submitting || (!newPostContent && !selectedFile)}
                  className="px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-48 shimmer"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="card animate-fade-in-up">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {post.userAvatar ? (
                      <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {post.userName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{post.userName}</span>
                        <span className="text-gray-500 text-sm">@{post.userId.substring(0, 5)}</span>
                        <span className="text-gray-400 text-xs">• {getRelativeTime(post.createdAt)}</span>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-gray-800 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.image && (
                      <div className="mt-3 rounded-lg overflow-hidden">
                        <img src={post.image} alt="Post attachment" className="w-full max-h-96 object-cover" />
                      </div>
                    )}

                    <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => handleLike(post.id, post.likes?.includes(user.uid))}
                        className={`flex items-center gap-2 text-sm transition-colors ${
                          post.likes?.includes(user.uid) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <FiHeart className={`w-5 h-5 ${post.likes?.includes(user.uid) ? 'fill-current' : ''}`} />
                        <span>{post.likeCount || 0}</span>
                      </button>
                      
                      <button 
                        onClick={() => document.getElementById(`comment-input-${post.id}`)?.focus()}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <FiMessageSquare className="w-5 h-5" />
                        <span>{post.commentCount || 0}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {(comments[post.id]?.length > 0) && (
                      <div className="mt-4 space-y-3 bg-gray-50 p-3 rounded-lg">
                        {comments[post.id].slice(0, 3).map(comment => (
                          <div key={comment.id} className="flex gap-2 text-sm">
                            <span className="font-semibold text-gray-900">{comment.userName}:</span>
                            <span className="text-gray-700">{comment.content}</span>
                          </div>
                        ))}
                        {comments[post.id].length > 3 && (
                          <p className="text-xs text-blue-600 cursor-pointer">View all {comments[post.id].length} comments</p>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <input
                        id={`comment-input-${post.id}`}
                        type="text"
                        placeholder="Write a comment..."
                        className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-green-500"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                      >
                        <FiSend className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No posts yet. Be the first to share something!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
