/**
 * ExDEX Platform - Main JavaScript File
 * Author: Cascade AI
 * Version: 1.0.0
 * Description: Frontend functionality for the BHE ecosystem trading platform
 */

// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize components
    initThreeJsToken();
    const sphere = initTradingSphere();
    connectLiveTradeFeed(sphere);
    
    // Initialize Knox Wallet
    const knox = new KnoxWalletIntegration();
    const isInitialized = await knox.init();
    
    if (isInitialized) {
        initWalletConnection(knox);
    } else {
        console.error('Failed to initialize Knox Wallet');
    }
    
    initAnimations();
    logAllTransactions(); // DRIPTIDE protocol logging
    createSecurityVerification(); // Security controller
});

// 3D Token Model using Three.js
function initThreeJsToken() {
    // Check if the 3D token model container exists
    const tokenModelContainer = document.getElementById('token-3d-model');
    if (!tokenModelContainer) return;

    // Set up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, tokenModelContainer.clientWidth / tokenModelContainer.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(tokenModelContainer.clientWidth, tokenModelContainer.clientHeight);
    tokenModelContainer.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00f6ff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Create BHE token geometry
    const tokenGeometry = new THREE.TorusKnotGeometry(3, 1, 100, 16);
    const wireMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00f6ff,
        wireframe: true,
        emissive: 0x00f6ff,
        emissiveIntensity: 0.5
    });
    
    const tokenMesh = new THREE.Mesh(tokenGeometry, wireMaterial);
    scene.add(tokenMesh);
    
    // Create outer glow spheres
    const glowGeometry = new THREE.SphereGeometry(4, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f6ff,
        transparent: true,
        opacity: 0.1
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Position camera
    camera.position.z = 10;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate the token
        tokenMesh.rotation.x += 0.01;
        tokenMesh.rotation.y += 0.01;
        
        // Pulse the glow
        const time = Date.now() * 0.001;
        glowMesh.scale.set(
            1 + Math.sin(time) * 0.1,
            1 + Math.sin(time) * 0.1,
            1 + Math.sin(time) * 0.1
        );
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = tokenModelContainer.clientWidth / tokenModelContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(tokenModelContainer.clientWidth, tokenModelContainer.clientHeight);
    });
}

// Initialize the 3D Trading Sphere visualization
function initTradingSphere() {
    const containerId = 'trading-sphere';
    const containerEl = document.getElementById(containerId);
    if (!containerEl) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }

    // Ensure Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js library not loaded');
        return;
    }

    // Create a new sphere instance
    const sphere = new TradingSphere(containerId, {
        autoRotate: true,
        maxNodes: 200,
        backgroundColor: 0x000000,
        sphereRadius: 15,
        showSphereGrid: true,
        trailEffect: true
    });

    // Start simulated trading feed for visual flair
    sphere.startTradeSimulation(1500);

    // Store globally for debugging
    window.tradingSphere = sphere;

    return sphere;
}

// Connect to RPC WebSocket and stream live trades into TradingSphere
function connectLiveTradeFeed(sphereInstance) {
    if (!sphereInstance) return;

    try {
        const ws = new WebSocket('ws://localhost:8545/ws/trades');

        ws.onopen = () => console.log('Live trade feed connected');

        ws.onmessage = (event) => {
            try {
                const tradeData = JSON.parse(event.data);
                // Expect { pair, amount, price, group, type, timestamp }
                sphereInstance.addTradeNode(tradeData);
            } catch (err) {
                console.error('Invalid trade message', err);
            }
        };

        ws.onerror = (err) => console.error('Trade feed error', err);
        ws.onclose = () => console.warn('Trade feed closed');
    } catch (e) {
        console.warn('WebSocket not supported or RPC offline');
    }
}

