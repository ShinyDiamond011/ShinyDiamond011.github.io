const EMAILJS_CONFIG = {
    publicKey:  'idl4qE0qo_kDPSOSH',
    serviceId:  'service_81io6fs',
    templateId: 'template_u2rjxtf',
};

const MAP_CONFIG = {
    lat:   14.104402,
    lng:   122.947862,
    zoom:  16,
    label: 'Purok 1, Brgy. Camambugan, Daet',
};

const OPENCAGE_API_KEY = '28f20208ae9a41cd971bb2f93a8f0c46';


/* ============================================================
   EMAILJS INITIALIZATION
   ============================================================ */
function initEmailJS() {
    if (typeof emailjs === 'undefined') {
        console.warn('[EmailJS] SDK not loaded. Make sure the EmailJS script tag is in index.html.');
        return;
    }
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log('%c[EmailJS] ✓ Initialized', 'color: #446B9E; font-weight: bold;');
}


/* ============================================================
   FORM VALIDATION
   ============================================================ */
function validateContactForm(data) {
    const errors = {};

    if (!data.from_name || data.from_name.trim().length < 2) {
        errors.name = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.from_email || !emailRegex.test(data.from_email.trim())) {
        errors.email = 'Please enter a valid email address.';
    }

    if (!data.subject || data.subject.trim().length < 3) {
        errors.subject = 'Please enter a subject (at least 3 characters).';
    }

    if (!data.message || data.message.trim().length < 20) {
        errors.message = 'Your message is too short. Please write at least 20 characters.';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}


/* ── Inline error display helpers ─── */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (field) field.classList.add('field-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

function clearFieldErrors() {
    document.querySelectorAll('.cf-input, .cf-textarea').forEach(el => {
        el.classList.remove('field-error');
    });
    document.querySelectorAll('.cf-field-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

function setFormState(state) {
    const btn        = document.getElementById('cf-submit-btn');
    const btnText    = document.getElementById('cf-btn-text');
    const btnSpinner = document.getElementById('cf-btn-spinner');
    const successMsg = document.getElementById('cf-success');
    const errorMsg   = document.getElementById('cf-error');

    if (!btn) return;

    successMsg && (successMsg.style.display = 'none');
    errorMsg   && (errorMsg.style.display   = 'none');
    btn.disabled = false;
    if (btnSpinner) btnSpinner.style.display = 'none';
    if (btnText)    btnText.textContent = 'Send Message';

    if (state === 'loading') {
        btn.disabled = true;
        if (btnSpinner) btnSpinner.style.display = 'inline-block';
        if (btnText)    btnText.textContent = 'Sending…';
    }
    if (state === 'success') {
        successMsg && (successMsg.style.display = 'flex');
    }
    if (state === 'error') {
        errorMsg && (errorMsg.style.display = 'flex');
    }
}


/* ============================================================
   FORM SUBMIT HANDLER
   ============================================================ */
async function handleContactSubmit(e) {
    e.preventDefault();
    clearFieldErrors();

    const form = e.target;
    const data = {
        from_name:  form.querySelector('#cf-name').value,
        from_email: form.querySelector('#cf-email').value,
        subject:    form.querySelector('#cf-subject').value,
        message:    form.querySelector('#cf-message').value,
        to_name:    'Dion Gabriel',
    };

    const { valid, errors } = validateContactForm(data);
    if (!valid) {
        if (errors.name)    showFieldError('cf-name',    errors.name);
        if (errors.email)   showFieldError('cf-email',   errors.email);
        if (errors.subject) showFieldError('cf-subject', errors.subject);
        if (errors.message) showFieldError('cf-message', errors.message);
        return;
    }

    setFormState('loading');

    try {
        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            data
        );
        setFormState('success');
        form.reset();
        console.log('%c[EmailJS] ✓ Message sent successfully', 'color: #446B9E; font-weight: bold;');
    } catch (err) {
        setFormState('error');
        console.error('[EmailJS] Send failed:', err);
    }
}


/* ============================================================
   LEAFLET MAP INITIALIZATION
   API #3 — OpenCage Geocoding API + Leaflet + OpenStreetMap
   ============================================================ */
async function initMap() {
    const mapContainer = document.getElementById('contact-map');
    if (!mapContainer) return;

    if (typeof L === 'undefined') {
        console.warn('[Leaflet] Library not loaded.');
        mapContainer.innerHTML = `
            <div class="map-fallback">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Camarines Norte, Philippines</span>
            </div>`;
        return;
    }

    // ── API #3: OpenCage Geocoding API call ───────────────
    let city     = 'Daet';
    let province = 'Camarines Norte';
    let country  = 'Philippines';

    try {
        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${MAP_CONFIG.lat}+${MAP_CONFIG.lng}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const components = data.results[0].components;
            city     = components.city || components.town || components.municipality || 'Daet';
            province = components.state || components.province || 'Camarines Norte';
            country  = components.country || 'Philippines';
            console.log('%c[OpenCage] ✓ Location resolved:', 'color: #446B9E; font-weight: bold;', data.results[0].formatted);
        }
    } catch (err) {
        console.warn('[OpenCage] Could not fetch location data. Using fallback labels.', err);
    }

    // ── Update card header with resolved data ─────────────
    const mapCardP = document.querySelector('.map-card-header p');
    if (mapCardP) {
        mapCardP.innerHTML = `${MAP_CONFIG.label}<br>${city}, ${province}, ${country}`;
    }

    // ── Render Leaflet map ────────────────────────────────
    const map = window._leafletMap = L.map('contact-map', {
        center:          [MAP_CONFIG.lat, MAP_CONFIG.lng],
        zoom:            MAP_CONFIG.zoom,
        scrollWheelZoom: false,
        zoomControl:     true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    // Force tile refresh after map renders
    setTimeout(() => map.invalidateSize(), 300);

    const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
            <div class="map-pin">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            </div>`,
        iconSize:    [40, 40],
        iconAnchor:  [20, 40],
        popupAnchor: [0, -44],
    });

    L.marker([MAP_CONFIG.lat, MAP_CONFIG.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
            <div class="map-popup">
                <strong>Dion Gabriel L. Tabanao</strong>
                <span>${MAP_CONFIG.label}</span>
                <span>${city}, ${province}</span>
                <span>${country}</span>
            </div>`, {
            maxWidth: 200,
            className: 'custom-popup',
        })
        .openPopup();

    console.log('%c[Leaflet] ✓ Map initialized', 'color: #446B9E; font-weight: bold;');
}


/* ============================================================
   INJECT ALL STYLES
   ============================================================ */
function injectContactStyles() {
    const style = document.createElement('style');
    style.id = 'contact-form-styles';
    style.textContent = `

        /* ── Contact layout wrapper ── */
        .contact-bottom {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-top: 2.5rem;
        }

        /* ── Contact Form Card ── */
        .contact-form-card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 20px;
            padding: 2rem;
        }

        .contact-form-card h3 {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--white);
            margin-bottom: 1.4rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            letter-spacing: 0.3px;
        }

        .contact-form-card h3 svg {
            width: 18px;
            height: 18px;
            opacity: 0.8;
        }

        /* ── Form fields ── */
        .cf-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.9rem;
        }

        .cf-field {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            margin-bottom: 0.9rem;
        }

        .cf-field label {
            font-size: 0.75rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .cf-input,
        .cf-textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 10px;
            color: var(--white);
            font-size: 0.9rem;
            font-family: inherit;
            transition: all 0.25s ease;
            outline: none;
        }

        .cf-input::placeholder,
        .cf-textarea::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }

        .cf-input:focus,
        .cf-textarea:focus {
            border-color: rgba(191, 209, 229, 0.6);
            background: rgba(255, 255, 255, 0.11);
            box-shadow: 0 0 0 3px rgba(191, 209, 229, 0.12);
        }

        .cf-input.field-error,
        .cf-textarea.field-error {
            border-color: rgba(255, 100, 100, 0.7);
            background: rgba(255, 80, 80, 0.07);
        }

        .cf-textarea {
            resize: vertical;
            min-height: 100px;
        }

        .cf-field-error {
            font-size: 0.72rem;
            color: rgba(255, 140, 140, 0.95);
            display: none;
            margin-top: 0.15rem;
        }

        /* ── Submit button ── */
        .cf-submit-btn {
            width: 100%;
            padding: 0.85rem 1.5rem;
            background: var(--white);
            color: var(--primary-blue);
            border: none;
            border-radius: 10px;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            transition: all 0.25s ease;
            margin-top: 0.4rem;
            letter-spacing: 0.2px;
        }

        .cf-submit-btn:hover:not(:disabled) {
            background: var(--light-blue);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 255, 255, 0.25);
        }

        .cf-submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .cf-submit-btn svg {
            width: 17px;
            height: 17px;
        }

        /* ── Button spinner ── */
        .cf-spinner {
            display: none;
            width: 15px;
            height: 15px;
            border: 2px solid rgba(27, 40, 69, 0.25);
            border-top-color: var(--primary-blue);
            border-radius: 50%;
            animation: cf-spin 0.65s linear infinite;
            flex-shrink: 0;
        }

        @keyframes cf-spin { to { transform: rotate(360deg); } }

        /* ── Success / Error banners ── */
        .cf-success,
        .cf-error-msg {
            display: none;
            align-items: center;
            gap: 0.7rem;
            padding: 0.9rem 1.1rem;
            border-radius: 10px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-top: 0.9rem;
        }

        .cf-success {
            background: rgba(80, 200, 120, 0.15);
            border: 1px solid rgba(80, 200, 120, 0.4);
            color: #7de0a0;
        }

        .cf-error-msg {
            background: rgba(255, 80, 80, 0.12);
            border: 1px solid rgba(255, 80, 80, 0.35);
            color: rgba(255, 160, 160, 0.95);
        }

        .cf-success svg,
        .cf-error-msg svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }

        /* ── Map card ── */
        .contact-map-card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 20px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            min-height: 400px;
        }

        .map-card-header {
            padding: 1.4rem 2rem 1rem;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
        }

        .map-card-header h3 {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--white);
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }

        .map-card-header h3 svg {
            width: 18px;
            height: 18px;
            opacity: 0.8;
        }

        .map-card-header p {
            font-size: 0.82rem;
            color: rgba(255, 255, 255, 0.55);
            line-height: 1.5;
            margin-top: 0.25rem;
        }

        .map-open-link {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.45rem 0.9rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-size: 0.75rem;
            font-weight: 600;
            white-space: nowrap;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }

        .map-open-link:hover {
            background: rgba(255, 255, 255, 0.18);
            color: var(--white);
        }

        .map-open-link svg {
            width: 12px;
            height: 12px;
        }

        /* ── Leaflet map container ── */
        #contact-map {
            flex: 1;
            min-height: 300px;
            height: 300px;
            width: 100%;
            position: relative;
            z-index: 0;
        }

        /* ── Fix Leaflet tile rendering ── */
        .leaflet-container {
            background: #e8e8e8 !important;
            height: 100% !important;
        }

        .leaflet-tile-pane {
            opacity: 1 !important;
        }

        /* ── Custom Leaflet marker ── */
        .custom-map-marker {
            background: none !important;
            border: none !important;
        }

        .map-pin {
            width: 40px;
            height: 40px;
            color: #446B9E;
            filter: drop-shadow(0 4px 8px rgba(27, 40, 69, 0.5));
            transition: transform 0.2s ease;
        }

        .map-pin:hover {
            transform: scale(1.15);
        }

        .map-pin svg {
            width: 100%;
            height: 100%;
        }

        /* ── Leaflet popup custom style ── */
        .custom-popup .leaflet-popup-content-wrapper {
            background: var(--primary-blue);
            color: var(--white);
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(27, 40, 69, 0.5);
            border: 1px solid rgba(191, 209, 229, 0.2);
        }

        .custom-popup .leaflet-popup-tip {
            background: var(--primary-blue);
        }

        .map-popup {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
        }

        .map-popup strong {
            font-size: 0.9rem;
            color: var(--lighter-blue);
        }

        .map-popup span {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.75);
        }

        /* ── Map fallback ── */
        .map-fallback {
            height: 100%;
            min-height: 280px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.8rem;
            color: rgba(255,255,255,0.5);
            font-size: 0.9rem;
        }

        .map-fallback svg {
            width: 36px;
            height: 36px;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
            .contact-bottom {
                grid-template-columns: 1fr;
            }
            .cf-row {
                grid-template-columns: 1fr;
            }
            #contact-map {
                min-height: 240px;
                height: 240px;
            }
        }

        @media (max-width: 640px) {
            .contact-form-card,
            .map-card-header {
                padding: 1.4rem;
            }
        }
    `;
    document.head.appendChild(style);
}


/* ============================================================
   MAIN INIT
   ============================================================ */
function initContactFeatures() {
    injectContactStyles();
    initEmailJS();

    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }

    // ── Initialize map when it scrolls into view ──────────
    const mapContainer = document.getElementById('contact-map');
    if (mapContainer) {
        let mapInitialized = false;
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !mapInitialized) {
                    mapInitialized = true;
                    mapObserver.disconnect();
                    initMap().then(() => {
                        // Extra invalidateSize after a short delay
                        // to guarantee tiles render correctly
                        setTimeout(() => {
                            if (window._leafletMap) {
                                window._leafletMap.invalidateSize();
                            }
                        }, 400);
                    });
                }
            });
        }, { threshold: 0.1 });
        mapObserver.observe(mapContainer);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactFeatures);
} else {
    initContactFeatures();
}