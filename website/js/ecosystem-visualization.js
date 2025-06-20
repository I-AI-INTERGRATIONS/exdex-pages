/**
 * ExDEX Platform - Ecosystem Visualization JavaScript
 * Author: Cascade AI
 * Version: 1.0.0
 * Description: Interactive visualization of the BHE ecosystem
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initMatrixBackground();
    initEcosystemMap();
    initTokenAnimation();
    init3DCubeNavigation();
    initHolographicEffects();
    initCryptoPriceTicker();
    initInteractiveTooltips();
    
    // Apply advanced CSS
    applyVisualEffects();
});

// Matrix Digital Rain Background
function initMatrixBackground() {
    const matrixContainer = document.createElement('div');
    matrixContainer.className = 'matrix-background';
    document.body.appendChild(matrixContainer);
    
    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-canvas';
    matrixContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Characters to display
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    const columns = Math.floor(canvas.width / 20); // 20px per column
    const drops = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * canvas.height);
    }
    
    // Primary matrix color (BHE cyan)
    const primaryColor = '#00f6ff';
    
    // Drawing function
    function draw() {
        // Semi-transparent black background to create trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set text color and font
        ctx.fillStyle = primaryColor;
        ctx.font = '15px monospace';
        
        // Draw characters
        for (let i = 0; i < drops.length; i++) {
            // Get random character
            const char = characters[Math.floor(Math.random() * characters.length)];
            
            // Draw character
            ctx.fillText(char, i * 20, drops[i] * 20);
            
            // Reset drop or move down
            if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
    }
    
    // Animation loop
    setInterval(draw, 50);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Interactive Ecosystem Map
function initEcosystemMap() {
    const container = document.getElementById('ecosystem-visualization');
    if (!container) return;
    
    // Define ecosystem components
    const components = [
        { id: 'bhe-token', name: 'BHE Token', type: 'core', x: 50, y: 50 },
        { id: 'nos-token', name: 'NOS Stablecoin', type: 'core', x: 30, y: 40 },
        { id: 'driptide', name: 'DRIPTIDE Protocol', type: 'datatoken', x: 70, y: 40 },
        { id: 'level4-bridge', name: 'Level 4 Bridge', type: 'bridge', x: 50, y: 30 },
        { id: 'xdex-wallet', name: 'XDEX Wallet', type: 'wallet', x: 35, y: 60 },
        { id: 'bank-buddy', name: 'Bank Buddy', type: 'wallet', x: 20, y: 70 },
        { id: 'security-controller', name: 'Security Controller', type: 'security', x: 65, y: 60 },
        { id: 'exdex-pool', name: 'ExDEX Liquidity Pool', type: 'liquidity', x: 80, y: 50 },
        { id: 'aggro-vault', name: 'Aggro Vault', type: 'liquidity', x: 60, y: 75 },
        { id: 'ai-monitor', name: 'AI Monitor', type: 'ai', x: 40, y: 75 }
    ];
    
    // Define connections between components
    const connections = [
        { source: 'bhe-token', target: 'level4-bridge', strength: 3 },
        { source: 'bhe-token', target: 'nos-token', strength: 2 },
        { source: 'bhe-token', target: 'exdex-pool', strength: 3 },
        { source: 'bhe-token', target: 'aggro-vault', strength: 2 },
        { source: 'bhe-token', target: 'xdex-wallet', strength: 3 },
        { source: 'nos-token', target: 'exdex-pool', strength: 3 },
        { source: 'nos-token', target: 'xdex-wallet', strength: 2 },
        { source: 'xdex-wallet', target: 'bank-buddy', strength: 4 },
        { source: 'xdex-wallet', target: 'security-controller', strength: 3 },
        { source: 'driptide', target: 'bhe-token', strength: 2 },
        { source: 'driptide', target: 'ai-monitor', strength: 3 },
        { source: 'security-controller', target: 'ai-monitor', strength: 4 },
        { source: 'level4-bridge', target: 'security-controller', strength: 3 },
        { source: 'aggro-vault', target: 'exdex-pool', strength: 3 },
        { source: 'ai-monitor', target: 'bank-buddy', strength: 2 }
    ];
    
    // Create SVG container
    const width = container.clientWidth;
    const height = 600;
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'ecosystem-map');
        
    // Create gradient definitions
    const defs = svg.append('defs');
    
    // Core component gradient
    const coreGradient = defs.append('radialGradient')
        .attr('id', 'core-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
    
    coreGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#00f6ff');
    
    coreGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#009ca3');
    
    // Datatoken component gradient
    const datatokenGradient = defs.append('radialGradient')
        .attr('id', 'datatoken-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
    
    datatokenGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#fd4dff');
    
    datatokenGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#c400c7');
    
    // Bridge component gradient
    const bridgeGradient = defs.append('radialGradient')
        .attr('id', 'bridge-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
    
    bridgeGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#9700cc');
    
    bridgeGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#6a0096');
    
    // Wallet component gradient
    const walletGradient = defs.append('radialGradient')
        .attr('id', 'wallet-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
    
    walletGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#00a3ff');
    
    walletGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#0070b0');
    
    // Security component gradient
    const securityGradient = defs.append('radialGradient')
        .attr('id', 'security-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
    
    securityGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ffc400');
    
    securityGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#cc9c00');
    
    // Liquidity component gradient
    const liquidityGradient = defs.append('radialGradient')
        .attr('id', 'liquidity-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
    
    liquidityGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#00e676');
    
    liquidityGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#00b259');
    
    // AI component gradient
    const aiGradient = defs.append('radialGradient')
        .attr('id', 'ai-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
    
    aiGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ff3300');
    
    aiGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#cc2900');
    
    // Connection gradient for animation
    const connectionGradient = defs.append('linearGradient')
        .attr('id', 'connection-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    connectionGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(0, 246, 255, 0)');
    
    connectionGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', 'rgba(0, 246, 255, 0.8)');
    
    connectionGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(0, 246, 255, 0)');
    
    // Animation for connection gradient
    connectionGradient.append('animate')
        .attr('attributeName', 'x1')
        .attr('from', '-100%')
        .attr('to', '100%')
        .attr('dur', '3s')
        .attr('repeatCount', 'indefinite');
    
    connectionGradient.append('animate')
        .attr('attributeName', 'x2')
        .attr('from', '0%')
        .attr('to', '200%')
        .attr('dur', '3s')
        .attr('repeatCount', 'indefinite');
    
    // Create connections first (to be behind nodes)
    const connectionElements = svg.selectAll('.connection')
        .data(connections)
        .enter()
        .append('line')
        .attr('class', 'connection')
        .attr('x1', d => {
            const source = components.find(c => c.id === d.source);
            return width * (source.x / 100);
        })
        .attr('y1', d => {
            const source = components.find(c => c.id === d.source);
            return height * (source.y / 100);
        })
        .attr('x2', d => {
            const target = components.find(c => c.id === d.target);
            return width * (target.x / 100);
        })
        .attr('y2', d => {
            const target = components.find(c => c.id === d.target);
            return height * (target.y / 100);
        })
        .attr('stroke', 'url(#connection-gradient)')
        .attr('stroke-width', d => d.strength)
        .attr('opacity', 0.8);
    
    // Create nodes
    const nodeElements = svg.selectAll('.node')
        .data(components)
        .enter()
        .append('g')
        .attr('class', d => `node ${d.type}`)
        .attr('transform', d => `translate(${width * (d.x / 100)}, ${height * (d.y / 100)})`)
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragging)
            .on('end', dragEnded));
    
    // Add circles for nodes
    nodeElements.append('circle')
        .attr('r', 30)
        .attr('fill', d => {
            switch (d.type) {
                case 'core': return 'url(#core-gradient)';
                case 'datatoken': return 'url(#datatoken-gradient)';
                case 'bridge': return 'url(#bridge-gradient)';
                case 'wallet': return 'url(#wallet-gradient)';
                case 'security': return 'url(#security-gradient)';
                case 'liquidity': return 'url(#liquidity-gradient)';
                case 'ai': return 'url(#ai-gradient)';
                default: return '#666';
            }
        })
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.3);
    
    // Add pulse animation to nodes
    nodeElements.append('circle')
        .attr('r', 30)
        .attr('fill', 'none')
        .attr('stroke', d => {
            switch (d.type) {
                case 'core': return '#00f6ff';
                case 'datatoken': return '#fd4dff';
                case 'bridge': return '#9700cc';
                case 'wallet': return '#00a3ff';
                case 'security': return '#ffc400';
                case 'liquidity': return '#00e676';
                case 'ai': return '#ff3300';
                default: return '#666';
            }
        })
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.7)
        .append('animate')
        .attr('attributeName', 'r')
        .attr('from', 30)
        .attr('to', 45)
        .attr('dur', '1.5s')
        .attr('repeatCount', 'indefinite');
    
    // Add labels
    nodeElements.append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', 50)
        .text(d => d.name)
        .attr('fill', '#ffffff')
        .attr('font-size', '12px')
        .attr('font-family', "'Orbitron', sans-serif");
    
    // Add icons or abbreviations inside circles
    nodeElements.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .text(d => {
            // Return first letter of each word
            return d.name.split(' ').map(word => word[0]).join('');
        })
        .attr('fill', '#ffffff')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('font-family', "'Orbitron', sans-serif");
    
    // Handle node dragging
    function dragStarted(event, d) {
        d3.select(this).raise().attr('stroke', '#fff');
    }
    
    function dragging(event, d) {
        d3.select(this).attr('transform', `translate(${event.x}, ${event.y})`);
        
        // Update connections
        svg.selectAll('.connection')
            .attr('x1', function(conn) {
                const source = components.find(c => c.id === conn.source);
                return source.id === d.id ? event.x : width * (source.x / 100);
            })
            .attr('y1', function(conn) {
                const source = components.find(c => c.id === conn.source);
                return source.id === d.id ? event.y : height * (source.y / 100);
            })
            .attr('x2', function(conn) {
                const target = components.find(c => c.id === conn.target);
                return target.id === d.id ? event.x : width * (target.x / 100);
            })
            .attr('y2', function(conn) {
                const target = components.find(c => c.id === conn.target);
                return target.id === d.id ? event.y : height * (target.y / 100);
            });
    }
    
    function dragEnded(event, d) {
        d3.select(this).attr('stroke', null);
        d.x = (event.x / width) * 100;
        d.y = (event.y / height) * 100;
    }
    
    // Add tooltips with descriptions
    nodeElements.append('title')
        .text(d => {
            switch (d.id) {
                case 'bhe-token':
                    return 'Bitcoin Hardened Ethereum Token - The core currency with Bitcoin economics and Ethereum programmability';
                case 'nos-token':
                    return 'Not your Average Satoshi Stablecoin - Stable value pegged to Bitcoin';
                case 'driptide':
                    return 'DRIPTIDE Protocol - Tokenized data with dual-PGP encryption and AI insights';
                case 'level4-bridge':
                    return 'Level 4 Bridge - Self-verifying cross-chain bridge between Bitcoin and Ethereum';
                case 'xdex-wallet':
                    return 'XDEX Wallet - NFC-enabled mobile wallet with ZK-validated transactions';
                case 'bank-buddy':
                    return 'Bank Buddy - Home node for secure asset storage and family recovery';
                case 'security-controller':
                    return 'Security Controller - AI-driven security monitoring and fraud detection';
                case 'exdex-pool':
                    return 'ExDEX Liquidity Pool - Trading and liquidity hub for BHE ecosystem';
                case 'aggro-vault':
                    return 'Aggro Vault - Multi-sig protected liquidity vault with ZK-validated claims';
                case 'ai-monitor':
                    return 'AI Monitor - Machine learning system for transaction optimization and security';
                default:
                    return d.name;
            }
        });
}
