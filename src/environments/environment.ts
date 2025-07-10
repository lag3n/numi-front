export const environment = {
  production: false,
  // For local development
  // apiUrl: 'http://localhost:8080',  // Node.js server for Stripe
  // authApiUrl: 'http://localhost:5000', // Flask server for authentication
  // imageApiUrl: 'http://localhost:8000', // FastAPI server for image processing
  // stripeServerUrl: 'http://localhost:8080',  // Stripe server URL
  
  // For VM testing (updated IPs)
  // Frontend: internal 10.128.0.4, external 34.57.63.208
  // api.py: internal 10.168.0.3, external 34.94.111.104
  apiUrl: 'http://34.57.63.208:8080',  // Node.js server for Stripe on frontend external IP (VM external: 34.57.63.208, internal: 10.128.0.4)
  authApiUrl: 'http://34.57.63.208:5000', // Flask server for authentication on frontend external IP (VM external: 34.57.63.208, internal: 10.128.0.4)
  imageApiUrl: 'http://34.16.183.28:8000', // FastAPI server for image processing on api.py external IP
  stripeServerUrl: 'http://34.57.63.208:8080',  // Stripe server on frontend external IP
  
  // Stripe publishable key (same for both environments)
  stripePublishableKey: 'pk_test_51REk9SQqWiM8rPLDqu6E8uuoCbgYxsOruF7931EVV2Yze6QIVb9bxmZnKlmteY0rMqpl3ZzrQ30g48GdLHnEVsrh00OA1EBMrd'
};
