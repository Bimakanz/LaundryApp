import { API_BASE_URL } from '../constants/config';

/**
 * Ambil path/URL bukti dari objek transaksi API (Laravel bisa beda-beda penamaan).
 */
export function getProofPathFromTransaction(tx) {
  if (!tx || typeof tx !== 'object') return null;
  const raw =
    tx.payment_proof ??
    tx.payment_proof_url ??
    tx.payment_proof_path ??
    tx.bukti_transfer ??
    tx.bukti_pembayaran ??
    (tx.transaction && (tx.transaction.payment_proof ?? tx.transaction.payment_proof_url));

  if (raw == null || raw === '') return null;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && typeof raw.url === 'string') return raw.url;
  return String(raw);
}

/**
 * Host API tanpa /api — untuk menyusun /storage/...
 */
export function getPublicBaseUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
}

/**
 * URL final untuk Expo Image.
 * - Jika sudah http(s), dipakai apa adanya.
 * - Path relatif: {PUBLIC}/storage/{path} dengan normalisasi agar tidak dobel "storage".
 */
export function buildPaymentProofImageUri(proofValue) {
  const proof = proofValue == null ? '' : String(proofValue).trim();
  if (!proof) return null;
  if (/^https?:\/\//i.test(proof)) return proof;

  const publicBase = getPublicBaseUrl();
  let path = proof.replace(/^\/+/, '');
  if (path.startsWith('storage/')) path = path.slice('storage/'.length);

  return `${publicBase}/storage/${path}`;
}
