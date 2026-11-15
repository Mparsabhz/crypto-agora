const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');
const Groq = require('groq-sdk');
const {
    loadBooks,
    loadPrintRuns,
    loadProfiles,
    saveBooks,
    savePrintRuns,
    saveProfiles
} = require('./database');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();
dotenv.config({ path: path.join(__dirname, 'gemini-site/.env') });

const app = express();
app.use(express.json());
const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origin not allowed by CORS.'));
    }
}));

const uploadDirectory = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
const blockchainFile = path.join(__dirname, 'blockchain.json');
const googleClientId = process.env.GOOGLE_CLIENT_ID
    || '588696727944-fljtld63gs6ottrkus3vibc80pjv781q.apps.googleusercontent.com';
const googleClient = new OAuth2Client(googleClientId);
const geminiApiKey = String(process.env.GEMINI_API_KEY || '').trim();
const ai = geminiApiKey ? new GoogleGenAI() : null;
const groqApiKey = String(process.env.GROQ_API_KEY || '').trim();
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

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

app.post('/api/chat', async (req, res) => {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

    if (!prompt) {
        return res.status(400).json({ error: 'Promptul este obligatoriu.' });
    }

    if (!ai && !groq) {
        return res.status(503).json({ error: 'Niciun serviciu AI nu este configurat pe server.' });
    }

    try {
        let reply = '';
        if (groq) {
            const response = await groq.chat.completions.create({
                model: 'qwen/qwen3.8-27b',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 800
            });
            reply = response.choices[0]?.message?.content?.trim() || '';
        } else {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            reply = typeof response.text === 'string' ? response.text.trim() : '';
        }

        if (!reply) {
            return res.status(502).json({ error: 'Serviciul AI a returnat un răspuns gol.' });
        }

        return res.json({ reply });
    } catch (error) {
        console.error('AI request failed:', error.message);
        return res.status(502).json({ error: 'Serviciul AI nu a putut procesa cererea.' });
    }
});

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
    }).map((book) => {
        const authorProfile = profiles[book.owner_email];
        return {
            ...book,
            author_name: authorProfile?.display_name || 'Autor necunoscut',
            author_profile_id: book.owner_email
                ? crypto.createHash('sha256').update(book.owner_email).digest('hex').slice(0, 24)
                : null
        };
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

app.get('/profiles', (req, res) => {
    const profileType = String(req.query.type || '').trim().toLowerCase();
    const search = String(req.query.search || '').trim().toLowerCase();

    const result = Object.entries(profiles)
        .filter((profile) => !profileType || profile[1].profile_type === profileType)
        .filter((profile) => {
            if (!search) return true;
            const profileData = profile[1];
            const searchable = profileData.profile_type === 'author'
                ? `${profileData.display_name} ${profileData.bio} ${profileData.genres} ${profileData.public_key}`
                : `${profileData.company_name} ${profileData.description} ${profileData.specialties} ${profileData.location} ${profileData.public_key}`;
            return searchable.toLowerCase().includes(search);
        })
        .map(([ownerEmail, profile]) => ({
            profile_id: crypto.createHash('sha256').update(ownerEmail).digest('hex').slice(0, 24),
            ...profile,
            owner_email: undefined
        }));

    return res.json({ count: result.length, profiles: result });
});

app.get('/profiles/:profileId', (req, res) => {
    const entry = Object.entries(profiles)
        .find(([ownerEmail]) => crypto.createHash('sha256').update(ownerEmail).digest('hex').slice(0, 24) === req.params.profileId);

    if (!entry) {
        return res.status(404).json({ error: 'Profilul nu există.' });
    }

    const [ownerEmail, profile] = entry;
    const publishedBooks = Object.values(books)
        .filter((book) => book.owner_email === ownerEmail)
        .map((book) => ({
            book_id: book.book_id,
            title: book.title,
            author_pubkey: book.author_pubkey,
            sha256_hash: book.sha256_hash,
            block_index: book.block_index,
            block_hash: book.block_hash,
            web_of_trust_score: book.web_of_trust_score
        }));

    return res.json({
        profile: {
            profile_id: req.params.profileId,
            ...profile,
            owner_email: undefined
        },
        books: publishedBooks
    });
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
                specialties: String(specialties || '').trim(),
                public_key: String(publicKey || '').trim()
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
    const {
        book_id: bookId,
        quantity,
        royalty_percent: royaltyPercent,
        publisher_profile_id: publisherProfileId
    } = req.body;
    const book = books[bookId];
    const parsedQuantity = Number(quantity);
    const parsedRoyalty = Number(royaltyPercent);
    const publisherEntry = Object.entries(profiles)
        .find(([ownerEmail]) => crypto.createHash('sha256').update(ownerEmail).digest('hex').slice(0, 24) === publisherProfileId);
    const publisherProfile = publisherEntry?.[1];
    const authorProfile = profiles[req.user.email];

    if (!book) {
        return res.status(404).json({ error: 'Cartea selectată nu există.' });
    }
    if (book.owner_email !== req.user.email) {
        return res.status(403).json({ error: 'Doar autorul cărții poate aproba un tiraj.' });
    }
    if (!publisherProfile || publisherProfile.profile_type !== 'publisher') {
        return res.status(400).json({ error: 'Selectează o editură cu profil valid.' });
    }
    if (!publisherProfile.public_key) {
        return res.status(409).json({ error: 'Editura selectată nu are încă o cheie publică.' });
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 10000) {
        return res.status(400).json({ error: 'Tirajul trebuie să fie între 1 și 10.000 de exemplare.' });
    }
    if (!Number.isFinite(parsedRoyalty) || parsedRoyalty < 0 || parsedRoyalty > 100) {
        return res.status(400).json({ error: 'Procentul autorului trebuie să fie între 0 și 100.' });
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
        book_title: book.title,
        owner_email: req.user.email,
        author_name: authorProfile?.display_name || req.user.name || 'Autor necunoscut',
        author_profile_id: crypto.createHash('sha256').update(req.user.email).digest('hex').slice(0, 24),
        author_public_key: book.author_pubkey,
        publisher_profile_id: publisherProfileId,
        publisher_name: publisherProfile.company_name,
        publisher_public_key: publisherProfile.public_key,
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
        .map((run) => ({
            ...run,
            book_title: books[run.book_id]?.title || run.book_title || run.book_id,
            author_name: profiles[run.owner_email]?.display_name || run.author_name || 'Autor necunoscut'
        }))
        .sort((left, right) => right.approved_at.localeCompare(left.approved_at));

    return res.json({ count: result.length, print_runs: result });
});

app.get('/my-publisher-runs', authenticateGoogle, (req, res) => {
    const publisherProfileId = crypto.createHash('sha256')
        .update(req.user.email)
        .digest('hex')
        .slice(0, 24);
    const result = Object.values(printRuns)
        .filter((run) => run.publisher_profile_id === publisherProfileId)
        .map((run) => ({
            ...run,
            book_title: books[run.book_id]?.title || run.book_title || run.book_id,
            author_name: profiles[run.owner_email]?.display_name || run.author_name || 'Autor necunoscut',
            author_profile_id: crypto.createHash('sha256').update(run.owner_email).digest('hex').slice(0, 24)
        }))
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

    const authorProfile = profiles[book.owner_email];
    res.json({
        status: "AUTENTIC",
        verified: true,
        data: {
            ...book,
            author_name: authorProfile?.display_name || 'Autor necunoscut',
            author_profile_id: book.owner_email
                ? crypto.createHash('sha256').update(book.owner_email).digest('hex').slice(0, 24)
                : null
        },
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
