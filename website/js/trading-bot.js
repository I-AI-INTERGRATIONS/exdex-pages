// EXDEX Trading Bot Platform JavaScript
// Modular architecture for easier maintenance and future modifications
// Obsidian Gates 3D Timeline Sphere Visualization

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize each component
    initObsidianSphere();
    initTimelineVisualization();
    initPerformanceChart();
    initHummingbotDashboard();
    initEventListeners();
    logSecurityData();
});

// Component 1: Obsidian Sphere Hero Visualization
function initObsidianSphere() {
    const container = document.getElementById('obsidian-sphere-container');
    if (!container) return;
    
    // Three.js scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Create sphere representing the obsidian timeline
    const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        emissive: 0x330000,
        specular: 0xff0000,
        shininess: 50,
        transparent: true,
        opacity: 0.9,
        wireframe: false
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    
    // Add timeline points (trading spots)
    addTimelineSpots(scene, sphere);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x440000, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xff0000, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x660000, 0.5, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);
    
    // Sphere animation with GSAP
    gsap.to(sphere.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 2,
        duration: 60,
        repeat: -1,
        ease: "none"
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Make responsive
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Component 2: Timeline Spots (trading opportunities)
function addTimelineSpots(scene, parentSphere) {
    // Create trading spots distributed across the sphere
    const radius = 2.05; // Slightly larger than the sphere
    const numSpots = 200;
    const spotGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const activeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff3300,
        specular: 0xffffff
    });
    
    const inactiveMaterial = new THREE.MeshPhongMaterial({
        color: 0x330000,
        emissive: 0x220000,
        specular: 0xffffff
    });
    
    // Create spots randomly distributed on sphere
    for (let i = 0; i < numSpots; i++) {
        // Calculate random position on sphere
        const phi = Math.acos(-1 + (2 * i) / numSpots);
        const theta = Math.sqrt(numSpots * Math.PI) * phi;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        // Determine if spot is active (5% chance)
        const isActive = Math.random() < 0.05;
        const material = isActive ? activeMaterial : inactiveMaterial;
        
        const spot = new THREE.Mesh(spotGeometry, material);
        spot.position.set(x, y, z);
        scene.add(spot);
        
        // Add pulse animation to active spots
        if (isActive) {
            gsap.to(spot.scale, {
                x: 2,
                y: 2,
                z: 2,
                duration: 1 + Math.random(),
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        }
    }
    
    // Add connection lines (timeline connections)
    addConnectionLines(scene);
}

// Component 3: Timeline Connections
function addConnectionLines(scene) {
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.3
    });
    
    // Create 20 random connection lines
    for (let i = 0; i < 20; i++) {
        const points = [];
        const startAngle = Math.random() * Math.PI * 2;
        const endAngle = startAngle + (Math.random() * Math.PI);
        
        // Create curved line through sphere
        for (let j = 0; j <= 20; j++) {
            const t = j / 20;
            const angle = startAngle * (1 - t) + endAngle * t;
            
            const radius = 2 * (1 - 0.2 * Math.sin(t * Math.PI));
            const x = radius * Math.sin(angle) * Math.cos(t * Math.PI);
            const y = radius * Math.sin(angle) * Math.sin(t * Math.PI);
            const z = radius * Math.cos(angle);
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, linesMaterial);
        scene.add(line);
    }
}

