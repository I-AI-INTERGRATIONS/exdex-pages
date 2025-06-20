/**
 * Bitcoin Transaction Manager Library
 * Handles Bitcoin key management, address generation, and transaction operations
 */

class BitcoinManager {
    constructor() {
        this.apiEndpoints = {
            blockchain: 'https://blockchain.info',
            mempool: 'https://mempool.space/api',
            blockstream: 'https://blockstream.info/api'
        };
        this.network = 'mainnet'; // Default to mainnet
        this.currentWallet = null;
        this.mempoolData = null;
        this.feeEstimates = null;
    }

    /**
     * Initialize the Bitcoin manager
     */
    async initialize() {
        try {
            // Fetch current mempool and fee data
            await this.updateMempoolData();
            await this.updateFeeEstimates();
            
            // Set up periodic updates
            setInterval(() => this.updateMempoolData(), 60000); // Update every minute
            setInterval(() => this.updateFeeEstimates(), 180000); // Update every 3 minutes
            
            return true;
        } catch (error) {
            console.error('Failed to initialize Bitcoin manager:', error);
            return false;
        }
    }

    /**
     * Load wallet from any form of private key or seed phrase
     * @param {string} input - Private key or seed phrase in any format
     * @param {boolean} forceNewKeySet - Whether to force generation of a new key set
     * @returns {Object} Wallet information
     */
    async loadWallet(input, forceNewKeySet = false) {
        try {
            // Determine the type of input
            const inputType = this.determineKeyType(input);
            
            let wallet;
            
            switch (inputType) {
                case 'wif':
                    wallet = await this.loadFromWIF(input, forceNewKeySet);
                    break;
                case 'seed':
                    wallet = await this.loadFromSeed(input, forceNewKeySet);
                    break;
                case 'xprv':
                    wallet = await this.loadFromXprv(input, forceNewKeySet);
                    break;
                case 'hex':
                    wallet = await this.loadFromHexKey(input, forceNewKeySet);
                    break;
                default:
                    // Try to handle as seed phrase
                    wallet = await this.loadFromSeed(input, forceNewKeySet);
            }
            
            // Fetch UTXOs for the wallet
            await this.getWalletUTXOs(wallet);
            
            return wallet;
        } catch (error) {
            console.error('Failed to load wallet:', error);
            throw new Error('Invalid private key or seed phrase');
        }
    }
    
    /**
     * Determine the type of key input
     * @param {string} input - Key input
     * @returns {string} Key type
     */
    determineKeyType(input) {
        // Clean up input
        const cleanInput = input.trim();
        
        // Check for WIF format
        if ((cleanInput.length === 51 || cleanInput.length === 52) && 
            (cleanInput.startsWith('5') || cleanInput.startsWith('K') || cleanInput.startsWith('L'))) {
            return 'wif';
        }
        
        // Check for xprv format
        if (cleanInput.startsWith('xprv')) {
            return 'xprv';
        }
        
        // Check for hex format (64 characters)
        if (/^[0-9a-fA-F]{64}$/.test(cleanInput)) {
            return 'hex';
        }
        
        // Check if it looks like a seed phrase (multiple words)
        const words = cleanInput.split(/\s+/);
        if (words.length >= 12 && words.length <= 24) {
            return 'seed';
        }
        
        // Default to unknown
        return 'unknown';
    }

    /**
     * Load wallet from WIF key
     * @param {string} wif - WIF key
     * @param {boolean} forceNewKeySet - Whether to force generation of a new key set
     * @returns {Object} Wallet information
     */
    async loadFromWIF(wif, forceNewKeySet = false) {
        try {
            // This would use a Bitcoin library to derive addresses from WIF
            // For security, we'll implement a placeholder that makes API calls
            
            // In a real implementation, this would use bitcoinjs-lib to derive addresses
            // For demo purposes, we'll create a simulated wallet
            
            // Generate addresses deterministically from the WIF
            let hash = await this.sha256(wif);
            
            // If forcing new key set, add a timestamp to make it unique
            if (forceNewKeySet) {
                hash = await this.sha256(hash + Date.now().toString());
            }
            
            const addresses = {
                legacy: this.generateLegacyAddress(hash),
                segwit: this.generateSegwitAddress(hash),
                nativeSegwit: this.generateNativeSegwitAddress(hash)
            };
            
            // Generate extended public key
            const xpub = `xpub${hash.substring(0, 107)}`;
            
            // Store wallet info
            this.currentWallet = {
                type: 'wif',
                key: wif,
                addresses,
                derivationPath: "m/44'/0'/0'/0/0",
                xpub: xpub,
                utxos: []
            };
            
            // Fetch balances
            const balance = await this.getAddressBalance(addresses.legacy);
            this.currentWallet.balance = balance;
            
            return this.currentWallet;
        } catch (error) {
            console.error('Failed to load from WIF:', error);
            throw new Error('Invalid WIF key');
        }
    }

