const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const databaseFile = path.join(__dirname, 'crypto-agora.sqlite');
const booksFile = path.join(__dirname, 'books.json');
const profilesFile = path.join(__dirname, 'profiles.json');
const printRunsFile = path.join(__dirname, 'print-runs.json');

const db = new Database(databaseFile);
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
        owner_email TEXT PRIMARY KEY,
        profile_type TEXT NOT NULL,
        profile_data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS books (
        book_id TEXT PRIMARY KEY,
        owner_email TEXT,
        title TEXT NOT NULL,
        sha256_hash TEXT NOT NULL,
        book_data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS print_runs (
        run_id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        owner_email TEXT NOT NULL,
        approved_at TEXT NOT NULL,
        run_data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS copies (
        copy_id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL REFERENCES print_runs(run_id) ON DELETE CASCADE,
        book_id TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        copy_data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trust_attestations (
        attestation_id TEXT PRIMARY KEY,
        from_profile_id TEXT NOT NULL,
        to_profile_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        weight INTEGER NOT NULL,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trust_reports (
        report_id TEXT PRIMARY KEY,
        reporter_profile_id TEXT NOT NULL,
        subject_profile_id TEXT NOT NULL,
        category TEXT NOT NULL,
        reason TEXT NOT NULL,
        severity INTEGER NOT NULL,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payments (
        payment_id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        copy_id TEXT,
        amount_xmr REAL NOT NULL,
        author_amount_xmr REAL NOT NULL,
        publisher_amount_xmr REAL NOT NULL,
        royalty_percent REAL NOT NULL,
        status TEXT NOT NULL,
        tx_id TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS anonymous_accounts (
        account_id TEXT PRIMARY KEY,
        public_key TEXT NOT NULL UNIQUE,
        token_hash TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
    );
`);

const paymentColumns = db.pragma('table_info(payments)').map((column) => column.name);
if (paymentColumns.includes('protocol_amount_xmr') && !paymentColumns.includes('publisher_amount_xmr')) {
    db.exec('ALTER TABLE payments RENAME COLUMN protocol_amount_xmr TO publisher_amount_xmr');
}

function readJsonFile(file) {
    if (!fs.existsSync(file)) return {};
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`Format invalid pentru ${file}`);
    }
    return parsed;
}

function importJsonData() {
    const importData = db.transaction(() => {
        const profiles = readJsonFile(profilesFile);
        const books = readJsonFile(booksFile);
        const printRuns = readJsonFile(printRunsFile);

        if (db.prepare('SELECT COUNT(*) AS count FROM profiles').get().count === 0) {
            const insertProfile = db.prepare(
                'INSERT INTO profiles (owner_email, profile_type, profile_data) VALUES (?, ?, ?)'
            );
            Object.entries(profiles).forEach(([ownerEmail, profile]) => {
                insertProfile.run(ownerEmail, profile.profile_type || 'author', JSON.stringify(profile));
            });
        }

        if (db.prepare('SELECT COUNT(*) AS count FROM books').get().count === 0) {
            const insertBook = db.prepare(
                'INSERT INTO books (book_id, owner_email, title, sha256_hash, book_data) VALUES (?, ?, ?, ?, ?)'
            );
            Object.values(books).forEach((book) => {
                insertBook.run(book.book_id, book.owner_email || null, book.title || '', book.sha256_hash, JSON.stringify(book));
            });
        }

        if (db.prepare('SELECT COUNT(*) AS count FROM print_runs').get().count === 0) {
            const insertRun = db.prepare(
                'INSERT INTO print_runs (run_id, book_id, owner_email, approved_at, run_data) VALUES (?, ?, ?, ?, ?)'
            );
            const insertCopy = db.prepare(
                'INSERT INTO copies (copy_id, run_id, book_id, sequence, status, created_at, copy_data) VALUES (?, ?, ?, ?, ?, ?, ?)'
            );
            Object.values(printRuns).forEach((run) => {
                insertRun.run(run.run_id, run.book_id, run.owner_email, run.approved_at, JSON.stringify(run));
                (run.copies || []).forEach((copy) => {
                    insertCopy.run(
                        copy.copy_id,
                        run.run_id,
                        copy.book_id || run.book_id,
                        copy.sequence,
                        copy.status || 'approved',
                        copy.created_at || run.approved_at,
                        JSON.stringify(copy)
                    );
                });
            });
        }
    });

    importData();
}

function loadProfiles() {
    const profiles = {};
    db.prepare('SELECT owner_email, profile_data FROM profiles').all().forEach((row) => {
        profiles[row.owner_email] = JSON.parse(row.profile_data);
    });
    return profiles;
}

function saveProfiles(profiles) {
    const save = db.transaction(() => {
        db.prepare('DELETE FROM profiles').run();
        const insert = db.prepare(
            'INSERT INTO profiles (owner_email, profile_type, profile_data) VALUES (?, ?, ?)'
        );
        Object.entries(profiles).forEach(([ownerEmail, profile]) => {
            insert.run(ownerEmail, profile.profile_type || 'author', JSON.stringify(profile));
        });
    });
    save();
}

function loadBooks() {
    const books = {};
    db.prepare('SELECT book_id, book_data FROM books').all().forEach((row) => {
        books[row.book_id] = JSON.parse(row.book_data);
    });
    return books;
}

function saveBooks(books) {
    const save = db.transaction(() => {
        db.prepare('DELETE FROM books').run();
        const insert = db.prepare(
            'INSERT INTO books (book_id, owner_email, title, sha256_hash, book_data) VALUES (?, ?, ?, ?, ?)'
        );
        Object.values(books).forEach((book) => {
            insert.run(book.book_id, book.owner_email || null, book.title || '', book.sha256_hash, JSON.stringify(book));
        });
    });
    save();
}

function loadPrintRuns() {
    const printRuns = {};
    const copiesByRun = {};
    db.prepare('SELECT run_id, run_data FROM print_runs').all().forEach((row) => {
        printRuns[row.run_id] = { ...JSON.parse(row.run_data), copies: [] };
        copiesByRun[row.run_id] = printRuns[row.run_id].copies;
    });
    db.prepare('SELECT run_id, copy_data FROM copies ORDER BY sequence').all().forEach((row) => {
        if (copiesByRun[row.run_id]) copiesByRun[row.run_id].push(JSON.parse(row.copy_data));
    });
    return printRuns;
}

function savePrintRuns(printRuns) {
    const save = db.transaction(() => {
        db.prepare('DELETE FROM copies').run();
        db.prepare('DELETE FROM print_runs').run();
        const insertRun = db.prepare(
            'INSERT INTO print_runs (run_id, book_id, owner_email, approved_at, run_data) VALUES (?, ?, ?, ?, ?)'
        );
        const insertCopy = db.prepare(
            'INSERT INTO copies (copy_id, run_id, book_id, sequence, status, created_at, copy_data) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        Object.values(printRuns).forEach((run) => {
            insertRun.run(run.run_id, run.book_id, run.owner_email, run.approved_at, JSON.stringify(run));
            (run.copies || []).forEach((copy) => {
                insertCopy.run(
                    copy.copy_id,
                    run.run_id,
                    copy.book_id || run.book_id,
                    copy.sequence,
                    copy.status || 'approved',
                    copy.created_at || run.approved_at,
                    JSON.stringify(copy)
                );
            });
        });
    });
    save();
}

importJsonData();

module.exports = {
    db,
    loadBooks,
    loadPrintRuns,
    loadProfiles,
    saveBooks,
    savePrintRuns,
    saveProfiles
};
