#!/bin/bash

AUDIO_DIR="audio"
PLAYLIST="playlist.m3u"

# Create new playlist file
rm -f "$PLAYLIST"
touch "$PLAYLIST"

# Add all .mp3 files from audio dir to playlist with absolute paths
find "$AUDIO_DIR" -maxdepth 1 -type f -iname "*.wav" | sort >> "$PLAYLIST"

echo "Playlist successfully updated at ${PLAYLIST}"
