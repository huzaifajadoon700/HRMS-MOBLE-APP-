# HRMS Mobile App

A comprehensive Human Resource Management System (HRMS) mobile application built with Flutter and Node.js backend.

## Project Structure

```
├── backend/                 # Node.js backend server
│   ├── Controllers/         # API controllers
│   ├── Models/             # Database models
│   ├── Routes/             # API routes
│   ├── Middlewares/        # Authentication & validation
│   ├── config/             # Configuration files
│   └── utils/              # Utility functions
│
└── mobile frontend/        # Flutter mobile application
    ├── lib/
    │   ├── core/           # Core utilities and constants
    │   ├── data/           # Data models
    │   ├── presentation/   # UI screens and widgets
    │   ├── providers/      # State management
    │   └── services/       # API and business logic services
    ├── android/            # Android-specific files
    ├── ios/                # iOS-specific files
    └── assets/             # Images and other assets
```

## Features

### Mobile App Features

- **Authentication**: Login/Register with JWT tokens
- **Restaurant Management**: Menu browsing, ordering, table reservations
- **Hotel Management**: Room booking, reservation management
- **Order Tracking**: Real-time order status updates via WebSocket
- **Payment Integration**: Stripe payment processing
- **Admin Panel**: Order management, user management, analytics
- **Profile Management**: User profile and preferences

### Backend Features

- **RESTful API**: Complete API for mobile app
- **Real-time Updates**: WebSocket integration for live updates
- **Authentication**: JWT-based authentication system
- **Payment Processing**: Stripe integration
- **File Upload**: Image upload for menus, rooms, etc.
- **Database**: MongoDB with Mongoose ODM

## Technology Stack

### Frontend (Mobile)

- **Flutter**: Cross-platform mobile development
- **Dart**: Programming language
- **Provider**: State management
- **HTTP**: API communication
- **Socket.IO**: Real-time communication

### Backend

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **Socket.IO**: Real-time communication
- **Stripe**: Payment processing
- **JWT**: Authentication
- **Multer**: File upload handling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Flutter SDK (v3.0 or higher)
- MongoDB
- Android Studio / Xcode for mobile development

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file with required environment variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   PORT=8080
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Mobile App Setup

1. Navigate to mobile frontend directory:

   ```bash
   cd "mobile frontend"
   ```

2. Install Flutter dependencies:

   ```bash
   flutter pub get
   ```

3. Set up environment configuration:

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your actual values
   # Or use the provided scripts for development
   ```

4. Run the app:

   ```bash
   # For development (Windows)
   scripts/run_dev.bat

   # For development (Linux/Mac)
   chmod +x scripts/run_dev.sh
   ./scripts/run_dev.sh

   # Or run manually with environment variables
   flutter run --dart-define=STRIPE_PUBLISHABLE_KEY=your_key_here
   ```

## API Documentation

The backend provides RESTful APIs for:

- Authentication (`/api/auth`)
- User management (`/api/users`)
- Menu management (`/api/menus`)
- Order management (`/api/orders`)
- Room management (`/api/rooms`)
- Table management (`/api/tables`)
- Booking management (`/api/bookings`)
- Payment processing (`/api/payments`)

## Security

### Environment Variables

This project uses environment variables to secure sensitive information:

- **Stripe Keys**: Use `STRIPE_PUBLISHABLE_KEY` environment variable
- **API URLs**: Use `API_BASE_URL` and `SOCKET_URL` environment variables
- **Database**: MongoDB URI is stored in backend `.env` file as `Mongo_Conn`

### Best Practices

- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate API keys regularly
- Use HTTPS in production

### Development vs Production

- Development: Uses test Stripe keys and local URLs
- Production: Must use live Stripe keys and production URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
