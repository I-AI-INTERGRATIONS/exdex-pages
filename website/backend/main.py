from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
from bitcoinlib.wallets import Wallet as BTCWallet
from web3 import Web3
from knox_wallet import KnoxWallet
from slice_of_life import LifeSlice
import logging
import subprocess
import tempfile
from typing import Optional
import requests
from fastapi import Query
import coinpayments
import hashlib

app = FastAPI()

# --- Logging Setup ---
logging.basicConfig(filename='opsec_log.txt', level=logging.INFO, format='%(asctime)s %(message)s')

# --- Blockchain Wallet Models ---
class WalletCreateRequest(BaseModel):
    blockchain: str  # 'btc' or 'eth'
    wallet_type: str = "standard"  # 'standard' or 'knox'

class WalletRecoveryRequest(BaseModel):
    blockchain: str
    mnemonic: str

class TransactionRequest(BaseModel):
    blockchain: str
    from_address: str
    to_address: str
    amount: float
    private_key: str

class WalletImportBalanceRequest(BaseModel):
    blockchain: str
    mnemonic: str

class PaymentRequest(BaseModel):
    blockchain: str
    from_address: str
    to_address: str
    amount: float
    private_key: str

# --- AI Assistant Models ---
class AIChatRequest(BaseModel):
    message: str

# --- Card Payment Model ---
class PaymentRequest(BaseModel):
    amount: float
    currency: str  # Can be crypto or fiat
    customer_email: str
    metadata: dict = None
    payment_method: str = "crypto"  # 'crypto' or 'atm'
    crypto_currency: str = "BTC"  # BTC, ETH, USDT, LTC, DOGE, XRP, BCH, ADA, SOL, DOT
    fiat_currency: str = "USD"  # USD, EUR, GBP, AUD, CAD, JPY

# --- Card BIN and User Card Generation ---
CARD_BIN = "420769"

def generate_user_card_number(smart_contract_address: str, use_first_half: bool = True) -> str:
    # Remove '0x' prefix if present and all non-digit/letter chars
    addr = smart_contract_address.lower().replace('0x', '')
    # Only use hex chars, remove any non-hex chars (for robustness)
    addr = ''.join(c for c in addr if c in '0123456789abcdef')
    half = len(addr) // 2
    if use_first_half:
        card_body = addr[:half]
    else:
        card_body = addr[half:]
    # Pad/truncate card_body to 10 digits (BIN is 6, card is 16)
    card_body = card_body[:10].ljust(10, '0')
    card_number = CARD_BIN + card_body
    return card_number

# --- BTC Wallet Logic ---
def create_btc_wallet(req: WalletCreateRequest):
    if req.wallet_type == "knox":
        knox = KnoxWallet.create()
        address = knox.get_address()
        mnemonic = knox.get_mnemonic()
        logging.info(f"Knox BTC wallet created: {address}")
        return {
            "address": address,
            "mnemonic": mnemonic,
            "wallet_type": "knox"
        }
    else:
        w = BTCWallet.create('BHE_BTC_WALLET', witness_type='segwit', network='bitcoin')
        mnemonic = w.mnemonic
        address = w.get_key().address
        logging.info(f"BTC wallet created: {address}")
        return {"address": address, "mnemonic": mnemonic, "wallet_type": "standard"}

def recover_btc_wallet(mnemonic):
    w = BTCWallet.create('BHE_BTC_WALLET_RECOVERED', keys=mnemonic, witness_type='segwit', network='bitcoin')
    address = w.get_key().address
    logging.info(f"BTC wallet recovered: {address}")
    return {"address": address, "mnemonic": mnemonic}

def send_btc_transaction(from_address, to_address, amount, private_key):
    # NOTE: Real implementation would require UTXO management and fee calculation
    # This is a placeholder for demonstration
    logging.info(f"BTC send: {amount} from {from_address} to {to_address}")
    return {"txid": "btc_real_txid", "status": "broadcasted"}

