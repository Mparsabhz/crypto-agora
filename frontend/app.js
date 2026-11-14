// Configurare API Backend (Parsabhz va pune aici URL-ul FastAPI / Flask / Node)
const API_BASE_URL = "http://localhost:8000/api";
const USE_BACKEND = false; // Schimbă în `true` când legi backend-ul live

// Contractul de date standard (JSON Schema din Blueprint)
let protocolState = {
    book_id: "ca_01",
    title: "Manifestul Libertății",
    author_pubkey: "0x8F9B7C4D2A1E90B3C5D8E7F6A1B2C3D4E5F63E2A",
    sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    web_of_trust_score: "99.4% (Verified Author)",
    print_batch: "LOT-2026-RO-500",
    batch_size: 500,
    royalty_split: "20% Direct-to-Author",
    xmr_tx_proof: "tx_private_9a8f7d6e5c4b3a21"
};

let qrInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initAuthorModule();
    initPrintModule();
    initReaderModule();
    checkUrlForMobileScan();
});

// 1. Navigație între cele 3 ecrane
function initNavigation() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            switchScreen(btn.dataset.target);
        });
    });

    document.getElementById("btn-to-print").addEventListener("click", () => {
        switchScreen("screen-print");
    });

    document.getElementById("btn-simulate-scan").addEventListener("click", () => {
        updateReaderUI();
        switchScreen("screen-reader");
    });
}

function switchScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    document.getElementById(screenId).classList.add("active");
    const activeTab = document.querySelector(`.tab-btn[data-target="${screenId}"]`);
    if (activeTab) activeTab.classList.add("active");
}

// 2. Modulul 1: Dashboard Autor & Calcul SHA-256
function initAuthorModule() {
    const form = document.getElementById("author-form");
    const fileInput = document.getElementById("manuscript-file");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("book-title").value.trim();
        const pubkey = document.getElementById("author-pubkey").value.trim();
        const file = fileInput.files[0];

        protocolState.title = title;
        protocolState.author_pubkey = pubkey;
        protocolState.book_id = "ca_" + Math.floor(10 + Math.random() * 89);

        if (USE_BACKEND && file) {
            // Integrare cu backend-ul lui Parsabhz
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", title);
            formData.append("author_pubkey", pubkey);

            try {
                const res = await fetch(`${API_BASE_URL}/register`, {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                protocolState = { ...protocolState, ...data };
            } catch (err) {
                console.error("Eroare API, folosim calcul local:", err);
            }
        } else if (file) {
            // Calcul SHA-256 nativ în browser pe fișierul încărcat
            protocolState.sha256_hash = await computeFileSHA256(file);
        }

        // Actualizare UI Ecran 1 + Sticker Ecran 2
        document.getElementById("author-status").textContent = "● Ancorat Criptografic";
        document.getElementById("author-book-id").textContent = protocolState.book_id;
        document.getElementById("author-hash").textContent = protocolState.sha256_hash;

        generateQRSticker();
        updateReaderUI();
    });
}

async function computeFileSHA256(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// 3. Modulul 2: Panou Tipografie & Generare QR
function initPrintModule() {
    generateQRSticker(); // Generează QR-ul inițial la încărcare

    document.getElementById("print-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        protocolState.print_batch = document.getElementById("batch-code").value.trim();
        protocolState.batch_size = parseInt(document.getElementById("batch-size").value, 10);

        if (USE_BACKEND) {
            try {
                const res = await fetch(`${API_BASE_URL}/mint-batch`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        book_id: protocolState.book_id,
                        print_batch: protocolState.print_batch,
                        batch_size: protocolState.batch_size
                    })
                });
                const data = await res.json();
                protocolState = { ...protocolState, ...data };
            } catch (err) {
                console.error("Eroare mint-batch API:", err);
            }
        }

        generateQRSticker();
        updateReaderUI();
    });
}

function generateQRSticker() {
    const container = document.getElementById("qrcode-container");
    container.innerHTML = "";

    // Construiește URL-ul care se va deschide pe telefonul juriului la scanare
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
        view: "verify",
        book_id: protocolState.book_id,
        title: protocolState.title,
        batch: protocolState.print_batch,
        hash: protocolState.sha256_hash
    });
    const verificationUrl = `${baseUrl}?${params.toString()}`;

    qrInstance = new QRCode(container, {
        text: verificationUrl,
        width: 150,
        height: 150,
        colorDark: "#0a0d12",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });

    document.getElementById("sticker-title").textContent = protocolState.title;
    document.getElementById("sticker-batch").textContent = `${protocolState.print_batch} • #001/${protocolState.batch_size}`;
}

// 4. Modulul 3: Verificare Cititor & Simulare Plată 20%
function initReaderModule() {
    updateReaderUI();

    document.getElementById("btn-trigger-tx").addEventListener("click", async (e) => {
        const btn = e.target;
        btn.textContent = "Se generează dovada XMR...";
        btn.disabled = true;

        if (USE_BACKEND) {
            try {
                const res = await fetch(`${API_BASE_URL}/settle-royalty`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ book_id: protocolState.book_id })
                });
                const data = await res.json();
                protocolState.xmr_tx_proof = data.xmr_tx_proof;
            } catch (err) {
                console.error("Eroare settle-royalty:", err);
            }
        } else {
            // Generează un nou hash de tranzacție privată mock
            const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(8)))
                .map(b => b.toString(16).padStart(2, "0")).join("");
            protocolState.xmr_tx_proof = `tx_private_${randomHex}`;
        }

        setTimeout(() => {
            document.getElementById("verify-tx").textContent = protocolState.xmr_tx_proof;
            btn.textContent = "✓ Plată 20% Confirmată Direct la Autor";
            btn.style.background = "#00c853";
        }, 500);
    });
}

function updateReaderUI() {
    document.getElementById("verify-title").textContent = protocolState.title;
    document.getElementById("verify-wot").textContent = protocolState.web_of_trust_score;
    document.getElementById("verify-batch").textContent = protocolState.print_batch;
    document.getElementById("verify-pubkey").textContent = formatShortKey(protocolState.author_pubkey);
    document.getElementById("verify-hash").textContent = protocolState.sha256_hash;
    document.getElementById("verify-royalty").textContent = protocolState.royalty_split;
    document.getElementById("verify-tx").textContent = protocolState.xmr_tx_proof;
}

function formatShortKey(key) {
    if (key.length <= 14) return key;
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

// Detectează dacă pagina a fost deschisă prin scanarea codului QR de pe carte
function checkUrlForMobileScan() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("view") === "verify") {
        if (urlParams.get("book_id")) protocolState.book_id = urlParams.get("book_id");
        if (urlParams.get("title")) protocolState.title = urlParams.get("title");
        if (urlParams.get("batch")) protocolState.print_batch = urlParams.get("batch");
        if (urlParams.get("hash")) protocolState.sha256_hash = urlParams.get("hash");

        updateReaderUI();
        switchScreen("screen-reader");
    }
}