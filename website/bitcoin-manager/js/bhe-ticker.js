/**
 * BHE Coin Ticker Component
 * Provides real-time price data and updates for BHE token
 * Includes deployment and launch preview functionality
 * ONLY connects to personal family node on EC-4 private network
 */

class BHETokenTicker {
    constructor() {
        this.tickerData = {
            symbol: "BHE",
            name: "Bitcoin Hardened Ethereum",
            currentPrice: 0,
            priceChangePercent: 0,
            marketCap: 0,
            volume24h: 0,
            circulatingSupply: 0,
            maxSupply: 21000000,
            launchDate: new Date("2025-06-15T00:00:00Z"),
            deploymentStage: "Pre-launch",
            contractAddress: "0x1234567890abcdef1234567890abcdef12345678", // Example address
            network: "EC-4 Private Network",
            familyNodeId: "exdex-home-node-personal", // Personal family node identifier
            securityLevel: "RIPTIDE-ENCRYPTED" // Highest security level
        };
        
        this.priceHistory = [];
        this.updateInterval = null;
        this.chartInstance = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the BHE token ticker
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            console.log("Initializing BHE Token Ticker for personal family node...");
            
            // Verify connection to personal family node
            const nodeVerified = await this.verifyFamilyNodeConnection();
            if (!nodeVerified) {
                console.error("Failed to verify personal family node connection");
                return false;
            }
            
            // Fetch initial data
            await this.fetchTokenData();
            
            // Set up update interval (every 30 seconds)
            this.updateInterval = setInterval(() => this.fetchTokenData(), 30000);
            
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error("Failed to initialize BHE Token Ticker:", error);
            return false;
        }
    }
    
    /**
     * Verify connection to personal family node
     * @returns {Promise<boolean>} Connection verified
     */
    async verifyFamilyNodeConnection() {
        try {
            // In a real implementation, this would verify connection to XDEXHomeNode contract
            // For demo purposes, we'll simulate verification
            console.log("Verifying connection to personal family node on EC-4 network...");
            
            // Simulate verification process
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Set family node connection status
            this.familyNodeConnected = true;
            this.tickerData.nodeStatus = "Connected";
            
            return true;
        } catch (error) {
            console.error("Failed to verify family node connection:", error);
            this.familyNodeConnected = false;
            this.tickerData.nodeStatus = "Disconnected";
            return false;
        }
    }

    /**
     * Fetch token data from API
     * @returns {Promise<Object>} Token data
     */
    async fetchTokenData() {
        try {
            // In a real implementation, this would fetch data from an API
            // For demo purposes, we'll simulate data updates
            
            // Generate simulated price data
            const previousPrice = this.tickerData.currentPrice || 10.50;
            const priceChange = (Math.random() - 0.5) * 0.5; // Random change between -0.25 and 0.25
            const newPrice = Math.max(previousPrice + priceChange, 0.01);
            
            // Update ticker data
            this.tickerData.currentPrice = parseFloat(newPrice.toFixed(2));
            this.tickerData.priceChangePercent = parseFloat(((newPrice - previousPrice) / previousPrice * 100).toFixed(2));
            this.tickerData.marketCap = parseFloat((this.tickerData.currentPrice * this.tickerData.circulatingSupply).toFixed(2));
            this.tickerData.volume24h = parseFloat((Math.random() * 1000000 + 500000).toFixed(2));
            this.tickerData.circulatingSupply = 1000000; // Fixed for demo
            
            // Add to price history
            this.priceHistory.push({
                timestamp: new Date(),
                price: this.tickerData.currentPrice
            });
            
            // Keep only the last 100 price points
            if (this.priceHistory.length > 100) {
                this.priceHistory.shift();
            }
            
            // Update deployment stage based on current date
            this.updateDeploymentStage();
            
            // Update UI
            this.updateUI();
            
            return this.tickerData;
        } catch (error) {
            console.error("Failed to fetch BHE token data:", error);
            throw error;
        }
    }

    /**
     * Update deployment stage based on current date
     */
    updateDeploymentStage() {
        const now = new Date();
        const launchDate = this.tickerData.launchDate;
        const daysDifference = Math.floor((launchDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysDifference > 30) {
            this.tickerData.deploymentStage = "Early Development";
        } else if (daysDifference > 14) {
            this.tickerData.deploymentStage = "Testnet Deployment";
        } else if (daysDifference > 7) {
            this.tickerData.deploymentStage = "Security Audit";
        } else if (daysDifference > 0) {
            this.tickerData.deploymentStage = "Pre-launch";
        } else {
            this.tickerData.deploymentStage = "Launched";
        }
    }

    /**
     * Update UI with current ticker data
     */
    updateUI() {
        // Update price display
        const priceElement = document.getElementById('bhe-price');
        if (priceElement) {
            priceElement.textContent = `$${this.tickerData.currentPrice.toFixed(2)}`;
        }
        
        // Update price change
        const changeElement = document.getElementById('bhe-price-change');
        if (changeElement) {
            const changeText = `${this.tickerData.priceChangePercent > 0 ? '+' : ''}${this.tickerData.priceChangePercent.toFixed(2)}%`;
            changeElement.textContent = changeText;
            
            // Update class based on price direction
            changeElement.className = 'price-change';
            if (this.tickerData.priceChangePercent > 0) {
                changeElement.classList.add('positive');
            } else if (this.tickerData.priceChangePercent < 0) {
                changeElement.classList.add('negative');
            }
        }
        
        // Update market cap
        const marketCapElement = document.getElementById('bhe-market-cap');
        if (marketCapElement) {
            marketCapElement.textContent = `$${this.formatNumber(this.tickerData.marketCap)}`;
        }
        
        // Update 24h volume
        const volumeElement = document.getElementById('bhe-volume');
        if (volumeElement) {
            volumeElement.textContent = `$${this.formatNumber(this.tickerData.volume24h)}`;
        }
        
        // Update circulating supply
        const supplyElement = document.getElementById('bhe-supply');
        if (supplyElement) {
            supplyElement.textContent = `${this.formatNumber(this.tickerData.circulatingSupply)} BHE`;
        }
        
        // Update deployment stage
        const stageElement = document.getElementById('bhe-stage');
        if (stageElement) {
            stageElement.textContent = this.tickerData.deploymentStage;
        }
        
        // Update launch countdown
        this.updateLaunchCountdown();
        
        // Update price chart
        this.updatePriceChart();
    }

    /**
     * Update launch countdown
     */
    updateLaunchCountdown() {
        const countdownElement = document.getElementById('bhe-countdown');
        if (!countdownElement) return;
        
        const now = new Date();
        const launchDate = this.tickerData.launchDate;
        
        if (now >= launchDate) {
            countdownElement.textContent = "Token Launched!";
            return;
        }
        
        const difference = launchDate - now;
        
        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Format countdown text
        countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    /**
     * Update price chart
     */
    updatePriceChart() {
        const chartCanvas = document.getElementById('bhe-price-chart');
        if (!chartCanvas) return;
        
        // Extract data for chart
        const labels = this.priceHistory.map(point => {
            const date = new Date(point.timestamp);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        });
        
        const prices = this.priceHistory.map(point => point.price);
        
        // If Chart.js is available, create/update chart
        if (window.Chart) {
            if (!this.chartInstance) {
                // Create new chart
                const ctx = chartCanvas.getContext('2d');
                this.chartInstance = new window.Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'BHE Price (USD)',
                            data: prices,
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false,
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: '#aaa'
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: '#aaa',
                                    maxTicksLimit: 10
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false
                            }
                        }
                    }
                });
            } else {
                // Update existing chart
                this.chartInstance.data.labels = labels;
                this.chartInstance.data.datasets[0].data = prices;
                this.chartInstance.update();
            }
        } else {
            console.warn("Chart.js not available. Price chart will not be displayed.");
        }
    }

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Get deployment progress percentage
     * @returns {number} Progress percentage
     */
    getDeploymentProgress() {
        const now = new Date();
        const launchDate = this.tickerData.launchDate;
        
        // If already launched, return 100%
        if (now >= launchDate) {
            return 100;
        }
        
        // Calculate progress based on deployment stage
        switch (this.tickerData.deploymentStage) {
            case "Early Development":
                return 25;
            case "Testnet Deployment":
                return 50;
            case "Security Audit":
                return 75;
            case "Pre-launch":
                return 90;
            default:
                return 0;
        }
    }

    /**
     * Get token data
     * @returns {Object} Current token data
     */
    getTokenData() {
        return { ...this.tickerData };
    }

    /**
     * Get price history
     * @returns {Array} Price history
     */
    getPriceHistory() {
        return [...this.priceHistory];
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        
        this.isInitialized = false;
    }
}

// Export the BHETokenTicker class
window.BHETokenTicker = BHETokenTicker;