# --- ETH Wallet Logic ---
INFURA_URL = os.getenv('INFURA_URL', 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID')
w3 = Web3(Web3.HTTPProvider(INFURA_URL))

def create_eth_wallet():
    acct = w3.eth.account.create()
    address = acct.address
    mnemonic = acct._private_key.hex()
    logging.info(f"ETH wallet created: {address}")
    return {"address": address, "mnemonic": mnemonic}

def recover_eth_wallet(mnemonic):
    try:
        # Try standard recovery first
        acct = w3.eth.account.from_mnemonic(mnemonic)
        address = acct.address
        logging.info(f"ETH wallet recovered: {address}")
        
        # Check balance
        balance = w3.eth.get_balance(address)
        
        # Check transaction history
        tx_count = w3.eth.get_transaction_count(address)
        
        return {
            "address": address,
            "mnemonic": mnemonic,
            "balance": balance,
            "transaction_count": tx_count,
            "status": "success"
        }
    except Exception as e:
        logging.error(f"Error recovering ETH wallet: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to recover wallet")

def send_eth_transaction(from_address, to_address, amount, private_key):
    acct = w3.eth.account.from_key(private_key)
    tx = {
        'nonce': w3.eth.get_transaction_count(from_address),
        'to': to_address,
        'value': w3.to_wei(amount, 'ether'),
        'gas': 21000,
        'gasPrice': w3.eth.gas_price,
        'chainId': 1
    }
    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logging.info(f"ETH send: {amount} from {from_address} to {to_address} | TX: {tx_hash.hex()}")
    return {"txid": tx_hash.hex(), "status": "broadcasted"}

# --- Wallet Endpoints ---
@app.post("/create_wallet")
async def create_wallet(req: WalletCreateRequest):
    try:
        if req.blockchain == "btc":
            return create_btc_wallet(req)
        elif req.blockchain == "eth":
            return create_eth_wallet()
        elif req.blockchain == "ltc":
            return create_ltc_wallet(req)
        elif req.blockchain == "doge":
            return create_doge_wallet(req)
        else:
            raise HTTPException(status_code=400, detail="Invalid blockchain type")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/wallet/balance/{address}/{currency}")
async def get_wallet_balance(address: str, currency: str):
    try:
        if currency == "BTC":
            balance = await get_btc_balance(address)
        elif currency == "ETH":
            balance = await get_eth_balance(address)
        elif currency == "LTC":
            balance = await get_ltc_balance(address)
        elif currency == "DOGE":
            balance = await get_doge_balance(address)
        else:
            raise HTTPException(status_code=400, detail="Unsupported currency")
            
        return {
            "address": address,
            "balance": balance,
            "currency": currency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    try:
        if req.blockchain == "btc":
            return create_btc_wallet(req)
        elif req.blockchain == "eth":
            return create_eth_wallet()
        else:
            raise HTTPException(status_code=400, detail="Invalid blockchain type")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recover_wallet")
async def recover_wallet(req: WalletRecoveryRequest):
    try:
        if req.blockchain == 'btc':
            return recover_btc_wallet(req.mnemonic)
        elif req.blockchain == 'eth':
            return recover_eth_wallet(req.mnemonic)
        else:
            raise HTTPException(status_code=400, detail="Unsupported blockchain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/wallet/send")
def send_transaction(req: TransactionRequest):
    if req.blockchain == 'btc':
        return send_btc_transaction(req.from_address, req.to_address, req.amount, req.private_key)
    elif req.blockchain == 'eth':
        return send_eth_transaction(req.from_address, req.to_address, req.amount, req.private_key)
    else:
        raise HTTPException(status_code=400, detail="Unsupported blockchain")

@app.post("/wallet/payment")
def payment(req: PaymentRequest):
    if req.blockchain == 'btc':
        return send_btc_transaction(req.from_address, req.to_address, req.amount, req.private_key)
    elif req.blockchain == 'eth':
        return send_eth_transaction(req.from_address, req.to_address, req.amount, req.private_key)
    else:
        raise HTTPException(status_code=400, detail="Unsupported blockchain")

@app.post("/wallet/import-and-balance")
def import_and_balance(req: WalletImportBalanceRequest):
    if req.blockchain == 'btc':
        # Recover BTC wallet
        result = recover_btc_wallet(req.mnemonic)
        address = result["address"]
        # Get BTC balance from blockchain.info
        try:
            url = f"https://blockchain.info/rawaddr/{address}?cors=true"
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                balance = data.get("final_balance", 0)
            else:
                balance = None
        except Exception as e:
            balance = None
        return {"address": address, "balance": balance, "mnemonic": req.mnemonic}
    elif req.blockchain == 'eth':
        # Recover ETH wallet
        result = recover_eth_wallet(req.mnemonic)
        address = result["address"]
        # Get ETH balance via Web3
        try:
            balance = w3.eth.get_balance(address)
        except Exception as e:
            balance = None
        return {"address": address, "balance": balance, "mnemonic": req.mnemonic}
    else:
        raise HTTPException(status_code=400, detail="Unsupported blockchain")

# --- Card Payment Processing Endpoint (Local PPC Only) ---
@app.post("/payment/process")
async def process_payment(req: PaymentRequest):
    try:
        # Initialize CoinPayments
        cp = coinpayments.CoinPaymentsAPI(
            public_key=os.getenv('COINPAYMENTS_PUBLIC_KEY'),
            private_key=os.getenv('COINPAYMENTS_PRIVATE_KEY')
        )
        
        # Create payment request
        payment_params = {
            'amount': req.amount,
            'currency1': req.currency,
            'currency2': req.crypto_currency if req.payment_method == "crypto" else "BTC",
            'buyer_email': req.customer_email,
            'item_name': 'BHE Token Purchase',
            'item_number': hashlib.sha256(str(datetime.now()).encode()).hexdigest()[:8],
            'ipn_url': f"{os.getenv('BASE_URL')}/ipn",
            'success_url': f"{os.getenv('BASE_URL')}/success",
            'cancel_url': f"{os.getenv('BASE_URL')}/cancel"
        }
        
        # Add additional parameters based on payment method
        if req.payment_method == "atm":
            payment_params.update({
                'payment_method': 'atm',
                'fiat_currency': req.fiat_currency,
                'atm_location': req.metadata.get('atm_location', 'nearest')
            })
        
        payment = cp.create_transaction(payment_params)
        
        # Generate QR code for crypto payments
        if req.payment_method == "crypto":
            qr_data = f"{req.crypto_currency.lower()}:{payment['result']['address']}?amount={payment['result']['amount']}"
            qr = QRCode(qr_data)
            qr.save(f"qr_codes/{payment['result']['txn_id']}.png")
        
        return {
            'payment_address': payment['result']['address'],
            'amount': payment['result']['amount'],
            'status_url': payment['result']['status_url'],
            'transaction_id': payment['result']['txn_id'],
            'payment_method': req.payment_method,
            'crypto_currency': req.crypto_currency if req.payment_method == "crypto" else None,
            'fiat_currency': req.fiat_currency if req.payment_method == "atm" else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    try:
        # Initialize CoinPayments
        cp = coinpayments.CoinPaymentsAPI(
            public_key=os.getenv('COINPAYMENTS_PUBLIC_KEY'),
            private_key=os.getenv('COINPAYMENTS_PRIVATE_KEY')
        )
        
        # Create payment request
        payment = cp.create_transaction({
            'amount': req.amount,
            'currency1': req.currency,
            'currency2': 'BTC',  # Convert to BTC
            'buyer_email': req.customer_email,
            'item_name': 'BHE Token Purchase',
            'item_number': hashlib.sha256(str(datetime.now()).encode()).hexdigest()[:8],
            'ipn_url': f"{os.getenv('BASE_URL')}/ipn",
            'success_url': f"{os.getenv('BASE_URL')}/success",
            'cancel_url': f"{os.getenv('BASE_URL')}/cancel"
        })
        
        return {
            'payment_address': payment['result']['address'],
            'amount': payment['result']['amount'],
            'status_url': payment['result']['status_url'],
            'transaction_id': payment['result']['txn_id']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # Validate destination
    if req.destination != "my_ppc":
        raise HTTPException(status_code=403, detail="Payments can only be processed to your PPC.")
    # (Optional) Basic validation
    if not req.card_number.isdigit() or len(req.card_number) < 12:
        raise HTTPException(status_code=400, detail="Invalid card number.")
    # Forward to local PPC endpoint
    ppc_url = "http://127.0.0.1:9000/ppc/process"
    try:
        payload = {
            "card_number": req.card_number,
            "expiry": req.expiry,
            "cvc": req.cvc,
            "amount": req.amount,
            "currency": req.currency
        }
        resp = requests.post(ppc_url, json=payload, timeout=10)
        return {"ppc_status": resp.status_code, "ppc_response": resp.json() if resp.status_code == 200 else resp.text}
    except Exception as e:
        return {"error": str(e)}

# --- Card Generation Endpoint ---
@app.get("/card/generate")
def card_generate(smart_contract: str = Query(...), half: str = Query('first')):
    use_first_half = (half == 'first')
    card_number = generate_user_card_number(smart_contract, use_first_half)
    return {"card_number": card_number, "bin": CARD_BIN, "smart_contract": smart_contract, "half": half}

# --- Rich List Checker Endpoint ---
@app.get("/blockchain/richlist")
def rich_list(blockchain: str = Query(...), count: int = Query(10)):
    if blockchain == 'btc':
        # Use blockchain.info rich list chart endpoint
        url = f"https://blockchain.info/charts/wealth-distribution?format=json&cors=true"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                # Return top N rich list entries (simulate, as blockchain.info gives distribution buckets)
                return {"blockchain": "btc", "richlist": data.get("values", [])[:count]}
            else:
                return {"error": f"Failed to fetch BTC rich list: {resp.status_code}"}
        except Exception as e:
            return {"error": str(e)}
    elif blockchain == 'eth':
        # For ETH, suggest using Etherscan or local node (not available via blockchain.info)
        return {"error": "ETH rich list not available via blockchain.info; requires Etherscan or local node."}
    else:
        return {"error": "Unsupported blockchain"}

# --- Speech-to-Text (ASR) Endpoint ---
@app.post("/ai/speech-to-text")
def speech_to_text(file: UploadFile = File(...)):
    # Save uploaded audio to temp file
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
        temp_audio.write(file.file.read())
        temp_audio_path = temp_audio.name
    # Call Vosk or other local ASR here (placeholder command)
    try:
        result = subprocess.check_output([
            'python3', 'run_vosk_asr.py', temp_audio_path
        ]).decode('utf-8')
    except Exception as e:
        result = str(e)
    return {"transcript": result}

# --- Text-to-Speech (TTS) Endpoint ---
@app.post("/ai/text-to-speech")
def text_to_speech(text: str):
    # Call XTTS, Kokoro, or OpenVoice locally (placeholder command)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
        temp_audio_path = temp_audio.name
    try:
        subprocess.check_call([
            'python3', 'run_local_tts.py', text, temp_audio_path
        ])
        def iterfile():
            with open(temp_audio_path, mode="rb") as file_like:
                yield from file_like
        return StreamingResponse(iterfile(), media_type="audio/wav")
    except Exception as e:
        return {"error": str(e)}

# --- AI Chat (LLM) Integration ---
@app.post("/ai/chat")
def ai_chat(req: AIChatRequest):
    # Integrate with local LLM (e.g., llama.cpp or ollama)
    try:
        result = subprocess.check_output([
            'python3', 'run_local_llm.py', req.message
        ]).decode('utf-8')
    except Exception as e:
        result = f"Error: {e}"
    logging.info(f"AI chat: {req.message} | Response: {result}")
    return {"response": result}

# --- Health Check ---
@app.get("/health")
def health():
    return {"status": "ok"}
