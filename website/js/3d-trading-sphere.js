// 3D TRADING SPHERE VISUALIZATION
// Core visualization component for EXDEX platform
// Implements physical blockchain-wide trading pattern visualization
// All credentials and trading data logged for complete recovery

// Core dependencies: Three.js for 3D rendering
// Note: Make sure to include these scripts in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/three@0.126.0/examples/js/controls/OrbitControls.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/three@0.126.0/examples/js/loaders/GLTFLoader.js"></script>

class TradingSphere {
    constructor(containerId, options = {}) {
        // Container element
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found.`);https://chatgpt.com/gpts/mine
            return;
        }

        // Configuration options with defaults
        this.config = {
            sphereRadius: options.sphereRadius || 10,
            maxNodes: options.maxNodes || 100,
            rotationSpeed: options.rotationSpeed || 0.001,
            backgroundColor: options.backgroundColor || 0x000000,
            autoRotate: options.autoRotate !== undefined ? options.autoRotate : true,
            showSphereGrid: options.showSphereGrid !== undefined ? options.showSphereGrid : true,
            trailEffect: options.trailEffect !== undefined ? options.trailEffect : true,
            highQuality: options.highQuality !== undefined ? options.highQuality : true,
            tradingPairs: options.tradingPairs || ['BTC/USDT', 'ETH/USDT', 'BNB/USDdf -h > /tmp/disk_space_check.txt && lsblk > /tmp/lsblk_check.txt && du -sh /media/chucky/onn.\ Disk/BHE.BitcoinHardendEtherumProject > /tmp/bhe_project_size.txtT', 'SOL/USDT', 'BHE/USDT'],
            tradingGroups: options.tradingGroups || ['market_making', 'arbitrage', 'swing_trading', 'grid_trading', 'bonkdabot'],
            markets: options.markets || []
        };

        // Sphere structure containers
        this.nodes = []; // Trading nodes (spheres)
        this.connections = []; // Connections between nodes
        this.tradeGroups = {}; // Groups of related trades
        this.marketData = {}; // Market data by trading pair
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.mouse = null;
        
        // Trading data
        this.tradingPairColors = {
            'BTC/USDT': 0xf7931a, // Bitcoin orange
            'ETH/USDT': 0x627eea, // Ethereum blue
            'BNB/USDT': 0xf3ba2f, // Binance yellow
            'SOL/USDT': 0x00ffbd, // Solana green
            'BHE/USDT': 0xff0000, // BHE red
            'default': 0xaaaaaa  // Default gray
        };
        
        this.tradingGroupPositions = {
            'market_making': new THREE.Vector3(1, 0, 0),
            'arbitrage': new THREE.Vector3(-1, 0, 0),
            'swing_trading': new THREE.Vector3(0, 1, 0),
            'grid_trading': new THREE.Vector3(0, -1, 0),
            'bonkdabot': new THREE.Vector3(0, 0, 1)
        };
        
        // Performance tracking
        this.stats = {
            fps: 0,
            nodes: 0,
            connections: 0,
            lastUpdate: Date.now()
        };
        
        // Initialize 3D scene
        this.init();
        
        // Log sphere creation for recovery
        console.log('TRADING SPHERE CREATED (RECOVERY LOG):', {
            config: this.config,
            container: containerId,
            timestamp: new Date().toISOString()
        });
    }
    
    // Initialize the 3D scene
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.backgroundColor);
        
        // Add fog for depth effect
        this.scene.fog = new THREE.FogExp2(this.config.backgroundColor, 0.001);
        
        // Create camera
        const { width, height } = this.container.getBoundingClientRect();
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
        this.camera.position.set(0, 0, 40);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer with high-quality settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: this.config.highQuality,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = this.config.highQuality;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // Set up high-performance GPU rendering hint
        if (this.config.highQuality) {
            this.renderer.powerPreference = "high-performance";
        }
        
        // Add orbit controls for interaction
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = this.config.autoRotate;
        this.controls.autoRotateSpeed = 0.5;
        
        // Setup raycaster for node interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Add event listeners
        this.setupEventListeners();
        
        // Create the main trading sphere structure
        this.createMainSphere();
        
        // Add lighting
        this.addLighting();
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    // Create the main sphere structure
    createMainSphere() {
        // Create main sphere as a SOLID GLOBE (no wireframe!)
        // Higher segment counts give a smooth ball appearance
        const sphereGeometry = new THREE.SphereGeometry(this.config.sphereRadius, 64, 64);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0x0b9fe7,          // Cyber‑blue tint
            metalness: 0.4,
            roughness: 0.6,
            emissive: 0x001144,
            emissiveIntensity: 0.35
        });
        this.mainSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.mainSphere.castShadow = false;
        this.mainSphere.receiveShadow = true;
        this.scene.add(this.mainSphere);
        
        // Add inner core to represent BHE token at center
        const coreGeometry = new THREE.SphereGeometry(this.config.sphereRadius * 0.1, 32, 32);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0x330000,
            metalness: 0.9,
            roughness: 0.2
        });
        this.sphereCore = new THREE.Mesh(coreGeometry, coreMaterial);
        this.scene.add(this.sphereCore);
        
        // Add grid lines on sphere surface if enabled
        if (this.config.showSphereGrid) {
            for (let i = 0; i < 3; i++) {
                const ringGeometry = new THREE.RingGeometry(this.config.sphereRadius - 0.05, this.config.sphereRadius, 64);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0x111111,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.2
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                
                // Rotate rings to be perpendicular to each axis
                if (i === 0) {
                    ring.rotation.x = Math.PI / 2;
                } else if (i === 1) {
                    ring.rotation.y = Math.PI / 2;
                }
                
                this.scene.add(ring);
            }
        }
        
        // Add trading group markers
        this.addTradingGroupMarkers();
    }
    
    // Add markers for different trading groups
    addTradingGroupMarkers() {
        for (const [group, position] of Object.entries(this.tradingGroupPositions)) {
            // Scale vector to sphere radius
            const scaledPosition = position.clone().normalize().multiplyScalar(this.config.sphereRadius);
            
            // Create marker for trading group
            const markerGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const markerMaterial = new THREE.MeshStandardMaterial({
                color: this.getGroupColor(group),
                emissive: this.getGroupColor(group),
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.8
            });
            
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(scaledPosition);
            this.scene.add(marker);
            
            // Add text label for group
            const textSprite = this.createTextSprite(group, { fontsize: 80 });
            textSprite.position.copy(scaledPosition.clone().multiplyScalar(1.1));
            this.scene.add(textSprite);
        }
    }
    
    // Re‑usable spherical positioning helper (markets hierarchy)
    // Converts layer & parent relationships into 3‑D coordinates on/around the sphere
    calculateSphericalPosition(market, allMarkets) {
        const L1_RADIUS = 5;
        const L2_RADIUS = 7;
        const DEX_RADIUS = 6;
        const SPIRAL_FACTOR = 2;

        if (market.layer === 'L1') {
            const l1Markets = allMarkets.filter(m => m.layer === 'L1');
            const l1Count = l1Markets.length || 1;
            const l1Index = l1Markets.findIndex(m => m.id === market.id);
            const t = (l1Index / l1Count) * Math.PI * SPIRAL_FACTOR;
            const phi = t * 10;
            const theta = Math.acos(1 - 2 * (l1Index / l1Count));
            const x = L1_RADIUS * Math.sin(theta) * Math.cos(phi);
            const y = L1_RADIUS * Math.cos(theta);
            const z = L1_RADIUS * Math.sin(theta) * Math.sin(phi);
            return [x, y, z];
        } else {
            const parent = allMarkets.find(m => m.id === market.parent);
            if (!parent) return [0, 0, 0];

            const [px, py, pz] = this.calculateSphericalPosition(parent, allMarkets);
            const parentPos = new THREE.Vector3(px, py, pz);

            const siblings = allMarkets.filter(m => m.layer === 'L2' && m.parent === market.parent);
            const siblingCount = siblings.length || 1;
            const siblingIndex = siblings.findIndex(m => m.id === market.id);

            const radius = market.consensus === 'AMM' ? DEX_RADIUS : L2_RADIUS;
            const t = (siblingIndex / siblingCount) * Math.PI * SPIRAL_FACTOR;
            const phi = t * 8;
            const theta = Math.PI / 2.5;

            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);

            const pos = new THREE.Vector3(x, y, z);
            const up = new THREE.Vector3(0, 1, 0);
            const parentDir = parentPos.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(up, parentDir);
            pos.applyQuaternion(quaternion);

            return [pos.x, pos.y, pos.z];
        }
    }
    
    // Add lighting to the scene
    addLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x444444, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light for shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);
        
        // Point lights for dramatic effect
        const colors = [0xff0000, 0x0000ff, 0x00ff00];
        for (let i = 0; i < 3; i++) {
            const pointLight = new THREE.PointLight(colors[i], 1, 50);
            const angle = (i / 3) * Math.PI * 2;
            pointLight.position.set(
                Math.cos(angle) * 20,
                Math.sin(angle) * 20,
                10
            );
            this.scene.add(pointLight);
        }
    }
    
    // Set up event listeners for interaction
    setupEventListeners() {
        this.container.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.container.addEventListener('click', (event) => this.onMouseClick(event));
    }
    
    // Handle mouse movement for raycasting
    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    // Handle mouse clicks for node selection
    onMouseClick(event) {
        // Update raycaster with current mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersected nodes
        const intersects = this.raycaster.intersectObjects(this.nodes);
        
        if (intersects.length > 0) {
            const node = intersects[0].object;
            if (node.userData.tradeData) {
                this.showTradeDetails(node.userData.tradeData);
            }
        }
    }
    
    // Handle window resize
    onWindowResize() {
        const { width, height } = this.container.getBoundingClientRect();
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    // Animation loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Rotate main sphere if auto-rotate is enabled
        if (this.config.autoRotate) {
            this.mainSphere.rotation.y += this.config.rotationSpeed;
        }
        
        // Pulse the core
        const time = Date.now() * 0.001; // Convert to seconds
        this.sphereCore.scale.set(
            1 + Math.sin(time * 2) * 0.1,
            1 + Math.sin(time * 2) * 0.1,
            1 + Math.sin(time * 2) * 0.1
        );
        
        // Update trade nodes
        this.updateTradeNodes();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
        
        // Update stats
        this.updateStats();
    }
    
    // Update trade nodes
    updateTradeNodes() {
        // Animate each node
        this.nodes.forEach(node => {
            if (node.userData.velocity) {
                // Apply velocity
                node.position.add(node.userData.velocity);
                
                // Dampen velocity
                node.userData.velocity.multiplyScalar(0.98);
                
                // Keep nodes inside the main sphere
                const distance = node.position.length();
                if (distance > this.config.sphereRadius) {
                    // Bounce off the sphere edge
                    node.position.normalize().multiplyScalar(this.config.sphereRadius);
                    node.userData.velocity.negate().multiplyScalar(0.8);
                }
            }
        });
        
        // Update connections between nodes
        this.updateConnections();
    }
    
    // Update connections between nodes
    updateConnections() {
        // Remove old connections from scene
        this.connections.forEach(connection => {
            this.scene.remove(connection);
        });
        this.connections = [];
        
        // Find nodes that should be connected (eg. same trading pair)
        const connectedPairs = {};
        
        this.nodes.forEach((node1, i) => {
            this.nodes.slice(i + 1).forEach(node2 => {
                // Connect nodes of the same trading pair
                if (node1.userData.tradeData && node2.userData.tradeData &&
                    node1.userData.tradeData.pair === node2.userData.tradeData.pair) {
                    
                    // Create connection line
                    const material = new THREE.LineBasicMaterial({
                        color: this.getPairColor(node1.userData.tradeData.pair),
                        transparent: true,
                        opacity: 0.3
                    });
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        node1.position,
                        node2.position
                    ]);
                    
                    const line = new THREE.Line(geometry, material);
                    this.scene.add(line);
                    this.connections.push(line);
                }
            });
        });
    }
    
    // Add a new trade node
    addTradeNode(tradeData) {
        // Validate trade data
        if (!tradeData || !tradeData.pair) {
            console.error('Invalid trade data:', tradeData);
            return null;
        }
        
        // Log trade data for recovery
        console.log('TRADE NODE ADDED (RECOVERY LOG):', tradeData);
        
        // Determine node size based on trade amount
        let nodeSize = 0.2;
        if (tradeData.amount) {
            // Scale node size based on amount, with a minimum and maximum size
            nodeSize = Math.max(0.1, Math.min(1.0, tradeData.amount / 10));
        }
        
        // Determine node color based on trading pair
        const nodeColor = this.getPairColor(tradeData.pair);
        
        // Create node geometry and material
        const geometry = new THREE.SphereGeometry(nodeSize, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: nodeColor,
            emissive: nodeColor,
            emissiveIntensity: 0.2,
            metalness: 0.8,
            roughness: 0.2
        });
        
        // Create the node mesh
        const node = new THREE.Mesh(geometry, material);
        
        // Determine node position based on trading group
        let position;
        // Prefer hierarchical market positioning if market metadata supplied
        if (tradeData.market && tradeData.market.layer) {
            // Make sure registry knows this market once
            if (!this.config.markets.find(m => m.id === tradeData.market.id)) {
                this.config.markets.push(tradeData.market);
            }
            const [mx, my, mz] = this.calculateSphericalPosition(tradeData.market, this.config.markets);
            position = new THREE.Vector3(mx, my, mz);
        } else if (tradeData.group && this.tradingGroupPositions[tradeData.group]) {
            position = this.tradingGroupPositions[tradeData.group].clone();
        } else {
            // Random fallback position
            position = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            );
        }
        
        // Normalize and scale position to sphere radius
        position.normalize().multiplyScalar(this.config.sphereRadius * Math.random() * 0.8);
        node.position.copy(position);
        
        // Add random velocity
        node.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
        );
        
        // Store trade data
        node.userData.tradeData = tradeData;
        
        // Add node to scene
        this.scene.add(node);
        this.nodes.push(node);
        
        // Limit number of nodes
        if (this.nodes.length > this.config.maxNodes) {
            const oldestNode = this.nodes.shift();
            this.scene.remove(oldestNode);
        }
        
        return node;
    }
    
    // Show trade details for a selected node
    showTradeDetails(tradeData) {
        // Display information about the trade
        // In a real implementation, this would show a modal or update a UI element
        console.log('Trade Details:', tradeData);
        
        // Create an event for other components to listen to
        const event = new CustomEvent('tradeNodeSelected', {
            detail: tradeData
        });
        this.container.dispatchEvent(event);
    }
    
    // Add multiple trade nodes at once
    addTradeNodes(tradesArray) {
        if (!Array.isArray(tradesArray)) {
            console.error('Expected array of trades:', tradesArray);
            return;
        }
        
        tradesArray.forEach(trade => this.addTradeNode(trade));
    }
    
    // Create a text sprite
    createTextSprite(text, parameters = {}) {
        const fontface = parameters.fontface || 'Arial';
        const fontsize = parameters.fontsize || 70;
        const borderThickness = parameters.borderThickness || 4;
        const borderColor = parameters.borderColor || { r: 0, g: 0, b: 0, a: 1 };
        const backgroundColor = parameters.backgroundColor || { r: 0, g: 0, b: 0, a: 0.8 };
        const textColor = parameters.textColor || { r: 255, g: 255, b: 255, a: 1 };
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `${fontsize}px ${fontface}`;
        
        // Canvas dimensions
        const textWidth = context.measureText(text).width;
        canvas.width = textWidth + borderThickness * 2;
        canvas.height = fontsize * 1.4;
        
        // Canvas background
        context.fillStyle = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`;
        context.strokeStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`;
        context.lineWidth = borderThickness;
        roundRect(context, borderThickness / 2, borderThickness / 2, canvas.width - borderThickness, canvas.height - borderThickness, 6);
        
        // Text
        context.fillStyle = `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, ${textColor.a})`;
        context.font = `${fontsize}px ${fontface}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        // Create sprite material
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.5 * canvas.width / canvas.height, 0.5, 1);
        
        return sprite;
        
        // Helper function for rounded rectangle
        function roundRect(ctx, x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
    
    // Update performance stats
    updateStats() {
        const now = Date.now();
        const deltaTime = now - this.stats.lastUpdate;
        
        if (deltaTime > 1000) { // Update every second
            this.stats.fps = Math.round(1000 / (deltaTime / 60));
            this.stats.nodes = this.nodes.length;
            this.stats.connections = this.connections.length;
            this.stats.lastUpdate = now;
            
            // Log stats
            console.log('TRADING SPHERE STATS:', this.stats);
            
            // Dispatch stats event
            const event = new CustomEvent('tradingSphereStats', {
                detail: this.stats
            });
            this.container.dispatchEvent(event);
        }
    }
    
    // Get color for trading pair
    g