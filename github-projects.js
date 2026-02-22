const GITHUB_CONFIG = {

    // ── username ──────────────────────────────────
    username: 'ShinyDiamond011',

    projects: [
        {
            repo: 'Last_Shot',
            
            // --- Optional overrides (leave null to use GitHub data) ---
            customTitle:       'Last Shot',
            customDescription: 'A terminal-based survival game built around the queue data structure, where players defend against incoming enemies using a cannon with various ammunition types. The gameplay highlights strategic sequencing, quick decision-making, and efficient resource use.',
            customImage:       'images/lastshot.png',
            customType:        'Game Development',
            customStatus:      'Terminal-Based',
            customTech:        ['Java', 'Maven', 'IntelliJ'],
        },
        {
            repo: 'SciBrain',               
            
            customTitle:       'SciBrain',
            customDescription: 'Developed in collaboration with a research team of Grade 12 STEM students from Our Lady Of Lourdes College Foundation and my partner, Emilyn Tagaan, this project is a web-based platform designed to generate comprehensive science reviewers using user-provided learning materials. The system includes interactive annotation features that allow users to highlight and organize key concepts, as well as automatically generated quizzes to reinforce understanding and support more effective learning.',
            customImage:       'images/scibrain.png',
            customType:        'Web Platform',
            customStatus:      null,
            customTech:        ['HTML', 'CSS', 'JavaScript', 'NodeJs', 'SQLite'],
        },
        {
            repo: 'Alamatiko',              
            
            customTitle:       'Alamatiko',
            customDescription: 'A mobile application showcasing Filipino cultural collections of Alamat (legends) and Epiko (epics) for cultural preservation and education. Features interactive storytelling and rich multimedia content.',
            customImage:       'images/alamatiko.png',
            customType:        'Mobile App',
            customStatus:      null,
            customTech:        ['Android Studio', 'Java', 'Firebase', 'XML'],
        },
        {
            repo: 'N.O.R.T.E',
            customTitle:       null,
            customDescription: null,
            customImage:       'images/norte.png',
            customType:        'Terminal-Based Game',
            customStatus:      null,
            customTech:        ['Java', 'Maven', 'IntelliJ'],
        },
        {
            repo: 'PrintLn-Print-To-Bee-Information-System-',
            customTitle:       'PrintLn (Print To Bee Information System)',
            customDescription: null,
            customImage:       'images/print.png',
            customType:        'Information System',
            customStatus:      null,
            customTech:        ['Java', 'MySQL', 'Visual Studio Code'],
        },
    ],
    token: null,
};


/* ============================================================
   CORE FETCHING LOGIC — no need to edit below this line
   ============================================================ */

/**
 * Fetch a single repo's data from the GitHub API.
 */
async function fetchRepo(username, repoName) {
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (GITHUB_CONFIG.token) {
        headers['Authorization'] = `token ${GITHUB_CONFIG.token}`;
    }

    const res = await fetch(
        `https://api.github.com/repos/${username}/${repoName}`,
        { headers }
    );

    if (!res.ok) {
        // Repo not found or rate limited — return null so we skip gracefully
        console.warn(`[GitHub API] Could not fetch repo "${repoName}": ${res.status} ${res.statusText}`);
        return null;
    }
    return res.json();
}


function mergeProjectData(githubData, config, index) {
    // Use overrides first, fall back to GitHub API fields
    const title       = config.customTitle       || (githubData ? githubData.name             : config.repo);
    const description = config.customDescription || (githubData ? githubData.description      : 'No description available.');
    const image       = config.customImage       || null;
    const type        = config.customType        || (githubData ? githubData.language         : 'Project');
    const status      = config.customStatus      || null;
    const githubUrl   = githubData               ? githubData.html_url                         : '#';
    const liveDemo    = config.liveDemo          || '#';
    const stars       = githubData               ? githubData.stargazers_count                 : 0;
    const forks       = githubData               ? githubData.forks_count                      : 0;

    // Tech tags: use override if provided, else derive from GitHub topics + language
    let tech = config.customTech || null;
    if (!tech && githubData) {
        tech = githubData.topics && githubData.topics.length > 0
            ? githubData.topics
            : (githubData.language ? [githubData.language] : []);
    }
    if (!tech) tech = [];

    return { title, description, image, type, status, githubUrl, liveDemo, tech, stars, forks, number: index + 1 };
}

/**
 * Build the SVG icon markup reused in project links.
 */
const SVG = {
    externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    github:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>`,
    star:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;vertical-align:middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    fork:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;vertical-align:middle;"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>`,
};