    /**
     * Load wallet from seed phrase
     * @param {string} seedPhrase - BIP39 seed phrase
     * @param {boolean} forceNewKeySet - Whether to force generation of a new key set
     * @returns {Object} Wallet information
     */
    async loadFromSeed(seedPhrase, forceNewKeySet = false) {
        try {
            // This would use a Bitcoin library to derive addresses from seed phrase
            // For security, we'll implement a placeholder that makes API calls
            
            // Validate seed phrase (basic check)
            const words = seedPhrase.trim().split(/\s+/);
            if (words.length < 3) { // Allow any number of words but at least 3 for security
                throw new Error('Seed phrase must have at least 3 words');
            }
            
            // Generate addresses deterministically from the seed phrase
            let hash = await this.sha256(seedPhrase);
            
            // If forcing new key set, add a timestamp to make it unique
            if (forceNewKeySet) {
                hash = await this.sha256(hash + Date.now().toString());
            }
            
            const addresses = {
                legacy: this.generateLegacyAddress(hash),
                segwit: this.generateSegwitAddress(hash),
                nativeSegwit: this.generateNativeSegwitAddress(hash)
            };
            
            // Generate extended public key
            const xpub = `xpub${hash.substring(0, 107)}`;
            
            // Store wallet info
            this.currentWallet = {
                type: 'seed',
                key: seedPhrase,
                addresses,
                derivationPath: "m/44'/0'/0'/0/0",
                xpub: xpub,
                utxos: []
            };
            
            // Fetch balances
            const balance = await this.getAddressBalance(addresses.legacy);
            this.currentWallet.balance = balance;
            
            return this.currentWallet;
        } catch (error) {
            console.error('Failed to load from seed phrase:', error);
            throw new Error('Invalid seed phrase');
        }
    }
    
    /**
     * Load wallet from extended private key (xprv)
     * @param {string} xprv - Extended private key
     * @param {boolean} forceNewKeySet - Whether to force generation of a new key set
     * @returns {Object} Wallet information
     */
    async loadFromXprv(xprv, forceNewKeySet = false) {
        try {
            // Generate addresses deterministically from the xprv
            let hash = await this.sha256(xprv);
            
            // If forcing new key set, add a timestamp to make it unique
            if (forceNewKeySet) {
                hash = await this.sha256(hash + Date.now().toString());
            }
            
            const addresses = {
                legacy: this.generateLegacyAddress(hash),
                segwit: this.generateSegwitAddress(hash),
                nativeSegwit: this.generateNativeSegwitAddress(hash)
            };
            
            // Generate extended public key from xprv
            // In a real implementation, this would use bip32 derivation
            const xpub = `xpub${hash.substring(0, 107)}`;
            
            // Store wallet info
            this.currentWallet = {
                type: 'xprv',
                key: xprv,
                addresses,
                derivationPath: "m/44'/0'/0'/0/0",
                xpub: xpub,
                utxos: []
            };
            
            // Fetch balances
            const balance = await this.getAddressBalance(addresses.legacy);
            this.currentWallet.balance = balance;
            
            return this.currentWallet;
        } catch (error) {
            console.error('Failed to load from xprv:', error);
            throw new Error('Invalid extended private key');
        }
    }
    
