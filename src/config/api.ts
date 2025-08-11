// API配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://data-converter-backend.onrender.com';

export const API_ENDPOINTS = {
  convert: `${API_BASE_URL}/convert`,
  convertStable: `${API_BASE_URL}/convert-stable`,
  generatePractice: `${API_BASE_URL}/generate-stable-practice`,
};

export default API_BASE_URL;
