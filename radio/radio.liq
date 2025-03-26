set("log.file.path","/tmp/liquidsoap.log")
set("log.stdout", true)
set("log.level", 4)

# Load playlist (fallible)
playlist_source = playlist(
  "playlist.m3u"
)

# Explicitly guarantee infallibility with fallback silence
radio = fallback(track_sensitive=false, [playlist_source, blank(duration=30.)])

# Output directly (no crossfade)
output.icecast(
  %mp3(bitrate=128),
  host="icecast",
  port=8000,
  password="icecastpass",
  mount="/stream",
  radio
)
