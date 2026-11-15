const express = require('express');
const crypto = require('crypto');
const cors = require('cors'); // opțional, dar bun dacă frontend-ul rulează pe alt port (ex: 5173)
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(express.json());
app.use(cors()); // Permite cereri din frontend fără bătăi de cap cu CORS

const uploadDirectory = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
const blockchainFile = path.join(__dirname, 'blockchain.json');
const booksFile = path.join(__dirname, 'books.json');
const printRunsFile = path.join(__dirname, 'print-runs.json');
const profilesFile = path.join(__dirname, 'profiles.json');
const googleClientId = process.env.GOOGLE_CLIENT_ID
    || '588696727944-fljtld63gs6ottrkus3vibc80pjv781q.apps.googleusercontent.com';
const googleClient = new OAuth2Client(googleClientId);

const upload = multer({
    storage: multer.diskStorage({
        destination: uploadDirectory,
        filename: (_req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
        }
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        const allowedExtensions = new Set(['.pdf', '.txt', '.md']);
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, allowedExtensions.has(extension));
    }
});

function loadBooks() {
    if (!fs.existsSync(booksFile)) {
        return {};
    }

    const storedBooks = JSON.parse(fs.readFileSync(booksFile, 'utf8'));
    if (!storedBooks || typeof storedBooks !== 'object' || Array.isArray(storedBooks)) {
        throw new Error(`Format invalid pentru ${booksFile}`);
    }

    return storedBooks;
}

function saveBooks(books) {
    const temporaryFile = `${booksFile}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(books, null, 2), 'utf8');
    fs.renameSync(temporaryFile, booksFile);
}

function loadPrintRuns() {
    if (!fs.existsSync(printRunsFile)) {
        return {};
    }

    const storedRuns = JSON.parse(fs.readFileSync(printRunsFile, 'utf8'));
    if (!storedRuns || typeof storedRuns !== 'object' || Array.isArray(storedRuns)) {
        throw new Error(`Format invalid pentru ${printRunsFile}`);
    }

    return storedRuns;
}

function savePrintRuns(printRuns) {
    const temporaryFile = `${printRunsFile}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(printRuns, null, 2), 'utf8');
    fs.renameSync(temporaryFile, printRunsFile);
}

function loadProfiles() {
    if (!fs.existsSync(profilesFile)) {
        return {};
    }

    const storedProfiles = JSON.parse(fs.readFileSync(profilesFile, 'utf8'));
    if (!storedProfiles || typeof storedProfiles !== 'object' || Array.isArray(storedProfiles)) {
        throw new Error(`Format invalid pentru ${profilesFile}`);
    }

    return storedProfiles;
}

