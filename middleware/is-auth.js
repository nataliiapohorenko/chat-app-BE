const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();
const client = new OAuth2Client(process.env.CLIENT_ID);

module.exports = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let payload;
  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
      });
      payload = ticket.getPayload();
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!payload) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.user = payload;
  next();
};