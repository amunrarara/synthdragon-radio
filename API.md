# API Documentation 📡

**Note**: The backend API is currently in development. This document outlines the planned API structure and endpoints for future implementation.

## 📋 Table of Contents

- [Overview](#overview)
- [Current Status](#current-status)
- [Planned Endpoints](#planned-endpoints)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [WebSocket Events](#websocket-events)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Implementation Guide](#implementation-guide)

## 🌟 Overview

The Synthdragon Radio API will provide programmatic access to:
- Stream information and metadata
- Listener statistics
- Track requests and voting
- Admin controls
- User management
- Real-time updates via WebSocket

**Base URL**: `https://your-domain.com/api/v1`
**Content Type**: `application/json`

## 🚧 Current Status

The backend API (`backend-api/`) exists as a placeholder. To begin development:

1. **Enable the backend service** in `docker-compose.yml`:
   ```yaml
   backend-api:
     build: ./backend-api
     container_name: backend-api
     ports:
       - "4000:4000"
     depends_on:
       - icecast
     environment:
       - NODE_ENV=development
   ```

2. **Install dependencies** in `backend-api/package.json`:
   ```json
   {
     "name": "synthdragon-radio-api",
     "version": "1.0.0",
     "description": "API for Synthdragon Radio",
     "main": "src/index.js",
     "dependencies": {
       "express": "^4.18.0",
       "cors": "^2.8.5",
       "axios": "^1.0.0",
       "ws": "^8.0.0",
       "jsonwebtoken": "^9.0.0",
       "bcrypt": "^5.0.0",
       "sqlite3": "^5.0.0",
       "helmet": "^7.0.0"
     }
   }
   ```

## 🛠️ Planned Endpoints

### Stream Information

#### `GET /api/v1/stream/status`
Get current stream status and metadata.

**Response:**
```json
{
  "status": "online",
  "listeners": 42,
  "currentTrack": {
    "title": "Neon Raceway",
    "artist": "ELFL",
    "duration": 234,
    "startTime": "2024-01-15T20:30:00Z"
  },
  "bitrate": 128,
  "format": "mp3",
  "uptime": 86400
}
```

#### `GET /api/v1/stream/history`
Get recently played tracks.

**Query Parameters:**
- `limit`: Number of tracks (default: 10, max: 50)
- `offset`: Pagination offset

**Response:**
```json
{
  "tracks": [
    {
      "id": "track_123",
      "title": "Purple Voyager",
      "artist": "ELFL",
      "playedAt": "2024-01-15T20:25:00Z",
      "duration": 198
    }
  ],
  "total": 150,
  "pagination": {
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Statistics

#### `GET /api/v1/stats/listeners`
Get listener statistics.

**Query Parameters:**
- `period`: `hour`, `day`, `week`, `month` (default: `day`)

**Response:**
```json
{
  "current": 42,
  "peak": 89,
  "peakTime": "2024-01-15T21:00:00Z",
  "average": 35,
  "history": [
    {
      "timestamp": "2024-01-15T20:00:00Z",
      "count": 38
    }
  ]
}
```

#### `GET /api/v1/stats/tracks`
Get track play statistics.

**Response:**
```json
{
  "totalTracks": 47,
  "totalPlaytime": 7200,
  "mostPlayed": [
    {
      "title": "Neon Raceway",
      "artist": "ELFL",
      "playCount": 15,
      "lastPlayed": "2024-01-15T20:30:00Z"
    }
  ]
}
```

### Track Requests

#### `GET /api/v1/requests/queue`
Get current request queue.

**Response:**
```json
{
  "queue": [
    {
      "id": "req_456",
      "trackId": "track_789",
      "title": "Synthwave Dreams",
      "artist": "Future Sunset",
      "requestedBy": "anonymous",
      "requestedAt": "2024-01-15T20:35:00Z",
      "votes": 3
    }
  ],
  "queueLength": 5,
  "estimatedWait": 900
}
```

#### `POST /api/v1/requests`
Request a track to be played.

**Request Body:**
```json
{
  "trackId": "track_789",
  "message": "Love this track!"
}
```

**Response:**
```json
{
  "id": "req_456",
  "status": "queued",
  "position": 3,
  "estimatedWait": 600
}
```

#### `POST /api/v1/requests/:id/vote`
Vote for a requested track.

**Response:**
```json
{
  "requestId": "req_456",
  "votes": 4,
  "userVote": "up"
}
```

### Playlist Management

#### `GET /api/v1/playlist`
Get current playlist information.

**Response:**
```json
{
  "name": "Synthwave Collection",
  "tracks": [
    {
      "id": "track_123",
      "title": "Neon City",
      "artist": "Cyber Dreams",
      "duration": 245,
      "fileSize": 5894673,
      "addedAt": "2024-01-10T15:30:00Z"
    }
  ],
  "totalTracks": 47,
  "totalDuration": 11543,
  "lastUpdated": "2024-01-15T10:00:00Z"
}
```

#### `GET /api/v1/tracks/search`
Search tracks in the playlist.

**Query Parameters:**
- `q`: Search query
- `artist`: Filter by artist
- `limit`: Number of results (default: 20)

**Response:**
```json
{
  "results": [
    {
      "id": "track_123",
      "title": "Neon City",
      "artist": "Cyber Dreams",
      "duration": 245,
      "relevanceScore": 0.95
    }
  ],
  "totalResults": 8,
  "query": "neon"
}
```

### User Management

#### `POST /api/v1/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "synthwave_fan",
  "email": "user@example.com",
  "password": "secure_password"
}
```

#### `POST /api/v1/auth/login`
Authenticate user and get token.

**Request Body:**
```json
{
  "username": "synthwave_fan",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "username": "synthwave_fan",
    "role": "user"
  },
  "expiresIn": 86400
}
```

#### `GET /api/v1/user/profile`
Get user profile (requires authentication).

**Response:**
```json
{
  "id": "user_123",
  "username": "synthwave_fan",
  "email": "user@example.com",
  "role": "user",
  "joinedAt": "2024-01-01T00:00:00Z",
  "stats": {
    "requestsCount": 15,
    "votesCount": 89
  }
}
```

### Admin Endpoints

#### `GET /api/v1/admin/system`
Get system information (admin only).

**Response:**
```json
{
  "status": "healthy",
  "uptime": 86400,
  "version": "1.0.0",
  "services": {
    "icecast": "online",
    "liquidsoap": "online",
    "database": "online"
  },
  "resources": {
    "cpu": 25.5,
    "memory": 512,
    "disk": 2048
  }
}
```

#### `POST /api/v1/admin/playlist/refresh`
Refresh the playlist from audio files (admin only).

**Response:**
```json
{
  "message": "Playlist refreshed successfully",
  "tracksAdded": 5,
  "tracksRemoved": 2,
  "totalTracks": 47
}
```

#### `POST /api/v1/admin/stream/skip`
Skip current track (admin only).

**Response:**
```json
{
  "message": "Track skipped",
  "previousTrack": {
    "title": "Old Track",
    "artist": "Previous Artist"
  },
  "currentTrack": {
    "title": "New Track",
    "artist": "New Artist"
  }
}
```

## 🔐 Authentication

### Bearer Token Authentication
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles and Permissions
- **`anonymous`**: Can view stream info, make requests, vote
- **`user`**: All anonymous permissions + profile management
- **`moderator`**: All user permissions + queue management
- **`admin`**: All permissions + system controls

### Token Refresh
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

## 📊 Data Models

### Track
```json
{
  "id": "string",
  "title": "string",
  "artist": "string",
  "duration": "number (seconds)",
  "fileSize": "number (bytes)",
  "bitrate": "number (kbps)",
  "sampleRate": "number (Hz)",
  "addedAt": "ISO 8601 timestamp",
  "playCount": "number",
  "lastPlayed": "ISO 8601 timestamp"
}
```

### User
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "enum (user, moderator, admin)",
  "createdAt": "ISO 8601 timestamp",
  "lastLogin": "ISO 8601 timestamp",
  "isActive": "boolean"
}
```

### Request
```json
{
  "id": "string",
  "trackId": "string",
  "userId": "string (optional)",
  "message": "string (optional)",
  "votes": "number",
  "status": "enum (pending, approved, rejected, played)",
  "createdAt": "ISO 8601 timestamp",
  "scheduledAt": "ISO 8601 timestamp (optional)"
}
```

## 🔄 WebSocket Events

**Connection**: `ws://your-domain.com/api/v1/ws`

### Client → Server Events

#### `subscribe`
Subscribe to specific event types.
```json
{
  "type": "subscribe",
  "events": ["trackChange", "listenerCount", "newRequest"]
}
```

#### `heartbeat`
Keep connection alive.
```json
{
  "type": "heartbeat",
  "timestamp": "2024-01-15T20:30:00Z"
}
```

### Server → Client Events

#### `trackChange`
Sent when track changes.
```json
{
  "type": "trackChange",
  "track": {
    "title": "New Track",
    "artist": "Artist Name",
    "duration": 240
  },
  "timestamp": "2024-01-15T20:30:00Z"
}
```

#### `listenerUpdate`
Sent when listener count changes significantly.
```json
{
  "type": "listenerUpdate",
  "current": 45,
  "previous": 42,
  "timestamp": "2024-01-15T20:30:00Z"
}
```

#### `newRequest`
Sent when new track is requested.
```json
{
  "type": "newRequest",
  "request": {
    "id": "req_456",
    "title": "Cool Track",
    "artist": "Cool Artist",
    "votes": 1
  }
}
```

## ❌ Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "TRACK_NOT_FOUND",
    "message": "The requested track could not be found",
    "details": {
      "trackId": "track_999"
    }
  },
  "timestamp": "2024-01-15T20:30:00Z",
  "path": "/api/v1/tracks/track_999"
}
```

### Common Error Codes
- `400 BAD_REQUEST`: Invalid request format
- `401 UNAUTHORIZED`: Authentication required
- `403 FORBIDDEN`: Insufficient permissions
- `404 NOT_FOUND`: Resource not found
- `429 RATE_LIMITED`: Too many requests
- `500 INTERNAL_ERROR`: Server error

## 🚦 Rate Limiting

### Limits by Endpoint Type
- **Stream info**: 60 requests/minute
- **Track requests**: 5 requests/minute
- **Voting**: 30 votes/minute
- **Authentication**: 10 attempts/minute
- **Admin actions**: 30 requests/minute

### Headers
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642276200
```