function saveProfiles(profiles) {
    const temporaryFile = `${profilesFile}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(profiles, null, 2), 'utf8');
    fs.renameSync(temporaryFile, profilesFile);
}

function findLatestBlockByHash(hash) {
    return [...cryptoAgoraChain.chain]
        .reverse()
        .find((block) => block.manuscript_hash === hash);
}

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
        this.difficulty = 2; // Setează 2 sau 3 pentru viteză maximă la hackathon
        this.chain = this.loadChain();

        if (this.chain.length === 0) {
            this.chain = [this.createGenesisBlock()];
            this.saveChain();
        }

        if (!this.isChainValid()) {
            throw new Error(`Blockchain invalid în ${blockchainFile}`);
        }
    }

    loadChain() {
        if (!fs.existsSync(blockchainFile)) {
            return [];
        }

        const storedChain = JSON.parse(fs.readFileSync(blockchainFile, 'utf8'));
        if (!Array.isArray(storedChain)) {
            throw new Error(`Format invalid pentru ${blockchainFile}`);
        }

        return storedChain.map((block) => Object.assign(
            new Block(
                block.index,
                block.timestamp,
                block.author_id,
                block.manuscript_hash,
                block.previous_hash
            ),
            block
        ));
    }

    saveChain() {
        const temporaryFile = `${blockchainFile}.tmp`;
        fs.writeFileSync(temporaryFile, JSON.stringify(this.chain, null, 2), 'utf8');
        fs.renameSync(temporaryFile, blockchainFile);
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
        this.saveChain();
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
const books = loadBooks();
const printRuns = loadPrintRuns();
const profiles = loadProfiles();
const legacyOwnerEmail = String(process.env.LEGACY_OWNER_EMAIL || '').trim().toLowerCase();

if (legacyOwnerEmail) {
    let migrated = false;
    Object.values(books).forEach((book) => {
        if (!book.owner_email) {
            book.owner_email = legacyOwnerEmail;
            migrated = true;
        }
    });
    if (migrated) saveBooks(books);
}

async function authenticateGoogle(req, res, next) {
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length)
        : '';

    if (!token) {
        return res.status(401).json({ error: 'Google authentication required.' });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: googleClientId
        });
        const payload = ticket.getPayload();
        if (!payload?.email || payload.email_verified === false) {
            return res.status(401).json({ error: 'Google account email is not verified.' });
        }

        req.user = {
            email: payload.email.toLowerCase(),
            name: payload.name || payload.email
        };
        return next();
    } catch (error) {
        console.error('Google token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid Google authentication token.' });
    }
}

// --- ENDPOINT-URI API ---

// 1. Salvează manuscrisul și îl înregistrează în blockchain
app.post('/register-book', authenticateGoogle, upload.single('file'), (req, res) => {
    const { author_id, manuscript_hash, title, author_pubkey, signature } = req.body;
    
    if (!author_id || !manuscript_hash || !title || !author_pubkey || !req.file) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Lipsesc titlul, cheia autorului, hash-ul sau fișierul!" });
    }

    const uploadedHash = crypto
        .createHash('sha256')
        .update(fs.readFileSync(req.file.path))
        .digest('hex');

    if (uploadedHash !== manuscript_hash) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Hash-ul fișierului nu corespunde manuscrisului trimis!" });
    }

    if (findLatestBlockByHash(manuscript_hash)) {
        fs.unlinkSync(req.file.path);
        return res.status(409).json({ error: "Acest manuscris este deja înregistrat în blockchain!" });
    }

    const newBlock = cryptoAgoraChain.addBlock(author_id, manuscript_hash);
    const bookId = `ca_${String(newBlock.index - 1).padStart(2, '0')}`;
    const book = {
        book_id: bookId,
        owner_email: req.user.email,
        title: title.trim(),
        author_pubkey: author_pubkey.trim(),
        signature: signature || null,
        sha256_hash: manuscript_hash,
        filename: req.file.originalname,
        stored_as: req.file.filename,
        file_size: req.file.size,
        web_of_trust_score: '99.9% (Verified Author)',
        print_batch: null,
        royalty_split: '20% Direct-to-Author',
        xmr_tx_proof: null,
        block_index: newBlock.index,
        block_hash: newBlock.hash
    };
    books[bookId] = book;
    saveBooks(books);
    
    res.json({ 
        message: "Cartea a fost minată și înregistrată public în blockchain!", 
        block: newBlock,
        data: book,
        file: {
            name: req.file.originalname,
            storedAs: req.file.filename,
            size: req.file.size
        }
    });
});

// 2. Returnează întregul ledger (lanțul) și starea de validare
app.get('/ledger', (req, res) => {
    res.json({ 
        isValid: cryptoAgoraChain.isChainValid(),
        length: cryptoAgoraChain.chain.length,
        chain: cryptoAgoraChain.chain,
        books: Object.values(books)
    });
});

// 3. Verifică o carte după hash-ul manuscrisului
app.get('/books', (req, res) => {
    const search = String(req.query.search || '').trim().toLowerCase();
    const result = Object.values(books).filter((book) => {
        if (!search) return true;
        return book.title.toLowerCase().includes(search)
            || book.author_pubkey.toLowerCase().includes(search)
            || book.book_id.toLowerCase().includes(search);
    });

    res.json({
        count: result.length,
        books: result
    });
});

app.get('/my-books', authenticateGoogle, (req, res) => {
    const result = Object.values(books)
        .filter((book) => book.owner_email === req.user.email);
    res.json({ count: result.length, books: result });
});

app.get('/profile', authenticateGoogle, (req, res) => {
    return res.json({
        profile: profiles[req.user.email] || null,
        email: req.user.email,
        name: req.user.name
    });
});

app.put('/profile', authenticateGoogle, (req, res) => {
    const {
        profile_type: profileType,
        display_name: displayName,
        bio,
        website,
        genres,
        public_key: publicKey,
        payout_address: payoutAddress,
        company_name: companyName,
        description,
        contact_email: contactEmail,
        location,
        specialties
    } = req.body;

    if (!['author', 'publisher'].includes(profileType)) {
        return res.status(400).json({ error: 'Tipul profilului trebuie să fie author sau publisher.' });
    }

    const profile = {
        owner_email: req.user.email,
        profile_type: profileType,
        updated_at: new Date().toISOString(),
        ...(profileType === 'author'
            ? {
                display_name: String(displayName || '').trim(),
                bio: String(bio || '').trim(),
                website: String(website || '').trim(),
                genres: String(genres || '').trim(),
                public_key: String(publicKey || '').trim(),
                payout_address: String(payoutAddress || '').trim()
            }
            : {
                company_name: String(companyName || '').trim(),
                description: String(description || '').trim(),
                website: String(website || '').trim(),
                contact_email: String(contactEmail || '').trim().toLowerCase(),
                location: String(location || '').trim(),
                specialties: String(specialties || '').trim()
            })
    };

    const requiredFields = profileType === 'author'
        ? [['display_name', profile.display_name], ['bio', profile.bio]]
        : [['company_name', profile.company_name], ['description', profile.description], ['contact_email', profile.contact_email]];
    const missingField = requiredFields.find(([, value]) => !value);
    if (missingField) {
        return res.status(400).json({ error: `Câmpul ${missingField[0]} este obligatoriu.` });
    }

    profiles[req.user.email] = profile;
    saveProfiles(profiles);
    return res.json({ message: 'Profilul a fost salvat.', profile });
});

app.post('/print-runs', authenticateGoogle, (req, res) => {
    const { book_id: bookId, quantity, royalty_percent: royaltyPercent, print_house_code: printHouseCode } = req.body;
    const book = books[bookId];
    const parsedQuantity = Number(quantity);
    const parsedRoyalty = Number(royaltyPercent);
    const normalizedCode = String(printHouseCode || '').trim().toUpperCase();

    if (!book) {
        return res.status(404).json({ error: 'Cartea selectată nu există.' });
    }
    if (book.owner_email !== req.user.email) {
        return res.status(403).json({ error: 'Doar autorul cărții poate aproba un tiraj.' });
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 10000) {
        return res.status(400).json({ error: 'Tirajul trebuie să fie între 1 și 10.000 de exemplare.' });
    }
    if (!Number.isFinite(parsedRoyalty) || parsedRoyalty < 0 || parsedRoyalty > 100) {
        return res.status(400).json({ error: 'Procentul autorului trebuie să fie între 0 și 100.' });
    }
    if (!/^[A-Z0-9_-]{2,12}$/.test(normalizedCode)) {
        return res.status(400).json({ error: 'Codul tipografiei poate conține doar litere, cifre, _ sau -.' });
    }

    const runId = `run_${crypto.randomBytes(10).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const copies = Array.from({ length: parsedQuantity }, (_, index) => ({
        copy_id: `copy_${crypto.randomBytes(12).toString('hex')}`,
        sequence: index + 1,
        run_id: runId,
        book_id: book.book_id,
        status: 'approved',
        created_at: createdAt
    }));

    printRuns[runId] = {
        run_id: runId,
        book_id: book.book_id,
        owner_email: req.user.email,
        print_house_code: normalizedCode,
        quantity: parsedQuantity,
        royalty_percent: parsedRoyalty,
        approved_at: createdAt,
        copies
    };
    savePrintRuns(printRuns);

    return res.status(201).json({
        message: 'Tirajul a fost aprobat de autor.',
        run: printRuns[runId],
        book
    });
});