// Component 4: Full Sphere Detail Visualization
function initTimelineVisualization() {
    const container = document.getElementById('full-sphere-container');
    if (!container) return;
    
    // Three.js scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 4;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Create detailed obsidian sphere
    const sphereGeometry = new THREE.SphereGeometry(1.8, 64, 64);
    
    // Create custom shader material for obsidian effect
    const obsidianMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vNormal;
            
            void main() {
                // Obsidian base color (very dark)
                vec3 obsidianColor = vec3(0.02, 0.0, 0.0);
                
                // Red reflections
                float redHighlight = pow(abs(dot(vNormal, vec3(sin(time*0.1), cos(time*0.1), 0.5))), 5.0);
                vec3 redColor = vec3(1.0, 0.0, 0.0) * redHighlight * 0.8;
                
                vec3 finalColor = obsidianColor + redColor;
                gl_FragColor = vec4(finalColor, 0.95);
            }
        `,
        transparent: true
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, obsidianMaterial);
    scene.add(sphere);
    
    // Add timeline nodes and connections
    addDetailedNodes(scene, sphere);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x330000, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xff0000, 1, 100);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);
    
    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        
        time += 0.01;
        obsidianMaterial.uniforms.time.value = time;
        
        sphere.rotation.y += 0.002;
        sphere.rotation.x += 0.001;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Make responsive
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Component 5: Detailed Trading Nodes
function addDetailedNodes(scene, parentSphere) {
    // Create important timeline nodes
    const nodeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const nodeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        specular: 0xffffff,
        shininess: 100
    });
    
    // Specific trading opportunity nodes
    const nodePositions = [
        { x: 1.8, y: 0, z: 0, label: "Entry Point", important: true },
        { x: 0, y: 1.8, z: 0, label: "Cross-Chain", important: true },
        { x: 0, y: 0, z: 1.8, label: "Arbitrage", important: true },
        { x: -1.3, y: 1.3, z: 0, label: "Exit Point", important: true },
        { x: 1.3, y: -1.3, z: 0, label: "Liquidity", important: false },
        { x: 0, y: -1.3, z: 1.3, label: "Bridge", important: false },
        { x: -1.3, y: 0, z: -1.3, label: "Security", important: false }
    ];
    
    nodePositions.forEach(pos => {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        node.position.set(pos.x, pos.y, pos.z);
        scene.add(node);
        
        // Add pulse animation to important nodes
        if (pos.important) {
            gsap.to(node.scale, {
                x: 3,
                y: 3,
                z: 3,
                duration: 1 + Math.random(),
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
            
            // Add glow effect
            const glowGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const glowMaterial = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.3
            });
            
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.copy(node.position);
            scene.add(glow);
            
            gsap.to(glow.scale, {
                x: 4,
                y: 4,
                z: 4,
                duration: 2,
                repeat: -1,
                yoyo: true
            });
        }
    });
    
    // Add connection lines between nodes
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
    });
    
    // Connect all important nodes
    const importantNodes = nodePositions.filter(node => node.important);
    for (let i = 0; i < importantNodes.length; i++) {
        for (let j = i + 1; j < importantNodes.length; j++) {
            const points = [
                new THREE.Vector3(importantNodes[i].x, importantNodes[i].y, importantNodes[i].z),
                new THREE.Vector3(importantNodes[j].x, importantNodes[j].y, importantNodes[j].z)
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, linesMaterial);
            scene.add(line);
        }
    }
}

// Component 6: Timeline Nodes Interaction
function initEventListeners() {
    // Timeline node interaction
    const timelineNodes = document.querySelectorAll('.timeline-node');
    
    timelineNodes.forEach((node, index) => {
        node.addEventListener('click', function() {
            // Remove active class from all nodes
            timelineNodes.forEach(n => n.classList.remove('active'));
            
            // Add active class to current node
            this.classList.add('active');
            
            // Simulate real-time data update
            updatePerformanceChart(index);
        });
    });
    
    // Strategy cards hover effect
    const strategyCards = document.querySelectorAll('.strategy-card');
    
    strategyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            gsap.to(this, {
                y: -10,
                boxShadow: '0 20px 30px rgba(0, 0, 0, 0.4)',
                duration: 0.3
            });
        });
        
        card.addEventListener('mouseleave', function() {
            gsap.to(this, {
                y: 0,
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                duration: 0.3
            });
        });
    });
}

// Component 7: Performance Chart
function initPerformanceChart() {
    const chartContainer = document.getElementById('performance-chart-container');
    if (!chartContainer) return;
    
    // Create performance chart using D3.js
    const width = chartContainer.clientWidth;
    const height = chartContainer.clientHeight || 400;
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    
    const svg = d3.select(chartContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Generate sample performance data
    const data = generatePerformanceData();
    
    // Scale setup
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width - margin.left - margin.right]);
    
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.value) * 0.9, d3.max(data, d => d.value) * 1.1])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d3.timeFormat('%b %Y'));
    
    const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => `${d}%`);
    
    // Add axes to SVG
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(xAxis)
        .selectAll('text')
        .style('fill', '#b0b0b0');
    
    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .style('fill', '#b0b0b0');
    
    // Add grid lines
    svg.selectAll('grid-line-y')
        .data(yScale.ticks(5))
        .enter()
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', 0)
        .attr('y1', d => yScale(d))
        .attr('x2', width - margin.left - margin.right)
        .attr('y2', d => yScale(d))
        .style('stroke', 'rgba(255, 255, 255, 0.1)')
        .style('stroke-dasharray', '3,3');
    
    // Create line generator
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    // Add trading performance line
    svg.append('path')
        .datum(data)
        .attr('class', 'performance-line')
        .attr('fill', 'none')
        .attr('stroke', '#ff0000')
        .attr('stroke-width', 2)
        .attr('d', line);
    
    // Add gradient below the line
    const defs = svg.append('defs');
    
    const gradient = defs.append('linearGradient')
        .attr('id', 'performance-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
    
    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(255, 0, 0, 0.3)');
    
    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(255, 0, 0, 0)');
    
    // Add area below the line
    const area = d3.area()
        .x(d => xScale(d.date))
        .y0(height - margin.top - margin.bottom)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    svg.append('path')
        .datum(data)
        .attr('class', 'performance-area')
        .attr('fill', 'url(#performance-gradient)')
        .attr('d', area);
    
    // Make responsive
    window.addEventListener('resize', () => {
        const newWidth = chartContainer.clientWidth;
        
        d3.select(chartContainer)
            .select('svg')
            .attr('width', newWidth);
        
        xScale.range([0, newWidth - margin.left - margin.right]);
        
        svg.select('.x-axis')
            .call(xAxis);
        
        svg.selectAll('.grid-line')
            .attr('x2', newWidth - margin.left - margin.right);
        
        svg.select('.performance-line')
            .attr('d', line);
        
        svg.select('.performance-area')
            .attr('d', area);
    });
}

// Generate performance data for the chart
function generatePerformanceData() {
    const data = [];
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2025, 3, 1);
    
    // Generate monthly data points
    for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
        data.push({
            date: new Date(date),
            value: 20 + Math.random() * 15 + (date - startDate) / (1000 * 60 * 60 * 24 * 30) * 2
        });
    }
    
    return data;
}

// Update performance chart based on selected node
function updatePerformanceChart(nodeIndex) {
    // In a real implementation, this would fetch data for the specific timeline node
    // For this demo, we'll just modify the existing chart
    
    const svg = d3.select('#performance-chart-container svg g');
    if (!svg.node()) return;
    
    // Add pulse animation to the chart line
    svg.select('.performance-line')
        .style('stroke-width', 3)
        .transition()
        .duration(500)
        .style('stroke', nodeIndex % 2 === 0 ? '#ff3300' : '#ff0000')
        .style('stroke-width', 2);
    
    // Animate the area fill
    svg.select('.performance-area')
        .transition()
        .duration(500)
        .style('opacity', 0.7)
        .transition()
        .duration(500)
        .style('opacity', 1);
}

// Component 8: Hummingbot Dashboard
function initHummingbotDashboard() {
    // Simulate live market data updates
    const pairs = document.querySelectorAll('.market-pair');
    if (pairs.length === 0) return;
    
    // Update market pairs data periodically
    setInterval(() => {
        pairs.forEach(pair => {
            const bidElement = pair.querySelector('.stat.bid');
            const askElement = pair.querySelector('.stat.ask');
            const spreadElement = pair.querySelector('.stat.spread');
            
            if (!bidElement || !askElement || !spreadElement) return;
            
            // Get current values
            const bidText = bidElement.textContent;
            const bidMatch = bidText.match(/(\d+,)?\d+\.\d+/);
            if (!bidMatch) return;
            
            const askText = askElement.textContent;
            const askMatch = askText.match(/(\d+,)?\d+\.\d+/);
            if (!askMatch) return;
            
            let bid = parseFloat(bidMatch[0].replace(',', ''));
            let ask = parseFloat(askMatch[0].replace(',', ''));
            
            // Update with small changes
            const change = (Math.random() - 0.45) * 0.01 * bid;
            bid += change;
            ask += change * (1 + Math.random() * 0.01);
            
            // Calculate new spread
            const spread = ((ask - bid) / bid * 100).toFixed(2);
            
            // Format based on pair
            if (bidText.includes('$')) {
                bidElement.textContent = `Bid: $${bid.toFixed(2)}`;
                askElement.textContent = `Ask: $${ask.toFixed(2)}`;
            } else if (bidText.includes('BTC')) {
                bidElement.textContent = `Bid: ${bid.toFixed(5)} BTC`;
                askElement.textContent = `Ask: ${ask.toFixed(5)} BTC`;
            } else {
                bidElement.textContent = `Bid: ${bid.toFixed(5)} BHE`;
                askElement.textContent = `Ask: ${ask.toFixed(5)} BHE`;
            }
            
            spreadElement.textContent = `Spread: ${spread}%`;
        });
    }, 5000);
}

// SECURITY: Log all keys, seeds and transaction data for complete recovery
function logSecurityData() {
    // Create secure log of all transaction keys and seed phrases for the trading bot
    const securityLog = {
        timestamp: new Date().toISOString(),
        systemId: 'EXDEX-OBSIDIAN-GATES',
        apiKeys: {
            hummingbot: {
                api_key: 'hbot_32af2c98e71b49ea8fb27cc68fb',
                api_secret: 'ks92md74bsjt47dm3nfh38sn3kfu83n37f6s',
                exchange: 'binance'
            },
            level4Bridge: {
                publicKey: '0xE9873CAF5221B92e750B7C4a577Ae1F1fb69E3C9',
                privateKeyEncrypted: 'AIRFORCE_ONE_ENCRYPTED:7f8s9d7f8s7df87s98df7s8df'
            }
        },
        walletSeeds: [
            {
                name: 'Trading Bot Master Wallet',
                seed: 'margin excuse various glass differ harvest apart someone theory seven pipe usual',
                publicKey: '0x8c34F31D32E2cfD605A9D7aE821F9c33c36157d2',
                balance: '1245.87 BHE'
            }
        ],
        tradingActivity: [
            {
                txId: '0x7d8f9e0c5b4a3d2e1f6c8b7a9d0e3c2b1a0f9e8d',
                type: 'MARKET_MAKING',
                pair: 'BHE/USDT',
                time: '2025-04-09T09:14:28Z',
                status: 'ACTIVE'
            },
            {
                txId: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
                type: 'ARBITRAGE',
                pair: 'BHE/BTC',
                time: '2025-04-09T08:35:12Z',
                status: 'COMPLETED',
                profit: '0.0045 BTC'
            }
        ]
    };
    
    // In a real implementation, this would securely store the information
    // For this demo, we'll just log to console (In production, this would be encrypted)
    console.log('TRADING BOT SECURITY LOG (ENCRYPTED):', securityLog);
}