## 🛠️ Implementation Guide

### Setting Up the Backend

1. **Initialize the Node.js application**:
   ```bash
   cd backend-api
   npm init -y
   npm install express cors axios ws jsonwebtoken bcrypt sqlite3 helmet
   ```

2. **Create basic Express server** (`src/index.js`):
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const helmet = require('helmet');
   
   const app = express();
   const PORT = process.env.PORT || 4000;
   
   // Middleware
   app.use(helmet());
   app.use(cors());
   app.use(express.json());
   
   // Routes
   app.get('/api/v1/stream/status', (req, res) => {
       // Implement stream status logic
       res.json({ status: 'online' });
   });
   
   app.listen(PORT, () => {
       console.log(`API server running on port ${PORT}`);
   });
   ```

3. **Integrate with Icecast**:
   ```javascript
   const axios = require('axios');
   
   async function getIcecastStatus() {
       try {
           const response = await axios.get('http://icecast:8000/status-json.xsl');
           return response.data;
       } catch (error) {
           console.error('Failed to fetch Icecast status:', error);
           return null;
       }
   }
   ```

### Database Schema (SQLite)

```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Tracks table
CREATE TABLE tracks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    filename TEXT NOT NULL,
    duration INTEGER,
    file_size INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    play_count INTEGER DEFAULT 0,
    last_played DATETIME
);

-- Requests table
CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    track_id TEXT NOT NULL,
    user_id TEXT,
    message TEXT,
    votes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_id) REFERENCES tracks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Request votes table
CREATE TABLE request_votes (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    user_id TEXT,
    vote_type TEXT NOT NULL, -- 'up' or 'down'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔮 Future Enhancements

- **Mobile API**: Dedicated endpoints for mobile apps
- **Social Features**: User profiles, favorites, comments
- **Analytics**: Detailed listening patterns and trends  
- **DJ Mode**: Live DJ sessions with chat integration
- **Scheduling**: Automated playlist scheduling
- **External Integration**: Spotify, Last.fm, Discord bots

---

This API documentation will evolve as the backend is implemented. Contributions and feedback are welcome!

🎵 **Building the future of synthwave streaming!** 🎵
