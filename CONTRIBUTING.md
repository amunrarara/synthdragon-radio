# Contributing to Synthdragon Radio 🐲

First off, thank you for considering contributing to Synthdragon Radio! It's people like you that make this project awesome. 🎵

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Be respectful, constructive, and kind in all interactions.

## 🚀 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues list. When creating a bug report, include:

- **Clear title**: Descriptive and specific
- **Environment details**: OS, Docker version, browser (if applicable)
- **Steps to reproduce**: Detailed step-by-step instructions
- **Expected behavior**: What should have happened
- **Actual behavior**: What actually happened
- **Screenshots/Logs**: If applicable
- **Additional context**: Any other relevant information

**Bug Report Template:**
```markdown
## Bug Description
A clear description of what the bug is.

## Environment
- OS: [e.g., Ubuntu 20.04, macOS 12.0, Windows 11]
- Docker version: [e.g., 20.10.17]
- Browser: [e.g., Chrome 104, Firefox 103] (if frontend issue)

## Steps to Reproduce
1. Start the services with `docker-compose up -d`
2. Navigate to `http://localhost`
3. Click on play button
4. Error occurs

## Expected Behavior
The audio stream should start playing.

## Actual Behavior
Player shows error message and no audio plays.

## Screenshots/Logs
[Include relevant screenshots or log output]

## Additional Context
[Any other relevant information]
```

### 💡 Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- **Check existing suggestions** in issues/discussions
- **Provide clear description** of the proposed feature
- **Explain the use case** and why it would be valuable
- **Consider implementation** complexity and alternatives

### 🎵 Contributing Music

We welcome music contributions! However, due to copyright considerations:

- Only submit music you own or have explicit permission to use
- Provide source/licensing information
- Ensure audio quality is suitable (preferably 44.1kHz/16-bit WAV)
- Follow synthwave/retrowave genre guidelines

### 💻 Code Contributions

Areas where code contributions are especially welcome:

#### Frontend Development
- UI/UX improvements
- Mobile responsiveness
- Accessibility features
- New player features (playlists, favorites, etc.)
- Performance optimizations

#### Backend Development
- API implementation (currently placeholder)
- User authentication system
- Listener statistics and analytics
- Admin dashboard
- Track request system

#### Infrastructure
- Docker improvements
- CI/CD pipeline setup
- Monitoring and logging
- Security enhancements
- Performance optimizations

#### Audio Engineering
- Liquidsoap configuration improvements
- Audio processing enhancements
- Stream quality optimizations
- Crossfading and transitions

## 🛠️ Development Setup

### Prerequisites

- Docker & Docker Compose
- Git
- Text editor/IDE of choice
- Audio files for testing (place in `radio/audio/`)

### Local Development

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/synthdragon-radio.git
   cd synthdragon-radio
   ```

2. **Create development branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up development environment**
   ```bash
   # Add test audio files
   mkdir -p radio/audio
   # Copy some test .wav files to radio/audio/
   
   # Update playlist
   cd radio && ./update_playlist.sh && cd ..
   
   # Start development containers
   docker-compose up -d
   ```

4. **Verify setup**
   ```bash
   # Check containers are running
   docker-compose ps
   
   # Test endpoints
   curl -I http://localhost:8000/stream
   curl http://localhost:8000/status-json.xsl
   ```

### Development Workflow

1. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation as needed

2. **Test your changes**
   ```bash
   # Frontend changes - test in browser
   open http://localhost
   
   # Backend changes - restart services
   docker-compose restart backend-api
   
   # Audio changes - restart liquidsoap
   docker-compose restart liquidsoap
   ```

3. **Check logs for errors**
   ```bash
   docker-compose logs -f
   ```

### File Structure for Development

```
synthdragon-radio/
├── frontend/
│   ├── index.html          # Main page - HTML structure
│   ├── player.js           # Player logic - JavaScript
│   ├── styles.css          # Styling - CSS with animations
│   └── public/             # Static assets
├── backend-api/            # Future API development
│   ├── src/index.js        # Main API entry point
│   └── package.json        # Node.js dependencies
├── radio/                  # Audio streaming
│   ├── radio.liq           # Liquidsoap configuration
│   └── update_playlist.sh  # Playlist management
├── icecast/
│   └── icecast.xml         # Streaming server config
└── docker-compose.yml      # Container orchestration
```

## 📝 Pull Request Process

### Before Submitting

1. **Update documentation** if you changed functionality
2. **Test thoroughly** in your local environment
3. **Follow the coding style** of the existing codebase
4. **Write clear commit messages**
5. **Keep changes focused** - one feature/fix per PR

