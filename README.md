# Klondike Solitaire Web Application

A modern, web-based implementation of the classic card game Klondike Solitaire, built with secure authentication, real-time gameplay, and a responsive user interface.

## 🎯 Features

- **Secure Access**: HTTPS deployment with CA-issued certificates
- **Multiple Authentication Options**: 
  - Native authentication system
  - GitHub OAuth integration
- **Advanced Gameplay**:
  - Full solitaire game implementation
  - Autocomplete functionality for valid moves
  - Infinite undo/redo capabilities
  - Game state persistence and history
- **User Features**:
  - Customizable user profiles
  - Game history with move-by-move replay
  - End-game detection and statistics

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB database
- SSL certificate for HTTPS

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/klondike-solitaire.git

# Navigate to project directory
cd klondike-solitaire

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React with modern JavaScript
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **Authentication**: Passport.js (native and GitHub OAuth)
- **Deployment**: HTTPS with public accessibility

### Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── config/          # Configuration files
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
└── public/          # Static assets
```

## 🔐 Security Features

- HTTPS encryption with valid CA certificates
- Secure authentication mechanisms
- Session management
- Input validation and sanitization

## 📱 User Interface

- Responsive design for all device sizes
- Clean and intuitive game interface
- User-friendly navigation
- Real-time game state updates

## 🎮 Game Features

- Standard Klondike Solitaire rules
- Move validation
- Automatic card movement to foundations
- Game history and statistics tracking
- End-game detection and handling

## 👥 User Management

- User registration and authentication
- Editable user profiles
- Game history tracking
- Persistent user preferences

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

The REST API endpoints include:

- `/api/auth/*` - Authentication endpoints
- `/api/game/*` - Game state management
- `/api/user/*` - User profile operations
- `/api/results/*` - Game history and results

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Klondike Solitaire design
- Vanderbilt University CS 4288 course
- Contributors and testers