// Obsidion Sphere: interactive 3D blockchain timeline
// This creates a 3D interactive visualization of blockchain timeline data

class ObsidionTimelineSphere {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        console.log('Canvas found:', this.canvas);
        console.log('Canvas dimensions:', this.canvas.width, this.canvas.height);
        
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.timelinePoints = [];
        this.marketNodes = [];
        this.selectedMarket = null;
        this.rotationSpeed = 0.0005;
        this.autoRotate = true;
        this.zoom = 12;
        
        // Initialize state
        this.blockchainData = this.generateBlockchainData();
        this.strategyData = this.generateStrategyData();
        
        // Initialize Three.js scene
        this.initThree();
        
        // Build timeline and markets
        this.buildBlockchainTimeline();
        this.createMarkets();
        
        // Start periodic market refresh
        this.startMarketRefresh();
        
        // Start animation
        this.animate();
        
        // Add event handlers for interaction
        this.addInteractionHandlers();
        
        // Update stats display
        setInterval(() => this.updateStats(), 1000);
    }
    
    initThree() {
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a20);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            60, 
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = this.zoom;
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        
        // Setup OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.5;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 20;
        
        // Add lights
        const sceneLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(sceneLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Create a test cube to verify rendering
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, 0, 0);
        this.scene.add(cube);
        
        // Create a partial sphere with glowing effect
        const sphereGeometry = new THREE.SphereGeometry(5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        
        // Create glowing material with reduced intensity
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0x3da9ff,
            wireframe: true,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
            emissive: new THREE.Color(0x3da9ff),
            emissiveIntensity: 0.2
        });
        
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        
        // Position the sphere slightly up and add rotation
        this.sphere.position.y = 2;
        this.sphere.rotation.y = Math.PI / 4;
        
        // Add glow effect using a shader with reduced intensity
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                varying vec3 vNormal;
                void main() {
                    float glow = 0.2 + 0.1 * sin(uTime * 2.0);
                    vec3 color = vec3(0.24, 0.67, 1.0);
                    gl_FragColor = vec4(color * glow, 0.5);
                }
            `
        });
        
        const glowMesh = new THREE.Mesh(sphereGeometry, glowMaterial);
        glowMesh.scale.set(1.1, 1.1, 1.1);
        
        // Create a group to hold both meshes
        const sphereGroup = new THREE.Group();
        sphereGroup.add(this.sphere);
        sphereGroup.add(glowMesh);
        
        this.scene.add(sphereGroup);
        
        // Add animation update
        this.updateGlow = () => {
            if (glowMaterial) {
                glowMaterial.uniforms.uTime.value += 0.01;
            }
        }
        
        // Add some points on the sphere
        this.addTestPoints();
        this.renderer.setClearColor(0x000000, 0);
        
        // Create containers
        this.timelineContainer = new THREE.Group();
        this.marketsContainer = new THREE.Group();
        this.connectionsContainer = new THREE.Group();
        
        this.scene.add(this.timelineContainer);
        this.scene.add(this.marketsContainer);
        this.scene.add(this.connectionsContainer);
        
        // Setup raycaster for interactions
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.07;
        this.controls.zoomSpeed = 0.5;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        });
    }
    
    generateBlockchainData() {
        // Generate sample blockchain timeline data
        const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'BNB Chain', 'Polygon', 'Avalanche', 'Solana'];
        const data = [];
        
        // Generate mock blockchain data
        let timestamp = Date.now() - (86400000 * 30); // Start 30 days ago
        const blockInterval = 12000; // 12 seconds per block average
        const txTypes = ['swap', 'transfer', 'bridge', 'stake', 'lend', 'borrow', 'liquidate', 'mint', 'burn'];
        
        for (let i = 0; i < 5000; i++) {
            const chain = chains[Math.floor(Math.random() * chains.length)];
            const txType = txTypes[Math.floor(Math.random() * txTypes.length)];
            const value = Math.random() * 10 + 0.1; // 0.1 to 10.1 ETH
            const blockNum = 17000000 + i;
            
            // Add small time variance
            timestamp += blockInterval + (Math.random() * 5000 - 2500);
            
            data.push({
                chain,
                timestamp,
                blockNum,
                txType,
                value,
                hash: '0x' + Math.random().toString(16).substring(2, 42),
                success: Math.random() > 0.05 // 5% fail rate
            });
        }
        
        return data;
    }
    
    generateStrategyData() {
        // Generate sample strategy types and their performance
        return [
            { name: 'Arbitrage', success: 0.89, color: 0x66bbff, type: 'market' },
            { name: 'Volatility', success: 0.75, color: 0xffaa33, type: 'market' },
            { name: 'Grid Trading', success: 0.92, color: 0x66ff99, type: 'market' },
            { name: 'Flash Loan', success: 0.67, color: 0xff6688, type: 'market' },
            { name: 'MEV', success: 0.78, color: 0xffdd44, type: 'market' },
            { name: 'Trend Following', success: 0.81, color: 0x33ddff, type: 'market' },
            { name: 'Lending', success: 0.94, color: 0x99ff66, type: 'market' },
            { name: 'Options', success: 0.71, color: 0xff99cc, type: 'market' }
        ];
    }
    
    async createMarkets() {
        // Clear existing markets
        while (this.marketsContainer.children.length > 0) {
            this.marketsContainer.remove(this.marketsContainer.children[0]);
        }
        this.marketNodes = [];
        
        // Fetch live market data (replace with your real API endpoint)
        let marketData = [];
        try {
            const response = await fetch('/api/markets'); // Replace with actual endpoint
            if (response.ok) {
                marketData = await response.json();
            } else {
                throw new Error('Failed to fetch markets');
            }
        } catch (err) {
            // Fallback: use local method if fetch fails
            marketData = this.generateMarketData();
            const debugInfo = document.getElementById('debug-info');
            if (debugInfo) debugInfo.textContent = 'Warning: Using fallback market data.';
        }
        
        // Use a subset of unique positions for markets
        const selectedPositions = this.getUniquePositions(this.marketPositions, marketData.length);
        
        marketData.forEach((data, index) => {
            // Place market at intersection point
            const position = selectedPositions[index];
            
            // Create market node - larger and more visible
            const geometry = new THREE.SphereGeometry(0.3, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: data.color,
                emissive: data.color,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 1.0
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);
            this.marketsContainer.add(mesh);
            
            // Create market node data
            const market = {
                mesh,
                position,
                data,
                connections: []
            };
            
            this.marketNodes.push(market);
            
            // Create label for market name - more visible
            this.createTextLabel(
                data.name,
                new THREE.Vector3(
                    position.x * 1.2,
                    position.y * 1.2,
                    position.z * 1.2
                ),
                0.4,
                data.color,
                this.marketsContainer
            );
        });
        
        // Create connections for each market - more visible
        this.marketNodes.forEach(market => {
            this.createMarketConnections(market);
        });
    }
    
    // Helper function to get a subset of unique positions
    getUniquePositions(positions, count) {
        // Ensure we don't try to get more positions than are available
        count = Math.min(count, positions.length);
        
        // Get evenly distributed positions
        const step = Math.floor(positions.length / count);
        const result = [];
        
        for (let i = 0; i < count; i++) {
            result.push(positions[i * step]);
        }
        
        return result;
    }
    
    createMarketConnections(market) {
        // Create meaningful connections between market and relevant timeline points
        const connections = [];
        const relevantTypes = this.getRelevantTxTypes(market.data.name);
        
        // Filter points that are specifically relevant to this market type
        // This ensures connections show ACTUAL data relationships, not random ones
        const relevantPoints = this.timelinePoints.filter(point => 
            relevantTypes.includes(point.data.txType)
        );
        
        if (relevantPoints.length === 0) return;
        
        // Sort by timestamp to create chronological connections
        const sortedPoints = [...relevantPoints].sort((a, b) => a.data.timestamp - b.data.timestamp);
        
        // Select points at regular intervals to show timeline progression
        const numConnections = Math.min(sortedPoints.length, 30);
        const interval = Math.max(1, Math.floor(sortedPoints.length / numConnections));
        
        // Create connections that show timeline progression - more visible
        for (let i = 0; i < sortedPoints.length; i += interval) {
            const point = sortedPoints[i];
            if (!point) continue;
            
            // Make lines more visible
            const opacity = 0.3;
            
            // Create thicker lines for higher value transactions
            const valueFactor = Math.min(1, point.data.value / 5);
            const lineWidth = 1 + valueFactor * 2;
            
            const geometry = new THREE.BufferGeometry().setFromPoints([
                market.position,
                point.position
            ]);
            
            const material = new THREE.LineBasicMaterial({
                color: market.data.color,
                transparent: true,
                opacity: opacity,
                linewidth: lineWidth
            });
            
            const line = new THREE.Line(geometry, material);
            this.connectionsContainer.add(line);
            
            // Store connection data for interaction
            connections.push({
                line,
                timelinePoint: point,
                timestamp: point.data.timestamp,
                value: point.data.value,
                active: true
            });
        }
        
        // Add special connections for high-value transactions - more visible
        const highValueThreshold = 5; // ETH
        const highValuePoints = relevantPoints.filter(p => p.data.value >= highValueThreshold);
        
        highValuePoints.forEach(point => {
            // Create highlighted connection for high-value transactions
            const geometry = new THREE.BufferGeometry().setFromPoints([
                market.position,
                point.position
            ]);
            
            const material = new THREE.LineBasicMaterial({
                color: 0xffffff,  // White core
                transparent: true,
                opacity: 0.4
            });
            
            const line = new THREE.Line(geometry, material);
            this.connectionsContainer.add(line);
            
            // Create glow effect for high-value transactions
            const glowMaterial = new THREE.LineBasicMaterial({
                color: market.data.color,
                transparent: true,
                opacity: 0.3,
                linewidth: 3
            });
            
            const glowLine = new THREE.Line(geometry, glowMaterial);
            this.connectionsContainer.add(glowLine);
            
            // Add pulse animation to high-value connections
            glowLine.userData.pulse = {
                scale: 1.0,
                direction: 1,
                speed: 0.01,
                min: 0.8,
                max: 1.5
            };
            
            // Store reference for animation
            this.pulsingLines = this.pulsingLines || [];
            this.pulsingLines.push(glowLine);
            
            // Store connection
            connections.push({
                line,
                glowLine,
                timelinePoint: point,
                timestamp: point.data.timestamp,
                value: point.data.value,
                highValue: true,
                active: true
            });
        });
        
        market.connections = connections;
    }
    
    getRelevantTxTypes(marketType) {
        // Return transaction types relevant to the market
        switch(marketType) {
            case 'Arbitrage':
                return ['swap', 'bridge'];
            case 'Volatility':
                return ['swap', 'liquidate'];
            case 'Grid Trading':
                return ['swap', 'transfer'];
            case 'Flash Loan':
                return ['borrow', 'swap', 'repay'];
            case 'MEV':
                return ['swap', 'mint', 'burn'];
            case 'Trend Following':
                return ['swap', 'transfer'];
            case 'Lending':
                return ['lend', 'borrow', 'liquidate'];
            case 'Options':
                return ['mint', 'burn', 'exercise'];
            default:
                return ['swap', 'transfer'];
        }
    }
    
    addInteractionHandlers() {
        // Mouse move handler for hover effects
        this.canvas.addEventListener('mousemove', (event) => {
            // Calculate mouse position in normalized device coordinates
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / this.canvas.clientWidth) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / this.canvas.clientHeight) * 2 + 1;
        });
        
        // Click handler for market selection
        this.canvas.addEventListener('click', (event) => {
            // Check for intersections with market nodes
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const marketIntersects = this.raycaster.intersectObjects(
                this.marketNodes.map(m => m.mesh)
            );
            
            if (marketIntersects.length > 0) {
                // Find which market was clicked
                const marketNode = marketIntersects[0].object;
                const market = this.marketNodes.find(m => m.mesh === marketNode);
                
                if (market) {
                    this.selectMarket(market);
                }
            }
        });
        
        // Add key handler to toggle auto-rotation
        window.addEventListener('keydown', (event) => {
            if (event.key === 'r' || event.key === 'R') {
                this.autoRotate = !this.autoRotate;
            }
        });
    }
    
    selectMarket(market) {
        // Deselect previous market
        if (this.selectedMarket) {
            this.selectedMarket.mesh.scale.set(1, 1, 1);
            
            // Reset connections
            this.selectedMarket.connections.forEach(conn => {
                conn.line.material.opacity = 0.05;
                if (conn.glowLine) {
                    conn.glowLine.material.opacity = 0.05;
                }
            });
        }
        
        // If clicking on already selected market, deselect it
        if (this.selectedMarket === market) {
            this.selectedMarket = null;
            this.updateMarketInfoPanel(null);
            return;
        }
        
        // Select new market
        this.selectedMarket = market;
        market.mesh.scale.set(1.3, 1.3, 1.3);
        
        // Highlight connections, still keeping them relatively transparent
        market.connections.forEach(conn => {
            conn.line.material.opacity = 0.1; // Slightly more visible when selected
            if (conn.glowLine) {
                conn.glowLine.material.opacity = 0.1;
            }
        });
        
        // Update info panel
        this.updateMarketInfoPanel(market);
    }
    
    updateMarketInfoPanel(market) {
        const panel = document.getElementById('market-info');
        if (!panel) return;
        const details = panel.querySelector('.market-details');
        if (!details) return;
        if (!market) {
            panel.querySelector('h3').textContent = 'Select a market node to view details';
            details.innerHTML = '';
            return;
        }
        // Show live market info (customize fields as needed)
        panel.querySelector('h3').textContent = market.data.name + ' Market';
        details.innerHTML = `
            <div><strong>Symbol:</strong> ${market.data.symbol || 'N/A'}</div>
            <div><strong>Chain:</strong> ${market.data.chain || 'N/A'}</div>
            <div><strong>Price:</strong> ${market.data.price !== undefined ? market.data.price : 'N/A'}</div>
            <div><strong>Volume (24h):</strong> ${market.data.volume_24h !== undefined ? market.data.volume_24h : 'N/A'}</div>
            <div><strong>Status:</strong> ${market.data.status || 'Active'}</div>
        `;
    }
    
    updateStats() {
        // Update displayed stats
        const rpmEl = document.querySelector('.sphere-stats .value:nth-child(1)');
        if (rpmEl) {
            rpmEl.textContent = `${Math.round(this.rotationSpeed * 10000)} RPM`;
        }
        
        const dataPointsEl = document.querySelector('.sphere-stats .value:nth-child(2)');
        if (dataPointsEl) {
            dataPointsEl.textContent = this.timelinePoints.length;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.autoRotate) {
            this.sphere.rotation.y += this.rotationSpeed;
        }
        
        // Update glow animation
        if (this.updateGlow) {
            this.updateGlow();
                    line.material.opacity = 0.2 + (pulse.scale - pulse.min) / (pulse.max - pulse.min) * 0.5;
                }
            });
        }
        
        // Update raycaster for hover effects
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const marketIntersects = this.raycaster.intersectObjects(
            this.marketNodes.map(m => m.mesh)
        );
        
        // Reset all market scales
        this.marketNodes.forEach(market => {
            if (market !== this.selectedMarket) {
                market.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        });
        
        // Highlight hovered market
        if (marketIntersects.length > 0) {
            const marketNode = marketIntersects[0].object;
            const market = this.marketNodes.find(m => m.mesh === marketNode);
            
            if (market && market !== this.selectedMarket) {
                market.mesh.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
            }
            
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    createTextLabel(text, position, size, color, parent) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        // Style text
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'Bold 32px Arial'; // Larger font
        context.textAlign = 'center';
        context.fillStyle = `#${new THREE.Color(color).getHexString()}`;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture and sprite
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0 // Fully visible
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(size * 10, size * 5, 1);
        
        parent.add(sprite);
        return sprite;
    }
    
    startMarketRefresh() {
        setInterval(() => {
            this.createMarkets();
        }, 60000);
    }
    
    buildBlockchainTimeline() {
        // Create a proper sphere structure for the timeline
        const radius = 5;
        
        // Create an actual geodesic sphere with higher detail
        const icosahedronGeometry = new THREE.IcosahedronGeometry(radius, 2);
        
        // Get the vertices for timeline points and market intersection positions
        const vertices = icosahedronGeometry.getAttribute('position').array;
        const indices = icosahedronGeometry.getIndex().array;
        
        // Extract all unique vertices
        const uniquePositions = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            uniquePositions.push(new THREE.Vector3(x, y, z));
        }
        
        // Find intersection points (for placing markets)
        const intersectionPoints = [];
        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i];
            const b = indices[i + 1];
            const c = indices[i + 2];
            
            // Calculate center of each face (intersection point)
            const vA = new THREE.Vector3(vertices[a * 3], vertices[a * 3 + 1], vertices[a * 3 + 2]);
            const vB = new THREE.Vector3(vertices[b * 3], vertices[b * 3 + 1], vertices[b * 3 + 2]);
            const vC = new THREE.Vector3(vertices[c * 3], vertices[c * 3 + 1], vertices[c * 3 + 2]);
            
            const center = new THREE.Vector3()
                .add(vA)
                .add(vB)
                .add(vC)
                .divideScalar(3);
            
            // Normalize to keep on sphere surface
            center.normalize().multiplyScalar(radius);
            
            intersectionPoints.push(center);
        }
        
        // Use the intersection points as market placement positions
        this.marketPositions = intersectionPoints;
        
        // Create timeline data points along the sphere vertices
        const timelinePoints = [];
        const timelineColors = [];
        const chainColors = {
            'Ethereum': new THREE.Color(0x6d5acd),
            'Arbitrum': new THREE.Color(0x28a0f0),
            'Optimism': new THREE.Color(0xff0420),
            'Base': new THREE.Color(0x0052ff),
            'BNB Chain': new THREE.Color(0xf0b90b),
            'Polygon': new THREE.Color(0x8247e5),
            'Avalanche': new THREE.Color(0xe84142),
            'Solana': new THREE.Color(0x00ff9d)
        };
        
        // Sort data by timestamp
        const sortedData = [...this.blockchainData].sort((a, b) => a.timestamp - b.timestamp);
        
        // Map blockchain data to sphere vertices
        sortedData.forEach((tx, index) => {
            // Get position on sphere - distribute evenly across all available vertices
            const positionIndex = Math.floor((index / sortedData.length) * uniquePositions.length);
            const position = uniquePositions[positionIndex % uniquePositions.length];
            
            // Add slight randomness to avoid exact overlap
            const jitter = 0.05;
            const x = position.x + (Math.random() - 0.5) * jitter;
            const y = position.y + (Math.random() - 0.5) * jitter;
            const z = position.z + (Math.random() - 0.5) * jitter;
            
            // Add point
            timelinePoints.push(x, y, z);
            
            // Add color
            const color = chainColors[tx.chain] || new THREE.Color(0xffffff);
            if (!tx.success) {
                // Failed transactions appear more red
                color.offsetHSL(0, 0, -0.3);
            }
            timelineColors.push(color.r, color.g, color.b);
            
            // Store reference to this data point
            this.timelinePoints.push({
                position: new THREE.Vector3(x, y, z),
                data: tx,
                index
            });
        });
        
        // Create the timeline geometry
        const timelineGeometry = new THREE.BufferGeometry();
        timelineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(timelinePoints, 3));
        timelineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(timelineColors, 3));
        
        // Create timeline material with larger points
        const timelineMaterial = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.9
        });
        
        // Create timeline mesh
        this.timeline = new THREE.Points(timelineGeometry, timelineMaterial);
        this.timelineContainer.add(this.timeline);
        
        // Create more visible wireframe sphere
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x6d5acd,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        
        const sphereMesh = new THREE.Mesh(icosahedronGeometry, wireframeMaterial);
        this.timelineContainer.add(sphereMesh);
        
        // Add thicker edges for better visibility
        const edgesGeometry = new THREE.EdgesGeometry(icosahedronGeometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2
        });
        
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        this.timelineContainer.add(edges);
    }
}

// Initialize once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create sphere instance
    const sphere = new ObsidionTimelineSphere('obsidion-sphere');
});
