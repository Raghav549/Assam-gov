// ============================================
// ADMIN MANAGE POSTS
// ============================================

import React, { useState, useEffect } from 'react';
import { getPendingPosts, approvePost, rejectPost, deletePost } from '../../services/firebase';
import { FiCheck, FiX, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getPendingPosts();
      setPosts(data);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      await approvePost(postId);
      toast.success('Post approved');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to approve post');
    }
  };

  const handleReject = async (postId) => {
    try {
      await rejectPost(postId);
      toast.success('Post rejected');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to reject post');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        toast.success('Post deleted');
        fetchPosts();
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderate Posts</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block p-4 rounded-full bg-green-100 mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500">No pending posts to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {post.userName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.userName}</p>
                      <p className="text-xs text-gray-500">{post.createdAt?.toDate().toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-800 mb-4 line-clamp-3">{post.content}</p>

                {post.image && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                    <img src={post.image} alt="Post" className="w-full h-48 object-cover" />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleReject(post.id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePosts;
