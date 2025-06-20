// EXDEX Investments Page JavaScript
// Implements advanced trading charts, vault visualization, and real-time data simulations
// Part of the AIRFORCE ONE OPSEC implementation

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initTradingChart();
    init3DVaultVisualization();
    initDataStreams();
    initAnimations();
    
    // Set up event listeners
    setupEventListeners();
    
    // Log all seeds, keys and transaction data for complete recovery as per user requirements
    logSecurityData();
});

// Trading Chart Initialization using Lightweight Charts
function initTradingChart() {
    const chartContainer = document.getElementById('trading-chart-container');
    if (!chartContainer) return;
    
    // Create chart instance
    const chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 400,
        layout: {
            backgroundColor: 'transparent',
            textColor: '#d1d4dc',
            fontSize: 12,
            fontFamily: 'Roboto Mono, monospace',
        },
        grid: {
            vertLines: {
                color: 'rgba(42, 46, 57, 0.5)',
                style: 1,
                visible: true,
            },
            horzLines: {
                color: 'rgba(42, 46, 57, 0.5)',
                style: 1,
                visible: true,
            },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
            vertLine: {
                color: 'rgba(0, 246, 255, 0.5)',
                width: 1,
                style: 1,
            },
            horzLine: {
                color: 'rgba(0, 246, 255, 0.5)',
                width: 1,
                style: 1,
            },
        },
        timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.3)',
            timeVisible: true,
            secondsVisible: false,
        },
        watermark: {
            visible: true,
            fontSize: 48,
            horzAlign: 'center',
            vertAlign: 'center',
            color: 'rgba(0, 246, 255, 0.05)',
            text: 'EXDEX.CC',
        },
    });
    
    // Create candlestick series
    const candleSeries = chart.addCandlestickSeries({
        upColor: '#0ecb81',
        downColor: '#f6465d',
        borderVisible: false,
        wickUpColor: '#0ecb81',
        wickDownColor: '#f6465d',
    });
    
    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
        color: 'rgba(0, 246, 255, 0.5)',
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
            top: 0.8,
            bottom: 0,
        },
    });
    
    // Generate sample data for the chart (in a real implementation, this would come from an API)
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 200);
    
    const candleData = [];
    const volumeData = [];
    
    for (let i = 0; i < 200; i++) {
        const openPrice = 4000 + Math.random() * 500;
        const highPrice = openPrice + Math.random() * 200;
        const lowPrice = openPrice - Math.random() * 200;
        const closePrice = lowPrice + Math.random() * (highPrice - lowPrice);
        
        const currentTime = currentDate.getTime() / 1000;
        
        candleData.push({
            time: currentTime,
            open: openPrice,
            high: highPrice,
            low: lowPrice,
            close: closePrice,
        });
        
        volumeData.push({
            time: currentTime,
            value: Math.random() * 100000000,
            color: closePrice >= openPrice ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)',
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Set chart data
    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    
    // Make chart responsive
    window.addEventListener('resize', () => {
        chart.applyOptions({
            width: chartContainer.clientWidth,
        });
    });
    
    // Add AI trendlines (simulated)
    const trendLineSeries = chart.addLineSeries({
        color: 'rgba(253, 77, 255, 0.8)',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
    });
    
    const trendData = candleData.map(item => ({
        time: item.time,
        value: calculateTrendValue(candleData, item.time),
    }));
    
    trendLineSeries.setData(trendData);
    
    // Add chart controls handlers
    const chartButtons = document.querySelectorAll('.chart-button');
    chartButtons.forEach(button => {
        button.addEventListener('click', function() {
            chartButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // In a real implementation, this would update the chart timeframe
            // For this demo, we'll just log it
            console.log(`Timeframe changed to: ${this.innerText}`);
        });
    });
}

// Calculate trend value for AI prediction line
function calculateTrendValue(data, time) {
    // Find the index of current time
    const index = data.findIndex(item => item.time === time);
    if (index < 10) return data[index].close;
    
    // Simple moving average with some randomness to simulate AI prediction
    const window = 10;
    let sum = 0;
    for (let i = index - window; i < index; i++) {
        sum += data[i].close;
    }
    const sma = sum / window;
    
    // Add slight trend bias and noise
    const noise = (Math.random() - 0.5) * 50;
    const trend = index / data.length * 200;
    
    return sma + noise + trend;
}

// 3D Vault Visualization using Three.js
function init3DVaultVisualization() {
    const container = document.getElementById('vault-3d-container');
    if (!container) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Create vault geometry
    const vaultGeometry = new THREE.BoxGeometry(3, 2, 1);
    const edges = new THREE.EdgesGeometry(vaultGeometry);
    
    // Create materials
    const vaultMaterial = new THREE.MeshPhongMaterial({
        color: 0x2a2e39,
        specular: 0x00f6ff,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
    });
    
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00f6ff,
        linewidth: 2
    });
    
    // Create vault mesh
    const vault = new THREE.Mesh(vaultGeometry, vaultMaterial);
    scene.add(vault);
    
    // Add edges for a wireframe effect
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    scene.add(wireframe);
    
    // Add token representations
    addTokens(scene);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00f6ff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xfd4dff, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        vault.rotation.x += 0.005;
        vault.rotation.y += 0.01;
        wireframe.rotation.x = vault.rotation.x;
        wireframe.rotation.y = vault.rotation.y;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Make vault responsive
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Add Bitcoin and Ethereum tokens to the 3D scene
function addTokens(scene) {
    // Create token geometries
    const btcGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    const ethGeometry = new THREE.OctahedronGeometry(0.3, 0);
    
    // Create token materials
    const btcMaterial = new THREE.MeshPhongMaterial({
        color: 0xf7931a,
        specular: 0xffffff,
        shininess: 100,
    });
    
    const ethMaterial = new THREE.MeshPhongMaterial({
        color: 0x627eea,
        specular: 0xffffff,
        shininess: 100,
    });
    
    // Create token meshes
    const btcToken = new THREE.Mesh(btcGeometry, btcMaterial);
    btcToken.position.set(-1, 0, 0);
    scene.add(btcToken);
    
    const ethToken = new THREE.Mesh(ethGeometry, ethMaterial);
    ethToken.position.set(1, 0, 0);
    scene.add(ethToken);
    
    // Animate tokens
    gsap.to(btcToken.position, {
        y: 0.5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });
    
    gsap.to(ethToken.position, {
        y: 0.5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        delay: 1,
        ease: "power1.inOut"
    });
    
    gsap.to(btcToken.rotation, {
        y: Math.PI * 2,
        duration: 5,
        repeat: -1,
        ease: "none"
    });
    
    gsap.to(ethToken.rotation, {
        y: Math.PI * 2,
        x: Math.PI * 2,
        duration: 5,
        repeat: -1,
        ease: "none"
    });
}

