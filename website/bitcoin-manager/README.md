# Bitcoin Transaction Manager

A secure, client-side GUI application for Bitcoin transaction management with CPFP (Child Pays For Parent), RBF (Replace By Fee), and address history functionality.

## Features

- **Wallet Management**: Load wallets using private keys (WIF) or seed phrases
- **Replace-By-Fee (RBF)**: Speed up unconfirmed transactions by replacing them with higher fee versions
- **Child Pays For Parent (CPFP)**: Create child transactions with higher fees to speed up confirmation of parent transactions
- **Address History**: View transaction history for any Bitcoin address
- **Real-time Mempool Data**: Monitor current mempool statistics and recommended fee rates

## Security Features

- **Client-side Processing**: All cryptographic operations are performed locally in your browser
- **No Private Key Storage**: Private keys and seed phrases are never stored or transmitted
- **Direct Blockchain Interaction**: Connects directly to blockchain APIs without intermediaries

## Usage

1. **Load a Wallet**:
   - Enter your private key (WIF) or seed phrase in the Wallet tab
   - Click "Load Wallet" to generate addresses and check balances

2. **Replace-By-Fee (RBF)**:
   - Enter the transaction ID of an unconfirmed transaction
   - Adjust the fee rate using the slider
   - Click "Replace Transaction" to broadcast the RBF transaction

3. **Child Pays For Parent (CPFP)**:
   - Enter the transaction ID of an unconfirmed parent transaction
   - Set the fee rate for the child transaction
   - Click "Create Child Transaction" to broadcast

4. **View Address History**:
   - Enter any Bitcoin address
   - Click "Load History" to view all transactions
   - Filter by transaction type (sent/received)
   - Click on any transaction to view detailed information

## Technical Implementation

- Pure JavaScript implementation with no external dependencies
- Uses multiple blockchain APIs for redundancy and reliability
- Implements Bitcoin transaction creation and signing according to the Bitcoin protocol
- Supports all address types: Legacy (P2PKH), SegWit (P2SH-P2WPKH), and Native SegWit (P2WPKH)

## Security Recommendations

- Always verify transaction details before broadcasting
- Use a hardware wallet for high-value transactions
- Run this application on a secure, malware-free computer
- Consider using a VPN when accessing blockchain services

## Disclaimer

This tool is provided for educational and development purposes only. Always exercise caution when handling cryptocurrency transactions. The developers are not responsible for any loss of funds resulting from the use of this application.

## License

This project is part of the BHE.BitcoinHardendEtherumProject and is subject to its licensing terms.
