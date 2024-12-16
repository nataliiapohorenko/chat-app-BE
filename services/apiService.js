const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://zenquotes.io/api',
  headers: {
    'Content-Type': 'application/json'
  },
});

async function fetchData(endpoint, params = {}) {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
    throw error; 
  }
}

module.exports = { fetchData };
