const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the frontend directory first (for styles.css, player.js)
app.use(express.static(path.join(__dirname, '../../frontend')));

// Serve static files from the repo root (for /frontend/public/... paths)
app.use(express.static(path.join(__dirname, '../../')));

// Serve the frontend index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Synthdragon Radio frontend server running on port ${PORT}`);
});
