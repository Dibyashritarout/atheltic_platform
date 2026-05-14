const jwt = require('jsonwebtoken');

// This is just for testing - get the JWT_SECRET from backend if available
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Create a test token for the athlete user
const userId = '6a04d855ee661b86b06507b6';
const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });

console.log('Test JWT Token:');
console.log(token);