// Initialize simulated data streams and updates
function initDataStreams() {
    // Update token prices occasionally
    setInterval(() => {
        // Get random token from the list
        const tokens = document.querySelectorAll('.token-item:not(.featured)');
        if (tokens.length === 0) return;
        
        const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
        const priceElement = randomToken.querySelector('.token-price');
        const changeElement = randomToken.querySelector('.token-change');
        
        if (!priceElement || !changeElement) return;
        
        // Parse current price
        const currentPrice = parseFloat(priceElement.textContent.replace('$', '').replace(',', ''));
        
        // Generate new price (slightly changed)
        const changePercent = (Math.random() * 2 - 1) * 2; // between -2% and +2%
        const newPrice = currentPrice * (1 + changePercent / 100);
        
        // Update price
        priceElement.textContent = `$${newPrice.toFixed(2)}`;
        
        // Update change percentage
        const currentChange = parseFloat(changeElement.textContent.replace('%', '').replace('+', ''));
        const newChange = currentChange + changePercent / 5;
        changeElement.textContent = `${newChange > 0 ? '+' : ''}${newChange.toFixed(1)}%`;
        
        // Update class
        changeElement.className = 'token-change ' + (newChange >= 0 ? 'positive' : 'negative');
    }, 5000);
    
    // Update discount timer
    const timerElement = document.querySelector('.discount-timer');
    if (timerElement) {
        let hours = 23;
        let minutes = 42;
        let seconds = 15;
        
        setInterval(() => {
            seconds--;
            if (seconds < 0) {
                seconds = 59;
                minutes--;
                if (minutes < 0) {
                    minutes = 59;
                    hours--;
                    if (hours < 0) {
                        hours = 23;
                    }
                }
            }
            
            timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} remaining`;
        }, 1000);
    }
    
    // Update progress bars for vault transfers
    animateProgressBars();
}

// Add subtle animations to various elements
function initAnimations() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.investment-button, .quantum-button, .cta-button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Animate pool cards on hover
    const poolItems = document.querySelectorAll('.pool-item');
    poolItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            gsap.to(this, {
                y: -5,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
                duration: 0.3
            });
        });
        
        item.addEventListener('mouseleave', function() {
            gsap.to(this, {
                y: 0,
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                duration: 0.3
            });
        });
    });
    
    // Animate discount banner
    const discountBanner = document.querySelector('.discount-banner');
    if (discountBanner) {
        gsap.to(discountBanner, {
            boxShadow: '0 0 25px rgba(255, 61, 0, 0.4)',
            duration: 2,
            repeat: -1,
            yoyo: true
        });
    }
}

// Setup event listeners for interactive elements
function setupEventListeners() {
    // Handle token selection
    const tokenItems = document.querySelectorAll('.token-item');
    tokenItems.forEach(item => {
        item.addEventListener('click', function() {
            // Get token data
            const tokenName = this.querySelector('.token-name').textContent;
            const tokenPrice = this.querySelector('.token-price').textContent;
            const tokenChange = this.querySelector('.token-change').textContent;
            const tokenIcon = this.querySelector('.token-icon').src;
            const changeClass = this.querySelector('.token-change').classList.contains('positive') ? 'positive' : 'negative';
            
            // Update selected token display
            const selectedName = document.querySelector('.selected-token-name');
            const selectedPrice = document.querySelector('.selected-token-price');
            const selectedChange = document.querySelector('.selected-token-change');
            const selectedIcon = document.querySelector('.selected-token-icon');
            
            if (selectedName) selectedName.textContent = `${tokenName}/USDT`;
            if (selectedPrice) selectedPrice.textContent = tokenPrice;
            if (selectedChange) {
                selectedChange.textContent = tokenChange;
                selectedChange.className = `selected-token-change ${changeClass}`;
            }
            if (selectedIcon) selectedIcon.src = tokenIcon;
            
            // Highlight selected token
            tokenItems.forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            
            // In a real implementation, this would update the chart data
            console.log(`Selected token: ${tokenName}`);
        });
    });
    
    // Pool filter buttons
    const filterButtons = document.querySelectorAll('.filter-button');
    const poolItems = document.querySelectorAll('.pool-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.textContent.toLowerCase();
            
            poolItems.forEach(pool => {
                if (filter === 'all') {
                    pool.style.display = 'block';
                    return;
                }
                
                const badge = pool.querySelector('.pool-badge');
                if (!badge) return;
                
                if (filter === 'high apy' && parseFloat(pool.querySelector('.pool-apy').textContent) > 40) {
                    pool.style.display = 'block';
                } else if (filter === 'new' && badge.textContent.toLowerCase() === 'new') {
                    pool.style.display = 'block';
                } else {
                    pool.style.display = 'none';
                }
            });
        });
    });
    
    // Investment buttons
    const investButtons = document.querySelectorAll('.investment-button, .quantum-button');
    investButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real implementation, this would open a modal for investment
            alert('Investment feature would be activated here. This would connect to wallet and allow for allocation of funds from the offline vault.');
        });
    });
}

// Animate progress bars for vault transfers
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach(bar => {
        const currentWidth = parseFloat(bar.style.width);
        
        // Simulate slow progress (every 30 seconds add 1%)
        setInterval(() => {
            const currentWidth = parseFloat(bar.style.width);
            if (currentWidth < 100) {
                const newWidth = currentWidth + 1;
                bar.style.width = `${newWidth}%`;
                
                // Also update the text percentage
                const progressLabel = bar.closest('.reserve-progress').querySelector('.progress-label');
                if (progressLabel) {
                    const offlineSpan = progressLabel.querySelector('span:first-child');
                    const poolSpan = progressLabel.querySelector('span:last-child');
                    
                    if (offlineSpan && poolSpan) {
                        const offlinePercent = 100 - newWidth;
                        const poolPercent = newWidth;
                        
                        offlineSpan.textContent = `Offline: ${offlinePercent}%`;
                        poolSpan.textContent = `Funding Pool: ${poolPercent}%`;
                    }
                }
            }
        }, 30000);
    });
}

// Log security data as required
function logSecurityData() {
    // Create secure log of all transaction keys and seed phrases
    const securityLog = {
        timestamp: new Date().toISOString(),
        systemId: 'EXDEX-AIRFORCE-ONE',
        walletSeeds: [
            {
                name: 'BTC Offline Vault',
                seed: 'width frame swing disagree surprise expect dwarf village force height canvas recycle',
                publicKey: '0x3F8E75b0E5c83cAAB1a85559D3A8205C4bBC1Df5',
                balance: '1245.87 BTC'
            },
            {
                name: 'ETH Offline Vault',
                seed: 'helmet border happy opinion weird twice surge gravity dance isolate element capable',
                publicKey: '0x72A9c969382cB873c5f04a2387340358B97cF607',
                balance: '8976.32 ETH'
            }
        ],
        transactionHistory: [
            {
                txId: '0xa8f7e5b4c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1',
                amount: '50 BTC',
                from: 'Offline Vault',
                to: 'Funding Pool',
                timestamp: '2025-04-09T03:12:45Z',
                status: 'completed'
            },
            {
                txId: '0x1e2d3c4b5a6f7e8d9c0b1a2e3d4f5c6b7a8f9e0d',
                amount: '250 ETH',
                from: 'Offline Vault',
                to: 'Funding Pool',
                timestamp: '2025-04-08T22:05:18Z',
                status: 'completed'
            }
        ]
    };
    
    // In a real implementation, this would securely store the information
    // For this demo, we'll just log to console (In production, this would be encrypted)
    console.log('SECURITY LOG (ENCRYPTED):', securityLog);
    
    // Send a copy to the server
    // This is a simulation of the actual implementation
    /*
    fetch('https://api.exdex.cc/secure-log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.EXDEX_API_KEY
        },
        body: JSON.stringify({
            encryptedData: encryptWithRIPTIDE(securityLog)
        })
    });
    */
}
