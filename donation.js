/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

// Luhn algorithm — standard credit card number validation
function luhnCheck(cardNumber) {
    const digits = cardNumber.replace(/\s/g, '').split('').reverse().map(Number);
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let d = digits[i];
        if (i % 2 === 1) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }
    return sum % 10 === 0;
}

// Detect card brand from first digits
function detectCardBrand(number) {
    const n = number.replace(/\s/g, '');
    if (/^4/.test(n))               return { brand: 'Visa',       icon: '💳' };
    if (/^5[1-5]/.test(n))          return { brand: 'Mastercard', icon: '💳' };
    if (/^3[47]/.test(n))           return { brand: 'Amex',       icon: '💳' };
    if (/^6(?:011|5)/.test(n))      return { brand: 'Discover',   icon: '💳' };
    return { brand: 'Card', icon: '💳' };
}

// Format card number with spaces every 4 digits
function formatCardNumber(value) {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '₱1 ').trim().substring(0, 19);
}

// Format expiry MM/YY
function formatExpiry(value) {
    const cleaned = value.replace(/\D/g, '').substring(0, 4);
    if (cleaned.length >= 3) {
        return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    return cleaned;
}

function validateDonationForm(data) {
    const errors = {};

    // Amount
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount < 1) {
        errors.amount = 'Please select or enter a valid amount (min ₱1).';
    }

    // Cardholder name
    if (!data.cardName || data.cardName.trim().length < 2) {
        errors.cardName = 'Please enter the cardholder name.';
    }

    // Card number — 16 digits, Luhn valid
    const rawCard = data.cardNumber.replace(/\s/g, '');
    if (rawCard.length < 13 || rawCard.length > 19) {
        errors.cardNumber = 'Please enter a valid card number.';
    } else if (!luhnCheck(rawCard)) {
        errors.cardNumber = 'Card number is invalid. (Use a test number like 4242 4242 4242 4242)';
    }

    // Expiry — MM/YY, not expired
    const expiryMatch = data.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
        errors.expiry = 'Enter expiry as MM/YY.';
    } else {
        const month = parseInt(expiryMatch[1]);
        const year  = parseInt('20' + expiryMatch[2]);
        const now   = new Date();
        if (month < 1 || month > 12) {
            errors.expiry = 'Invalid month.';
        } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
            errors.expiry = 'Your card has expired.';
        }
    }

    // CVV — 3 or 4 digits
    if (!/^\d{3,4}$/.test(data.cvv)) {
        errors.cvv = 'CVV must be 3 or 4 digits.';
    }

    return { valid: Object.keys(errors).length === 0, errors };
}


/* ============================================================
   localStorage — SIMULATED DATABASE
   Key: 'dgt_donations'
   Value: JSON array of donation records
   ============================================================ */
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw7qwBplWbLZXoHjU_rR3fH0XbqW0omVH5dDM1Jmde0n_ZwR31UVF3eaeUYYd9dueqp-A/exec';

async function saveDonationRecord(record) {
    // Save to localStorage as backup
    try {
        const existing = JSON.parse(localStorage.getItem('dgt_donations') || '[]');
        existing.push(record);
        localStorage.setItem('dgt_donations', JSON.stringify(existing));
    } catch (e) {
        console.warn('[Donation] localStorage write failed:', e);
    }

    // POST to Google Sheets (real database transaction)
    try {
        const response = await fetch(SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
            mode: 'no-cors' // required for Apps Script
        });
        console.log('%c[Donation] ✓ Record sent to Google Sheets', 'color: #446B9E; font-weight: bold;', record);
        return true;
    } catch (err) {
        console.error('[Donation] Google Sheets POST failed:', err);
        return false;
    }
}

