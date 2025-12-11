import { setupMockAPI } from './mock-api.js';

export default {
    root: './',
    server: {
        port: 3000,
        open: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        middlewareMode: false,
        middleware: [
            (req, res, next) => {
                if (req.url === '/api/episodes') {
                    const mockEpisodes = [
                        {
                            name: 'Episode 1: Unpacking the Latest Hot Takes',
                            release_date: '2024-12-10',
                            duration_ms: 1800000,
                            description: 'Nandi and Vance break down the week\'s biggest pop culture moments with their signature unfiltered commentary.',
                            images: [{ url: 'https://via.placeholder.com/300x300?text=Right+Quick+Ep+1' }],
                            external_urls: { spotify: 'https://open.spotify.com/show/3nwEyCN9eUwP7QKneoYYiJ' }
                        },
                        {
                            name: 'Episode 2: Why We\'re Obsessed With This Show',
                            release_date: '2024-12-03',
                            duration_ms: 2100000,
                            description: 'A deep dive into the Netflix series everyone is talking about. Why it\'s good, why it\'s problematic, and why we can\'t stop watching.',
                            images: [{ url: 'https://via.placeholder.com/300x300?text=Right+Quick+Ep+2' }],
                            external_urls: { spotify: 'https://open.spotify.com/show/3nwEyCN9eUwP7QKneoYYiJ' }
                        },
                        {
                            name: 'Episode 3: Celebrity Drama We Can\'t Ignore',
                            release_date: '2024-11-26',
                            duration_ms: 1950000,
                            description: 'When celebrities go wrong: the feuds, the controversies, and the tea that keeps on brewing.',
                            images: [{ url: 'https://via.placeholder.com/300x300?text=Right+Quick+Ep+3' }],
                            external_urls: { spotify: 'https://open.spotify.com/show/3nwEyCN9eUwP7QKneoYYiJ' }
                        }
                    ];
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(mockEpisodes));
                } else {
                    next();
                }
            }
        ]
    },
    build: {
        outDir: 'dist'
    }
};