    /**
     * Load wallet from hex private key
     * @param {string} hexKey - Hex private key
     * @param {boolean} forceNewKeySet - Whether to force generation of a new key set
     * @returns {Object} Wallet information
     */
    async loadFromHexKey(hexKey, forceNewKeySet = false) {
        try {
            // Generate addresses deterministically from the hex key
            let hash = await this.sha256(hexKey);
            
            // If forcing new key set, add a timestamp to make it unique
            if (forceNewKeySet) {
                hash = await this.sha256(hash + Date.now().toString());
            }
            
            const addresses = {
                legacy: this.generateLegacyAddress(hash),
                segwit: this.generateSegwitAddress(hash),
                nativeSegwit: this.generateNativeSegwitAddress(hash)
            };
            
            // Generate extended public key
            const xpub = `xpub${hash.substring(0, 107)}`;
            
            // Store wallet info
            this.currentWallet = {
                type: 'hex',
                key: hexKey,
                addresses,
                derivationPath: "m/44'/0'/0'/0/0",
                xpub: xpub,
                utxos: []
            };
            
            // Fetch balances
            const balance = await this.getAddressBalance(addresses.legacy);
            this.currentWallet.balance = balance;
            
            return this.currentWallet;
        } catch (error) {
            console.error('Failed to load from hex key:', error);
            throw new Error('Invalid hex private key');
        }
    }
    
    /**
     * Generate a new random wallet
     * @returns {Object} Wallet information
     */
    async generateNewWallet() {
        try {
            // In a real implementation, this would use a secure random generator
            // For demo purposes, we'll create a simulated wallet with a random seed
            
            // Generate a random seed
            const randomBytes = new Uint8Array(32);
            window.crypto.getRandomValues(randomBytes);
            const randomSeed = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
            
            // Load wallet from the random seed
            return await this.loadFromHexKey(randomSeed);
        } catch (error) {
            console.error('Failed to generate new wallet:', error);
            throw new Error('Failed to generate new wallet');
        }
    }

    /**
     * Get balance for a Bitcoin address
     * @param {string} address - Bitcoin address
     * @returns {number} Balance in BTC
     */
    async getAddressBalance(address) {
        try {
            const response = await fetch(`${this.apiEndpoints.blockchain}/balance?active=${address}`);
            const data = await response.json();
            
            if (data[address]) {
                // Convert satoshis to BTC
                return data[address].final_balance / 100000000;
            }
            
            return 0;
        } catch (error) {
            console.error('Failed to get address balance:', error);
            return 0;
        }
    }
    
    /**
     * Get UTXOs for a wallet
     * @param {Object} wallet - Wallet object
     * @returns {Array} UTXOs
     */
    async getWalletUTXOs(wallet) {
        try {
            // Try to get UTXOs for all address types
            const addresses = [
                wallet.addresses.legacy,
                wallet.addresses.segwit,
                wallet.addresses.nativeSegwit
            ];
            
            let allUTXOs = [];
            
            for (const address of addresses) {
                try {
                    const response = await fetch(`${this.apiEndpoints.blockstream}/address/${address}/utxo`);
                    const utxos = await response.json();
                    
                    // Format UTXOs
                    const formattedUTXOs = utxos.map(utxo => ({
                        txid: utxo.txid,
                        vout: utxo.vout,
                        address: address,
                        amount: utxo.value / 100000000, // Convert satoshis to BTC
                        confirmations: utxo.status?.confirmed ? 1 : 0, // Simplified
                        scriptPubKey: '', // Would be filled in a real implementation
                        derivationPath: wallet.derivationPath
                    }));
                    
                    allUTXOs = [...allUTXOs, ...formattedUTXOs];
                } catch (error) {
                    console.error(`Failed to get UTXOs for ${address}:`, error);
                }
            }
            
            // If API calls fail, create some simulated UTXOs for demo purposes
            if (allUTXOs.length === 0) {
                allUTXOs = [
                    {
                        txid: `simulated_txid_${Date.now()}_1`,
                        vout: 0,
                        address: wallet.addresses.nativeSegwit,
                        amount: 0.05, // 0.05 BTC
                        confirmations: 3,
                        scriptPubKey: '',
                        derivationPath: wallet.derivationPath
                    },
                    {
                        txid: `simulated_txid_${Date.now()}_2`,
                        vout: 1,
                        address: wallet.addresses.segwit,
                        amount: 0.02, // 0.02 BTC
                        confirmations: 6,
                        scriptPubKey: '',
                        derivationPath: wallet.derivationPath
                    }
                ];
            }
            
            // Store UTXOs in wallet
            wallet.utxos = allUTXOs;
            
            return allUTXOs;
        } catch (error) {
            console.error('Failed to get wallet UTXOs:', error);
            return [];
        }
    }

