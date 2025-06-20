/**
 * Workflow Visualizer for Bitcoin Transaction Manager
 * Provides visual representation of transaction workflow with encryption verification
 */

class WorkflowVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.steps = [];
        this.currentStep = 0;
        this.animationFrame = null;
        this.initialized = false;
    }

    /**
     * Initialize the workflow visualizer
     * @param {string} canvasId - Canvas element ID
     * @returns {boolean} Success status
     */
    initialize(canvasId) {
        try {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                console.error(`Canvas element with ID ${canvasId} not found`);
                return false;
            }
            
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
            this.initialized = true;
            
            // Define workflow steps
            this.defineWorkflowSteps();
            
            // Draw initial state
            this.drawWorkflow();
            
            return true;
        } catch (error) {
            console.error("Failed to initialize Workflow Visualizer:", error);
            return false;
        }
    }

    /**
     * Set up canvas dimensions
     */
    setupCanvas() {
        // Set canvas dimensions to match its display size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Set up high-DPI canvas if needed
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            
            this.canvas.style.width = `${rect.width}px`;
            this.canvas.style.height = `${rect.height}px`;
        }
    }

    /**
     * Define workflow steps
     */
    defineWorkflowSteps() {
        this.steps = [
            {
                name: "Wallet Verification",
                description: "Verify wallet ownership with private key",
                icon: "🔑",
                color: "#4CAF50",
                connections: [1],
                position: { x: 100, y: 100 },
                status: "completed"
            },
            {
                name: "Encryption Bot",
                description: "Generate unique client encryption",
                icon: "🔒",
                color: "#2196F3",
                connections: [2],
                position: { x: 250, y: 100 },
                status: "completed"
            },
            {
                name: "Riptide Token",
                description: "Create tokenized command for EC-4",
                icon: "🔖",
                color: "#9C27B0",
                connections: [3],
                position: { x: 400, y: 100 },
                status: "active"
            },
            {
                name: "GPG Signature",
                description: "Sign transaction with GPG key",
                icon: "✍️",
                color: "#FF9800",
                connections: [4],
                position: { x: 550, y: 100 },
                status: "pending"
            },
            {
                name: "EC-4 Verification",
                description: "Server verifies signature and token",
                icon: "✅",
                color: "#795548",
                connections: [5],
                position: { x: 400, y: 200 },
                status: "pending"
            },
            {
                name: "Transaction Broadcast",
                description: "Send verified transaction to network",
                icon: "📡",
                color: "#607D8B",
                connections: [],
                position: { x: 250, y: 200 },
                status: "pending"
            }
        ];
    }

    /**
     * Draw workflow on canvas
     */
    drawWorkflow() {
        if (!this.initialized) {
            console.error("Workflow Visualizer not initialized");
            return;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.drawConnections();
        
        // Draw nodes
        this.steps.forEach((step, index) => {
            this.drawNode(step, index);
        });
    }

    /**
     * Draw connections between nodes
     */
    drawConnections() {
        this.ctx.lineWidth = 3;
        
        this.steps.forEach((step, index) => {
            step.connections.forEach(targetIndex => {
                const target = this.steps[targetIndex];
                
                // Determine connection status
                let connectionStatus = "pending";
                if (step.status === "completed" && target.status === "completed") {
                    connectionStatus = "completed";
                } else if (step.status === "completed" && target.status === "active") {
                    connectionStatus = "active";
                }
                
                // Set connection color based on status
                if (connectionStatus === "completed") {
                    this.ctx.strokeStyle = "#4CAF50";
                } else if (connectionStatus === "active") {
                    this.ctx.strokeStyle = "#2196F3";
                } else {
                    this.ctx.strokeStyle = "#E0E0E0";
                }
                
                // Draw connection line
                this.ctx.beginPath();
                this.ctx.moveTo(step.position.x, step.position.y);
                this.ctx.lineTo(target.position.x, target.position.y);
                this.ctx.stroke();
                
                // Draw arrow
                this.drawArrow(step.position, target.position);
            });
        });
    }

    /**
     * Draw arrow at the end of a connection
     * @param {Object} from - Starting position
     * @param {Object} to - Ending position
     */
    drawArrow(from, to) {
        const headLength = 10;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);
        
        // Calculate position slightly before the end point
        const endX = to.x - headLength * Math.cos(angle);
        const endY = to.y - headLength * Math.sin(angle);
        
        // Draw arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(to.x, to.y);
        this.ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Draw a node
     * @param {Object} step - Step data
     * @param {number} index - Step index
     */
    drawNode(step, index) {
        const radius = 30;
        
        // Draw node circle
        this.ctx.beginPath();
        this.ctx.arc(step.position.x, step.position.y, radius, 0, 2 * Math.PI);
        
        // Set fill color based on status
        if (step.status === "completed") {
            this.ctx.fillStyle = step.color;
        } else if (step.status === "active") {
            this.ctx.fillStyle = step.color;
            
            // Add glow effect for active node
            this.ctx.shadowColor = step.color;
            this.ctx.shadowBlur = 15;
        } else {
            this.ctx.fillStyle = "#E0E0E0";
        }
        
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowColor = "transparent";
        this.ctx.shadowBlur = 0;
        
        // Draw border
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#333";
        this.ctx.stroke();
        
        // Draw icon
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "#FFF";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(step.icon, step.position.x, step.position.y);
        
        // Draw label
        this.ctx.font = "14px Arial";
        this.ctx.fillStyle = "#333";
        this.ctx.fillText(step.name, step.position.x, step.position.y + radius + 20);
        
        // Draw step number
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillText((index + 1).toString(), step.position.x, step.position.y - radius - 10);
    }

    /**
     * Advance to the next workflow step
     * @returns {number} Current step index
     */
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            // Mark current step as completed
            this.steps[this.currentStep].status = "completed";
            
            // Advance to next step
            this.currentStep++;
            
            // Mark new step as active
            this.steps[this.currentStep].status = "active";
            
            // Redraw workflow
            this.drawWorkflow();
        }
        
        return this.currentStep;
    }

    /**
     * Reset workflow to initial state
     */
    resetWorkflow() {
        // Reset step statuses
        this.steps.forEach((step, index) => {
            if (index === 0) {
                step.status = "active";
            } else {
                step.status = "pending";
            }
        });
        
        this.currentStep = 0;
        this.drawWorkflow();
    }

    /**
     * Animate workflow progression
     * @param {number} duration - Animation duration in milliseconds
     */
    animateWorkflow(duration = 5000) {
        // Reset workflow
        this.resetWorkflow();
        
        const stepDuration = duration / (this.steps.length - 1);
        let stepIndex = 0;
        
        const animate = () => {
            if (stepIndex < this.steps.length - 1) {
                setTimeout(() => {
                    this.nextStep();
                    stepIndex++;
                    this.animationFrame = requestAnimationFrame(animate);
                }, stepDuration);
            }
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }

    /**
     * Stop workflow animation
     */
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * Update workflow with current transaction status
     * @param {Object} status - Transaction status
     */
    updateWithTransactionStatus(status) {
        // Map transaction status to workflow steps
        if (status.walletVerified) {
            this.steps[0].status = "completed";
            this.steps[1].status = "active";
        }
        
        if (status.encryptionInitialized) {
            this.steps[1].status = "completed";
            this.steps[2].status = "active";
        }
        
        if (status.tokenCreated) {
            this.steps[2].status = "completed";
            this.steps[3].status = "active";
        }
        
        if (status.gpgSigned) {
            this.steps[3].status = "completed";
            this.steps[4].status = "active";
        }
        
        if (status.serverVerified) {
            this.steps[4].status = "completed";
            this.steps[5].status = "active";
        }
        
        if (status.transactionBroadcast) {
            this.steps[5].status = "completed";
        }
        
        // Update current step
        for (let i = this.steps.length - 1; i >= 0; i--) {
            if (this.steps[i].status === "completed" || this.steps[i].status === "active") {
                this.currentStep = i;
                break;
            }
        }
        
        // Redraw workflow
        this.drawWorkflow();
    }
}

// Export the WorkflowVisualizer class
window.WorkflowVisualizer = WorkflowVisualizer;
