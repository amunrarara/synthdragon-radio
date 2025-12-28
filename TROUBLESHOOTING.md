# Troubleshooting Guide 🔧

This guide helps you diagnose and fix common issues with Synthdragon Radio.

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Common Issues](#common-issues)
- [Frontend Problems](#frontend-problems)
- [Streaming Issues](#streaming-issues)
- [Docker Container Problems](#docker-container-problems)
- [Audio Problems](#audio-problems)
- [Performance Issues](#performance-issues)
- [Network and Connectivity](#network-and-connectivity)
- [Advanced Troubleshooting](#advanced-troubleshooting)
- [Getting Help](#getting-help)

## 🚀 Quick Diagnostics

Before diving into specific issues, run these commands to get an overview:

```bash
# Check container status
docker-compose ps

# Check system resources
htop
df -h

# Test stream connectivity
curl -I http://localhost:8000/stream

# Check metadata endpoint
curl http://localhost:8000/status-json.xsl

# View recent logs
docker-compose logs --tail=50
```

## ❗ Common Issues

### Issue: Services Won't Start

**Symptoms:**
- `docker-compose up` fails
- Containers exit immediately
- Port binding errors

**Diagnosis:**
```bash
# Check detailed logs
docker-compose logs

# Check for port conflicts
sudo netstat -tlnp | grep -E ":(80|8000|4000)"

# Check system resources
free -h
df -h
```

**Solutions:**

1. **Port conflicts:**
   ```bash
   # Kill processes using required ports
   sudo fuser -k 8000/tcp
   sudo fuser -k 80/tcp
   
   # Or change ports in docker-compose.yml
   ports:
     - "8080:8000"  # Use different host port
   ```

2. **Resource issues:**
   ```bash
   # Free up disk space
   docker system prune -af
   sudo apt autoremove
   
   # Check available memory
   free -h
   ```

3. **Permission problems:**
   ```bash
   # Fix Docker permissions
   sudo chown -R $USER:docker /opt/synthdragon-radio
   
   # Add user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

### Issue: Stream Not Playing

**Symptoms:**
- Web player shows "offline" or error
- No audio playback
- Connection timeouts

**Diagnosis:**
```bash
# Test stream URL directly
curl -v http://localhost:8000/stream

# Check Icecast status
curl http://localhost:8000/status-json.xsl | jq .

# Verify audio files
ls -la radio/audio/
file radio/audio/*.wav
```

**Solutions:**

1. **Missing audio files:**
   ```bash
   # Check if audio directory exists and has files
   ls -la radio/audio/
   
   # Update playlist if files were added
   cd radio && ./update_playlist.sh
   
   # Restart Liquidsoap
   docker-compose restart liquidsoap
   ```

2. **Liquidsoap configuration errors:**
   ```bash
   # Check Liquidsoap logs
   docker-compose logs liquidsoap
   
   # Validate Liquidsoap syntax
   docker-compose exec liquidsoap liquidsoap --check-lib
   ```

3. **Icecast not receiving stream:**
   ```bash
   # Check Icecast admin panel
   open http://localhost:8000/admin/
   
   # Verify mount point
   curl http://localhost:8000/status-json.xsl | jq '.icestats.source'
   ```

## 🌐 Frontend Problems

### Issue: Web Page Won't Load

**Symptoms:**
- Browser shows connection refused
- 404 errors
- Blank page

**Solutions:**

1. **Check if frontend service is running:**
   ```bash
   docker-compose ps frontend
   docker-compose logs frontend
   ```

2. **Verify HTML file:**
   ```bash
   # Check file exists
   ls -la frontend/index.html
   
   # Test local file access
   open frontend/index.html
   ```

3. **Port configuration:**
   ```bash
   # Check if port 80 is available
   sudo netstat -tlnp | grep :80
   
   # Test on different port
   # Modify docker-compose.yml ports section
   ```

### Issue: Player Controls Not Working

**Symptoms:**
- Play button doesn't respond
- JavaScript errors in console
- UI elements not interactive

**Diagnosis:**
```bash
# Open browser developer tools (F12)
# Check Console tab for JavaScript errors
# Check Network tab for failed requests
```

**Solutions:**

1. **JavaScript errors:**
   ```javascript
   // Common fixes in player.js
   
   // Check Howler.js is loaded
   if (typeof Howl === 'undefined') {
       console.error('Howler.js not loaded');
   }
   
   // Verify DOM elements exist
   if (!document.getElementById('play-pause')) {
       console.error('Play button not found');
   }
   ```

2. **CORS issues:**
   ```bash
   # Add CORS headers to icecast.xml
   <http-headers>
       <header name="Access-Control-Allow-Origin" value="*" />
   </http-headers>
   ```

3. **Network connectivity:**
   ```bash
   # Test from browser console
   fetch('http://localhost:8000/stream')
     .then(response => console.log('Stream OK'))
     .catch(error => console.error('Stream failed:', error));
   ```

## 📡 Streaming Issues

### Issue: Poor Audio Quality

**Symptoms:**
- Distorted audio
- Crackling sounds
- Low volume

**Solutions:**

1. **Check source audio quality:**
   ```bash
   # Analyze audio files
   file radio/audio/*.wav
   mediainfo radio/audio/sample.wav
   ```

2. **Adjust Liquidsoap encoding:**
   ```liquidsoap
   # In radio.liq, increase bitrate
   output.icecast(
     %mp3(bitrate=320),  # Higher quality
     host="icecast",
     port=8000,
     password="icecastpass",
     mount="/stream",
     radio
   )
   ```

3. **System resource issues:**
   ```bash
   # Monitor CPU usage during streaming
   top -p $(pgrep liquidsoap)
   
   # Check for I/O bottlenecks
   iotop
   ```

### Issue: Stream Keeps Dropping

**Symptoms:**
- Intermittent audio interruptions
- Connection timeouts
- Player frequently reconnecting

**Solutions:**

1. **Network stability:**
   ```bash
   # Test network connectivity
   ping -c 10 8.8.8.8
   
   # Check for packet loss
   mtr google.com
   ```

2. **Buffer configuration:**
   ```xml
   <!-- In icecast.xml, increase buffer sizes -->
   <limits>
       <burst-size>131072</burst-size>  <!-- Increase buffer -->
       <client-timeout>60</client-timeout>
   </limits>
   ```

3. **Liquidsoap fallback:**
   ```liquidsoap
   # Ensure fallback is configured
   radio = fallback(track_sensitive=false, [playlist_source, blank(duration=30.)])
   ```

## 🐳 Docker Container Problems

### Issue: Container Keeps Restarting

**Symptoms:**
- Container status shows "Restarting"
- Services become unavailable periodically

**Diagnosis:**
```bash
# Check container health
docker inspect synthdragon-radio_icecast_1

# View restart logs
docker events --filter container=synthdragon-radio_icecast_1

# Check exit codes
docker-compose logs --details icecast
```

**Solutions:**

1. **Memory issues:**
   ```bash
   # Increase Docker memory limits
   # In docker-compose.yml
   services:
     icecast:
       deploy:
         resources:
           limits:
             memory: 512M
           reservations:
             memory: 256M
   ```

2. **Health check failures:**
   ```yaml
   # Adjust health check in docker-compose.yml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:8000/admin/stats.xml"]
     interval: 60s  # Increase interval
     timeout: 30s   # Increase timeout
     retries: 5     # More retries
   ```

### Issue: Container Build Failures

**Symptoms:**
- `docker-compose build` fails
- Missing dependencies in containers

**Solutions:**

1. **Clear Docker cache:**
   ```bash
   docker-compose build --no-cache
   docker system prune -af
   ```

2. **Check Dockerfile syntax:**
   ```dockerfile
   # Verify each Dockerfile for syntax errors
   # Common issues:
   # - Missing base image updates
   # - Incorrect file paths
   # - Missing dependencies
   ```

3. **Network issues during build:**
   ```bash
   # Test internet connectivity
   curl -I https://registry.hub.docker.com
   
   # Use different Docker registry if needed
   docker pull savonet/liquidsoap:7d2ffd5
   ```

## 🎵 Audio Problems

### Issue: No Audio Files Found

**Symptoms:**
- Liquidsoap logs show empty playlist
- Stream plays silence
- Playlist.m3u is empty

**Solutions:**

1. **Check audio directory:**
   ```bash
   # Verify directory structure
   ls -la radio/audio/
   
   # Check file permissions
   stat radio/audio/*.wav
   
   # Verify file formats
   file radio/audio/*.wav
   ```

2. **Update playlist:**
   ```bash
   cd radio
   chmod +x update_playlist.sh
   ./update_playlist.sh
   
   # Check generated playlist
   cat playlist.m3u
   ```

3. **File path issues:**
   ```bash
   # Ensure paths in playlist are correct
   # Paths should be relative to radio directory
   # Example: audio/song.wav (not /full/path/audio/song.wav)
   ```

### Issue: Metadata Not Displaying

**Symptoms:**
- Track information shows as "Unknown"
- Artist/title not updating
- Status endpoint returns empty data

**Solutions:**

1. **Check metadata format:**
   ```bash
   # Ensure audio files have proper naming
   # Format: "Artist - Title.wav"
   # Example: "Synthwave Artist - Cool Track.wav"
   ```

2. **Verify Icecast metadata:**
   ```bash
   # Test metadata endpoint
   curl http://localhost:8000/status-json.xsl | jq '.icestats.source[0].title'
   ```

3. **Frontend metadata parsing:**
   ```javascript
   // Check metadata parsing in player.js
   // Ensure the parsing logic matches your filename format
   if (currentTrack && currentTrack.includes(' - ')) {
       const [artist, title] = currentTrack.split(' - ');
       songTitle.textContent = `| SONG: ${title.trim()}`;
       songArtist.textContent = `| ARTIST: ${artist.trim()}`;
   }
   ```

## ⚡ Performance Issues

### Issue: High CPU Usage

**Symptoms:**
- Server becomes slow
- High load averages
- Services become unresponsive

**Diagnosis:**
```bash
# Monitor process usage
top -p $(pgrep liquidsoap)
htop

# Check I/O usage
iotop

# Monitor Docker stats
docker stats
```

**Solutions:**

1. **Optimize Liquidsoap:**
   ```liquidsoap
   # Reduce CPU usage in radio.liq
   set("decoder.file_extensions.wav",["wav"])  # Only decode WAV files
   set("log.level", 2)  # Reduce logging
   
   # Use lower quality encoding if needed
   output.icecast(%mp3(bitrate=128), ...)
   ```

2. **Limit Docker resources:**
   ```yaml
   # In docker-compose.yml
   services:
     liquidsoap:
       deploy:
         resources:
           limits:
             cpus: '1.0'
             memory: 512M
   ```

### Issue: Memory Leaks

**Symptoms:**
- Memory usage constantly increasing
- System runs out of memory over time
- OOM (Out of Memory) killer activating

**Solutions:**

1. **Monitor memory usage:**
   ```bash
   # Watch memory over time
   watch -n 5 'free -h && docker stats --no-stream'
   ```

2. **Restart services periodically:**
   ```bash
   # Add cron job to restart daily
   0 4 * * * cd /opt/synthdragon-radio && docker-compose restart
   ```

## 🌐 Network and Connectivity

### Issue: Can't Access from External Networks

**Symptoms:**
- Works on localhost but not from other devices
- Firewall blocking connections
- DNS resolution problems

**Solutions:**

1. **Firewall configuration:**
   ```bash
   # Check firewall status
   sudo ufw status
   
   # Allow necessary ports
   sudo ufw allow 8000/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

2. **Network binding:**
   ```yaml
   # In docker-compose.yml, bind to all interfaces
   ports:
     - "0.0.0.0:8000:8000"  # Instead of 127.0.0.1:8000:8000
   ```

3. **DNS and routing:**
   ```bash
   # Test external connectivity
   curl -I http://your-server-ip:8000/stream
   
   # Check routing
   traceroute your-server-ip
   ```

## 🔧 Advanced Troubleshooting

### Debugging Container Issues

```bash
# Get shell access to container
docker-compose exec icecast sh
docker-compose exec liquidsoap sh

# Check container logs with timestamps
docker-compose logs -t icecast

# Monitor container events
docker events --filter container=synthdragon-radio_icecast_1

# Inspect container configuration
docker inspect synthdragon-radio_icecast_1
```

### Performance Monitoring

```bash
# Monitor system performance
iostat -x 1
vmstat 1
netstat -i

# Check Docker performance
docker exec <container> top
docker exec <container> ps aux
docker exec <container> df -h
```

### Log Analysis

```bash
# Search for specific errors
docker-compose logs | grep -i error
docker-compose logs | grep -i "connection refused"
docker-compose logs | grep -i "permission denied"

# Analyze Liquidsoap logs
docker-compose logs liquidsoap | grep -E "(ERROR|CRITICAL)"

# Check system logs
sudo journalctl -u docker.service
sudo tail -f /var/log/syslog
```

### Network Debugging

```bash
# Test internal container communication
docker-compose exec liquidsoap ping icecast
docker-compose exec frontend ping icecast

# Check network configuration
docker network ls
docker network inspect synthdragon-radio_default

# Monitor network traffic
sudo tcpdump -i any port 8000
```

## 🆘 Getting Help

### Before Asking for Help

1. **Gather system information:**
   ```bash
   # System info
   uname -a
   docker --version
   docker-compose --version
   
   # Container status
   docker-compose ps
   
   # Recent logs
   docker-compose logs --tail=100
   ```

2. **Create a minimal test case:**
   - Try with just one audio file
   - Use default configuration
   - Test on localhost first

3. **Document steps to reproduce:**
   - What you were trying to do
   - What you expected to happen
   - What actually happened
   - Your environment details

### Where to Get Help

1. **GitHub Issues:**
   - Search existing issues first
   - Provide system information and logs
   - Include steps to reproduce

2. **Community Forums:**
   - Liquidsoap mailing list
   - Icecast forums
   - Docker community

3. **Emergency Recovery:**
   ```bash
   # Stop everything and start fresh
   docker-compose down
   docker system prune -af
   git checkout -- .
   docker-compose up -d
   ```

## 🔄 Recovery Procedures

### Complete System Reset

```bash
# Nuclear option - start completely fresh
cd synthdragon-radio
docker-compose down
docker system prune -af --volumes
git clean -fdx
git reset --hard HEAD
docker-compose up -d
```

### Backup Current State Before Troubleshooting

```bash
# Backup configuration
tar -czf synthdragon-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml \
  icecast/ \
  radio/ \
  frontend/

# Backup logs
docker-compose logs > logs-$(date +%Y%m%d).txt
```

---

## 💡 Pro Tips

- **Always check logs first** - most issues leave traces in logs
- **Test components individually** - isolate the problematic service
- **Use health checks** - they help identify when services are actually ready
- **Monitor resources** - many issues are resource-related
- **Keep backups** - especially of working configurations

**Remember**: Most issues are configuration-related and can be solved by carefully checking logs and following the diagnostic steps above.

🎵 **Keep the synthwave flowing!** 🎵
