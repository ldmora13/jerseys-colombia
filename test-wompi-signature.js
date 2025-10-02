import crypto from "crypto";

const reference = "ORDER_1759423288689_vwkq72olu";
const amountInCents = 11768100;
const currency = "COP";

const integritySecret = "test_integrity_b6rHdOrpciL2tKgNwpCq0RCUJ6UwrBzR";

// Armar cadena de firma
const signatureString = `${reference}${amountInCents}${currency}${integritySecret}`;

// Generar SHA256 HEX
const signature = crypto
  .createHash("sha256")
  .update(signatureString)
  .digest("hex");

console.log("📄 Cadena firmada:", signatureString);
console.log("🔐 Firma generada:", signature);
console.log("🔑 Longitud secreto:", integritySecret.length);
