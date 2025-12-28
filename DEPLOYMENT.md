# Production Deployment Guide 🚀

This guide covers deploying Synthdragon Radio in a production environment with proper security, monitoring, and performance considerations.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Security Configuration](#security-configuration)
- [Production Setup](#production-setup)
- [Reverse Proxy Configuration](#reverse-proxy-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Performance Optimization](#performance-optimization)
- [Backup and Recovery](#backup-and-recovery)
- [Maintenance](#maintenance)

## 🔧 Prerequisites

### System Requirements

**Minimum:**
- 2 CPU cores
- 2GB RAM
- 20GB storage
- Ubuntu 20.04+ or similar Linux distribution

**Recommended:**
- 4 CPU cores
- 4GB RAM
- 50GB storage (SSD preferred)
- Dedicated server or VPS

### Software Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
sudo apt install -y nginx certbot python3-certbot-nginx ufw htop
```

## 🔒 Security Configuration

### 1. Change Default Passwords

**Update Icecast passwords** in `icecast/icecast.xml`:

```xml
<authentication>
    <source-password>STRONG_SOURCE_PASSWORD</source-password>
    <relay-password>STRONG_RELAY_PASSWORD</relay-password>
    <admin-user>admin</admin-user>
    <admin-password>STRONG_ADMIN_PASSWORD</admin-password>
</authentication>
```

### 2. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp  # If exposing Icecast directly
sudo ufw enable
```

### 3. Secure Docker Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  icecast:
    build: ./icecast
    container_name: icecast-prod
    ports:
      - "127.0.0.1:8000:8000"  # Bind to localhost only
    volumes:
      - ./icecast/icecast.xml:/usr/share/icecast2/icecast.xml:ro
      - icecast-logs:/var/log/icecast2
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/status.xsl"]
      interval: 30s
      timeout: 10s
      retries: 3

  liquidsoap:
    build: ./radio
    container_name: liquidsoap-prod
    depends_on:
      - icecast
    volumes:
      - ./radio:/radio:ro
      - ./radio/audio:/radio/audio:ro
      - liquidsoap-logs:/tmp
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "pgrep", "liquidsoap"]
      interval: 30s
      timeout: 5s
      retries: 3

  frontend:
    image: nginx:alpine
    container_name: frontend-prod
    ports:
      - "127.0.0.1:8080:80"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  icecast-logs:
  liquidsoap-logs:

networks:
  default:
    driver: bridge
```

## 🏗️ Production Setup

### 1. Application Deployment

```bash
# Create production directory
sudo mkdir -p /opt/synthdragon-radio
cd /opt/synthdragon-radio

# Clone repository
git clone https://github.com/your-repo/synthdragon-radio.git .

# Create audio directory with proper permissions
sudo mkdir -p radio/audio
sudo chown -R 1000:1000 radio/audio

# Copy your audio files
sudo cp /path/to/your/music/*.wav radio/audio/

# Update playlist
cd radio && ./update_playlist.sh && cd ..

# Create logs directory
sudo mkdir -p logs
sudo chown -R 1000:1000 logs
```

### 2. Configuration Files

**Create production environment file** `.env.prod`:

```bash
# Icecast Configuration
ICECAST_SOURCE_PASSWORD=your_strong_source_password
ICECAST_ADMIN_PASSWORD=your_strong_admin_password
ICECAST_RELAY_PASSWORD=your_strong_relay_password
ICECAST_HOSTNAME=your-domain.com

# Stream Configuration
STREAM_NAME=Synthdragon Radio
STREAM_DESCRIPTION=24/7 Synthwave Internet Radio
STREAM_GENRE=Synthwave
STREAM_URL=https://your-domain.com

# Liquidsoap Configuration
AUDIO_QUALITY=high
CROSSFADE_DURATION=3

# Security
ADMIN_ALLOWED_IPS=192.168.1.0/24,10.0.0.0/8
```

### 3. Update Frontend Configuration

**Modify `frontend/player.js`** for production:

```javascript
const CONFIG = {
    streamUrl: 'https://your-domain.com/stream',
    metadataUrl: 'https://your-domain.com/status-json.xsl',
    updateInterval: 10000,
    fallbackArtist: 'Synthdragon Radio',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
};
```

## 🔄 Reverse Proxy Configuration

### Nginx Configuration

Create `/etc/nginx/sites-available/synthdragon-radio`:

```nginx
# Upstream definitions
upstream icecast_backend {
    server 127.0.0.1:8000;
}

upstream frontend_backend {
    server 127.0.0.1:8080;
}

# Main server block
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    # CORS headers for stream
    location ~* \.(m3u|pls)$ {
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Range" always;
        proxy_pass http://icecast_backend;
    }

    # Stream endpoint
    location /stream {
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Range" always;
        
        proxy_pass http://icecast_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Streaming optimizations
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Icecast admin and status pages
    location ~ ^/(admin|status) {
        # Restrict admin access
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;

        proxy_pass http://icecast_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Status JSON endpoint (public)
    location /status-json.xsl {
        add_header Access-Control-Allow-Origin "*" always;
        proxy_pass http://icecast_backend;
    }

    # Frontend application
    location / {
        proxy_pass http://frontend_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://frontend_backend;
        }
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/synthdragon-radio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 SSL/TLS Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Set up auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Custom SSL Certificate (Alternative)

If using custom certificates:

```bash
# Copy certificates to proper location
sudo mkdir -p /etc/ssl/certs/synthdragon
sudo cp your-cert.pem /etc/ssl/certs/synthdragon/
sudo cp your-key.pem /etc/ssl/private/synthdragon/
sudo chmod 644 /etc/ssl/certs/synthdragon/your-cert.pem
sudo chmod 600 /etc/ssl/private/synthdragon/your-key.pem
```

## 📊 Monitoring and Logging

### 1. Docker Logging Configuration

Add to `docker-compose.prod.yml`:

```yaml
x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "100m"
    max-file: "5"

services:
  icecast:
    # ... other config
    logging: *default-logging
  
  liquidsoap:
    # ... other config
    logging: *default-logging
```

### 2. System Monitoring

**Install monitoring tools:**

```bash
# Install system monitoring
sudo apt install htop iotop nethogs

# Optional: Install Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-*linux-amd64.tar.gz
tar xvfz node_exporter-*linux-amd64.tar.gz
sudo cp node_exporter-*/node_exporter /usr/local/bin/
```

**Create monitoring script** `scripts/monitor.sh`:

```bash
#!/bin/bash
# System monitoring script

LOG_FILE="/var/log/synthdragon-monitor.log"

check_services() {
    echo "$(date): Checking services..." >> $LOG_FILE
    
    # Check Docker containers
    if ! docker-compose -f /opt/synthdragon-radio/docker-compose.prod.yml ps | grep -q "Up"; then
        echo "$(date): ERROR - Some containers are not running" >> $LOG_FILE
        # Restart services
        cd /opt/synthdragon-radio
        docker-compose -f docker-compose.prod.yml restart
    fi
    
    # Check stream availability
    if ! curl -f http://localhost:8000/stream > /dev/null 2>&1; then
        echo "$(date): ERROR - Stream not available" >> $LOG_FILE
    fi
    
    # Check disk space
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 90 ]; then
        echo "$(date): WARNING - Disk usage at ${DISK_USAGE}%" >> $LOG_FILE
    fi
}

# Run checks
check_services
```

**Set up cron job:**

```bash
# Add to crontab
*/5 * * * * /opt/synthdragon-radio/scripts/monitor.sh
```

### 3. Log Rotation

Create `/etc/logrotate.d/synthdragon-radio`:

```
/var/log/icecast2/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}

/var/log/synthdragon-monitor.log {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

## ⚡ Performance Optimization

### 1. System Optimization

```bash
# Increase file descriptor limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Optimize network settings
echo "net.core.rmem_max = 16777216" >> /etc/sysctl.conf
echo "net.core.wmem_max = 16777216" >> /etc/sysctl.conf
echo "net.ipv4.tcp_rmem = 4096 12582912 16777216" >> /etc/sysctl.conf
echo "net.ipv4.tcp_wmem = 4096 12582912 16777216" >> /etc/sysctl.conf

# Apply settings
sudo sysctl -p
```

### 2. Audio Quality Configuration

**High-quality streaming** - Update `radio/radio.liq`:

```liquidsoap
# High-quality MP3 encoding
output.icecast(
  %mp3(bitrate=320),  # High bitrate
  host="icecast",
  port=8000,
  password="your_password",
  mount="/stream",
  name="Synthdragon Radio",
  description="24/7 Synthwave Internet Radio",
  genre="Synthwave",
  radio
)
```

### 3. CDN Integration (Optional)

For global distribution, consider using a CDN:

```nginx
# Add CDN headers to nginx config
location /stream {
    add_header X-Cache-Status $upstream_cache_status;
    proxy_cache_valid 200 302 10m;
    proxy_cache_valid 404 1m;
    # ... rest of config
}
```

## 💾 Backup and Recovery

### 1. Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backup/synthdragon-radio"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$DATE"

mkdir -p $BACKUP_PATH

# Backup configuration files
cp -r /opt/synthdragon-radio/{icecast,radio,frontend,docker-compose*.yml} $BACKUP_PATH/

# Backup playlist and scripts
cp /opt/synthdragon-radio/radio/playlist.m3u $BACKUP_PATH/
cp -r /opt/synthdragon-radio/scripts $BACKUP_PATH/

# Create archive
tar -czf "$BACKUP_PATH.tar.gz" -C $BACKUP_DIR "backup_$DATE"
rm -rf $BACKUP_PATH

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_PATH.tar.gz"
```

### 2. Recovery Procedure

```bash
# Stop services
cd /opt/synthdragon-radio
docker-compose -f docker-compose.prod.yml down

# Restore from backup
tar -xzf /backup/synthdragon-radio/backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp/
cp -r /tmp/backup_YYYYMMDD_HHMMSS/* /opt/synthdragon-radio/

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Maintenance

### 1. Regular Updates

**Update system packages:**

```bash
#!/bin/bash
# update.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Update Docker images
cd /opt/synthdragon-radio
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Clean up old images
docker image prune -f
```

### 2. Health Checks

**Create health check script** `scripts/health_check.sh`:

```bash
#!/bin/bash

HEALTH_LOG="/var/log/synthdragon-health.log"

# Check stream health
if curl -f --max-time 10 https://your-domain.com/stream > /dev/null 2>&1; then
    echo "$(date): Stream OK" >> $HEALTH_LOG
else
    echo "$(date): Stream FAILED" >> $HEALTH_LOG
    # Alert administrators
    # mail -s "Synthdragon Radio Stream Down" admin@your-domain.com < /dev/null
fi

# Check frontend health
if curl -f --max-time 10 https://your-domain.com/ > /dev/null 2>&1; then
    echo "$(date): Frontend OK" >> $HEALTH_LOG
else
    echo "$(date): Frontend FAILED" >> $HEALTH_LOG
fi
```

### 3. Automated Deployment

**Create deployment script** `scripts/deploy.sh`:

```bash
#!/bin/bash

cd /opt/synthdragon-radio

# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
sleep 30

# Verify deployment
if scripts/health_check.sh; then
    echo "Deployment successful"
else
    echo "Deployment failed - rolling back"
    git checkout HEAD~1
    docker-compose -f docker-compose.prod.yml up -d
fi
```

## 🚨 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check system resources
htop
df -h
```

**Stream quality issues:**
```bash
# Check Liquidsoap logs
docker-compose logs liquidsoap

# Verify audio files
file radio/audio/*.wav
```

**SSL certificate issues:**
```bash
# Test certificate
openssl s_client -connect your-domain.com:443

# Renew certificate
sudo certbot renew
```

## 📞 Support

For production deployment issues:

- Check system logs: `/var/log/syslog`
- Review application logs: `docker-compose logs`
- Monitor system resources: `htop`, `iotop`, `nethogs`
- Test network connectivity: `curl`, `ping`, `telnet`

---

This deployment guide should provide a solid foundation for running Synthdragon Radio in production. Adjust configurations based on your specific requirements and infrastructure.

🎵 **Rock on with professional-grade synthwave streaming!** 🎵