### PR Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
Describe how you tested your changes:
- [ ] Local testing completed
- [ ] All services start correctly
- [ ] Audio streaming works
- [ ] Frontend displays correctly
- [ ] No console errors

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have tested my changes locally

## Screenshots (if applicable)
Include screenshots for UI changes.

## Additional Notes
Any additional information, concerns, or questions.
```

### Review Process

1. **Automated checks** (when available) must pass
2. **Maintainer review** for code quality and compatibility
3. **Testing verification** by reviewers
4. **Approval and merge** by project maintainers

## 🎨 Style Guidelines

### JavaScript
- Use ES6+ features when appropriate
- Prefer `const` and `let` over `var`
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Follow existing formatting (2-space indentation)

```javascript
/**
 * Updates track information from Icecast metadata
 * @returns {Promise<void>}
 */
async function updateTrackInfo() {
    const controller = new AbortController();
    // Implementation...
}
```

### CSS
- Use meaningful class names
- Group related properties together
- Comment complex animations
- Maintain consistent naming convention
- Use CSS custom properties for themes

```css
/* Player controls styling */
.player-controls {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
}

.play-button {
    /* Button styling */
}
```

### HTML
- Use semantic HTML5 elements
- Include proper ARIA attributes
- Maintain accessibility standards
- Keep markup clean and organized

### Configuration Files
- Include comments explaining complex configurations
- Maintain consistent formatting
- Document any security considerations

### Docker
- Use specific version tags when possible
- Include health checks where appropriate
- Document environment variables
- Keep images lightweight

## 🧪 Testing

### Manual Testing Checklist

**Frontend Testing:**
- [ ] Player loads correctly
- [ ] Play/pause functionality works
- [ ] Metadata updates automatically
- [ ] UI is responsive on different screen sizes
- [ ] No JavaScript errors in console
- [ ] Accessibility features work (keyboard navigation, screen reader)

**Backend Testing:**
- [ ] API endpoints respond correctly
- [ ] Error handling works properly
- [ ] Authentication (when implemented)
- [ ] CORS headers configured correctly

**Audio Testing:**
- [ ] Stream starts and plays audio
- [ ] Playlist updates correctly
- [ ] Audio quality is acceptable
- [ ] Metadata broadcasting works
- [ ] Fallback behavior on errors

**Docker Testing:**
- [ ] All containers start successfully
- [ ] Services communicate properly
- [ ] Volumes mount correctly
- [ ] Environment variables work
- [ ] Container logs show no errors

### Test Commands

```bash
# Check service health
docker-compose ps

# Test stream availability
curl -I http://localhost:8000/stream

# Test metadata endpoint
curl http://localhost:8000/status-json.xsl | jq .

# View service logs
docker-compose logs icecast
docker-compose logs liquidsoap

# Test frontend
open http://localhost
```

## 📚 Documentation

### When to Update Documentation

- **New features**: Document how to use them
- **Configuration changes**: Update relevant config sections
- **API changes**: Update API documentation
- **Bug fixes**: Update troubleshooting if relevant
- **Dependencies**: Update installation requirements

### Documentation Style

- **Clear and concise**: Easy to understand
- **Example-driven**: Include practical examples
- **Well-organized**: Use proper headings and structure
- **Up-to-date**: Keep in sync with code changes
- **Accessible**: Consider different skill levels

### Types of Documentation

1. **README.md**: Project overview and quick start
2. **CONTRIBUTING.md**: This guide for contributors
3. **API.md**: API documentation (when backend is implemented)
4. **DEPLOYMENT.md**: Production deployment guide
5. **TROUBLESHOOTING.md**: Common issues and solutions
6. **Code comments**: Inline documentation for complex logic

## 🏆 Recognition

Contributors will be recognized in:
- **README.md**: Contributors section
- **Release notes**: Acknowledgment of contributions
- **GitHub**: Automatic contributor recognition

## 📞 Getting Help

If you need help contributing:

- **Issues**: Create an issue with the `question` label
- **Discussions**: Start a discussion for broader topics
- **Discord/Chat**: Join our community (if available)
- **Email**: Contact maintainers directly for sensitive issues

## 🎵 Thank You!

Your contributions make Synthdragon Radio better for everyone in the synthwave community. Whether you're fixing a bug, adding a feature, or just improving documentation, every contribution matters! 

Keep the synthwave alive! 💜

---

*This document is living and will be updated as the project evolves. Feel free to suggest improvements!*