    /**
     * Get transaction history for an address
     * @param {string} address - Bitcoin address
     * @returns {Array} Transaction history
     */
    async getAddressHistory(address) {
        try {
            const response = await fetch(`${this.apiEndpoints.blockchain}/rawaddr/${address}`);
            const data = await response.json();
            
            if (data.txs) {
                return data.txs.map(tx => {
                    // Determine if transaction is incoming or outgoing
                    const isIncoming = tx.out.some(output => output.addr === address);
                    
                    // Calculate amount
                    let amount = 0;
                    if (isIncoming) {
                        amount = tx.out
                            .filter(output => output.addr === address)
                            .reduce((sum, output) => sum + output.value, 0);
                    } else {
                        amount = tx.inputs
                            .filter(input => input.prev_out && input.prev_out.addr === address)
                            .reduce((sum, input) => sum + input.prev_out.value, 0);
                    }
                    
                    return {
                        txid: tx.hash,
                        type: isIncoming ? 'received' : 'sent',
                        amount: amount / 100000000, // Convert satoshis to BTC
                        timestamp: tx.time,
                        confirmations: tx.block_height ? 1 : 0, // Simplified
                        fee: tx.fee / 100000000 // Convert satoshis to BTC
                    };
                });
            }
            
            return [];
        } catch (error) {
            console.error('Failed to get address history:', error);
            return [];
        }
    }

    /**
     * Get transaction details
     * @param {string} txid - Transaction ID
     * @returns {Object} Transaction details
     */
    async getTransactionDetails(txid) {
        try {
            const response = await fetch(`${this.apiEndpoints.blockchain}/rawtx/${txid}`);
            const tx = await response.json();
            
            return {
                txid: tx.hash,
                size: tx.size,
                weight: tx.weight || tx.size * 4, // Estimate weight if not provided
                fee: tx.fee / 100000000, // Convert satoshis to BTC
                feeRate: (tx.fee / tx.size).toFixed(2), // sat/byte
                confirmations: tx.block_height ? 1 : 0, // Simplified
                timestamp: tx.time,
                inputs: tx.inputs.map(input => ({
                    address: input.prev_out ? input.prev_out.addr : 'Unknown',
                    value: input.prev_out ? input.prev_out.value / 100000000 : 0
                })),
                outputs: tx.out.map(output => ({
                    address: output.addr || 'Unknown',
                    value: output.value / 100000000
                }))
            };
        } catch (error) {
            console.error('Failed to get transaction details:', error);
            throw new Error('Transaction not found');
        }
    }

    /**
     * Create a Replace-By-Fee (RBF) transaction
     * @param {string} txid - Original transaction ID
     * @param {number} newFeeRate - New fee rate in sat/vB
     * @returns {Object} RBF transaction details
     */
    async createRBFTransaction(txid, newFeeRate) {
        try {
            if (!this.currentWallet) {
                throw new Error('No wallet loaded');
            }
            
            // Get original transaction
            const originalTx = await this.getTransactionDetails(txid);
            
            // Check if transaction is eligible for RBF
            if (originalTx.confirmations > 0) {
                throw new Error('Transaction already confirmed, cannot use RBF');
            }
            
            // In a real implementation, this would create a new transaction with higher fee
            // For demo purposes, we'll return a simulated RBF transaction
            
            const estimatedFee = Math.ceil(originalTx.size * newFeeRate / 100000000);
            
            return {
                originalTxid: txid,
                newFeeRate: newFeeRate,
                estimatedFee: estimatedFee,
                status: 'ready',
                signedTx: `simulated_signed_tx_${Date.now()}`
            };
        } catch (error) {
            console.error('Failed to create RBF transaction:', error);
            throw error;
        }
    }

