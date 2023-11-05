import axios from 'axios';
const stripe = Stripe(
  'pk_test_51O1nluAjJHcIyuQfmqiN9Ifr0mBfQOZYlgSZHe4gaRsLz7rRAHV91vpxDD4lrXmp3MQJUZlj75IoZdHW35nhowBY00w9Cne45p'
);
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    // 2) Create checkout form + charge credit card
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