// Wallet Connection
async function initWalletConnection(knox) {
    const connectWalletButton = document.querySelector('.connect-wallet button');
    if (!connectWalletButton) return;
    
    connectWalletButton.addEventListener('click', async () => {
        try {
            // Check if Web3 is injected
            if (typeof window.ethereum !== 'undefined') {
                connectWalletButton.textContent = 'Connecting...';
                
                // Create Knox wallet
                const walletData = await knox.createWallet('eth');
                const account = walletData.address;
                
                // Get and visualize life slice
                const lifeSliceData = await knox.getLifeSlice(account);
                const visualization = await knox.visualizeLifeSlice(lifeSliceData);
                document.body.appendChild(visualization);
                
                // Truncate the address for display
                const truncatedAddress = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
                connectWalletButton.textContent = truncatedAddress;
                
                // Add connected class
                connectWalletButton.classList.add('connected');
                
                // Log the connection (for DRIPTIDE)
                console.log(`Wallet connected: ${account}`);
                
                // Show success notification
                showNotification('Wallet connected successfully!', 'success');
                
                // Trigger PGP key generation
                generatePGPKey(account);
            } else {
                showNotification('Please install a Web3 wallet like MetaMask!', 'error');
                connectWalletButton.textContent = 'Install Wallet';
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            connectWalletButton.textContent = 'Connect Failed';
            setTimeout(() => {
                connectWalletButton.textContent = 'Connect Wallet';
            }, 3000);
            
            showNotification('Failed to connect wallet. Please try again.', 'error');
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Animations using GSAP
function initAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') return;
    
    // Animate hero title
    gsap.from('.hero-title', {
        duration: 1.5,
        opacity: 0,
        y: 50,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-subtitle', {
        duration: 1.5,
        opacity: 0,
        y: 30,
        ease: 'power3.out',
        delay: 0.3
    });
    
    gsap.from('.hero-text', {
        duration: 1.5,
        opacity: 0,
        y: 30,
        ease: 'power3.out',
        delay: 0.5
    });
    
    gsap.from('.hero-cta', {
        duration: 1.5,
        opacity: 0,
        y: 30,
        ease: 'power3.out',
        delay: 0.7
    });
    
    // Animate metrics counters
    const metricValues = document.querySelectorAll('.metric-value');
    metricValues.forEach((metric) => {
        const value = metric.textContent;
        metric.textContent = '0';
        
        // Create scroll trigger
        gsap.to(metric, {
            scrollTrigger: {
                trigger: metric,
                start: 'top 80%',
                once: true
            },
            duration: 2,
            ease: 'power1.out',
            onUpdate: function() {
                if (value.includes('$')) {
                    // Handle currency format
                    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
                    const progress = this.progress();
                    const current = (numericValue * progress).toFixed(1);
                    metric.textContent = `$${current}M`;
                } else if (value.includes('%')) {
                    // Handle percentage format
                    const numericValue = parseFloat(value);
                    const progress = this.progress();
                    const current = (numericValue * progress).toFixed(2);
                    metric.textContent = `${current}%`;
                } else if (value.includes('K')) {
                    // Handle thousands format
                    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
                    const progress = this.progress();
                    const current = Math.round(numericValue * progress);
                    metric.textContent = `${current}K`;
                } else if (value.includes('M')) {
                    // Handle millions format
                    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
                    const progress = this.progress();
                    const current = (numericValue * progress).toFixed(1);
                    metric.textContent = `${current}M`;
                } else {
                    // Handle regular numbers
                    const numericValue = parseFloat(value);
                    const progress = this.progress();
                    const current = Math.round(numericValue * progress);
                    metric.textContent = current;
                }
            }
        });
    });
    
    // Animate card display
    gsap.to('.card-display', {
        scrollTrigger: {
            trigger: '.card-showcase',
            start: 'top 70%'
        },
        duration: 1.5,
        rotationY: 10,
        transformOrigin: 'left center',
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        repeatDelay: 1
    });
}

// DRIPTIDE Protocol integration
function logAllTransactions() {
    // Simulated function to demonstrate DRIPTIDE data tokenization
    console.log('DRIPTIDE Protocol: Monitoring system initialized');
    
    // In a real implementation, this would capture transaction data
    // and create tokenized data assets on the blockchain
    function captureAction(action, data) {
        const timestamp = new Date().toISOString();
        const securePGPEncryption = true; // Simulate encryption
        
        console.log(`DRIPTIDE: Capturing ${action} at ${timestamp}`);
        
        // Hash calculation (simulated)
        const actionHash = `0x${Array.from(timestamp + action + JSON.stringify(data)).reduce((acc, char) => 
            acc + char.charCodeAt(0).toString(16), '')}`;
        
        return {
            actionType: action,
            timestamp: timestamp,
            dataHash: actionHash,
            encrypted: securePGPEncryption,
            success: true
        };
    }
    
    // Add event listeners to capture user actions
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const buttonType = this.className;
            
            captureAction('button_click', {
                text: buttonText,
                type: buttonType,
                path: getElementPath(this)
            });
        });
    });
    
    // Helper to get DOM path
    function getElementPath(el) {
        const path = [];
        while (el && el.nodeType === Node.ELEMENT_NODE) {
            let selector = el.nodeName.toLowerCase();
            if (el.id) {
                selector += `#${el.id}`;
            } else if (el.className) {
                selector += `.${el.className.replace(/\s+/g, '.')}`;
            }
            path.unshift(selector);
            el = el.parentNode;
        }
        return path.join(' > ');
    }
}

