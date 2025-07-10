export const environment = {
  production: true,
  apiUrl: 'http://34.57.63.208:8080',  // Node.js server for Stripe on frontend external IP (VM external: 34.57.63.208, internal: 10.128.0.4)
  authApiUrl: 'http://34.57.63.208:5000', // Flask server for authentication on frontend external IP (VM external: 34.57.63.208, internal: 10.128.0.4)
  imageApiUrl: 'http://34.16.183.28:8000', // FastAPI server for image processing on api.py external IP
  stripePublishableKey: 'pk_test_51REk9SQqWiM8rPLDqu6E8uuoCbgYxsOruF7931EVV2Yze6QIVb9bxmZnKlmteY0rMqpl3ZzrQ30g48GdLHnEVsrh00OA1EBMrd',
  stripeServerUrl: 'http://34.57.63.208:8080'  // Stripe server on frontend external IP
};
