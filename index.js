const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Hardcoded user details ──────────────────────────────────────────────────
const USER_ID = "hariom_patidar_15082005";
const EMAIL = "hariompatidar231194@acropolis.in";
const ROLL_NUMBER = "0827CS231097";

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))
app.use(express.json());

// ── Helper: check if a number is prime ─────────────────────────────────────
function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// ── Helper: detect MIME type from magic bytes ───────────────────────────────
function detectMimeType(buffer) {
  // Check magic bytes for common file types
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return "image/gif";
  }
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "application/pdf";
  }
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return "application/zip";
  }
  if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
    return "image/bmp";
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    return "image/webp";
  }
  // Fallback: try to detect text
  const slice = buffer.slice(0, 512).toString("utf8");
  if (/^[\x09\x0A\x0D\x20-\x7E]+$/.test(slice)) {
    return "text/plain";
  }
  return "application/octet-stream";
}

// ── GET /bfhl ───────────────────────────────────────────────────────────────
app.get("/bfhl", (req, res) => {
  return res.status(200).json({ operation_code: 1 });
});

// ── POST /bfhl ──────────────────────────────────────────────────────────────
app.post("/bfhl", (req, res) => {
  try {
    const { data, file_b64 } = req.body;

    // Validate data field
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ is_success: false, error: "data field is missing or not an array" });
    }

    // ── Process numbers and alphabets ──────────────────────────────────────
    const numbers = [];
    const alphabets = [];
    const lowercaseLetters = [];
    let isPrimeFound = false;

    for (const item of data) {
      const str = String(item);

      // Check if it's a valid number (integer or float)
      if (!isNaN(str) && str.trim() !== "") {
        numbers.push(str);
        // Check if integer and prime
        const intVal = parseInt(str, 10);
        if (Number.isInteger(parseFloat(str)) && isPrime(intVal)) {
          isPrimeFound = true;
        }
      }
      // Check if it's a single alphabet character
      else if (/^[a-zA-Z]$/.test(str)) {
        alphabets.push(str);
        if (/^[a-z]$/.test(str)) {
          lowercaseLetters.push(str);
        }
      }
    }

    // Highest lowercase alphabet (last alphabetically)
    let highestLowercaseAlphabet = [];
    if (lowercaseLetters.length > 0) {
      const highest = lowercaseLetters.reduce((a, b) => (a > b ? a : b));
      highestLowercaseAlphabet = [highest];
    }

    // ── Build response ─────────────────────────────────────────────────────
    const response = {
      is_success: true,
      user_id: USER_ID,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      numbers,
      alphabets,
      highest_lowercase_alphabet: highestLowercaseAlphabet,
      is_prime_found: isPrimeFound,
    };

    // ── File handling ──────────────────────────────────────────────────────
    if (file_b64 && file_b64.trim() !== "") {
      try {
        const buffer = Buffer.from(file_b64, "base64");

        // Verify it's valid base64 by re-encoding and comparing
        const reEncoded = buffer.toString("base64");
        // Allow minor padding differences
        if (Math.abs(reEncoded.length - file_b64.replace(/\s/g, "").length) > 4) {
          response.file_valid = false;
        } else {
          response.file_valid = true;
          response.file_mime_type = detectMimeType(buffer);
          response.file_size_kb = String(Math.ceil(buffer.length / 1024));
        }
      } catch (fileErr) {
        response.file_valid = false;
      }
    } else {
      response.file_valid = false;
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error("Error processing request:", err);
    return res.status(500).json({ is_success: false, error: "Internal server error" });
  }
});

// ── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`BFHL Backend running on port ${PORT}`);
});