/**
 * Render tech tags HTML.
 */
function renderTechTags(tech) {
    return tech.map(t => `<span>${t}</span>`).join('');
}

/**
 * Render the GitHub stats badge (stars / forks) if > 0.
 */
function renderStats(stars, forks) {
    if (stars === 0 && forks === 0) return '';
    return `
        <span class="github-stats-badge">
            ${SVG.star} ${stars}
            &nbsp;&nbsp;${SVG.fork} ${forks}
        </span>`;
}

/**
 * Build the featured (full-width, first) project card HTML.
 * Exactly matches your existing .project-featured structure.
 */
function buildFeaturedCard(p) {
    const imagePart = p.image
        ? `<img src="${p.image}" alt="${p.title}" class="project-image">`
        : `<div class="project-image-placeholder"></div>`;

    const statusPart = p.status
        ? `<span class="project-status">${p.status}</span>`
        : '';

    return `
        <div class="project-featured github-loaded" data-repo="${GITHUB_CONFIG.projects[0].repo}">
            <div class="project-featured-image">
                ${imagePart}
                <div class="project-featured-overlay"></div>
                <span class="project-featured-number">0${p.number}</span>
                ${renderStats(p.stars, p.forks)}
            </div>
            <div class="project-featured-content">
                <div class="project-featured-top">
                    <span class="project-type-tag">${p.type}</span>
                    ${statusPart}
                </div>
                <h3 class="project-featured-title">${p.title}</h3>
                <p class="project-featured-desc">${p.description}</p>
                <div class="project-featured-footer">
                    <div class="tech-tags">
                        ${renderTechTags(p.tech)}
                    </div>
                    <div class="project-featured-links">
                        <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
                            ${SVG.github} GitHub
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
}

/**
 * Build a horizontal (side card, second or third) project card HTML.
 * Exactly matches your existing .project-horizontal structure.
 */
function buildHorizontalCard(p, repoName) {
    const imagePart = p.image
        ? `<img src="${p.image}" alt="${p.title}" class="project-image">`
        : `<div class="project-image-placeholder"></div>`;

    return `
        <div class="project-horizontal github-loaded" data-repo="${repoName}">
            <div class="project-horizontal-image">
                ${imagePart}
                <span class="project-horizontal-number">0${p.number}</span>
                ${renderStats(p.stars, p.forks)}
            </div>
            <div class="project-horizontal-content">
                <div class="project-horizontal-top">
                    <span class="project-type-tag">${p.type}</span>
                </div>
                <h3>${p.title}</h3>
                <p>${p.description}</p>
                <div class="tech-tags">
                    ${renderTechTags(p.tech)}
                </div>
                <div class="project-links">
                    <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
                        ${SVG.github} GitHub
                    </a>
                </div>
            </div>
        </div>`;
}

/**
 * Show a subtle status indicator below the section header.
 */
function showApiStatus(type, message) {
    // Remove any existing status badge
    const existing = document.querySelector('.github-api-status');
    if (existing) existing.remove();

    if (type === 'loading') {
        const badge = document.createElement('div');
        badge.className = 'github-api-status github-api-loading';
        badge.innerHTML = `
            <span class="github-spinner"></span>
            <span>Fetching latest projects from GitHub…</span>`;
        const header = document.querySelector('#projects .section-header');
        if (header) header.after(badge);
    }
    // On success we just silently remove the loader
    // On error we show a small dismissable notice
    if (type === 'error') {
        const badge = document.createElement('div');
        badge.className = 'github-api-status github-api-error';
        badge.innerHTML = `
            <span>⚠ Could not reach GitHub API — showing saved projects instead.</span>
            <button onclick="this.parentElement.remove()" aria-label="Dismiss">✕</button>`;
        const header = document.querySelector('#projects .section-header');
        if (header) header.after(badge);
        setTimeout(() => badge.remove(), 6000);
    }
}

/**
 * Inject the styles needed for loading states and the GitHub stats badge.
 * Keeps everything self-contained — no edits needed to styles.css.
 */
function injectGitHubStyles() {
    const style = document.createElement('style');
    style.id = 'github-projects-styles';
    style.textContent = `
        /* ── Loading / error status bar ── */
        .github-api-status {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.7rem 1.4rem;
            border-radius: 30px;
            font-size: 0.85rem;
            font-weight: 600;
            width: fit-content;
            margin: -2rem auto 2.5rem;
            transition: opacity 0.4s ease;
        }
        .github-api-loading {
            background: rgba(27, 40, 69, 0.08);
            border: 1px solid rgba(27, 40, 69, 0.2);
            color: var(--primary-blue);
        }
        .github-api-error {
            background: rgba(200, 60, 60, 0.08);
            border: 1px solid rgba(200, 60, 60, 0.25);
            color: #c83c3c;
            justify-content: space-between;
        }
        .github-api-error button {
            background: none;
            border: none;
            cursor: pointer;
            color: inherit;
            font-size: 0.85rem;
            padding: 0 0.2rem;
            line-height: 1;
        }

        /* ── Spinner ── */
        .github-spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(27, 40, 69, 0.2);
            border-top-color: var(--primary-blue);
            border-radius: 50%;
            animation: gh-spin 0.7s linear infinite;
            flex-shrink: 0;
        }
        @keyframes gh-spin { to { transform: rotate(360deg); } }

        /* ── GitHub stats badge on card images ── */
        .github-stats-badge {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            background: rgba(10, 18, 32, 0.72);
            backdrop-filter: blur(8px);
            color: rgba(255,255,255,0.85);
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.15);
            z-index: 3;
            letter-spacing: 0.4px;
        }

        /* ── Placeholder for repos with no custom image ── */
        .project-image-placeholder {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 60%, var(--accent-blue) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
        }

        /* ── Fade-in when cards are injected ── */
        .github-loaded {
            animation: gh-fade-in 0.55s ease both;
        }
        @keyframes gh-fade-in {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* Stagger the side cards */
        .projects-row .github-loaded:nth-child(2) {
            animation-delay: 0.12s;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Re-attach the project card tilt effect from script.js
 * to the newly injected dynamic cards.
 */
function reattachTilt() {
    document.querySelectorAll('.project-featured, .project-horizontal').forEach(card => {
        // Remove old listeners by cloning (safest way)
        const clone = card.cloneNode(true);
        card.parentNode.replaceChild(clone, card);
    });

    document.querySelectorAll('.project-featured, .project-horizontal').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect    = this.getBoundingClientRect();
            const rotateX = ((e.clientY - rect.top)  - rect.height / 2) / 18;
            const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 18;
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Re-attach placeholder link prevention
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', e => e.preventDefault());
    });
}

