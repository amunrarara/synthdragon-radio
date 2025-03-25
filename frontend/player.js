// DOM Elements
const playPauseBtn = document.getElementById('play-pause');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const statusElement = document.getElementById('status-message') || document.createElement('div');

// Configuration
const CONFIG = {
    streamUrl: 'http://localhost:8000/stream',
    metadataUrl: 'http://localhost:8000/status-json.xsl',
    updateInterval: 10000, // 10 seconds between metadata updates
    fallbackArtist: 'Synthdragon Radio'
};

// Stream state
let isPlaying = false;
let metadataUpdateTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Initialize stream once, with proper error handling
const stream = new Howl({
    src: [CONFIG.streamUrl],
    html5: true,
    format: ['mp3', 'aac'],
    autoplay: true,
    preload: true,
    onplay: () => {
        isPlaying = true;
        playPauseBtn.textContent = '⏸︎';
        statusElement.textContent = 'Connected';
    },
    onpause: () => {
        isPlaying = false;
        playPauseBtn.textContent = '▶︎';
        statusElement.textContent = 'Paused';
    },
    onstop: () => {
        isPlaying = false;
        playPauseBtn.textContent = '▶︎';
        statusElement.textContent = 'Stopped';
    },
    onloaderror: (id, err) => {
        console.error('Stream loading error:', err);
        statusElement.textContent = 'Error loading stream';
        handleStreamError();
    },
    onplayerror: (id, err) => {
        console.error('Stream playback error:', err);
        statusElement.textContent = 'Playback error';
        handleStreamError();
    }
});

// Play/Pause button handler
playPauseBtn.addEventListener('click', () => {
    if (!isPlaying) {
        // Only load the stream when needed
        stream.play();
        startMetadataUpdates();
    } else {
        stream.pause();
        stopMetadataUpdates();
    }
});

// Fetch and display current song metadata with better error handling
async function updateTrackInfo() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(CONFIG.metadataUrl, {
            signal: controller.signal,
            cache: 'no-cache' // Prevent caching of metadata
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Handle different Icecast response structures
        let currentTrack = '';
        if (data.icestats && data.icestats.source) {
            // Handle both single source and array of sources
            const source = Array.isArray(data.icestats.source)
                ? data.icestats.source[0]
                : data.icestats.source;

            currentTrack = source.title || '';
        }

        // Simple parsing assuming 'Song Title - Artist' format
        if (currentTrack && currentTrack.includes(' - ')) {
            const [title, artist] = currentTrack.split(' - ');
            songTitle.textContent = title.trim();
            songArtist.textContent = artist.trim();
        } else if (currentTrack) {
            songTitle.textContent = currentTrack;
            songArtist.textContent = CONFIG.fallbackArtist;
        } else {
            songTitle.textContent = 'Unknown Track';
            songArtist.textContent = CONFIG.fallbackArtist;
        }

        // Reset reconnect attempts on success
        reconnectAttempts = 0;

    } catch (error) {
        console.error('Error fetching track info:', error);

        if (error.name === 'AbortError') {
            statusElement.textContent = 'Metadata request timed out';
        } else if (error.message.includes('Failed to fetch')) {
            statusElement.textContent = 'Cannot connect to server';
        } else {
            statusElement.textContent = 'Error updating track info';
        }

        // Don't attempt to reconnect if we're not playing
        if (isPlaying) {
            handleMetadataError();
        }
    }
}

// Handle stream errors with reconnect logic
function handleStreamError() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && isPlaying) {
        reconnectAttempts++;
        statusElement.textContent = `Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`;

        // Try to reconnect after a delay
        setTimeout(() => {
            stream.stop();
            stream.unload();
            stream.load();
            stream.play();
        }, 3000); // Wait 3 seconds before reconnecting
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        statusElement.textContent = 'Could not connect after multiple attempts';
        stopMetadataUpdates();
    }
}

// Handle metadata errors
function handleMetadataError() {
    // If we can't fetch metadata but stream is playing, just continue
    // We'll retry on next interval
}

// Start metadata update interval
function startMetadataUpdates() {
    updateTrackInfo(); // Update immediately

    // Clear any existing timer before setting a new one
    if (metadataUpdateTimer) {
        clearInterval(metadataUpdateTimer);
    }

    // Set new timer
    metadataUpdateTimer = setInterval(updateTrackInfo, CONFIG.updateInterval);
}

// Stop metadata updates
function stopMetadataUpdates() {
    if (metadataUpdateTimer) {
        clearInterval(metadataUpdateTimer);
        metadataUpdateTimer = null;
    }
}

// Clean up resources when page unloads
window.addEventListener('beforeunload', () => {
    stopMetadataUpdates();
    stream.unload();
});
