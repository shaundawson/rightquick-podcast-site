/* ============================================
   RIGHT QUICK PODCAST - MAIN JAVASCRIPT
   ============================================
   Handles: Episodes API, form submission, footer year
   ============================================ */

// These will be injected by Amplify env vars in production
// For local dev, use .env file or APP_CONFIG
const SPOTIFY_SHOW_ID = window.APP_CONFIG?.SPOTIFY_SHOW_ID || '3nwEyCN9eUwP7QKneoYYiJ';
const APPLE_PODCAST_ID = window.APP_CONFIG?.APPLE_PODCAST_ID || '1849280234';
const API_ENDPOINT = 'https://6fh6qddx41.execute-api.us-east-1.amazonaws.com/prod/spotify-proxy/api/episodes';

let spotifyToken = null;

let appleEpisodes = {};

document.addEventListener('DOMContentLoaded', () => {
    updateCopyrightYear();
    fetchApplePodcastEpisodes().then(() => {
        displayEpisodesAsTable();
    });
});

/* ============================================
   FOOTER - Update copyright year
   ============================================ */

function updateCopyrightYear() {
    const copyrightElement = document.getElementById('footer-copyright');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `© Right Quick ${currentYear}. All Rights Reserved.`;
    }
}

/* ============================================
   SPOTIFY API - Fetch episodes from Lambda
   ============================================ */

async function fetchSpotifyEpisodesData() {
    try {
        console.log('📻 Fetching episodes from:', API_ENDPOINT);
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const episodes = await response.json();
        console.log('📻 Episodes fetched:', episodes.length);
        return episodes;
    } catch (error) {
        console.error('❌ Error fetching episodes:', error);
        showError('Could not load episodes. Try refreshing the page.');
        return null;
    }
}

/* ============================================
   APPLE PODCASTS API - Fetch episodes
   ============================================ */

async function fetchApplePodcastEpisodes() {
    try {
        console.log('🍎 Fetching Apple Podcasts episodes...');

        const response = await fetch(
            `https://itunes.apple.com/lookup?id=${APPLE_PODCAST_ID}&entity=podcastEpisode&limit=200`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Apple Podcasts');
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const episodes = data.results.slice(1);
            console.log(`🍎 Found ${episodes.length} episodes on Apple Podcasts`);

            episodes.forEach((ep) => {
                const releaseDate = ep.releaseDate ? ep.releaseDate.split('T')[0] : '';
                const trackUrl = ep.trackViewUrl;

                appleEpisodes[releaseDate] = {
                    title: ep.trackName,
                    url: trackUrl
                };
            });

            console.log('✅ Apple episodes ready for matching');
        }
    } catch (error) {
        console.error('⚠️ Warning: Could not fetch Apple Podcasts:', error);
    }
}

/* ============================================
   DISPLAY EPISODES - Create cards
   ============================================ */

async function displayEpisodesAsTable() {
    const container = document.getElementById('episodes-container');

    const episodes = await fetchSpotifyEpisodesData();

    if (!episodes || episodes.length === 0) {
        container.innerHTML = '<div class="episode-empty">No episodes available.</div>';
        return;
    }

    const sortedEpisodes = episodes.sort(
        (a, b) => new Date(b.release_date) - new Date(a.release_date)
    );

    let gridHTML = '<div class="episodes-grid">';

    sortedEpisodes.forEach(episode => {
        gridHTML += createEpisodeCard(episode);
    });

    gridHTML += '</div>';

    container.innerHTML = gridHTML;
}

/* Create individual episode card */
function createEpisodeCard(episode) {
    const title = episode.name || 'Untitled Episode';
    const releaseDate = new Date(episode.release_date);
    const durationMs = episode.duration_ms || 0;
    const spotifyUrl = episode.external_urls?.spotify || '#';
    const descriptionFull = episode.description || '';
    const episodeImage = episode.images?.[0]?.url || 'artwork.png';

    const description =
        descriptionFull.length > 800
            ? descriptionFull.slice(0, 800) + '…'
            : descriptionFull;

    const duration = formatDuration(durationMs);

    const dateStr = releaseDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const dateKey = releaseDate.toISOString().split('T')[0];
    let finalAppleUrl = `https://podcasts.apple.com/podcast/id${APPLE_PODCAST_ID}`;

    if (appleEpisodes[dateKey]) {
        finalAppleUrl = appleEpisodes[dateKey].url;
    }

    return `
      <article class="episode-card">
        <div class="episode-card-inner">
          <div class="episode-image-wrapper">
            <img src="${episodeImage}" alt="${escapeHtml(title)}" class="episode-artwork">
          </div>

          <div class="episode-content">
            <div class="episode-meta">
              <span class="episode-date">${escapeHtml(dateStr)}</span>
              <span class="episode-duration">${escapeHtml(duration)}</span>
            </div>

            <h3 class="episode-title">
              ${escapeHtml(title)}
            </h3>

            <p class="episode-description">${escapeHtml(description)}</p>

            <div class="episode-footer">
              <a href="${spotifyUrl}" target="_blank" rel="noopener noreferrer"
                 class="episode-btn episode-btn-spotify" title="Listen on Spotify">
                <i class="fa-brands fa-spotify" aria-hidden="true"></i>
                <span>Listen on Spotify</span>
              </a>
              <a href="${finalAppleUrl}" target="_blank" rel="noopener noreferrer"
                 class="episode-btn episode-btn-apple" title="Listen on Apple Podcasts">
                <i class="fa-brands fa-apple" aria-hidden="true"></i>
                <span>Listen on Apple Podcasts</span>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
}

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

function formatDuration(ms) {
    if (!ms || ms === 0) return '';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    }
    if (seconds > 0) {
        parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    }

    return parts.join(' ');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showError(message) {
    const container = document.getElementById('episodes-container');
    container.innerHTML = `
        <div class="episode-empty">
            ${message}<br>
            <a href="https://open.spotify.com/show/3nwEyCN9eUwP7QKneoYYiJ"
               target="_blank"
               style="color: #FF6037; text-decoration: underline; margin-top: 12px; display: inline-block;">
               Listen on Spotify →
            </a>
        </div>
    `;
}

/* ============================================
   CONTACT FORM - Handle submission
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formMessage = document.getElementById('formMessage');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        access_key: 'YOUR_WEB3FORMS_KEY',
                        name: name,
                        email: email,
                        message: message
                    })
                });

                if (response.ok) {
                    formMessage.className = 'form-message success show';
                    formMessage.textContent = '✅ Message sent! We\'ll get back to you soon.';
                    contactForm.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                formMessage.className = 'form-message error show';
                formMessage.textContent = '❌ Error sending message. Please try again.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    }
});
