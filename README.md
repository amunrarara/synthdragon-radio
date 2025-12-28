# 🐲 Synthdragon Radio

![Synthdragon Radio Banner](/.github/SynthdragonRadioBanner.jpg)

**A retro synthwave internet radio station with a stunning cyberpunk aesthetic**

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com/)
[![Liquidsoap](https://img.shields.io/badge/Liquidsoap-Streaming-red.svg)](https://liquidsoap.info/)
[![Icecast](https://img.shields.io/badge/Icecast-Broadcasting-orange.svg)](https://icecast.org/)

## 🌟 Features

- **🎵 24/7 Synthwave Music**: Curated playlist of synthwave and retrowave tracks
- **🎨 Retro Cyberpunk UI**: Beautiful animated background with neon aesthetics
- **📱 Responsive Web Player**: Works on desktop and mobile devices
- **🔄 Real-time Metadata**: Live track information display
- **🐳 Docker Containerized**: Easy deployment with Docker Compose
- **🎛️ Liquidsoap Engine**: Professional audio streaming with fallback support
- **📡 Icecast Broadcasting**: Industry-standard streaming server
- **🔧 Modular Architecture**: Separate frontend, backend, and streaming components

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Icecast       │    │   Liquidsoap    │
│   Web Player    │◄──►│   Streaming     │◄──►│   Audio Engine  │
│   (HTML/CSS/JS) │    │   Server        │    │   (Radio Logic) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Port 80       │    │   Port 8000     │    │   Audio Files   │
│   Web Interface │    │   Stream/Admin  │    │   (.wav files)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Audio files in WAV format (place in `radio/audio/` directory)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd synthdragon-radio
   ```

2. **Add your music collection**
   ```bash
   mkdir -p radio/audio
   # Copy your .wav files to radio/audio/
   ```

3. **Update the playlist**
   ```bash
   cd radio
   chmod +x update_playlist.sh
   ./update_playlist.sh
   ```

4. **Start the radio station**
   ```bash
   docker-compose up -d
   ```

5. **Access the web player**
   - Open your browser to `http://localhost` (frontend)
   - Stream URL: `http://localhost:8000/stream`
   - Admin panel: `http://localhost:8000/admin/` (admin/icecastpass)

## 📁 Project Structure

```
synthdragon-radio/
├── 📂 frontend/                 # Web player interface
│   ├── 🎨 index.html           # Main HTML page
│   ├── 🎵 player.js            # Audio player logic
│   ├── 💄 styles.css           # Cyberpunk styling
│   └── 📂 public/              # Static assets
│       ├── 🎨 images/          # Graphics and logos
│       └── 🔤 fonts/           # Custom fonts
├── 📂 radio/                   # Liquidsoap audio engine
│   ├── 🎛️ radio.liq            # Liquidsoap configuration
│   ├── 📝 playlist.m3u         # Generated playlist
│   ├── 🔄 update_playlist.sh   # Playlist generator script
│   ├── 🐳 Dockerfile          # Liquidsoap container
│   └── 📂 audio/              # Music files (not in repo)
├── 📂 icecast/                 # Streaming server
│   ├── ⚙️ icecast.xml          # Icecast configuration
│   └── 🐳 Dockerfile          # Icecast container
├── 📂 backend-api/             # Future API development
│   ├── 📝 src/index.js         # API entry point (placeholder)
│   ├── 📦 package.json         # Node.js dependencies
│   └── 🐳 Dockerfile          # API container
└── 🐳 docker-compose.yml       # Container orchestration
```

## ⚙️ Configuration

### Streaming Settings

**Icecast Configuration** (`icecast/icecast.xml`):
- Default password: `icecastpass` (change for production)
- Stream port: `8000`
- Max clients: `100`
- Format: MP3 @ 128kbps

**Liquidsoap Configuration** (`radio/radio.liq`):
- Playlist source with fallback silence
- Auto-reload playlist on changes
- Metadata broadcasting support

### Frontend Configuration

**Player Settings** (`frontend/player.js`):
```javascript
const CONFIG = {
    streamUrl: 'http://localhost:8000/stream',
    metadataUrl: 'http://localhost:8000/status-json.xsl',
    updateInterval: 10000, // 10 seconds
    fallbackArtist: 'Synthdragon Radio'
};
```

## 🎵 Managing Music

### Adding New Tracks

1. **Add audio files**: Copy `.wav` files to `radio/audio/`
2. **Update playlist**: Run `./radio/update_playlist.sh`
3. **Reload Liquidsoap**: The playlist updates automatically

### Supported Formats

- **Primary**: WAV (uncompressed, best quality)
- **Future**: MP3, FLAC, OGG (modify `update_playlist.sh`)

### Playlist Management

The playlist is automatically generated from files in `radio/audio/`:
- Sorted alphabetically
- Loops continuously
- Supports hot-reloading

## 🐳 Docker Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **Icecast** | `icecast` | 8000 | Stream server & admin |
| **Liquidsoap** | `liquidsoap` | - | Audio processing |
| **Backend** | `backend-api` | 4000 | Future API (disabled) |

### Service Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart icecast

# Stop all services
docker-compose down
```

## 🔧 Development

### Frontend Development

The web player uses vanilla JavaScript with:
- **Howler.js**: Audio playback library
- **Fetch API**: Metadata retrieval
- **CSS Animations**: Cyberpunk visual effects

### Backend Development (Future)

The Node.js API is prepared for:
- Track request system
- Listener statistics
- Admin controls
- Social features

### Local Development Setup

1. **Modify docker-compose.yml** for development:
   ```yaml
   volumes:
     - ./frontend:/frontend
   ```

2. **Enable backend API**:
   ```yaml
   backend-api:
     build: ./backend-api
     ports:
       - "4000:4000"
   ```

## 🎨 Customization

### Visual Theme

**Colors** (CSS custom properties):
```css
:root {
  --neon-pink: #ff006e;
  --neon-blue: #8338ec;
  --cyber-green: #06ffa5;
  --dark-bg: #0d1117;
}
```

**Fonts**:
- `lost-in-south.ttf`: Main title font
- `mokoto.ttf`: UI elements
- `protest-revolution.ttf`: Accent text

### Audio Processing

**Liquidsoap Features**:
- Crossfading (currently disabled)
- Volume normalization
- Fallback silence on errors
- Metadata injection

## 📊 Monitoring

### Stream Health

- **Icecast Admin**: `http://localhost:8000/admin/`
- **Status JSON**: `http://localhost:8000/status-json.xsl`
- **Stream Stats**: `http://localhost:8000/status.xsl`

### Logs

```bash
# Icecast logs
docker-compose logs icecast

# Liquidsoap logs
docker-compose logs liquidsoap

# All services
docker-compose logs -f
```

## 🚨 Troubleshooting

### Common Issues

**Stream not playing**:
- Check if audio files exist in `radio/audio/`
- Verify playlist.m3u is populated
- Ensure Docker containers are running

**Metadata not updating**:
- Check CORS headers in icecast.xml
- Verify status-json.xsl endpoint accessibility
- Check browser console for errors

**Connection refused**:
- Wait for containers to fully start (30-60 seconds)
- Check port availability (8000, 4000)
- Verify Docker network connectivity

### Debug Commands

```bash
# Check container status
docker-compose ps

# Test stream URL
curl -I http://localhost:8000/stream

# Check metadata endpoint
curl http://localhost:8000/status-json.xsl

# Container shell access
docker-compose exec icecast sh
```

## 🛡️ Security

### Production Deployment

1. **Change default passwords** in `icecast.xml`
2. **Use HTTPS** with reverse proxy (nginx/Caddy)
3. **Restrict admin access** by IP
4. **Enable authentication** for sensitive endpoints
5. **Configure firewall** rules

### Default Credentials

- **Icecast Admin**: `admin` / `icecastpass`
- **Icecast Source**: `source` / `icecastpass`

**⚠️ Change these in production!**

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Areas for Contribution

- 🎵 **Music curation**: Add more synthwave tracks
- 🎨 **UI/UX improvements**: Enhanced player features
- 🔧 **Backend development**: API implementation
- 📱 **Mobile optimization**: Better responsive design
- 🔐 **Security enhancements**: Authentication system
- 📊 **Analytics**: Listener statistics
- 🌐 **Internationalization**: Multi-language support

## 📄 License

This project is licensed under the **Mozilla Public License 2.0** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Music Sources**: Epidemic Sound (synthwave collection)
- **Liquidsoap**: Professional audio streaming engine
- **Icecast**: Open-source streaming server
- **Docker**: Containerization platform
- **Synthwave Community**: Inspiration and aesthetic guidance

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](../../issues)
- 💡 **Feature Requests**: [Start a discussion](../../discussions)
- 📧 **Contact**: Create an issue for direct communication

---

<div align="center">

**🎵 Keep the synthwave alive! 🎵**

*Made with 💜 for the synthwave community*

</div>
