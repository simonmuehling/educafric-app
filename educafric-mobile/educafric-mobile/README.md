# EDUCAFRIC - African Educational Technology Platform

## 🌍 Overview

EDUCAFRIC is a comprehensive African educational technology platform providing complete digital learning and management solutions for schools, teachers, parents, and students. The platform features advanced parent-child connection systems, subscription equity, and optimizations specifically designed for African educational markets.

## 🎯 Key Features

### Parent-Child Connection System
- **3 Connection Methods**: Automatic school invitation, QR code scanning, manual requests
- **Complete Equity Principle**: All paying parents receive identical full access rights
- **Secure Validation**: All connections require school approval for security

### Multi-Role User Management
- **Students**: Academic tracking, QR code generation, progress monitoring
- **Teachers**: Class management, grade entry, communication tools
- **Parents**: Child monitoring, academic tracking, geolocation services
- **Directors**: School administration, connection management, reporting
- **Freelancers**: Independent teaching services and student management
- **Commercial**: Business development and partnership management

### Advanced Features
- **Bilingual Support**: Complete French/English localization
- **Mobile-First Design**: Optimized for smartphones and tablets
- **Geolocation Services**: Real-time child tracking and safety zones
- **Payment Integration**: Stripe integration with African payment methods
- **Document Management**: PDF generation, digital signatures, workflows
- **Notification System**: SMS, email, WhatsApp, and push notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/educafric.git
cd educafric

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:push

# Start development server
npm run dev
```

### Android APK Generation

The project includes GitHub Actions workflow for automatic APK generation:

1. Push code to GitHub
2. GitHub Actions builds Android APK automatically
3. Download signed APK/AAB files from Actions artifacts
4. Submit to Google Play Store

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Authentication**: Passport.js with session management
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**: RESTful endpoints for all functionalities
- **Security**: Rate limiting, CORS, input validation

### Frontend (React + TypeScript)
- **UI Components**: Shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Mobile**: Capacitor for native mobile features

### Database Schema
- **Users**: Multi-role user management
- **Schools**: Educational institution data
- **Parent-Student Relations**: Connection tracking
- **Subscriptions**: Payment and access management
- **Geolocation**: Safety zones and tracking
- **Documents**: File management and workflows

## 📱 Parent-Child Connection System

### The Equity Principle
**ALL PAYING PARENTS = IDENTICAL FULL ACCESS RIGHTS**

No hierarchy between Primary Parents, Secondary Parents, or Guardians. All paying subscribers receive complete access to their child's data.

### Connection Methods

#### 1. Automatic School Invitation
- School creates parent profiles during student enrollment
- Automatic email invitations sent to parents
- Immediate connection upon account activation

#### 2. QR Code Scanning
- Student generates secure QR code from profile
- Parent scans QR code with EDUCAFRIC app
- School validates connection for security

#### 3. Manual Request
- Parent submits connection request with identity verification
- School validates parent identity and relationship
- Director approves/rejects connection requests

## 🔒 Security Features

- **Multi-factor Authentication**: Optional 2FA via SMS
- **Session Management**: Secure session handling with timeout
- **School Validation**: All parent connections require school approval
- **Data Protection**: GDPR compliant with African data localization
- **Audit Trails**: Complete logging of all administrative actions

## 🌍 African Market Adaptations

### Payment Methods
- **Cameroon**: Orange Money, MTN Mobile Money, Afriland Bank
- **International**: Stripe credit card processing
- **Currency**: Automatic CFA/local currency conversion

### Educational Systems
- **Curriculum Support**: Adapted to African educational standards
- **Language Support**: French/English bilingual interface
- **Cultural Context**: Extended family structures and guardianship

### Connectivity Optimization
- **Offline Mode**: Core features work without internet
- **Low Bandwidth**: Optimized for slower connections
- **SMS Fallback**: Critical notifications via SMS when needed

## 📊 Testing

### Automated Test Suite
```bash
# Run parent-child connection tests
node test-parent-child-connections.cjs

# Run full test suite
npm test
```

### Test Coverage
- Authentication for all user roles
- Parent-child connection workflows
- API endpoint validation
- Subscription equity verification
- Payment processing
- Geolocation services

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push database schema changes
npm test             # Run test suite
npm run lint         # Run linting
```

### Environment Variables
```bash
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
HOSTINGER_EMAIL_USER=...
HOSTINGER_EMAIL_PASS=...
```

## 📚 Documentation

- **[Parent-Child Connections](CONNEXION_PARENTS_ENFANTS_EDUCAFRIC.md)** - Complete system documentation
- **[GitHub Push Guide](GITHUB_PUSH_GUIDE.md)** - APK generation instructions
- **[Project Context](replit.md)** - Development context and preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@educafric.com
- Phone: +237 656 200 472
- Website: https://educafric.com

## 🎉 Acknowledgments

- African educational institutions for feedback and requirements
- Open source community for excellent tools and libraries
- Replit for providing development platform
- Contributors and testers who helped build this platform

---

**EDUCAFRIC - Empowering African Education Through Technology** 🌍📚✨