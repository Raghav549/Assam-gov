// Supabase service layer kept at this path for backward-compatible imports.
// Firebase has been fully removed from the frontend.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_ANON_KEY || 'placeholder-anon-key');
export const auth = supabase.auth;
export const db = supabase;
export const storage = supabase.storage;

const tables = {
  users: 'users', posts: 'posts', scholarships: 'scholarships', courses: 'courses',
  helpRequests: 'help_requests', donations: 'donations', govtWorks: 'govt_works',
  govtIssues: 'govt_issues', notifications: 'notifications', comments: 'comments'
};

export const usersCollection = tables.users;
export const postsCollection = tables.posts;
export const scholarshipsCollection = tables.scholarships;
export const coursesCollection = tables.courses;
export const helpRequestsCollection = tables.helpRequests;
export const donationsCollection = tables.donations;
export const govtWorksCollection = tables.govtWorks;
export const govtIssuesCollection = tables.govtIssues;
export const notificationsCollection = tables.notifications;
export const commentsCollection = tables.comments;

const now = () => new Date().toISOString();
const unwrap = async (promise) => { const { data, error } = await promise; if (error) throw error; return data; };
const list = (data) => (data || []).map(row => ({ id: row.id, ...row }));

// AUTH
export const registerUser = async (email, password, displayName) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Account could not be created.');
  const profile = { uid: data.user.id, email, displayName, role: 'student', profilePicture: null, bio: '', location: '', phone: '', educationLevel: '', interests: [], createdAt: now(), updatedAt: now(), isVerified: true, isActive: true };
  const { error: profileError } = await supabase.from(tables.users).upsert(profile, { onConflict: 'uid' });
  if (profileError) throw profileError;
  return { ...data.user, uid: data.user.id };
};

export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { ...data.user, uid: data.user.id };
};
export const logoutUser = async () => { const { error } = await supabase.auth.signOut(); if (error) throw error; };
export const resetPassword = async (email) => { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) throw error; };
export const onAuthStateChange = (callback) => { const { data } = supabase.auth.onAuthStateChange((_event, user) => callback(user ? { ...user, uid: user.id } : null)); return () => data.subscription.unsubscribe(); };

// USERS
export const getUserById = async (uid) => { const data = await unwrap(supabase.from(tables.users).select('*').eq('uid', uid).maybeSingle()); return data ? { id: data.id, ...data } : null; };
export const updateUserProfile = async (userId, data) => unwrap(supabase.from(tables.users).update({ ...data, updatedAt: now() }).eq('uid', userId));
export const getAllUsers = async () => list(await unwrap(supabase.from(tables.users).select('*').order('createdAt', { ascending: false })));
export const updateUserRole = async (userId, role) => unwrap(supabase.from(tables.users).update({ role, updatedAt: now() }).eq('uid', userId));
export const toggleUserActive = async (userId, isActive) => unwrap(supabase.from(tables.users).update({ isActive, updatedAt: now() }).eq('uid', userId));

// POSTS
export const createPost = async (postData) => unwrap(supabase.from(tables.posts).insert({ ...postData, likes: [], likeCount: 0, commentCount: 0, status: 'pending', createdAt: now(), updatedAt: now() }).select().single());
export const getAllPosts = async (category = null) => { let q = supabase.from(tables.posts).select('*').eq('status', 'approved').order('createdAt', { ascending: false }); if (category) q = q.eq('category', category); return list(await unwrap(q)); };
export const getPendingPosts = async () => list(await unwrap(supabase.from(tables.posts).select('*').eq('status', 'pending').order('createdAt', { ascending: false })));
export const approvePost = async (id) => unwrap(supabase.from(tables.posts).update({ status: 'approved', updatedAt: now() }).eq('id', id));
export const rejectPost = async (id) => unwrap(supabase.from(tables.posts).update({ status: 'rejected', updatedAt: now() }).eq('id', id));
export const deletePost = async (id) => unwrap(supabase.from(tables.posts).delete().eq('id', id));
const updatePostLikes = async (id, userId, add) => { const post = await unwrap(supabase.from(tables.posts).select('likes').eq('id', id).single()); const likes = Array.isArray(post.likes) ? post.likes : []; const nextLikes = add ? [...new Set([...likes, userId])] : likes.filter(x => x !== userId); return unwrap(supabase.from(tables.posts).update({ likes: nextLikes, likeCount: nextLikes.length, updatedAt: now() }).eq('id', id)); };
export const likePost = (id, uid) => updatePostLikes(id, uid, true);
export const unlikePost = (id, uid) => updatePostLikes(id, uid, false);