app.get('/my-print-runs', authenticateGoogle, (req, res) => {
    const result = Object.values(printRuns)
        .filter((run) => run.owner_email === req.user.email)
        .sort((left, right) => right.approved_at.localeCompare(left.approved_at));

    return res.json({ count: result.length, print_runs: result });
});

app.get('/copies/:copyId', (req, res) => {
    const copy = Object.values(printRuns)
        .flatMap((run) => run.copies)
        .find((item) => item.copy_id === req.params.copyId);

    if (!copy) {
        return res.status(404).json({ detail: 'Exemplarul nu există în registrul public.' });
    }

    const book = books[copy.book_id];
    const block = book ? findLatestBlockByHash(book.sha256_hash) : null;
    if (!book || !block) {
        return res.status(409).json({ detail: 'Exemplarul nu are o carte validă în ledger.' });
    }

    return res.json({
        status: 'EXEMPLAR AUTENTIC',
        verified: true,
        copy,
        book,
        block
    });
});

app.get('/books/:bookId', (req, res) => {
    const book = books[req.params.bookId];
    if (!book) {
        return res.status(404).json({ detail: "Cartea nu există în registrul public!" });
    }

    const block = findLatestBlockByHash(book.sha256_hash);

    if (!block) {
        return res.status(409).json({ detail: "Metadata cărții nu are un bloc valid în ledger!" });
    }

    res.json({
        status: "AUTENTIC",
        verified: true,
        data: book,
        block
    });
});

app.get('/verify/:hash', (req, res) => {
    const targetHash = req.params.hash;
    const foundBlock = findLatestBlockByHash(targetHash);

    if (foundBlock) {
        const book = Object.values(books).find((item) => item.sha256_hash === targetHash);
        return res.json({
            status: "AUTENTIC",
            verified: true,
            author: foundBlock.author_id,
            timestamp: foundBlock.timestamp,
            block_index: foundBlock.index,
            block_hash: foundBlock.hash,
            data: book || {
                sha256_hash: foundBlock.manuscript_hash,
                block_index: foundBlock.index,
                block_hash: foundBlock.hash
            }
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
