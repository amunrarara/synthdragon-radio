const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Determine the base path for frontend files
// In Docker: /app/frontend, locally: ../../frontend relative to src/
const dockerFrontendPath = '/app/frontend';
const localFrontendPath = path.join(__dirname, '../../frontend');
const FRONTEND_PATH = fs.existsSync(dockerFrontendPath) ? dockerFrontendPath : localFrontendPath;

// Determine the base path for repo root (for /frontend/public/... paths)
const dockerRootPath = '/app';
const localRootPath = path.join(__dirname, '../../');
const ROOT_PATH = fs.existsSync(path.join(dockerRootPath, 'frontend')) ? dockerRootPath : localRootPath;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the frontend directory first (for styles.css, player.js)
app.use(express.static(FRONTEND_PATH));

// Serve static files from the repo root (for /frontend/public/... paths)
app.use(express.static(ROOT_PATH));

// Serve the frontend index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Synthdragon Radio frontend server running on port ${PORT}`);
    console.log(`Serving frontend from: ${FRONTEND_PATH}`);
});
