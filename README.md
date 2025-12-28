![Synthdragon Radio Banner](/.github/SynthdragonRadioBanner.jpg)

# Synthdragon Radio

A self-hosted internet radio station with a cyberpunk/synthwave aesthetic. Synthdragon Radio streams continuous music through an Icecast server powered by Liquidsoap, with a retro-futuristic web player interface.

## Architecture

The project consists of four main components orchestrated via Docker Compose:

**Icecast** serves as the streaming server, handling client connections and delivering the audio stream to listeners. It exposes port 8000 for both the audio stream and metadata API.

**Liquidsoap** handles audio processing and playlist management. It reads from a playlist file, manages track transitions, and streams the output to Icecast in MP3 format at 128kbps.

**Frontend** is a static web player with a synthwave-inspired design featuring an animated grid, neon sun, and city skyline. It uses the Howler.js library for audio playback and fetches track metadata from the Icecast status API.

**Backend API** (work in progress) is a Node.js service intended to provide additional functionality for the radio station.

## Prerequisites

- Docker and Docker Compose
- Audio files in WAV format placed in the `radio/audio/` directory

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/amunrarara/synthdragon-radio.git
   cd synthdragon-radio
   ```

2. Add your audio files to `radio/audio/`. The playlist expects WAV files.

3. Update the playlist (if you've added new audio files):
   ```bash
   cd radio
   ./update_playlist.sh
   ```

4. Start the services:
   ```bash
   docker-compose up -d
   ```

5. Open the frontend in your browser and point it to `http://localhost:8000/stream` to listen.

## Configuration

### Icecast

The Icecast server configuration is located in `icecast/icecast.xml`. Key settings include:

- Maximum clients: 100
- Stream mount point: `/stream`
- Metadata endpoint: `/status-json.xsl`
- CORS headers are enabled for cross-origin access

Default passwords are set to `icecastpass` for source, relay, and admin access. For production deployments, update these in both `icecast/icecast.xml` and `radio/radio.liq`.

### Liquidsoap

The radio configuration is in `radio/radio.liq`. It loads the playlist from `playlist.m3u` and outputs to Icecast. The stream falls back to 30 seconds of silence if the playlist is empty or unavailable.

### Frontend

The web player connects to `http://localhost:8000/stream` by default. To change the stream URL, edit the `CONFIG` object in `frontend/player.js`:

```javascript
const CONFIG = {
    streamUrl: 'http://localhost:8000/stream',
    metadataUrl: 'http://localhost:8000/status-json.xsl',
    updateInterval: 10000,
    fallbackArtist: 'Synthdragon Radio'
};
```

## Project Structure

```
synthdragon-radio/
├── docker-compose.yml      # Service orchestration
├── frontend/
│   ├── index.html          # Web player HTML
│   ├── player.js           # Audio player logic
│   ├── styles.css          # Cyberpunk styling
│   └── public/             # Static assets (images, fonts)
├── icecast/
│   ├── Dockerfile          # Icecast container
│   └── icecast.xml         # Server configuration
├── radio/
│   ├── Dockerfile          # Liquidsoap container
│   ├── radio.liq           # Liquidsoap script
│   ├── playlist.m3u        # Track playlist
│   └── update_playlist.sh  # Playlist generator script
└── backend-api/
    ├── Dockerfile          # Node.js container
    └── src/
        └── index.js        # API entry point (WIP)
```

## Managing the Playlist

The playlist is stored in `radio/playlist.m3u`. To regenerate it from the audio files in `radio/audio/`:

```bash
cd radio
./update_playlist.sh
```

This script scans for WAV files and creates a new playlist. After updating, restart the Liquidsoap container:

```bash
docker-compose restart liquidsoap
```

## Ports

| Service    | Port | Description                    |
|------------|------|--------------------------------|
| Icecast    | 8000 | Stream and admin interface     |
| Backend API| 4000 | REST API (when enabled)        |

## License

This project is licensed under the Mozilla Public License 2.0. See the [LICENSE](LICENSE) file for details.
