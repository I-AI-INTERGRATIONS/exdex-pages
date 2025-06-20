class CoinPayment {
    constructor() {
        this.paymentAddress = null;
        this.amount = null;
        this.status = 'pending';
        this.transactionId = null;
        this.paymentMethod = 'crypto';
        this.cryptoCurrency = 'BTC';
        this.fiatCurrency = 'USD';
        this.atmLocation = 'nearest';
        this.currentQRCode = null;
        this.paymentHistory = [];
    }

    async init() {
        // Initialize CoinPayments
        window.coinpayments.init();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Payment method toggle
        document.querySelectorAll('.payment-method-toggle').forEach(button => {
            button.addEventListener('click', () => {
                this.paymentMethod = button.dataset.method;
                this.updateUI();
            });
        });

        // Crypto buttons
        document.querySelectorAll('.crypto-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.cryptoCurrency = button.dataset.crypto;
                this.updateUI();
            });
        });

        // Fiat buttons
        document.querySelectorAll('.fiat-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.fiatCurrency = button.dataset.currency;
                this.updateUI();
            });
        });

        // ATM location selector
        document.querySelectorAll('.atm-location-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.atmLocation = button.dataset.location;
                this.updateUI();
            });
        });

        // Payment button
        document.getElementById('submit-payment').addEventListener('click', () => {
            this.createPayment();
        });
    }

    async createPayment() {
        try {
            // Get amount from input
            const amount = document.getElementById('payment-amount').value;
            const email = document.getElementById('customer-email').value;
            
            // Make API call to backend
            const response = await fetch('/payment/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    currency: this.paymentMethod === 'crypto' ? this.cryptoCurrency : this.fiatCurrency,
                    customer_email: email,
                    payment_method: this.paymentMethod,
                    crypto_currency: this.cryptoCurrency,
                    fiat_currency: this.fiatCurrency,
                    metadata: {
                        atm_location: this.atmLocation
                    }
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.paymentAddress = data.payment_address;
                this.amount = data.amount;
                this.transactionId = data.transaction_id;
                this.paymentMethod = data.payment_method;
                this.cryptoCurrency = data.crypto_currency;
                this.fiatCurrency = data.fiat_currency;
                
                // Update UI
                this.updateUI();
                
                // Generate QR code if crypto payment
                if (this.paymentMethod === 'crypto') {
                    this.generateQRCode();
                }
                
                // Start status polling
                this.startStatusPolling();
                
                // Save to payment history
                this.paymentHistory.push({
                    transactionId: this.transactionId,
                    amount: this.amount,
                    currency: this.paymentMethod === 'crypto' ? this.cryptoCurrency : this.fiatCurrency,
                    method: this.paymentMethod,
                    status: 'pending',
                    timestamp: new Date().toISOString()
                });
                
                // Update payment history display
                this.updatePaymentHistory();
            } else {
                throw new Error(data.detail || 'Failed to create payment');
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            this.showError(error.message);
        }
    }
        } catch (error) {
            console.error('Error creating payment:', error);
            this.showError(error.message);
        }
    }

    updateUI() {
        document.getElementById('payment-address').value = this.paymentAddress;
        document.getElementById('payment-amount').value = this.amount;
        document.getElementById('payment-currency').textContent = 
            this.paymentMethod === 'crypto' ? this.cryptoCurrency : this.fiatCurrency;
        document.getElementById('payment-method').textContent = 
            this.paymentMethod === 'crypto' ? 'Cryptocurrency' : 'ATM';
        document.getElementById('payment-status').textContent = this.status;
        
        // Show/hide ATM details
        const atmDetails = document.querySelector('.atm-details');
        if (this.paymentMethod === 'atm') {
            atmDetails.style.display = 'block';
            document.getElementById('atm-location').textContent = this.atmLocation;
        } else {
            atmDetails.style.display = 'none';
        }
    }

    generateQRCode() {
        // Clear previous QR code if exists
        if (this.currentQRCode) {
            this.currentQRCode.clear();
        }
        
        const canvas = document.getElementById('qrcode');
        const qr = new QRCode(canvas, {
            text: `${this.cryptoCurrency.toLowerCase()}:${this.paymentAddress}?amount=${this.amount}`,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        this.currentQRCode = qr;
    }

    async startStatusPolling() {
        const checkStatus = async () => {
            try {
                const response = await fetch(`/payment/status?txid=${this.transactionId}`);
                const data = await response.json();
                
                if (data.status === 'completed') {
                    this.status = 'completed';
                    this.updateUI();
                    clearInterval(this.pollingInterval);
                    this.showSuccess();
                    
                    // Update payment history
                    const payment = this.paymentHistory.find(p => p.transactionId === this.transactionId);
                    if (payment) {
                        payment.status = 'completed';
                        this.updatePaymentHistory();
                    }
                } else if (data.status === 'cancelled') {
                    this.status = 'cancelled';
                    this.updateUI();
                    clearInterval(this.pollingInterval);
                    this.showError('Payment cancelled');
                    
                    // Update payment history
                    const payment = this.paymentHistory.find(p => p.transactionId === this.transactionId);
                    if (payment) {
                        payment.status = 'cancelled';
                        this.updatePaymentHistory();
                    }
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        };

        this.pollingInterval = setInterval(checkStatus, 30000); // Check every 30 seconds
    }

    showError(message) {
        const statusDiv = document.getElementById('payment-status');
        statusDiv.textContent = message;
        statusDiv.style.color = 'red';
    }

    showSuccess() {
        const statusDiv = document.getElementById('payment-status');
        statusDiv.textContent = 'Payment Completed!';
        statusDiv.style.color = 'green';
    }
}

// Initialize payment system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const payment = new CoinPayment();
    payment.init();
});
