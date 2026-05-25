# BFHL Backend — Bajaj Finserv Health Dev Challenge

## API Documentation

### GET /bfhl
Returns operation code.

**Response:**
```json
{ "operation_code": 1 }
```

---

### POST /bfhl
Processes a mixed data array and optional base64-encoded file.

**Request Body:**
```json
{
  "data": ["M", "1", "334", "4", "B"],
  "file_b64": "<optional base64 string>"
}
```

**Response:**
```json
{
  "is_success": true,
  "user_id": "hariom_patidar_15082005",
  "email": "hariompatidar231194@acropolis.in",
  "roll_number": "0827CS231097",
  "numbers": ["1", "334", "4"],
  "alphabets": ["M", "B"],
  "highest_lowercase_alphabet": [],
  "is_prime_found": false,
  "file_valid": false
}
```

---

## Local Setup

```bash
npm install
npm start
# Server runs on http://localhost:3000
```

## Deploy on Render

1. Push this repo to GitHub
2. Go to render.com → New Web Service
3. Connect repo, use settings from render.yaml
4. Click "Create Web Service"
