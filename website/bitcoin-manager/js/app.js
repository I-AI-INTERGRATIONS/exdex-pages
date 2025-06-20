/**
 * Bitcoin Transaction Manager Application
 * Main application logic and UI interactions
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize managers
    const bitcoinManager = new BitcoinManager();
    const walletConnectManager = new WalletConnectManager();
    const googlePayManager = new GooglePayManager();
    const encryptionBotClient = new EncryptionBotClient();
    const workflowVisualizer = new WorkflowVisualizer();
    const bheTokenTicker = new BHETokenTicker();
    const exdexHomeLauncher = new EXDEXHomeLauncher();
    
    // Initialize Bitcoin manager
    await bitcoinManager.initialize();
    
    // Initialize WalletConnect and Google Pay
    await initializePaymentMethods();
    
    // Initialize workflow visualizer
    initializeWorkflowVisualizer();
    
    // Initialize BHE token ticker
    initializeBHETokenTicker();
    
    // Initialize EXDEX Home Launcher
    initializeEXDEXHomeLauncher();
    
    // Update UI with initial mempool data
    updateMempoolStats();
    
    // Set up tab navigation
    setupTabs();
    
    // Set up event listeners
    setupEventListeners();
    
    /**
     * Initialize EXDEX Home Launcher
     */
    async function initializeEXDEXHomeLauncher() {
        try {
            const initialized = await exdexHomeLauncher.initialize();
            console.log("EXDEX Home Launcher initialized:", initialized);
            
            if (initialized) {
                // Update UI with current launch status
                exdexHomeLauncher.updateLaunchUI();
                
                // Set up launch button event listener
                document.getElementById('launch-token-btn')?.addEventListener('click', async () => {
                    try {
                        updateStatus("Launching BHE token...", "info");
                        const launchButton = document.getElementById('launch-token-btn');
                        if (launchButton) {
                            launchButton.disabled = true;
                            launchButton.textContent = "Launching...";
                        }
                        
                        const launched = await exdexHomeLauncher.launchToken();
                        
                        if (launched) {
                            updateStatus("BHE token successfully launched!", "success");
                            exdexHomeLauncher.updateLaunchUI();
                        } else {
                            updateStatus("Failed to launch BHE token", "error");
                            if (launchButton) {
                                launchButton.disabled = false;
                                launchButton.textContent = "Launch Token";
                            }
                        }
                    } catch (error) {
                        console.error("Failed to launch token:", error);
                        updateStatus("Failed to launch BHE token", "error");
                    }
                });
            }
        } catch (error) {
            console.error("Failed to initialize EXDEX Home Launcher:", error);
        }
    }
    
    /**
     * Initialize BHE token ticker
     */
    async function initializeBHETokenTicker() {
        try {
            const initialized = await bheTokenTicker.initialize();
            console.log("BHE Token Ticker initialized:", initialized);
            
            if (initialized) {
                // Update progress bar width based on deployment progress
                const progressElement = document.getElementById('bhe-progress');
                if (progressElement) {
                    const progress = bheTokenTicker.getDeploymentProgress();
                    progressElement.style.width = `${progress}%`;
                }
                
                // Set up event listeners for BHE ticker buttons
                document.getElementById('view-contract-btn')?.addEventListener('click', () => {
                    const contractAddress = bheTokenTicker.getTokenData().contractAddress;
                    // In a real implementation, this would open a blockchain explorer
                    alert(`Contract Address: ${contractAddress}\nRunning on EC-4 Private Network`);
                });
                
                document.getElementById('view-docs-btn')?.addEventListener('click', () => {
                    // In a real implementation, this would open documentation
                    alert('BHE Token Documentation\nAccess restricted to authorized users on EC-4 Private Network');
                });
                
                // Start countdown timer
                startLaunchCountdown();
            }
        } catch (error) {
            console.error("Failed to initialize BHE Token Ticker:", error);
        }
    }
    
    /**
     * Start launch countdown timer
     */
    function startLaunchCountdown() {
        // Update countdown every second
        setInterval(() => {
            bheTokenTicker.updateLaunchCountdown();
        }, 1000);
    }
    
    /**
     * Initialize workflow visualizer
     */
    function initializeWorkflowVisualizer() {
        const canvasElement = document.getElementById('workflow-canvas');
        if (canvasElement) {
            const initialized = workflowVisualizer.initialize('workflow-canvas');
            console.log("Workflow visualizer initialized:", initialized);
        }
    }
    
    /**
     * Initialize payment methods (WalletConnect and Google Pay)
     */
    async function initializePaymentMethods() {
        try {
            // Initialize WalletConnect
            const walletConnectInitialized = await walletConnectManager.initialize();
            console.log("WalletConnect initialized:", walletConnectInitialized);
            
            // Initialize Google Pay
            const googlePayInitialized = await googlePayManager.initialize();
            console.log("Google Pay initialized:", googlePayInitialized);
            
            if (googlePayInitialized) {
                googlePayManager.createButton('google-pay-button');
            } else {
                document.getElementById('google-pay-status').textContent = "Google Pay not available";
            }
        } catch (error) {
            console.error("Failed to initialize payment methods:", error);
            updateStatus("Failed to initialize payment methods", "error");
        }
    }
    
    /**
     * Set up tab navigation
     */
    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked button and corresponding pane
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    /**
     * Set up event listeners for UI interactions
     */
    function setupEventListeners() {
        // Wallet tab
        document.getElementById('verify-wallet-btn').addEventListener('click', verifyWalletOwnership);
        document.getElementById('load-wallet-btn').addEventListener('click', loadWallet);
        document.getElementById('generate-new-key-btn').addEventListener('click', generateNewWallet);
        document.getElementById('refresh-balance').addEventListener('click', refreshWalletBalance);
        document.getElementById('refresh-utxos').addEventListener('click', refreshUTXOs);
        document.getElementById('create-tx-btn').addEventListener('click', createTransaction);
        document.getElementById('tx-fee-rate').addEventListener('input', updateTxFeeRateValue);
        document.getElementById('wallet-file').addEventListener('change', handleFileUpload);
        
        // WalletConnect event listeners
        document.getElementById('generate-qr-btn')?.addEventListener('click', generateWalletConnectQR);
        document.getElementById('connect-wallet-btn')?.addEventListener('click', connectWalletConnect);
        
        // Encryption Bot event listeners
        document.getElementById('initialize-encryption-btn')?.addEventListener('click', initializeEncryptionBot);
        
        // Workflow Visualizer event listeners
        document.getElementById('animate-workflow-btn')?.addEventListener('click', () => {
            workflowVisualizer.animateWorkflow(5000);
            updateStatus("Animating secure transaction workflow", "info");
        });
        
        document.getElementById('reset-workflow-btn')?.addEventListener('click', () => {
            workflowVisualizer.resetWorkflow();
            updateStatus("Workflow reset", "info");
        });
        
        // RBF tab
        document.getElementById('load-tx-btn').addEventListener('click', loadTransaction);
        document.getElementById('new-fee-rate').addEventListener('input', updateFeeRateValue);
        document.getElementById('rbf-submit-btn').addEventListener('click', submitRBF);
        
        // CPFP tab
        document.getElementById('load-parent-tx-btn').addEventListener('click', loadParentTransaction);
        document.getElementById('child-fee-rate').addEventListener('input', updateChildFeeRateValue);
        document.getElementById('cpfp-submit-btn').addEventListener('click', submitCPFP);
        
        // Address History tab
        document.getElementById('load-history-btn').addEventListener('click', loadAddressHistory);
        document.getElementById('history-filter').addEventListener('change', filterTransactionHistory);
        
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', copyToClipboard);
        });
        
        // Modal close button
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('transaction-modal').style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('transaction-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Pool Contract Admin actions
        document.getElementById('lock-pool-btn')?.addEventListener('click', async () => {
            try {
                updateStatus("Locking pool...", "info");
                const result = await walletConnectManager.lockPool();
                if (result) {
                    updateStatus("Pool locked successfully", "success");
                }
            } catch (error) {
                console.error("Failed to lock pool:", error);
                updateStatus("Failed to lock pool", "error");
            }
        });
        
        document.getElementById('unlock-pool-btn')?.addEventListener('click', async () => {
            try {
                updateStatus("Unlocking pool...", "info");
                const result = await walletConnectManager.unlockPool();
                if (result) {
                    updateStatus("Pool unlocked successfully", "success");
                }
            } catch (error) {
                console.error("Failed to unlock pool:", error);
                updateStatus("Failed to unlock pool", "error");
            }
        });
        
        document.getElementById('withdraw-fees-btn')?.addEventListener('click', async () => {
            try {
                updateStatus("Withdrawing fees...", "info");
                const result = await walletConnectManager.withdrawFees();
                if (result) {
                    updateStatus("Fees withdrawn successfully", "success");
                }
            } catch (error) {
                console.error("Failed to withdraw fees:", error);
                updateStatus("Failed to withdraw fees", "error");
            }
        });
        
        document.getElementById('update-settings-btn')?.addEventListener('click', async () => {
            try {
                const feePercentage = parseFloat(document.getElementById('fee-percentage').value);
                const minDeposit = parseFloat(document.getElementById('min-deposit').value);
                const maxUsers = parseInt(document.getElementById('max-users').value);
                
                if (isNaN(feePercentage) || isNaN(minDeposit) || isNaN(maxUsers)) {
                    updateStatus("Invalid settings values", "error");
                    return;
                }
                
                updateStatus("Updating settings...", "info");
                const result = await walletConnectManager.updateFeeStructure(feePercentage, minDeposit, maxUsers);
                if (result) {
                    updateStatus("Settings updated successfully", "success");
                }
            } catch (error) {
                console.error("Failed to update settings:", error);
                updateStatus("Failed to update settings", "error");
            }
        });
    }
    
    /**
     * Handle file upload for wallet data
     * @param {Event} event - Change event
     */
    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Update file name display
        document.getElementById('file-name').textContent = file.name;
        
        updateStatus(`Processing ${file.name}...`, 'info');
        
        try {
            let walletData = '';
            
            // Handle different file types
            if (file.type.startsWith('image/')) {
                // Process QR code image
                walletData = await processQRCode(file);
            } else {
                // Process text-based files (.dat, .key, .json, .txt)
                walletData = await processTextFile(file);
            }
            
            if (walletData) {
                // Set the extracted data to the input field
                document.getElementById('wallet-input').value = walletData;
                updateStatus('File processed successfully. Click Verify Ownership to continue.', 'success');
            } else {
                updateStatus('Could not extract wallet data from file', 'error');
            }
        } catch (error) {
            updateStatus(`Error processing file: ${error.message}`, 'error');
        }
    }
    
    /**
     * Process QR code image to extract wallet data
     * @param {File} file - Image file containing QR code
     * @returns {Promise<string>} Extracted wallet data
     */
    async function processQRCode(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                img.onload = async function() {
                    try {
                        // In a real implementation, this would use a QR code library
                        // For demo purposes, we'll simulate QR code extraction
                        
                        // Simulate QR code processing delay
                        await new Promise(r => setTimeout(r, 1000));
                        
                        // Extract a simulated private key from the image filename
                        // In a real app, this would use a QR code scanning library
                        const simulatedKey = `L${btoa(file.name).substring(0, 50)}`;
                        
                        resolve(simulatedKey);
                    } catch (error) {
                        reject(new Error('Failed to process QR code'));
                    }
                };
                img.onerror = function() {
                    reject(new Error('Failed to load image'));
                };
                img.src = e.target.result;
            };
            
            reader.onerror = function() {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Process text file to extract wallet data
     * @param {File} file - Text file containing wallet data
     * @returns {Promise<string>} Extracted wallet data
     */
    async function processTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    
                    // Handle different file formats
                    if (file.name.endsWith('.json')) {
                        // Parse JSON file
                        const jsonData = JSON.parse(content);
                        
                        // Extract private key or seed phrase from common wallet formats
                        if (jsonData.privateKey) {
                            resolve(jsonData.privateKey);
                        } else if (jsonData.seedPhrase || jsonData.mnemonic) {
                            resolve(jsonData.seedPhrase || jsonData.mnemonic);
                        } else if (jsonData.xprv) {
                            resolve(jsonData.xprv);
                        } else if (jsonData.keystore && jsonData.keystore.crypto) {
                            // This is likely an Ethereum keystore file
                            // In a real app, we would prompt for password
                            resolve(content); // Pass the entire keystore for processing
                        } else {
                            // Try to find any key-like string in the JSON
                            const jsonString = JSON.stringify(jsonData);
                            const keyMatch = jsonString.match(/([KL5][a-zA-Z0-9]{50,52}|xprv[a-zA-Z0-9]{107,108}|[0-9a-f]{64})/i);
                            if (keyMatch) {
                                resolve(keyMatch[0]);
                            } else {
                                reject(new Error('No wallet data found in JSON file'));
                            }
                        }
                    } else if (file.name.endsWith('.dat')) {
                        // Handle wallet.dat files
                        // In a real app, this would use specialized libraries
                        // For demo purposes, we'll extract any key-like pattern
                        const keyMatch = content.match(/([KL5][a-zA-Z0-9]{50,52}|xprv[a-zA-Z0-9]{107,108}|[0-9a-f]{64})/i);
                        if (keyMatch) {
                            resolve(keyMatch[0]);
                        } else {
                            // If no key found, use the filename as a seed for demo purposes
                            resolve(`wallet-seed-${file.name.replace(/\W/g, '-')}`);
                        }
                    } else {
                        // Handle plain text files
                        // Look for common patterns (WIF, xprv, seed phrases)
                        const lines = content.split(/\r?\n/);
                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (
                                // WIF key pattern
                                /^[KL5][a-zA-Z0-9]{50,52}$/.test(trimmed) ||
                                // xprv pattern
                                /^xprv[a-zA-Z0-9]{107,108}$/.test(trimmed) ||
                                // Hex private key pattern
                                /^[0-9a-f]{64}$/i.test(trimmed) ||
                                // Seed phrase pattern (multiple words)
                                /^[a-z]+(\s+[a-z]+){11,23}$/i.test(trimmed)
                            ) {
                                resolve(trimmed);
                                return;
                            }
                        }
                        
                        // If no recognized pattern, use the whole content
                        resolve(content.trim());
                    }
                } catch (error) {
                    reject(new Error(`Failed to process file: ${error.message}`));
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Verify wallet ownership from private key or seed phrase
     */
    async function verifyWalletOwnership() {
        const walletInput = document.getElementById('wallet-input').value.trim();
        
        if (!walletInput) {
            updateStatus('Please enter a private key or seed phrase or upload a wallet file', 'error');
            return;
        }
        
        updateStatus('Verifying ownership...', 'info');
        
        try {
            // Store the input temporarily for the next step
            sessionStorage.setItem('tempWalletInput', walletInput);
            
            // Determine key type for display
            const keyType = bitcoinManager.determineKeyType(walletInput);
            
            // Show key options screen
            document.getElementById('key-options').classList.remove('hidden');
            
            updateStatus('Ownership verified. Please select key options.', 'success');
        } catch (error) {
            updateStatus(`Failed to verify ownership: ${error.message}`, 'error');
        }
    }
    
    /**
     * Load wallet after verification and key options selection
     */
    async function loadWallet() {
        const walletInput = sessionStorage.getItem('tempWalletInput');
        const forceNewKeySet = document.getElementById('force-new-keyset').checked;
        
        if (!walletInput) {
            updateStatus('No wallet data found. Please verify ownership first.', 'error');
            return;
        }
        
        updateStatus('Loading wallet...', 'info');
        
        try {
            const wallet = await bitcoinManager.loadWallet(walletInput, forceNewKeySet);
            
            // Clear temporary storage
            sessionStorage.removeItem('tempWalletInput');
            
            // Update UI with wallet info
            document.getElementById('legacy-address').textContent = wallet.addresses.legacy;
            document.getElementById('segwit-address').textContent = wallet.addresses.segwit;
            document.getElementById('native-segwit-address').textContent = wallet.addresses.nativeSegwit;
            document.getElementById('wallet-balance').textContent = `${wallet.balance.toFixed(8)} BTC`;
            
            // Update key info
            document.getElementById('key-type').textContent = wallet.type.toUpperCase();
            document.getElementById('derivation-path').textContent = wallet.derivationPath;
            document.getElementById('xpub-key').textContent = wallet.xpub;
            
            // Display UTXOs
            displayUTXOs(wallet.utxos);
            
            // Hide key options and show wallet details
            document.getElementById('key-options').classList.add('hidden');
            document.getElementById('wallet-details').classList.remove('hidden');
            
            // Pre-fill address history tab with native segwit address
            document.getElementById('history-address').value = wallet.addresses.nativeSegwit;
            
            updateStatus('Wallet loaded successfully', 'success');
        } catch (error) {
            updateStatus(`Failed to load wallet: ${error.message}`, 'error');
        }
    }
    
    /**
     * Generate a new wallet
     */
    async function generateNewWallet() {
        updateStatus('Generating new wallet...', 'info');
        
        try {
            const wallet = await bitcoinManager.generateNewWallet();
            
            // Update UI with wallet info
            document.getElementById('wallet-input').value = wallet.key;
            document.getElementById('legacy-address').textContent = wallet.addresses.legacy;
            document.getElementById('segwit-address').textContent = wallet.addresses.segwit;
            document.getElementById('native-segwit-address').textContent = wallet.addresses.nativeSegwit;
            document.getElementById('wallet-balance').textContent = `${wallet.balance.toFixed(8)} BTC`;
            
            // Update key info
            document.getElementById('key-type').textContent = wallet.type.toUpperCase();
            document.getElementById('derivation-path').textContent = wallet.derivationPath;
            document.getElementById('xpub-key').textContent = wallet.xpub;
            
            // Display UTXOs
            displayUTXOs(wallet.utxos);
            
            // Show wallet details
            document.getElementById('wallet-details').classList.remove('hidden');
            
            // Pre-fill address history tab with native segwit address
            document.getElementById('history-address').value = wallet.addresses.nativeSegwit;
            
            updateStatus('New wallet generated successfully', 'success');
        } catch (error) {
            updateStatus(`Failed to generate new wallet: ${error.message}`, 'error');
        }
    }
    
    /**
     * Refresh wallet balance
     */
    async function refreshWalletBalance() {
        if (!bitcoinManager.currentWallet) {
            updateStatus('No wallet loaded', 'error');
            return;
        }
        
        updateStatus('Refreshing balance...', 'info');
        
        try {
            const balance = await bitcoinManager.getAddressBalance(bitcoinManager.currentWallet.addresses.legacy);
            bitcoinManager.currentWallet.balance = balance;
            document.getElementById('wallet-balance').textContent = `${balance.toFixed(8)} BTC`;
            updateStatus('Balance refreshed', 'success');
        } catch (error) {
            updateStatus(`Failed to refresh balance: ${error.message}`, 'error');
        }
    }
    
    /**
     * Refresh UTXOs
     */
    async function refreshUTXOs() {
        if (!bitcoinManager.currentWallet) {
            updateStatus('No wallet loaded', 'error');
            return;
        }
        
        updateStatus('Refreshing UTXOs...', 'info');
        
        try {
            const utxos = await bitcoinManager.getWalletUTXOs(bitcoinManager.currentWallet);
            displayUTXOs(utxos);
            updateStatus('UTXOs refreshed', 'success');
        } catch (error) {
            updateStatus(`Failed to refresh UTXOs: ${error.message}`, 'error');
        }
    }
    
    /**
     * Display UTXOs in the UTXO list
     * @param {Array} utxos - List of UTXOs
     */
    function displayUTXOs(utxos) {
        const utxoList = document.getElementById('utxo-list');
        utxoList.innerHTML = '';
        
        if (utxos.length === 0) {
            utxoList.innerHTML = '<div class="empty-state">No UTXOs found</div>';
            return;
        }
        
        utxos.forEach(utxo => {
            const utxoItem = document.createElement('div');
            utxoItem.className = 'utxo-item';
            
            const utxoDetails = document.createElement('div');
            utxoDetails.className = 'utxo-details';
            
            const utxoTxid = document.createElement('div');
            utxoTxid.className = 'utxo-txid';
            utxoTxid.textContent = `${utxo.txid}:${utxo.vout}`;
            
            const utxoAmount = document.createElement('div');
            utxoAmount.className = 'utxo-amount';
            utxoAmount.textContent = `${utxo.amount.toFixed(8)} BTC`;
            
            const utxoConfirmations = document.createElement('div');
            utxoConfirmations.className = 'utxo-confirmations';
            utxoConfirmations.textContent = `${utxo.confirmations} confirmation${utxo.confirmations !== 1 ? 's' : ''}`;
            
            utxoDetails.appendChild(utxoTxid);
            utxoDetails.appendChild(utxoAmount);
            utxoDetails.appendChild(utxoConfirmations);
            
            const utxoSelect = document.createElement('input');
            utxoSelect.type = 'checkbox';
            utxoSelect.className = 'utxo-select';
            utxoSelect.dataset.txid = utxo.txid;
            utxoSelect.dataset.vout = utxo.vout;
            utxoSelect.dataset.amount = utxo.amount;
            
            utxoItem.appendChild(utxoDetails);
            utxoItem.appendChild(utxoSelect);
            
            utxoList.appendChild(utxoItem);
        });
    }
    
    /**
     * Update transaction fee rate value display
     */
    function updateTxFeeRateValue() {
        const feeRate = document.getElementById('tx-fee-rate').value;
        document.getElementById('tx-fee-rate-value').textContent = `${feeRate} sat/vB`;
    }
    
    /**
     * Create a new transaction
     */
    async function createTransaction() {
        if (!bitcoinManager.currentWallet) {
            updateStatus('Please load a wallet first', 'error');
            return;
        }
        
        const destinationAddress = document.getElementById('destination-address').value.trim();
        const amount = parseFloat(document.getElementById('tx-amount').value);
        const feeRate = parseInt(document.getElementById('tx-fee-rate').value);
        
        if (!destinationAddress) {
            updateStatus('Please enter a destination address', 'error');
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            updateStatus('Please enter a valid amount', 'error');
            return;
        }
        
        // Get selected UTXOs
        const selectedUtxos = Array.from(document.querySelectorAll('.utxo-select:checked')).map(checkbox => {
            return {
                txid: checkbox.dataset.txid,
                vout: parseInt(checkbox.dataset.vout),
                amount: parseFloat(checkbox.dataset.amount)
            };
        });
        
        if (selectedUtxos.length === 0) {
            updateStatus('Please select at least one UTXO', 'error');
            return;
        }
        
        const totalSelected = selectedUtxos.reduce((sum, utxo) => sum + utxo.amount, 0);
        
        if (totalSelected < amount) {
            updateStatus('Selected UTXOs do not have enough funds', 'error');
            return;
        }
        
        updateStatus('Creating transaction...', 'info');
        
        try {
            // In a real implementation, this would create an actual transaction
            // For demo purposes, we'll simulate a successful transaction
            
            setTimeout(() => {
                updateStatus('Transaction created successfully. Ready to broadcast.', 'success');
                
                // Show transaction details in a modal
                const modalDetails = document.querySelector('.tx-modal-details');
                modalDetails.innerHTML = '';
                
                // Create transaction overview section
                const overviewSection = document.createElement('div');
                overviewSection.className = 'detail-section';
                
                const overviewTitle = document.createElement('h4');
                overviewTitle.textContent = 'Transaction Overview';
                overviewSection.appendChild(overviewTitle);
                
                // Add transaction details
                addDetailRow(overviewSection, 'Destination', destinationAddress);
                addDetailRow(overviewSection, 'Amount', `${amount.toFixed(8)} BTC`);
                addDetailRow(overviewSection, 'Fee Rate', `${feeRate} sat/vB`);
                addDetailRow(overviewSection, 'Estimated Fee', `0.00001234 BTC`);
                addDetailRow(overviewSection, 'Total', `${(amount + 0.00001234).toFixed(8)} BTC`);
                
                modalDetails.appendChild(overviewSection);
                
                // Show modal
                document.getElementById('transaction-modal').style.display = 'block';
            }, 1500);
            
        } catch (error) {
            updateStatus(`Failed to create transaction: ${error.message}`, 'error');
        }
    }
    
    /**
     * Load transaction for RBF
     */
    async function loadTransaction() {
        const txid = document.getElementById('rbf-txid').value.trim();
        
        if (!txid) {
            updateStatus('Please enter a transaction ID', 'error');
            return;
        }
        
        updateStatus('Loading transaction...', 'info');
        
        try {
            const tx = await bitcoinManager.getTransactionDetails(txid);
            
            // Check if transaction is confirmed
            if (tx.confirmations > 0) {
                updateStatus('Transaction is already confirmed, cannot use RBF', 'error');
                return;
            }
            
            // Update UI with transaction details
            document.getElementById('current-fee').textContent = `${tx.feeRate} sat/vB`;
            
            // Get recommended fee
            const recommendedFee = bitcoinManager.getRecommendedFee();
            document.getElementById('recommended-fee').textContent = `${recommendedFee} sat/vB`;
            
            // Set slider value to recommended fee
            const feeSlider = document.getElementById('new-fee-rate');
            feeSlider.value = recommendedFee;
            document.getElementById('fee-rate-value').textContent = `${recommendedFee} sat/vB`;
            
            // Show transaction details
            document.getElementById('rbf-tx-details').classList.remove('hidden');
            
            // Store transaction data for later use
            document.getElementById('rbf-tx-details').dataset.txid = txid;
            document.getElementById('rbf-tx-details').dataset.currentFee = tx.feeRate;
            
            updateStatus('Transaction loaded successfully', 'success');
        } catch (error) {
            updateStatus(`Failed to load transaction: ${error.message}`, 'error');
        }
    }
    
    /**
     * Update fee rate value display
     */
    function updateFeeRateValue() {
        const feeRate = document.getElementById('new-fee-rate').value;
        document.getElementById('fee-rate-value').textContent = `${feeRate} sat/vB`;
    }
    
    /**
     * Submit RBF transaction
     */
    async function submitRBF() {
        if (!bitcoinManager.currentWallet) {
            updateStatus('Please load a wallet first', 'error');
            return;
        }
        
        const txDetails = document.getElementById('rbf-tx-details');
        const txid = txDetails.dataset.txid;
        const newFeeRate = parseInt(document.getElementById('new-fee-rate').value);
        const currentFee = parseFloat(txDetails.dataset.currentFee);
        
        if (newFeeRate <= currentFee) {
            updateStatus('New fee rate must be higher than current fee rate', 'error');
            return;
        }
        
        updateStatus('Creating RBF transaction...', 'info');
        
        try {
            const rbfTx = await bitcoinManager.createRBFTransaction(txid, newFeeRate);
            
            // In a real implementation, this would show a confirmation dialog
            // For demo purposes, we'll simulate broadcasting
            
            updateStatus('Broadcasting RBF transaction...', 'info');
            
            const result = await bitcoinManager.broadcastTransaction(rbfTx.signedTx);
            
            if (result.success) {
                updateStatus(`RBF transaction broadcast successfully. New TXID: ${result.txid}`, 'success');
                
                // Update UI
                document.getElementById('rbf-txid').value = result.txid;
                document.getElementById('current-fee').textContent = `${newFeeRate} sat/vB`;
                txDetails.dataset.currentFee = newFeeRate;
                txDetails.dataset.txid = result.txid;
            } else {
                updateStatus('Failed to broadcast RBF transaction', 'error');
            }
        } catch (error) {
            updateStatus(`Failed to create RBF transaction: ${error.message}`, 'error');
        }
    }
    
    /**
     * Load parent transaction for CPFP
     */
    async function loadParentTransaction() {
        const txid = document.getElementById('cpfp-txid').value.trim();
        
        if (!txid) {
            updateStatus('Please enter a parent transaction ID', 'error');
            return;
        }
        
        updateStatus('Loading parent transaction...', 'info');
        
        try {
            const tx = await bitcoinManager.getTransactionDetails(txid);
            
            // Check if transaction is confirmed
            if (tx.confirmations > 0) {
                updateStatus('Parent transaction is already confirmed, cannot use CPFP', 'error');
                return;
            }
            
            // Update UI with transaction details
            document.getElementById('parent-fee').textContent = `${tx.feeRate} sat/vB`;
            
            // Get recommended fee
            const recommendedFee = bitcoinManager.getRecommendedFee();
            document.getElementById('recommended-child-fee').textContent = `${recommendedFee} sat/vB`;
            
            // Set slider value to recommended fee
            const feeSlider = document.getElementById('child-fee-rate');
            feeSlider.value = recommendedFee;
            document.getElementById('child-fee-rate-value').textContent = `${recommendedFee} sat/vB`;
            
            // Show transaction details
            document.getElementById('cpfp-tx-details').classList.remove('hidden');
            
            // Store transaction data for later use
            document.getElementById('cpfp-tx-details').dataset.txid = txid;
            
            updateStatus('Parent transaction loaded successfully', 'success');
        } catch (error) {
            updateStatus(`Failed to load parent transaction: ${error.message}`, 'error');
        }
    }
    
    /**
     * Update child fee rate value display
     */
    function updateChildFeeRateValue() {
        const feeRate = document.getElementById('child-fee-rate').value;
        document.getElementById('child-fee-rate-value').textContent = `${feeRate} sat/vB`;
    }
    
    /**
     * Submit CPFP transaction
     */
    async function submitCPFP() {
        if (!bitcoinManager.currentWallet) {
            updateStatus('Please load a wallet first', 'error');
            return;
        }
        
        const txDetails = document.getElementById('cpfp-tx-details');
        const parentTxid = txDetails.dataset.txid;
        const childFeeRate = parseInt(document.getElementById('child-fee-rate').value);
        
        updateStatus('Creating CPFP transaction...', 'info');
        
        try {
            const cpfpTx = await bitcoinManager.createCPFPTransaction(parentTxid, childFeeRate);
            
            // In a real implementation, this would show a confirmation dialog
            // For demo purposes, we'll simulate broadcasting
            
            updateStatus('Broadcasting CPFP transaction...', 'info');
            
            const result = await bitcoinManager.broadcastTransaction(cpfpTx.signedTx);
            
            if (result.success) {
                updateStatus(`CPFP transaction broadcast successfully. Child TXID: ${result.txid}`, 'success');
                
                // Update UI
                document.getElementById('cpfp-txid').value = '';
                document.getElementById('cpfp-tx-details').classList.add('hidden');
            } else {
                updateStatus('Failed to broadcast CPFP transaction', 'error');
            }
        } catch (error) {
            updateStatus(`Failed to create CPFP transaction: ${error.message}`, 'error');
        }
    }
    
    /**
     * Load address transaction history
     */
    async function loadAddressHistory() {
        const address = document.getElementById('history-address').value.trim();
        
        if (!address) {
            updateStatus('Please enter a Bitcoin address', 'error');
            return;
        }
        
        updateStatus('Loading transaction history...', 'info');
        
        try {
            const transactions = await bitcoinManager.getAddressHistory(address);
            
            // Store transactions for filtering
            document.getElementById('address-history').dataset.transactions = JSON.stringify(transactions);
            
            // Display transactions
            displayTransactions(transactions);
            
            // Show history container
            document.getElementById('address-history').classList.remove('hidden');
            
            updateStatus(`Loaded ${transactions.length} transactions`, 'success');
        } catch (error) {
            updateStatus(`Failed to load transaction history: ${error.message}`, 'error');
        }
    }
    
    /**
     * Display transactions in the transaction list
     * @param {Array} transactions - List of transactions
     */
    function displayTransactions(transactions) {
        const txList = document.getElementById('tx-list');
        txList.innerHTML = '';
        
        if (transactions.length === 0) {
            txList.innerHTML = '<div class="tx-item">No transactions found</div>';
            return;
        }
        
        transactions.forEach(tx => {
            const txItem = document.createElement('div');
            txItem.className = 'tx-item';
            txItem.dataset.txid = tx.txid;
            
            const txHeader = document.createElement('div');
            txHeader.className = 'tx-header';
            
            const txType = document.createElement('div');
            txType.className = `tx-type ${tx.type}`;
            txType.textContent = tx.type === 'received' ? 'Received' : 'Sent';
            
            const txDate = document.createElement('div');
            txDate.className = 'tx-date';
            txDate.textContent = new Date(tx.timestamp * 1000).toLocaleString();
            
            txHeader.appendChild(txType);
            txHeader.appendChild(txDate);
            
            const txDetails = document.createElement('div');
            txDetails.className = 'tx-details';
            
            const txAmount = document.createElement('div');
            txAmount.className = `tx-amount ${tx.type === 'received' ? 'positive' : 'negative'}`;
            txAmount.textContent = `${tx.type === 'received' ? '+' : '-'}${tx.amount.toFixed(8)} BTC`;
            
            const txId = document.createElement('div');
            txId.className = 'tx-id';
            txId.textContent = tx.txid;
            
            txDetails.appendChild(txAmount);
            txDetails.appendChild(txId);
            
            txItem.appendChild(txHeader);
            txItem.appendChild(txDetails);
            
            // Add click event to show transaction details
            txItem.addEventListener('click', () => showTransactionDetails(tx.txid));
            
            txList.appendChild(txItem);
        });
    }
    
    /**
     * Filter transaction history by type
     */
    function filterTransactionHistory() {
        const filter = document.getElementById('history-filter').value;
        const historyContainer = document.getElementById('address-history');
        
        if (!historyContainer.dataset.transactions) {
            return;
        }
        
        const transactions = JSON.parse(historyContainer.dataset.transactions);
        
        if (filter === 'all') {
            displayTransactions(transactions);
        } else {
            const filteredTransactions = transactions.filter(tx => tx.type === filter);
            displayTransactions(filteredTransactions);
        }
    }
    
    /**
     * Show transaction details in modal
     * @param {string} txid - Transaction ID
     */
    async function showTransactionDetails(txid) {
        updateStatus('Loading transaction details...', 'info');
        
        try {
            const tx = await bitcoinManager.getTransactionDetails(txid);
            
            const modalDetails = document.querySelector('.tx-modal-details');
            modalDetails.innerHTML = '';
            
            // Create transaction overview section
            const overviewSection = document.createElement('div');
            overviewSection.className = 'detail-section';
            
            const overviewTitle = document.createElement('h4');
            overviewTitle.textContent = 'Transaction Overview';
            overviewSection.appendChild(overviewTitle);
            
            // Add transaction details
            addDetailRow(overviewSection, 'Transaction ID', tx.txid);
            addDetailRow(overviewSection, 'Size', `${tx.size} bytes`);
            addDetailRow(overviewSection, 'Fee', `${tx.fee.toFixed(8)} BTC`);
            addDetailRow(overviewSection, 'Fee Rate', `${tx.feeRate} sat/vB`);
            addDetailRow(overviewSection, 'Confirmations', tx.confirmations.toString());
            addDetailRow(overviewSection, 'Timestamp', new Date(tx.timestamp * 1000).toLocaleString());
            
            modalDetails.appendChild(overviewSection);
            
            // Create inputs section
            const inputsSection = document.createElement('div');
            inputsSection.className = 'detail-section';
            
            const inputsTitle = document.createElement('h4');
            inputsTitle.textContent = 'Inputs';
            inputsSection.appendChild(inputsTitle);
            
            tx.inputs.forEach((input, index) => {
                addDetailRow(inputsSection, `Input #${index + 1}`, `${input.address} (${input.value.toFixed(8)} BTC)`);
            });
            
            modalDetails.appendChild(inputsSection);
            
            // Create outputs section
            const outputsSection = document.createElement('div');
            outputsSection.className = 'detail-section';
            
            const outputsTitle = document.createElement('h4');
            outputsTitle.textContent = 'Outputs';
            outputsSection.appendChild(outputsTitle);
            
            tx.outputs.forEach((output, index) => {
                addDetailRow(outputsSection, `Output #${index + 1}`, `${output.address} (${output.value.toFixed(8)} BTC)`);
            });
            
            modalDetails.appendChild(outputsSection);
            
            // Show modal
            document.getElementById('transaction-modal').style.display = 'block';
            
            updateStatus('Transaction details loaded', 'success');
        } catch (error) {
            updateStatus(`Failed to load transaction details: ${error.message}`, 'error');
        }
    }
    
    /**
     * Add a detail row to a section
     * @param {Element} section - Section to add row to
     * @param {string} label - Row label
     * @param {string} value - Row value
     */
    function addDetailRow(section, label, value) {
        const row = document.createElement('div');
        row.className = 'detail-row';
        
        const labelElement = document.createElement('div');
        labelElement.className = 'detail-label';
        labelElement.textContent = label;
        
        const valueElement = document.createElement('div');
        valueElement.className = 'detail-value';
        valueElement.textContent = value;
        
        row.appendChild(labelElement);
        row.appendChild(valueElement);
        
        section.appendChild(row);
    }
    
    /**
     * Copy text to clipboard
     * @param {Event} event - Click event
     */
    function copyToClipboard(event) {
        const button = event.target.closest('.copy-btn');
        const elementId = button.getAttribute('data-copy');
        const text = document.getElementById(elementId).textContent;
        
        navigator.clipboard.writeText(text)
            .then(() => {
                // Show temporary success indicator
                button.innerHTML = '<i class="fas fa-check" aria-hidden="true" title="Copied"></i>';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy" aria-hidden="true" title="Copy to clipboard"></i>';
                }, 2000);
                
                updateStatus('Copied to clipboard', 'success');
            })
            .catch(error => {
                updateStatus('Failed to copy to clipboard', 'error');
            });
    }
    
    /**
     * Update mempool statistics
     */
    function updateMempoolStats() {
        if (bitcoinManager.mempoolData) {
            document.getElementById('mempool-size').textContent = bitcoinManager.mempoolData.count || 0;
        }
        
        if (bitcoinManager.feeEstimates) {
            document.getElementById('next-block-fee').textContent = bitcoinManager.feeEstimates.fastestFee || 0;
        }
    }
    
    /**
     * Generate WalletConnect QR code
     */
    async function generateWalletConnectQR() {
        try {
            const qrContainer = document.getElementById('wallet-connect-qr');
            qrContainer.innerHTML = '<div class="loading">Generating QR code...</div>';
            
            updateStatus("Generating WalletConnect QR code...", "info");
            const qrCodeData = await walletConnectManager.generateQRCode();
            
            // Display the QR code
            qrContainer.innerHTML = '';
            const qrImage = document.createElement('img');
            qrImage.src = qrCodeData;
            qrImage.alt = 'WalletConnect QR Code';
            qrImage.style.width = '100%';
            qrImage.style.height = '100%';
            qrContainer.appendChild(qrImage);
            
            updateStatus("QR code generated. Scan with your mobile wallet", "success");
        } catch (error) {
            console.error("Failed to generate QR code:", error);
            document.getElementById('wallet-connect-qr').innerHTML = 
                '<div class="qr-placeholder error">Failed to generate QR code</div>';
            updateStatus("Failed to generate QR code", "error");
        }
    }
    
    /**
     * Connect wallet using WalletConnect
     */
    async function connectWalletConnect() {
        try {
            updateStatus("Connecting wallet...", "info");
            const result = await walletConnectManager.connectWallet();
            
            if (result.connected) {
                // Update UI to show connected status
                const statusDot = document.querySelector('.status-dot');
                if (statusDot) {
                    statusDot.classList.remove('disconnected');
                    statusDot.classList.add('connected');
                }
                
                // Update connection info
                const connectionInfo = document.querySelector('.connection-info .value');
                if (connectionInfo) {
                    connectionInfo.textContent = 
                        `Connected: ${result.account.substring(0, 6)}...${result.account.substring(result.account.length - 4)}`;
                }
                
                // Show admin panel if owner
                if (walletConnectManager.isPoolOwner()) {
                    const adminPanel = document.getElementById('admin-panel');
                    if (adminPanel) {
                        adminPanel.classList.remove('hidden');
                    }
                    
                    // Update pool contract info
                    updatePoolContractInfo();
                }
                
                updateStatus("Wallet connected successfully", "success");
            }
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            updateStatus("Failed to connect wallet", "error");
        }
    }
    
    /**
     * Initialize encryption bot client
     */
    async function initializeEncryptionBot() {
        try {
            updateStatus("Initializing encryption bot client...", "info");
            
            const result = await encryptionBotClient.initialize();
            
            if (result) {
                // Update UI to show initialized status
                const statusElement = document.getElementById('encryption-bot-status');
                const statusDot = document.getElementById('encryption-bot-status-dot');
                const clientIdElement = document.getElementById('encryption-client-id');
                
                if (statusElement) {
                    statusElement.textContent = "Initialized";
                }
                
                if (statusDot) {
                    statusDot.classList.remove('disconnected');
                    statusDot.classList.add('connected');
                }
                
                if (clientIdElement) {
                    clientIdElement.textContent = encryptionBotClient.clientId;
                }
                
                // Update GPG status
                const gpgStatusElement = document.getElementById('gpg-status');
                const gpgStatusDot = document.getElementById('gpg-status-dot');
                
                if (gpgStatusElement) {
                    gpgStatusElement.textContent = "Enabled";
                }
                
                if (gpgStatusDot) {
                    gpgStatusDot.classList.add('connected');
                }
                
                updateStatus("Encryption bot client initialized successfully", "success");
                
                // Update workflow visualizer
                workflowVisualizer.updateWithTransactionStatus({
                    walletVerified: true,
                    encryptionInitialized: true,
                    tokenCreated: false,
                    gpgSigned: false,
                    serverVerified: false,
                    transactionBroadcast: false
                });
            } else {
                updateStatus("Failed to initialize encryption bot client", "error");
            }
        } catch (error) {
            console.error("Failed to initialize encryption bot client:", error);
            updateStatus("Failed to initialize encryption bot client", "error");
        }
    }
    
    /**
     * Update pool contract info
     */
    async function updatePoolContractInfo() {
        try {
            if (walletConnectManager.isWalletConnected()) {
                const poolBalance = await walletConnectManager.getPoolBalance();
                const poolBalanceElement = document.getElementById('pool-balance');
                if (poolBalanceElement) {
                    poolBalanceElement.textContent = `${poolBalance} BTC`;
                }
                
                const isOwner = walletConnectManager.isPoolOwner();
                const ownerStatusElement = document.getElementById('owner-status');
                if (ownerStatusElement) {
                    ownerStatusElement.textContent = isOwner ? 'Yes' : 'No';
                }
                
                const adminPanel = document.getElementById('admin-panel');
                if (adminPanel) {
                    if (isOwner) {
                        adminPanel.classList.remove('hidden');
                    } else {
                        adminPanel.classList.add('hidden');
                    }
                }
            }
        } catch (error) {
            console.error("Failed to update pool contract info:", error);
            updateStatus("Failed to update pool contract info", "error");
        }
    }
    
    /**
     * Update status message
     * @param {string} message - Status message
     * @param {string} type - Message type (info, success, error)
     */
    function updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = message;
        
        // Remove all status classes
        statusElement.classList.remove('info', 'success', 'error');
        
        // Add appropriate class
        statusElement.classList.add(type);
    }
});
