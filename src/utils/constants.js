// ============================================
// CONSTANTS
// ============================================

export const APP_NAME = 'Youth Assam';
export const APP_TAGLINE = 'Empowering Assam\'s Youth';

export const CATEGORIES = {
  POSTS: ['Problems', 'Advice', 'Books', 'Help', 'General'],
  SCHOLARSHIPS: ['National', 'International', 'State', 'Merit-based', 'Need-based', 'Sports', 'Research'],
  COURSES: ['Skills', 'Technology', 'Government Exams', 'Language', 'Business', 'Science', 'Arts'],
  HELP_ISSUES: ['Education', 'Jobs', 'Documents', 'Financial Aid', 'Healthcare', 'Legal', 'Other'],
  GOVT_STATUS: ['Running', 'Completed', 'Delayed', 'Planned', 'Cancelled'],
  DONATION_TYPES: ['Fees', 'Books', 'Essentials', 'Medical', 'Equipment', 'Other']
};

export const INDIA_STATES = [
  'Assam', 'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const ASSAM_DISTRICTS = [
  'Baksa', 'Barpeta', 'Biswanath', 'Darrang', 'Dhemaji', 'Dhubri',
  'Dibrugarh', 'Goalpara', 'Golaghat', 'Hailakandi', 'Jorhat', 'Kamrup',
  'Kamrup Metropolitan', 'Karbi Anglong', 'Kokrajhar', 'Lakhimpur',
  'Majuli', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar',
  'Tinsukia', 'Udalguri', 'West Karbi Anglong'
];

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin'
};

export const MAX_FILE_SIZE_IMAGE = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE_DOCUMENT = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const PAGINATION_LIMIT = 20;

export const TOAST_DURATION = 4000;

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  MOST_LIKED: 'most_liked',
  MOST_COMMENTED: 'most_commented'
};

export const DEFAULT_AVATAR_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#06b6d4'
];

export const FOOTER_LINKS = {
  platform: [
    { label: 'Home', path: '/' },
    { label: 'Scholarships', path: '/scholarships' },
    { label: 'Courses', path: '/courses' },
    { label: 'Social Feed', path: '/feed' },
    { label: 'About Us', path: '/about' },
  ],
  resources: [
    { label: 'Help & Support', path: '/help' },
    { label: 'Government Tracker', path: '/govt-tracker' },
    { label: 'Donations', path: '/donations' },
    { label: 'FAQ', path: '/faq' },
  ],
  legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Contact Us', path: '/contact' },
  ]
};

export const SOCIAL_LINKS = {
  facebook: '#',
  twitter: '#',
  instagram: '#',
  linkedin: '#',
  youtube: '#'
};

export default {
  APP_NAME,
  APP_TAGLINE,
  CATEGORIES,
  INDIA_STATES,
  ASSAM_DISTRICTS,
  ROLES,
  MAX_FILE_SIZE_IMAGE,
  MAX_FILE_SIZE_DOCUMENT,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  PAGINATION_LIMIT,
  TOAST_DURATION,
  SORT_OPTIONS,
  DEFAULT_AVATAR_COLORS,
  FOOTER_LINKS,
  SOCIAL_LINKS
};
