// Stripe Payment Integration
class StripePayment {
    constructor() {
        this.stripe = null;
        this.cardElement = null;
        this.paymentIntent = null;
    }

    async init() {
        try {
            // Initialize Stripe
            this.stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY);
            
            // Create card element
            const elements = this.stripe.elements();
            this.cardElement = elements.create('card');
            
            // Mount card element
            const cardContainer = document.getElementById('card-element');
            if (cardContainer) {
                this.cardElement.mount('#card-element');
            }
            
            // Handle errors
            this.cardElement.on('change', ({error}) => {
                const displayError = document.getElementById('card-errors');
                if (error) {
                    displayError.textContent = error.message;
                } else {
                    displayError.textContent = '';
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error initializing Stripe:', error);
            return false;
        }
    }

    async createPaymentIntent(amount, currency, metadata) {
        try {
            const response = await fetch('/payment/card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    metadata: metadata,
                    customer_email: document.getElementById('customer-email').value
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                this.paymentIntent = data;
                return data;
            } else {
                throw new Error(data.detail || 'Failed to create payment intent');
            }
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    async confirmPayment() {
        try {
            const result = await this.stripe.confirmCardPayment(
                this.paymentIntent.client_secret,
                {
                    payment_method: {
                        card: this.cardElement
                    }
                }
            );
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            return result.paymentIntent;
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    }
}

// Export the class
window.StripePayment = StripePayment;