function generateReference() {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DGT-${ts}-${rand}`;
}


/* ============================================================
   FORM STATE MANAGEMENT
   ============================================================ */
function setDonationState(state, refNumber = '') {
    const btn        = document.getElementById('don-submit-btn');
    const btnText    = document.getElementById('don-btn-text');
    const spinner    = document.getElementById('don-spinner');
    const successEl  = document.getElementById('don-success');
    const errorEl    = document.getElementById('don-error');

    if (!btn) return;

    // Reset
    successEl && (successEl.style.display = 'none');
    errorEl   && (errorEl.style.display   = 'none');
    btn.disabled = false;
    if (spinner)  spinner.style.display  = 'none';
    if (btnText)  btnText.textContent    = 'Support Now';

    if (state === 'loading') {
        btn.disabled = true;
        if (spinner)  spinner.style.display  = 'inline-block';
        if (btnText)  btnText.textContent    = 'Processing…';
    }

    if (state === 'success') {
        if (successEl) {
            const refEl = successEl.querySelector('.don-ref');
            if (refEl) refEl.textContent = refNumber;
            successEl.style.display = 'flex';
        }
    }

    if (state === 'error') {
        if (errorEl) errorEl.style.display = 'flex';
    }
}

function showDonationFieldError(id, message) {
    const field = document.getElementById(id);
    const err   = document.getElementById(`${id}-error`);
    if (field) field.classList.add('don-field-error');
    if (err)   { err.textContent = message; err.style.display = 'block'; }
}

function clearDonationErrors() {
    document.querySelectorAll('.don-input').forEach(el => el.classList.remove('don-field-error'));
    document.querySelectorAll('.don-inline-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}


/* ============================================================
   AMOUNT SELECTOR
   ============================================================ */
function initAmountSelector() {
    const presets     = document.querySelectorAll('.don-preset');
    const customInput = document.getElementById('don-amount-custom');

    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            presets.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (customInput) customInput.value = '';
        });
    });

    if (customInput) {
        customInput.addEventListener('input', () => {
            presets.forEach(b => b.classList.remove('active'));
        });
    }
}

function getSelectedAmount() {
    const activePreset = document.querySelector('.don-preset.active');
    if (activePreset) return activePreset.dataset.amount;
    const custom = document.getElementById('don-amount-custom');
    return custom ? custom.value : '';
}


/* ============================================================
   CARD INPUT FORMATTING
   ============================================================ */
function initCardFormatting() {
    const cardInput  = document.getElementById('don-card-number');
    const expiryInput = document.getElementById('don-expiry');
    const brandEl    = document.getElementById('don-card-brand');

    if (cardInput) {
        cardInput.addEventListener('input', function () {
            const formatted = formatCardNumber(this.value);
            this.value = formatted;
            if (brandEl) {
                const { brand } = detectCardBrand(formatted);
                brandEl.textContent = formatted.length > 0 ? brand : '';
            }
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener('input', function () {
            this.value = formatExpiry(this.value);
        });
    }

    const cvvInput = document.getElementById('don-cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').substring(0, 4);
        });
    }
}


/* ============================================================
   SUBMIT HANDLER
   ============================================================ */
async function handleDonationSubmit(e) {
    e.preventDefault();
    clearDonationErrors();

    const data = {
        amount:     getSelectedAmount(),
        cardName:   document.getElementById('don-card-name')?.value   || '',
        cardNumber: document.getElementById('don-card-number')?.value  || '',
        expiry:     document.getElementById('don-expiry')?.value       || '',
        cvv:        document.getElementById('don-cvv')?.value          || '',
    };

    // ── Step 1: Validate ──────────────────────────────────
    const { valid, errors } = validateDonationForm(data);
    if (!valid) {
        if (errors.amount)     showDonationFieldError('don-amount-custom', errors.amount);
        if (errors.cardName)   showDonationFieldError('don-card-name',     errors.cardName);
        if (errors.cardNumber) showDonationFieldError('don-card-number',   errors.cardNumber);
        if (errors.expiry)     showDonationFieldError('don-expiry',        errors.expiry);
        if (errors.cvv)        showDonationFieldError('don-cvv',           errors.cvv);
        return;
    }

    // ── Step 2: Simulate processing delay ────────────────
    setDonationState('loading');
    await new Promise(resolve => setTimeout(resolve, 1800));

    // ── Step 3: Save to localStorage (simulated DB) ──────
    const refNumber = generateReference();
    const record = {
        ref:       refNumber,
        amount:    parseFloat(data.amount).toFixed(2),
        cardName:  data.cardName.trim(),
        cardLast4: data.cardNumber.replace(/\s/g, '').slice(-4),
        timestamp: new Date().toISOString(),
    };

    const saved = await saveDonationRecord(record);

    if (saved) {
        // ── Step 4: Success response ──────────────────────
        setDonationState('success', refNumber);
        e.target.reset();
        document.querySelectorAll('.don-preset').forEach(b => b.classList.remove('active'));
        document.querySelector('.don-preset[data-amount="100"]')?.classList.add('active');

        console.log('%c[Donation] ✓ Simulated transaction recorded:', 'color: #446B9E; font-weight: bold;', record);
        console.log('[Donation] All records in localStorage:', JSON.parse(localStorage.getItem('dgt_donations') || '[]'));
    } else {
        setDonationState('error');
    }
}


/* ============================================================
   INJECT DONATION STYLES
   ============================================================ */
function injectDonationStyles() {
    const style = document.createElement('style');
    style.id = 'donation-styles';
    style.textContent = `

/* ── Donation widget wrapper ── */
        .donation-widget {
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding: 2.5rem 0 0;
            max-width: 1400px;
            margin: 1rem auto 0;
        }

        .donation-inner {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2rem 2.5rem;
            display: grid;
            grid-template-columns: 220px 1fr;
            gap: 2.5rem;
            align-items: start;
        }

        /* ── Left: label column ── */
        .donation-label {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
        }

        .donation-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(191, 209, 229, 0.1);
            border: 1px solid rgba(191, 209, 229, 0.2);
            border-radius: 20px;
            padding: 0.35rem 0.9rem;
            font-size: 0.72rem;
            font-weight: 700;
            color: var(--lighter-blue);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            width: fit-content;
        }

        .donation-label h4 {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--white);
            line-height: 1.3;
            margin: 0;
        }

        .donation-label p {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.45);
            line-height: 1.6;
            margin: 0;
        }

        .don-secure-note {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.72rem;
            color: rgba(255, 255, 255, 0.3);
            margin-top: 0.25rem;
        }

        .don-secure-note svg {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
        }

        /* ── Right: form area ── */
        .donation-form-area {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        /* ── Amount row ── */
        .don-amounts {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .don-preset {
            padding: 0.45rem 1.1rem;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }

        .don-preset:hover {
            background: rgba(191, 209, 229, 0.12);
            border-color: rgba(191, 209, 229, 0.35);
            color: var(--white);
        }

        .don-preset.active {
            background: rgba(191, 209, 229, 0.18);
            border-color: var(--lighter-blue);
            color: var(--lighter-blue);
        }

        .don-divider {
            color: rgba(255, 255, 255, 0.25);
            font-size: 0.8rem;
            padding: 0 0.1rem;
        }

        .don-custom-wrap {
            position: relative;
            width: 110px;
        }

        .don-currency {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.45);
            font-size: 0.85rem;
            font-weight: 600;
            pointer-events: none;
            z-index: 1;
        }

        /* ── Base input ── */
        .don-input {
            width: 100%;
            padding: 0.65rem 0.9rem;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 8px;
            color: var(--white);
            font-size: 0.85rem;
            font-family: inherit;
            transition: all 0.2s ease;
            outline: none;
            box-sizing: border-box;
        }

        .don-input::placeholder {
            color: rgba(255, 255, 255, 0.25);
        }

        .don-input:focus {
            border-color: rgba(191, 209, 229, 0.5);
            background: rgba(255, 255, 255, 0.09);
            box-shadow: 0 0 0 2px rgba(191, 209, 229, 0.1);
        }

        .don-input.don-field-error {
            border-color: rgba(255, 100, 100, 0.6);
        }

        #don-amount-custom {
            padding-left: 1.8rem;
        }

        /* ── Card number row ── */
        .don-card-brand-row {
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }

        .don-card-brand-row .don-input {
            flex: 1;
        }

        #don-card-brand {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.45);
            font-weight: 600;
            min-width: 55px;
            text-align: right;
            white-space: nowrap;
        }

        /* ── Expiry + CVV row ── */
        .don-card-row {
            display: grid;
            grid-template-columns: 120px 100px 1fr;
            gap: 0.6rem;
            align-items: start;
        }

        /* ── Cardholder name + submit row ── */
        .don-bottom-row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 0.6rem;
            align-items: start;
        }

        /* ── Inline errors ── */
        .don-inline-error {
            font-size: 0.7rem;
            color: rgba(255, 140, 140, 0.9);
            display: none;
            margin-top: 0.2rem;
        }

        /* ── Submit button ── */
        .don-submit-btn {
            padding: 0.65rem 1.4rem;
            background: var(--white);
            color: var(--primary-blue);
            border: none;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            white-space: nowrap;
            transition: all 0.2s ease;
            height: 38px;
        }

        .don-submit-btn:hover:not(:disabled) {
            background: var(--light-blue);
            transform: translateY(-1px);
        }

        .don-submit-btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }

        /* ── Spinner ── */
        .don-spinner {
            display: none;
            width: 13px;
            height: 13px;
            border: 2px solid rgba(27, 40, 69, 0.2);
            border-top-color: var(--primary-blue);
            border-radius: 50%;
            animation: don-spin 0.6s linear infinite;
            flex-shrink: 0;
        }

        @keyframes don-spin { to { transform: rotate(360deg); } }

        /* ── Success / Error ── */
        .don-feedback {
            display: none;
            align-items: flex-start;
            gap: 0.7rem;
            padding: 0.85rem 1rem;
            border-radius: 10px;
            font-size: 0.82rem;
            font-weight: 500;
            line-height: 1.5;
        }

        .don-feedback svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
            margin-top: 1px;
        }

        #don-success {
            background: rgba(80, 200, 120, 0.1);
            border: 1px solid rgba(80, 200, 120, 0.3);
            color: #7de0a0;
        }

        #don-error {
            background: rgba(255, 80, 80, 0.1);
            border: 1px solid rgba(255, 80, 80, 0.3);
            color: rgba(255, 160, 160, 0.9);
        }

        .don-ref {
            font-weight: 700;
            color: #a8edbe;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
            .donation-inner {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            .don-card-row {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media (max-width: 640px) {
            .donation-inner {
                padding: 1.5rem;
            }
            .don-bottom-row {
                grid-template-columns: 1fr;
            }
            .don-submit-btn {
                width: 100%;
            }
            .don-card-row {
                grid-template-columns: 1fr 1fr;
            }
            .don-custom-wrap {
                width: 90px;
            }
        }
    `;
    document.head.appendChild(style);
}


/* ============================================================
   MAIN INIT
   ============================================================ */
function initDonation() {
    injectDonationStyles();
    initAmountSelector();
    initCardFormatting();

    const form = document.getElementById('donation-form');
    if (form) {
        form.addEventListener('submit', handleDonationSubmit);
    }

    console.log('%c[Donation] ✓ Payment simulation initialized', 'color: #446B9E; font-weight: bold;');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDonation);
} else {
    initDonation();
}