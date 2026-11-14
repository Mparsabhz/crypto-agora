const express = require('express');
const crypto = require('crypto');
const cors = require('cors'); // opțional, dar bun dacă frontend-ul rulează pe alt port (ex: 5173)

const app = express();
app.use(express.json());
app.use(cors()); // Permite cereri din frontend fără bătăi de cap cu CORS

class Block {
    constructor(index, timestamp, authorId, manuscriptHash, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.author_id = authorId;
        this.manuscript_hash = manuscriptHash;
        this.previous_hash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    // Calculează hash-ul SHA-256 al blocului curent
    calculateHash() {
        return crypto.createHash('sha256')
            .update(
                this.index + 
                this.timestamp + 
                this.author_id + 
                this.manuscript_hash + 
                this.previous_hash + 
                this.nonce
            )
            .digest('hex');
    }

    // Proof-of-Work simplificat (opțional, dă bine la juriu că "minează" un bloc)
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Setează 2 sau 3 pentru viteză maximă la hackathon
    }

    createGenesisBlock() {
        return new Block(
            1, 
            Date.now(), 
            "CryptoAgora_Genesis", 
            "0000000000000000000000000000000000000000000000000000000000000000", 
            "0"
        );
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(authorId, manuscriptHash) {
        const latestBlock = this.getLatestBlock();
        const newBlock = new Block(
            this.chain.length + 1,
            Date.now(),
            authorId,
            manuscriptHash,
            latestBlock.hash
        );
        
        // Minăm blocul (generează hash-ul cu dificultatea impusă)
        newBlock.mineBlock(this.difficulty);
        
        this.chain.push(newBlock);
        return newBlock;
    }

    // Verifică integritatea întregului lanț
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Verificăm dacă hash-ul curent a fost modificat
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Verificăm dacă legătura cu blocul anterior este ruptă
            if (currentBlock.previous_hash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Inițializăm blockchain-ul
const cryptoAgoraChain = new Blockchain();

// --- ENDPOINT-URI API ---

// 1. Înregistrează o carte nouă în blockchain
app.post('/register-book', (req, res) => {
    const { author_id, manuscript_hash } = req.body;
    
    if (!author_id || !manuscript_hash) {
        return res.status(400).json({ error: "Lipsește author_id sau manuscript_hash!" });
    }

    const newBlock = cryptoAgoraChain.addBlock(author_id, manuscript_hash);
    
    res.json({ 
        message: "Cartea a fost minată și înregistrată public în blockchain!", 
        block: newBlock 
    });
});

// 2. Returnează întregul ledger (lanțul) și starea de validare
app.get('/ledger', (req, res) => {
    res.json({ 
        isValid: cryptoAgoraChain.isChainValid(),
        length: cryptoAgoraChain.chain.length,
        chain: cryptoAgoraChain.chain 
    });
});

// 3. Verifică o carte după hash-ul manuscrisului
app.get('/verify/:hash', (req, res) => {
    const targetHash = req.params.hash;
    const foundBlock = cryptoAgoraChain.chain.find(b => b.manuscript_hash === targetHash);

    if (foundBlock) {
        return res.json({
            status: "AUTENTIC",
            verified: true,
            author: foundBlock.author_id,
            timestamp: foundBlock.timestamp,
            block_index: foundBlock.index,
            block_hash: foundBlock.hash
        });
    }

    res.status(404).json({ detail: "Cartea nu există în registrul public sau hash-ul este invalid!" });
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ 
        status: "Online 🚀", 
        project: "CryptoAgora Blockchain Node", 
        totalBlocks: cryptoAgoraChain.chain.length,
        isChainValid: cryptoAgoraChain.isChainValid()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 CryptoAgora Robust Blockchain Node running on port ${PORT}`);
});
