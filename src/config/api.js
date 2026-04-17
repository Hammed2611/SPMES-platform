// Central API configuration
// Change VITE_API_URL in your .env file to point to your deployed backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_BASE;
