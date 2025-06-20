class PoolInterface {
    constructor() {
        this.poolAddress = null;
        this.userBalance = {};
        this.poolBalance = {};
        this.exchangeRates = {};
        this.tierCoins = {
            'TIER1': { price: 100, description: 'Basic Tier', atmLimit: 1000 },
            'TIER2': { price: 500, description: 'Premium Tier', atmLimit: 5000 },
            'TIER3': { price: 1000, description: 'Elite Tier', atmLimit: 10000 }
        };
        this.atmCardFee = 0.01; // 1% fee for ATM card
        this.taxRate = 0.01; // 1% tax rate
        this.usTariffRate = 0.25; // 25% tariff for US users
        
        // Tax addresses
        this.taxAddresses = {
            evm: '0x86de433858B18f664100371D88178d29e9076E95',
            btc: 'bc1qsqtwnytap3j2gnq2jyt55ktveeu75lqsekdetk'
        };
        
        this.init();
    }

    async init() {
        // Initialize web3
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            await this.loadPoolData();
            this.setupEventListeners();
        }
    }

    async loadPoolData() {
        try {
            // Load pool contract
            const poolContract = new this.web3.eth.Contract(POOL_ABI, POOL_ADDRESS);
            
            // Get pool balances
            const tokens = ['WETH', 'WBTC', 'USDT', 'DAI', 'USDC'];
            for (const token of tokens) {
                const balance = await poolContract.methods.getPoolBalance(token).call();
                this.poolBalance[token] = this.web3.utils.fromWei(balance);
            }

            // Get exchange rates
            this.exchangeRates = await this.fetchExchangeRates();
        } catch (error) {
            console.error('Error loading pool data:', error);
        }
    }

    async fetchExchangeRates() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,usd-coin,dai,usdt&vs_currencies=usd');
            const data = await response.json();
            return {
                'WETH': data.ethereum.usd,
                'WBTC': data.bitcoin.usd,
                'USDT': data.usdt.usd,
                'DAI': data.dai.usd,
                'USDC': data.usd_coin.usd
            };
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return {
                'WETH': 1800,
                'WBTC': 40000,
                'USDT': 1,
                'DAI': 1,
                'USDC': 1
            };
        }
    }

    setupEventListeners() {
        // Deposit button
        document.querySelectorAll('.deposit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const token = btn.dataset.token;
                const amount = document.getElementById(`deposit-${token}`).value;
                await this.deposit(token, amount);
            });
        });

        // Withdraw button
        document.querySelectorAll('.withdraw-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const token = btn.dataset.token;
                const amount = document.getElementById(`withdraw-${token}`).value;
                await this.withdraw(token, amount);
            });
        });

        // Buy Tier Coin button
        document.querySelectorAll('.buy-tier-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const tier = btn.dataset.tier;
                const amount = document.getElementById(`tier-amount-${tier}`).value;
                await this.buyTierCoin(tier, amount);
            });
        });

        // Buy ATM Card button
        document.querySelector('.buy-atm-btn').addEventListener('click', async () => {
            const amount = document.getElementById('atm-amount').value;
            const currency = document.getElementById('atm-currency').value;
            await this.buyATMCard(amount, currency);
        });

        // Withdraw button
        document.querySelectorAll('.withdraw-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const token = btn.dataset.token;
                const amount = document.getElementById(`withdraw-${token}`).value;
                await this.withdraw(token, amount);
            });
        });

        // Convert button
        document.querySelector('.convert-btn').addEventListener('click', async () => {
            const fromToken = document.getElementById('from-token').value;
            const toToken = document.getElementById('to-token').value;
            const amount = document.getElementById('convert-amount').value;
            await this.convert(fromToken, toToken, amount);
        });
    }

    async deposit(token, amount) {
        try {
            const poolContract = new this.web3.eth.Contract(POOL_ABI, POOL_ADDRESS);
            const accounts = await this.web3.eth.getAccounts();
            
            // Calculate tax
            const taxAmount = amount * this.taxRate;
            const finalAmount = amount - taxAmount;
            
            // Send tax to tax address
            await this.sendTax(token, taxAmount);
            
            // Execute deposit
            const tx = await poolContract.methods.deposit(token, this.web3.utils.toWei(finalAmount)).send({
                from: accounts[0]
            });
            
            // Update UI
            this.updatePoolUI();
            this.showNotification(`Successfully deposited ${amount} ${token}. Tax: ${taxAmount}`);
        } catch (error) {
            console.error('Deposit error:', error);
            this.showError(error.message);
        }
    }

    async withdraw(token, amount) {
        try {
            const poolContract = new this.web3.eth.Contract(POOL_ABI, POOL_ADDRESS);
            const accounts = await this.web3.eth.getAccounts();
            
            // Calculate tax
            const taxAmount = amount * this.taxRate;
            const finalAmount = amount - taxAmount;
            
            // Send tax to tax address
            await this.sendTax(token, taxAmount);
            
            // Execute withdraw
            const tx = await poolContract.methods.withdraw(token, this.web3.utils.toWei(finalAmount)).send({
                from: accounts[0]
            });
            
            // Update UI
            this.updatePoolUI();
            this.showNotification(`Successfully withdrew ${amount} ${token}. Tax: ${taxAmount}`);
        } catch (error) {
            console.error('Withdraw error:', error);
            this.showError(error.message);
        }
    }

    async buyTierCoin(tier, amount) {
        try {
            const poolContract = new this.web3.eth.Contract(POOL_ABI, POOL_ADDRESS);
            const accounts = await this.web3.eth.getAccounts();
            const tierData = this.tierCoins[tier];
            
            // Calculate cost
            const cost = tierData.price * amount;
            
            // Calculate tax
            const taxAmount = cost * this.taxRate;
            const finalCost = cost - taxAmount;
            
            // Send tax to tax address
            await this.sendTax('USDT', taxAmount);
            
            // Check if user has enough balance
            const userBalance = await this.getUserBalance('USDT');
            if (userBalance < finalCost) {
                throw new Error('Insufficient USDT balance after tax');
            }
            
            // Execute purchase
            const tx = await poolContract.methods.buyTierCoin(tier, amount).send({
                from: accounts[0]
            });
            
            // Update UI
            this.updatePoolUI();
            this.showNotification(`Successfully purchased ${amount} ${tier} coins. Tax: ${taxAmount}`);
            
            // Update user's tier status
            this.updateUserTier(tier);
        } catch (error) {
            console.error('Buy tier coin error:', error);
            this.showError(error.message);
        }
    }

    async buyATMCard(amount, currency) {
        try {
            const poolContract = new this.web3.eth.Contract(POOL_ABI, POOL_ADDRESS);
            const accounts = await this.web3.eth.getAccounts();
            
            // Get user's country (for demo purposes, we'll use a mock function)
            const isUSUser = await this.isUserFromUS();
            
            // Calculate base amount
            let finalAmount = amount;
            
            // Apply taxes/tariffs
            let taxAmount = amount * this.taxRate;
            let tariffAmount = 0;
            
            if (isUSUser) {
                tariffAmount = amount * this.usTariffRate;
                finalAmount -= tariffAmount;
            }
            
            finalAmount -= taxAmount;
            
            // Send tax and tariff
            await this.sendTax(currency, taxAmount);
            if (tariffAmount > 0) {
                await this.sendTariff(currency, tariffAmount);
            }
            
            // Check if user has enough balance
            const userBalance = await this.getUserBalance(currency);
            if (userBalance < finalAmount) {
                throw new Error(`Insufficient balance after tax${isUSUser ? ' and tariff' : ''}`);
            }
            
            // Execute purchase
            const tx = await poolContract.methods.buyATMCard(finalAmount, currency).send({
                from: accounts[0]
            });
            
            // Update UI
            this.updatePoolUI();
            
            const message = `Successfully purchased ATM card with ${amount} ${currency}. Tax: ${taxAmount}${isUSUser ? `, Tariff: ${tariffAmount}` : ''}`;
            this.showNotification(message);
            
            // Generate and display card details
            await this.generateATMCardDetails();
        } catch (error) {
            console.error('Buy ATM card error:', error);
            this.showError(error.message);
        }
    }

    async getUserBalance(token) {
        const poolContract = new this.web3.eth.Contract(POOL_ABI, POOL_ADDRESS);
        const accounts = await this.web3.eth.getAccounts();
        return await poolContract.methods.getUserBalance(accounts[0], token).call();
    }

    updateUserTier(tier) {
        const userTier = document.querySelector('.user-tier');
        if (userTier) {
            userTier.textContent = `Current Tier: ${tier}`;
        }
    }

    async generateATMCardDetails() {
        try {
            const poolContract = new this.web3.eth.Contract(POOL_ABI, POOL_ADDRESS);
            const accounts = await this.web3.eth.getAccounts();
            const cardDetails = await poolContract.methods.getATMCardDetails(accounts[0]).call();
            
            // Update card details display
            document.getElementById('card-number').textContent = cardDetails.cardNumber;
            document.getElementById('card-expiry').textContent = cardDetails.expiry;
            document.getElementById('card-cvv').textContent = cardDetails.cvv;
            document.getElementById('card-limit').textContent = `$${cardDetails.limit}`;
        } catch (error) {
            console.error('Error generating card details:', error);
        }
    }

    updatePoolUI() {
        // Update pool balances
        for (const token in this.poolBalance) {
            document.getElementById(`pool-balance-${token}`).textContent = this.poolBalance[token];
        }

        // Update exchange rates
        for (const token in this.exchangeRates) {
            document.getElementById(`exchange-rate-${token}`).textContent = `$${this.exchangeRates[token].toFixed(2)}`;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'error';
        error.textContent = message;
        document.body.appendChild(error);
        setTimeout(() => error.remove(), 5000);
    }
}

// Initialize pool interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pool = new PoolInterface();
});