// COMMENTS
export const addComment = async (postId, commentData) => { const comment = await unwrap(supabase.from(tables.comments).insert({ ...commentData, postId, createdAt: now() }).select().single()); const post = await unwrap(supabase.from(tables.posts).select('commentCount').eq('id', postId).single()); await unwrap(supabase.from(tables.posts).update({ commentCount: (post.commentCount || 0) + 1, updatedAt: now() }).eq('id', postId)); return comment; };
export const getCommentsByPost = async (postId) => list(await unwrap(supabase.from(tables.comments).select('*').eq('postId', postId).order('createdAt', { ascending: true })));

// SCHOLARSHIPS
export const createScholarship = async (data) => unwrap(supabase.from(tables.scholarships).insert({ ...data, createdAt: now(), updatedAt: now() }).select().single());
export const getAllScholarships = async (filters = {}) => { let q = supabase.from(tables.scholarships).select('*').order('deadline', { ascending: true }); if (filters.country) q = q.eq('country', filters.country); if (filters.category) q = q.eq('category', filters.category); return list(await unwrap(q)); };
export const getScholarshipById = async (id) => { const data = await unwrap(supabase.from(tables.scholarships).select('*').eq('id', id).maybeSingle()); return data ? { id: data.id, ...data } : null; };
export const updateScholarship = async (id, data) => unwrap(supabase.from(tables.scholarships).update({ ...data, updatedAt: now() }).eq('id', id));
export const deleteScholarship = async (id) => unwrap(supabase.from(tables.scholarships).delete().eq('id', id));

// COURSES
export const createCourse = async (data) => unwrap(supabase.from(tables.courses).insert({ ...data, createdAt: now(), updatedAt: now() }).select().single());
export const getAllCourses = async (category = null) => { let q = supabase.from(tables.courses).select('*').order('createdAt', { ascending: false }); if (category) q = q.eq('category', category); return list(await unwrap(q)); };
export const updateCourse = async (id, data) => unwrap(supabase.from(tables.courses).update({ ...data, updatedAt: now() }).eq('id', id));
export const deleteCourse = async (id) => unwrap(supabase.from(tables.courses).delete().eq('id', id));

// HELP REQUESTS
export const createHelpRequest = async (data) => unwrap(supabase.from(tables.helpRequests).insert({ ...data, status: 'pending', adminReply: null, createdAt: now(), updatedAt: now() }).select().single());
export const getHelpRequests = async (status = null) => { let q = supabase.from(tables.helpRequests).select('*').order('createdAt', { ascending: false }); if (status) q = q.eq('status', status); return list(await unwrap(q)); };
export const replyToHelpRequest = async (id, reply) => unwrap(supabase.from(tables.helpRequests).update({ adminReply: reply, status: 'resolved', updatedAt: now() }).eq('id', id));
export const updateHelpRequestStatus = async (id, status) => unwrap(supabase.from(tables.helpRequests).update({ status, updatedAt: now() }).eq('id', id));

// DONATIONS
export const createDonationRequest = async (data) => unwrap(supabase.from(tables.donations).insert({ ...data, status: 'pending', totalRaised: 0, donors: [], createdAt: now(), updatedAt: now() }).select().single());
export const getDonationRequests = async (status = null) => { let q = supabase.from(tables.donations).select('*').order('createdAt', { ascending: false }); if (status) q = q.eq('status', status); return list(await unwrap(q)); };
export const approveDonationRequest = async (id) => unwrap(supabase.from(tables.donations).update({ status: 'approved', updatedAt: now() }).eq('id', id));
export const rejectDonationRequest = async (id) => unwrap(supabase.from(tables.donations).update({ status: 'rejected', updatedAt: now() }).eq('id', id));
export const recordDonation = async (id, donorData) => { const donation = await unwrap(supabase.from(tables.donations).select('totalRaised,donors').eq('id', id).single()); const donors = Array.isArray(donation.donors) ? donation.donors : []; donors.push({ ...donorData, timestamp: now() }); return unwrap(supabase.from(tables.donations).update({ totalRaised: (donation.totalRaised || 0) + Number(donorData.amount || 0), donors, updatedAt: now() }).eq('id', id)); };

