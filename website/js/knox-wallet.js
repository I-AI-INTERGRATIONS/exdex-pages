class KnoxWalletIntegration {
    constructor() {
        this.wallet = null;
        this.initialized = false;
    }

    async init() {
        try {
            // Initialize Knox Wallet
            this.wallet = await window.knox.init();
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize Knox Wallet:', error);
            return false;
        }
    }

    async createWallet(blockchain) {
        try {
            const response = await fetch('/create_wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    blockchain: blockchain,
                    wallet_type: 'knox'
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.detail || 'Failed to create wallet');
            }
        } catch (error) {
            console.error('Error creating Knox wallet:', error);
            throw error;
        }
    }

    async getLifeSlice(address) {
        try {
            const response = await fetch(`/slice_of_life?address=${address}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting life slice:', error);
            throw error;
        }
    }

    async visualizeLifeSlice(data) {
        const container = document.createElement('div');
        container.className = 'life-slice-visualization';
        
        // Create a 3D visualization of transaction history
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        
        // Add transaction nodes
        data.transactions.forEach((tx, index) => {
            const geometry = new THREE.SphereGeometry(0.1, 32, 32);
            const material = new THREE.MeshStandardMaterial({
                color: index % 2 === 0 ? 0x00f6ff : 0x00ff00,
                transparent: true,
                opacity: 0.8
            });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(
                Math.sin(index) * 2,
                Math.cos(index) * 2,
                index * 0.1
            );
            scene.add(sphere);
        });
        
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
        
        return container;
    }
}

// Export the KnoxWalletIntegration class
window.KnoxWalletIntegration = KnoxWalletIntegration;
