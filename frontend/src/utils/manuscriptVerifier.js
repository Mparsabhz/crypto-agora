const CHUNK_SIZE = 64 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const PDF_HEADER = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256(buffer) {
  return toHex(await crypto.subtle.digest('SHA-256', buffer));
}

function hasPrefix(bytes, prefix) {
  return prefix.every((byte, index) => bytes[index] === byte);
}

function hasPdfEofMarker(bytes) {
  const marker = new TextEncoder().encode('%%EOF');
  const start = Math.max(0, bytes.length - 1024);
  for (let index = start; index <= bytes.length - marker.length; index += 1) {
    if (marker.every((byte, markerIndex) => bytes[index + markerIndex] === byte)) return true;
  }
  return false;
}

function isValidUtf8(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes).trim().length > 0;
  } catch {
    return false;
  }
}

function calculateEntropy(bytes) {
  if (!bytes.length) return 0;
  const frequencies = new Uint32Array(256);
  bytes.forEach((byte) => { frequencies[byte] += 1; });

  return frequencies.reduce((entropy, frequency) => {
    if (!frequency) return entropy;
    const probability = frequency / bytes.length;
    return entropy - probability * Math.log2(probability);
  }, 0);
}

function inspectFormat(file, bytes) {
  const extension = file.name.toLowerCase().split('.').pop();
  if (extension === 'pdf') {
    const headerValid = hasPrefix(bytes, PDF_HEADER);
    const eofMarkerValid = hasPdfEofMarker(bytes);
    return {
      format: 'PDF',
      formatValid: headerValid && eofMarkerValid,
      detail: headerValid && eofMarkerValid ? 'VALID PDF structure' : 'CORRUPT / SPOOFED',
    };
  }

  if (extension === 'txt' || extension === 'md') {
    const textValid = isValidUtf8(bytes);
    return {
      format: extension.toUpperCase(),
      formatValid: textValid,
      detail: textValid ? `VALID ${extension.toUpperCase()} UTF-8` : 'CORRUPT / EMPTY',
    };
  }

  return {
    format: extension?.toUpperCase() || 'UNKNOWN',
    formatValid: false,
    detail: 'UNSUPPORTED FORMAT',
  };
}

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
}

async function calculateMerkleRoot(bytes) {
  const chunkBuffers = [];
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    chunkBuffers.push(bytes.slice(offset, Math.min(offset + CHUNK_SIZE, bytes.length)));
  }

  const chunkHashes = await Promise.all(chunkBuffers.map((chunk) => sha256(chunk)));
  let level = chunkHashes;
  while (level.length > 1) {
    const nextLevel = [];
    for (let index = 0; index < level.length; index += 2) {
      const right = level[index + 1] || level[index];
      const leftBytes = hexToBytes(level[index]);
      const rightBytes = hexToBytes(right);
      const pair = new Uint8Array(leftBytes.length + rightBytes.length);
      pair.set(leftBytes);
      pair.set(rightBytes, leftBytes.length);
      nextLevel.push(await sha256(pair));
    }
    level = nextLevel;
  }

  return {
    root: level[0] || '',
    chunks: chunkHashes.map((hash, index) => ({
      id: index,
      hash,
      size: `${(chunkBuffers[index].length / 1024).toFixed(1)} KB`,
      status: 'ready',
    })),
  };
}

function isValidPublicKey(authorPubKey) {
  return /^0x[0-9a-f]{40,128}$/i.test(authorPubKey.trim());
}

function isExistingHash(hash, existingWorks) {
  return existingWorks.some((work) => {
    const existingHash = typeof work === 'string' ? work : work?.sha256_hash || work?.sha256Hash;
    return typeof existingHash === 'string' && existingHash.toLowerCase() === hash.toLowerCase();
  });
}

export async function analyzeManuscript(file, authorPubKey = '', existingWorks = []) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new TypeError('A readable manuscript file is required');
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const sha256Hash = await sha256(buffer);
  const formatInspection = inspectFormat(file, bytes);
  const entropy = calculateEntropy(bytes);
  const sizeValid = bytes.length > 0 && bytes.length <= MAX_FILE_SIZE;
  const entropyValid = entropy >= 3.5 && entropy <= 7.95;
  const merkle = await calculateMerkleRoot(bytes);
  const isDuplicate = isExistingHash(sha256Hash, existingWorks);
  const keyValid = isValidPublicKey(authorPubKey);
  const merkleValid = merkle.chunks.length > 0 && Boolean(merkle.root);
  const trustScore = isDuplicate ? 0 : Math.min(100, (
    (formatInspection.formatValid ? 40 : 0)
    + (entropyValid && sizeValid ? 25 : 0)
    + (merkleValid ? 20 : 0)
    + (keyValid ? 15 : 0)
  ));

  return {
    sha256Hash,
    merkleRoot: merkle.root,
    chunks: merkle.chunks,
    chunkCount: merkle.chunks.length,
    entropy,
    entropyValid,
    sizeValid,
    format: formatInspection.format,
    formatValid: formatInspection.formatValid,
    formatDetail: formatInspection.detail,
    isDuplicate,
    keyValid,
    merkleValid,
    trustScore: Number(trustScore.toFixed(1)),
    publishable: formatInspection.formatValid && !isDuplicate,
  };
}