// GOVERNMENT WORKS
export const createGovtWork = async (data) => unwrap(supabase.from(tables.govtWorks).insert({ ...data, createdAt: now(), updatedAt: now() }).select().single());
export const getAllGovtWorks = async (status = null) => { let q = supabase.from(tables.govtWorks).select('*').order('createdAt', { ascending: false }); if (status) q = q.eq('status', status); return list(await unwrap(q)); };
export const updateGovtWork = async (id, data) => unwrap(supabase.from(tables.govtWorks).update({ ...data, updatedAt: now() }).eq('id', id));
export const deleteGovtWork = async (id) => unwrap(supabase.from(tables.govtWorks).delete().eq('id', id));

// GOVERNMENT ISSUES
export const reportGovtIssue = async (data) => unwrap(supabase.from(tables.govtIssues).insert({ ...data, status: 'reported', createdAt: now(), updatedAt: now() }).select().single());
export const getGovtIssues = async (status = null) => { let q = supabase.from(tables.govtIssues).select('*').order('createdAt', { ascending: false }); if (status) q = q.eq('status', status); return list(await unwrap(q)); };

// NOTIFICATIONS
export const createNotification = async (data) => unwrap(supabase.from(tables.notifications).insert({ ...data, read: false, createdAt: now() }).select().single());
export const getUserNotifications = async (uid) => list(await unwrap(supabase.from(tables.notifications).select('*').eq('userId', uid).order('createdAt', { ascending: false }).limit(50)));
export const markNotificationRead = async (id) => unwrap(supabase.from(tables.notifications).update({ read: true }).eq('id', id));
export const markAllNotificationsRead = async (uid) => unwrap(supabase.from(tables.notifications).update({ read: true }).eq('userId', uid).eq('read', false));
export const getUnreadCount = async (uid) => { const { count, error } = await supabase.from(tables.notifications).select('id', { count: 'exact', head: true }).eq('userId', uid).eq('read', false); if (error) return 0; return count || 0; };

// REALTIME
const subscribeAndRefresh = (table, filter, loader, callback, channelName) => { let active = true; const refresh = async () => { if (!active) return; try { callback(await loader()); } catch (e) { console.error(`Realtime ${table} refresh failed:`, e); } }; refresh(); const channel = supabase.channel(channelName).on('postgres_changes', { event: '*', schema: 'public', table, ...(filter ? { filter } : {}) }, refresh).subscribe(); return () => { active = false; supabase.removeChannel(channel); }; };
export const subscribeToPosts = (callback) => subscribeAndRefresh(tables.posts, 'status=eq.approved', () => getAllPosts(), callback, 'public-posts');
export const subscribeToNotifications = (uid, callback) => subscribeAndRefresh(tables.notifications, `userId=eq.${uid}`, () => getUserNotifications(uid), callback, `user-notifications-${uid}`);

// STORAGE
export const uploadFile = async (bucket, path, file, options = {}) => { const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, ...options }); if (error) throw error; return data; };
export const getFileUrl = (bucket, path) => supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
export const deleteFile = async (bucket, path) => { const { error } = await supabase.storage.from(bucket).remove([path]); if (error) throw error; };

export default { supabase, registerUser, loginUser, logoutUser, resetPassword, onAuthStateChange, getUserById, updateUserProfile, getAllUsers, updateUserRole, toggleUserActive, createPost, getAllPosts, getPendingPosts, approvePost, rejectPost, deletePost, likePost, unlikePost, addComment, getCommentsByPost, createScholarship, getAllScholarships, getScholarshipById, updateScholarship, deleteScholarship, createCourse, getAllCourses, updateCourse, deleteCourse, createHelpRequest, getHelpRequests, replyToHelpRequest, updateHelpRequestStatus, createDonationRequest, getDonationRequests, approveDonationRequest, rejectDonationRequest, recordDonation, createGovtWork, getAllGovtWorks, updateGovtWork, deleteGovtWork, reportGovtIssue, getGovtIssues, createNotification, getUserNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount, subscribeToPosts, subscribeToNotifications, uploadFile, getFileUrl, deleteFile };