/**
 * Main entry point — fetches all configured repos and
 * rebuilds the bento grid. Falls back silently on any error.
 */
async function initGitHubProjects() {
    injectGitHubStyles();

    const bentoContainer = document.querySelector('.projects-bento');
    if (!bentoContainer) {
        console.warn('[GitHub API] .projects-bento container not found.');
        return;
    }

    // Guard: we need at least 1 project configured
    if (!GITHUB_CONFIG.projects || GITHUB_CONFIG.projects.length === 0) {
        console.warn('[GitHub API] No projects configured in GITHUB_CONFIG.projects.');
        return;
    }

    showApiStatus('loading');

    try {
        // Fetch all repos in parallel
        const fetchPromises = GITHUB_CONFIG.projects.map(p =>
            fetchRepo(GITHUB_CONFIG.username, p.repo)
        );
        const githubResults = await Promise.all(fetchPromises);

        // Merge GitHub data with local overrides
        const mergedProjects = GITHUB_CONFIG.projects.map((config, i) =>
            mergeProjectData(githubResults[i], config, i)
        );

        // ── Build HTML ────────────────────────────────────────
        let html = '';

        // First project → featured card
        html += buildFeaturedCard(mergedProjects[0]);

        // Remaining projects → side-by-side row
        if (mergedProjects.length > 1) {
            html += `<div class="projects-row">`;
            for (let i = 1; i < mergedProjects.length; i++) {
                html += buildHorizontalCard(mergedProjects[i], GITHUB_CONFIG.projects[i].repo);
            }
            html += `</div>`;
        }

        // ── Inject into DOM ───────────────────────────────────
        bentoContainer.innerHTML = html;

        // Remove the loading badge silently
        const loadingBadge = document.querySelector('.github-api-status');
        if (loadingBadge) loadingBadge.remove();

        // Re-attach interactions
        reattachTilt();

        console.log(
            `%c[GitHub API] ✓ Loaded ${mergedProjects.length} project(s) for ${GITHUB_CONFIG.username}`,
            'color: #446B9E; font-weight: bold;'
        );

    } catch (err) {
        console.error('[GitHub API] Failed to load projects:', err);

        // Remove loading badge, show error notice, keep hardcoded HTML
        const loadingBadge = document.querySelector('.github-api-status');
        if (loadingBadge) loadingBadge.remove();
        showApiStatus('error');
    }
}

// Kick off after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGitHubProjects);
} else {
    initGitHubProjects();
}