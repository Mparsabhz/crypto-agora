const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

class Blockchain {
    constructor() {
        this.chain = [];
        // Creăm block-ul de geneză (primul block din rețea)
        this.createBlock("0", "CryptoAgora_Genesis", "0000000000000000");
    }

    createBlock(previousHash, authorId, manuscriptHash) {
        const block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            author_id: authorId,
            manuscript_hash: manuscriptHash,
            previous_hash: previousHash
        };
        
        // Generăm hash-ul criptografic SHA-256 al block-ului curent
        const blockString = JSON.stringify(block, Object.keys(block).sort());
        block.hash = crypto.createHash('sha256').update(blockString).digest('hex');
        
        this.chain.push(block);
        return block;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }
}

const blockchain = new Blockchain();

// Endpoint pentru înregistrarea unei cărți noi
app.post('/register-book', (req, res) => {
    const { author_id, manuscript_hash } = req.body;
    
    if (!author_id || !manuscript_hash) {
        return res.status(400).json({ error: "Lipsește author_id sau manuscript_hash!" });
    }

    const lastBlock = blockchain.getLastBlock();
    const newBlock = blockchain.createBlock(
        lastBlock.hash,
        author_id,
        manuscript_hash
    );

    res.json({ message: "Cartea a fost înregistrată public în blockchain!", block: newBlock });
});

// Endpoint pentru vizualizarea întregului ledger
app.get('/ledger', (req, res) => {
    res.json({ chain: blockchain.chain, length: blockchain.chain.length });
});

// Endpoint pentru verificarea unei cărți după hash-ul manuscrisului
app.get('/verify/:hash', (req, res) => {
    const targetHash = req.params.hash;
    const foundBlock = blockchain.chain.find(b => b.manuscript_hash === targetHash);

    if (foundBlock) {
        return res.json({
            status: "AUTENTIC",
            verified: true,
            author: foundBlock.author_id,
            timestamp: foundBlock.timestamp,
            block_index: foundBlock.index
        });
    }

    res.status(404).json({ detail: "Cartea nu există în registrul public sau hash-ul este invalid!" });
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ status: "Online", project: "CryptoAgora Ledger API" });
});

app.listen(PORT, () => {
    console.log(`CryptoAgora Node.js Ledger running on port ${PORT}`);
});
