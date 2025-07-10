const express = require('express');
const cors = require('cors');
const STRIPE_SECRET_KEY = 'sk_test_51REk9SQqWiM8rPLDj2K6pkYxM6FaXiTqNyUvZn9FhxNfD9EK9520MM4rGXCVF8M7RMdoV1bHqv4a0OPkZ2Xik5qf003ayzqBXL';
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const PRICE_IDS = {
  price_1REkNAQqWiM8rPLDt6kYx6Xh: 'price_1REkNAQqWiM8rPLDt6kYx6Xh',
  price_1REkanQqWiM8rPLDU9YKrHdC: 'price_1REkanQqWiM8rPLDU9YKrHdC',
  price_1REkbCQqWiM8rPLD0QY3yQ9z: 'price_1REkbCQqWiM8rPLD0QY3yQ9z'
};

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId } = req.body;
    
    if (!PRICE_IDS[priceId]) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[priceId],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:4200/cancel',
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