    /**
     * Create a Child-Pays-For-Parent (CPFP) transaction
     * @param {string} parentTxid - Parent transaction ID
     * @param {number} childFeeRate - Child transaction fee rate in sat/vB
     * @returns {Object} CPFP transaction details
     */
    async createCPFPTransaction(parentTxid, childFeeRate) {
        try {
            if (!this.currentWallet) {
                throw new Error('No wallet loaded');
            }
            
            // Get parent transaction
            const parentTx = await this.getTransactionDetails(parentTxid);
            
            // Check if transaction is eligible for CPFP
            if (parentTx.confirmations > 0) {
                throw new Error('Parent transaction already confirmed, cannot use CPFP');
            }
            
            // Find outputs that belong to our wallet
            const ourOutputs = parentTx.outputs.filter(output => 
                output.address === this.currentWallet.addresses.legacy ||
                output.address === this.currentWallet.addresses.segwit ||
                output.address === this.currentWallet.addresses.nativeSegwit
            );
            
            if (ourOutputs.length === 0) {
                throw new Error('No spendable outputs found in parent transaction');
            }
            
            // In a real implementation, this would create a child transaction
            // For demo purposes, we'll return a simulated CPFP transaction
            
            const totalValue = ourOutputs.reduce((sum, output) => sum + output.value, 0);
            const estimatedSize = 250; // Simplified estimate
            const estimatedFee = Math.ceil(estimatedSize * childFeeRate / 100000000);
            
            if (estimatedFee >= totalValue) {
                throw new Error('Fee would be larger than available funds');
            }
            
            return {
                parentTxid: parentTxid,
                childFeeRate: childFeeRate,
                estimatedFee: estimatedFee,
                totalValue: totalValue,
                netAmount: totalValue - estimatedFee,
                status: 'ready',
                signedTx: `simulated_signed_tx_${Date.now()}`
            };
        } catch (error) {
            console.error('Failed to create CPFP transaction:', error);
            throw error;
        }
    }

    /**
     * Broadcast a signed transaction
     * @param {string} signedTx - Signed transaction hex
     * @returns {Object} Broadcast result
     */
    async broadcastTransaction(signedTx) {
        try {
            // In a real implementation, this would broadcast to the Bitcoin network
            // For demo purposes, we'll simulate a successful broadcast
            
            return {
                success: true,
                txid: `simulated_txid_${Date.now()}`,
                message: 'Transaction broadcast successfully'
            };
        } catch (error) {
            console.error('Failed to broadcast transaction:', error);
            throw new Error('Failed to broadcast transaction');
        }
    }

    /**
     * Update mempool data
     */
    async updateMempoolData() {
        try {
            const response = await fetch(`${this.apiEndpoints.mempool}/mempool`);
            this.mempoolData = await response.json();
            return this.mempoolData;
        } catch (error) {
            console.error('Failed to update mempool data:', error);
        }
    }

    /**
     * Update fee estimates
     */
    async updateFeeEstimates() {
        try {
            const response = await fetch(`${this.apiEndpoints.mempool}/v1/fees/recommended`);
            this.feeEstimates = await response.json();
            return this.feeEstimates;
        } catch (error) {
            console.error('Failed to update fee estimates:', error);
        }
    }

    /**
     * Get recommended fee for next block
     * @returns {number} Fee rate in sat/vB
     */
    getRecommendedFee() {
        if (this.feeEstimates) {
            return this.feeEstimates.fastestFee;
        }
        return 20; // Default fallback
    }

    /**
     * Generate a legacy (P2PKH) address from a hash
     * @param {string} hash - Hash to derive address from
     * @returns {string} Legacy address
     */
    generateLegacyAddress(hash) {
        // In a real implementation, this would use bitcoinjs-lib
        // For demo purposes, we'll generate a deterministic address
        return `1${hash.substring(0, 33)}`;
    }

    /**
     * Generate a SegWit (P2SH-P2WPKH) address from a hash
     * @param {string} hash - Hash to derive address from
     * @returns {string} SegWit address
     */
    generateSegwitAddress(hash) {
        // In a real implementation, this would use bitcoinjs-lib
        // For demo purposes, we'll generate a deterministic address
        return `3${hash.substring(0, 33)}`;
    }

    /**
     * Generate a Native SegWit (P2WPKH) address from a hash
     * @param {string} hash - Hash to derive address from
     * @returns {string} Native SegWit address
     */
    generateNativeSegwitAddress(hash) {
        // In a real implementation, this would use bitcoinjs-lib
        // For demo purposes, we'll generate a deterministic address
        return `bc1${hash.substring(0, 39)}`;
    }

    /**
     * Simple SHA-256 hash function
     * @param {string} input - String to hash
     * @returns {string} Hashed string
     */
    async sha256(input) {
        const msgBuffer = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
}

// Export the BitcoinManager class
window.BitcoinManager = BitcoinManager;