// PGP Key Generation for Dual Security
function generatePGPKey(address) {
    console.log(`Generating PGP key pair for wallet: ${address}`);
    
    // In a real implementation, this would use OpenPGP.js or a similar library
    // For demonstration, we'll simulate the key generation
    
    // Simulated key pair
    const simulatedKeyPair = {
        publicKey: `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v4.10.9
Comment: https://openpgpjs.org

xjMEYY5NbRYJKwYBBAHaRw8BAQdAH+FBF5mSkvmovXbsd0JYLmhqXZSJnydJ
Up0ZwgCm3j7NKUJIRSBVc2VyICh3YWxsZXQ6ICR7YWRkcmVzc30pIDxiaGVA
ZXhkZXguaW8+wncEEBYKAB8FAmGOTW0GCwkHCAMCBBUICgIEFgIBAAIZAQIb
AwIeAQAKCRBt8YjSXgG8DEIyAP9GW1jn3GjOvnMlYnvrXxtIXZLOVOlUJGRR
qQ3xnPrCUwEA5EKkwvKP4g1ZK6u/zdJY9fN88VQVpGuGZ0YXhjO5CAPOOARh
jk1tEgorBgEEAZdVAQUBAQdAdeYbJS6V0J5QfzYlJjRbQcBSigveOMQUJYGw
aUJu1a4DAQgHwmEEGBYIAAkFAmGOTW0CGwwACgkQbfGI0l4BvAzSvwEA40VA
ygOtgFFaFH5a2Sx5A36MNGrjwW1qUUHI94qg9FEA/0XGOi9iFHFdP+tRlkB7
fyHJ4bYW7q5SQcgfj1KJDSEQ
=Ck1z
-----END PGP PUBLIC KEY BLOCK-----`,
        privateKey: `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: OpenPGP.js v4.10.9
Comment: https://openpgpjs.org

xYYEYY5NbRYJKwYBBAHaRw8BAQdAH+FBF5mSkvmovXbsd0JYLmhqXZSJnydJ
Up0ZwgCm3j7+CQMIxDMUQzY3QXXA4Vdp9X7+ULsNFbXt5S2o2H4SCyFo1G56
BYUB/W8oFQgH4gzJlnCBGXHvK8MUpxftCrXYN5TQI+dYl4yh0h9VJ7I8zSlC
SEUgVXNlciAod2FsbGV0OiAke2FkZHJlc3N9KSA8YmhlQGV4ZGV4LmlvPsJ3
BBAWCgAfBQJhjk1tBgsJBwgDAgQVCAoCBBYCAQACGQECGwMCHgEACgkQbfGI
0l4BvAxCMgD/Rlta...`
    };
    
    // In a real implementation, we would store the private key securely
    // For demo, just logging the public key
    console.log('PGP public key generated for secure messaging');
    
    return simulatedKeyPair;
}

// Security verification for the connection
function createSecurityVerification() {
    // This would integrate with the SecurityController contract in production
    console.log('Initializing security verification system');
    
    // Simulate a security score calculation
    function calculateSecurityScore(data) {
        // In production, this would use real metrics from the SecurityController
        const factors = {
            hasHardwareWallet: true,
            usesMultisig: false,
            unrecognizedIP: false,
            suspiciousPatterns: false
        };
        
        let score = 0;
        if (factors.hasHardwareWallet) score += 2;
        if (factors.usesMultisig) score += 2;
        if (factors.unrecognizedIP) score += 1;
        if (factors.suspiciousPatterns) score += 2;
        
        return Math.min(score, 5); // 0-5 scale where 5 is highest risk
    }
    
    // Check security on page load
    const initialScore = calculateSecurityScore({});
    
    if (initialScore > 3) {
        showNotification('Security Alert: Your connection may be at risk. Consider using a hardware wallet.', 'warning');
    }
    
    return {
        score: initialScore,
        factors: ['IP verification', 'Wallet type', 'Transaction patterns']
    };
}
