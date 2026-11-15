export async function sha256FromFile(file) {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return toHex(hashBuf);
}

export async function sha256FromText(text) {
  const data = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return toHex(hashBuf);
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function shortHash(hash, head = 10, tail = 6) {
  if (!hash || hash.length < head + tail) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}