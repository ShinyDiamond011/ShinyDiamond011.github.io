# Dion Gabriel L. Tabanao — Personal Portfolio Website

A personal portfolio website built with vanilla HTML, CSS, and JavaScript, showcasing projects, skills, and contact information. Developed as part of an academic requirement at **Camarines Norte State College**, BS Information Technology.

---

##  Project Overview

This portfolio is a fully responsive, single-page website designed to highlight the developer's background, technical skills, and featured projects. It features smooth scroll animations, a split-screen hero layout, an interactive project gallery, a live contact form, an embedded map, and a simulated payment widget.

The project integrates three external APIs to demonstrate real-world web development capabilities:

- A **live contact form** powered by EmailJS
- An **interactive map** rendered using Leaflet.js with OpenStreetMap tiles
- **Reverse geocoding** using the OpenCage Geocoding API
- A **GitHub Projects API** integration that dynamically loads repository data
- A **simulated payment/donation widget** that validates card details and logs transactions

---

##  Project Structure

```
TABANAO PORTFOLIO/
│
├── index.html              # Main HTML file (single-page structure)
├── styles.css              # All visual styles and responsive layout
├── script.js               # Core interactions (scroll, nav, animations)
├── contact-form.js         # EmailJS form + Leaflet map initialization
├── github-projects.js      # GitHub API integration for project cards
├── donation.js             # Simulated payment widget logic
└── images/
```

---

## APIs Used

### API #1 — GitHub REST API
**File:** `github-projects.js`

**Purpose:** Dynamically fetches repository data (title, description, stars, forks, URL) from the developer's GitHub account (`ShinyDiamond011`) and injects it into the Projects section. Custom overrides (images, descriptions, tech tags) are merged with live GitHub data.

**Endpoint used:**
```
GET https://api.github.com/repos/{username}/{repo}
```

**Repositories fetched:**
- `Last_Shot` — Terminal-based survival game
- `SciBrain` — Web-based science reviewer platform
- `Alamatiko` — Filipino cultural mobile application
- `N.O.R.T.E` — Terminal-based game
- `PrintLn-Print-To-Bee-Information-System-` — Java information system

---

### API #2 — EmailJS
**File:** `contact-form.js`

**Purpose:** Sends contact form submissions directly to the developer's email inbox without requiring a backend server. The form collects name, email, subject, and message — all fields are validated before sending.

**SDK loaded via CDN:**
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
```

**Configuration:**
- Public Key: `idl4qE0qo_kDPSOSH`
- Service ID: `service_81io6fs`
- Template ID: `template_u2rjxtf`

---

### API #3 — Leaflet.js + OpenStreetMap + OpenCage Geocoding API
**File:** `contact-form.js`

**Purpose (Leaflet + OpenStreetMap):** Renders an interactive map in the Contact section pinpointing the developer's location in Daet, Camarines Norte. The map uses a custom-styled marker and popup, and lazy-loads only when the map scrolls into the viewport.

**Purpose (OpenCage):** Performs reverse geocoding on the map coordinates to resolve them into a human-readable city, province, and country label that is dynamically displayed in the map card header.

**Leaflet CSS/JS loaded via CDN:**
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

**OpenCage endpoint used:**
```
GET https://api.opencagedata.com/geocode/v1/json?q={lat}+{lng}&key={API_KEY}
```

---

## Transaction Feature Description

**File:** `donation.js`

The portfolio includes a **"Buy Me a Coffee"** donation widget located in the footer. This feature simulates a complete payment transaction flow to demonstrate frontend form validation and a database logging pipeline.

### How it works:

1. **Amount Selection** — The user selects a preset amount (₱50, ₱100, ₱200) or types a custom value.
2. **Card Input with Live Formatting** — As the user types, the card number is auto-formatted into groups of four digits, and the card brand (Visa, Mastercard, Amex, etc.) is detected and displayed in real time.
3. **Validation** — On submit, the form runs full client-side validation:
   - Amount must be ≥ ₱1
   - Card number is checked using the **Luhn algorithm** (industry-standard checksum)
   - Expiry must be in MM/YY format and must not be in the past
   - CVV must be 3–4 digits
   - Cardholder name must be present
4. **Simulated Processing** — A 1.8-second loading delay mimics real payment gateway processing.
5. **Transaction Logging** — On success, a unique reference number is generated (e.g., `DGT-M4X72-K9AB`) and the transaction record (amount, card last 4 digits, cardholder name, timestamp) is:
   - Saved to **`localStorage`** as a local backup
   - POSTed to a **Google Apps Script Web App** that logs the record to a Google Sheets spreadsheet
6. **Success/Error Feedback** — The user sees either a success message with the reference number or an error prompt.

> **Note:** This is a fully simulated transaction. No real money is charged. Use test card number `4242 4242 4242 4242` to trigger a successful flow.

---

## How to Run / View the Project

### Option A — Open Locally (Quickest)

1. Download or clone the project folder.
2. Open `index.html` directly in any modern web browser (Chrome, Firefox, Edge).
3. All features are functional locally except EmailJS (requires internet) and the map (requires internet for tiles).

> Some browsers block local file API calls. If you encounter issues, use Option B.

### Option B — Live Server (Recommended for Development)

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Open the project folder in VS Code.
4. Right-click `index.html` → **"Open with Live Server"**.
5. The site will open at `http://127.0.0.1:5500` with all features working.

### Option C — GitHub Pages (Live Deployment)

The project can be deployed for free via GitHub Pages:

1. Push all project files to a GitHub repository.
2. Go to **Settings → Pages**.
3. Set the source to the `main` branch, `/ (root)` folder.
4. The live site will be available at: `https://{username}.github.io/{repository-name}`

---

## Technologies Used

| Category | Technologies |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (Custom Properties, Grid, Flexbox, Animations) |
| Scripting | Vanilla JavaScript (ES6+) |
| APIs | GitHub REST API, EmailJS, Leaflet.js, OpenStreetMap, OpenCage Geocoding |
| Storage | localStorage, Google Sheets (via Apps Script) |
| Tools | VS Code, Git, GitHub |

---

## Developer

**Dion Gabriel L. Tabanao**
BS Information Technology — Backend Development
Camarines Norte State College

- 📧 diongabtabz01@gmail.com
- 📞 +63 907 001 0233
- 🔗 [LinkedIn](https://www.linkedin.com/in/dion-gabriel-tabanao-9b050a386/)
- 💻 [GitHub](https://github.com/ShinyDiamond011)

---

*© 2025 Dion Gabriel L. Tabanao. All rights reserved.*
