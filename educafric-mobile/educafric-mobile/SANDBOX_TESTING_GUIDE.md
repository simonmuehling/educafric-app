# Educafric Sandbox Testing Guide

## UPDATED: January 24, 2025 - DirectorDashboard Complete Functionality

### 🎯 LATEST UPDATE: DIRECTORDASHBOARD FUNCTIONALITY
✅ **ALL 31 BUTTONS NOW FUNCTIONAL**: Every button across all DirectorDashboard modules has complete click handler functionality  
✅ **ZERO PLACEHOLDER CONTENT**: No more "Coming soon" or placeholder text anywhere  
✅ **COMPLETE BILINGUAL SUPPORT**: French/English messages for every interactive element  
✅ **PRODUCTION-READY UX**: Professional user experience with immediate click feedback

## Overview
The Educafric sandbox provides a comprehensive testing environment with all premium features unlocked and realistic family/school relationships between demo accounts.

## Sandbox Access
- **URL**: `/sandbox`
- **Available to**: All authenticated users
- **Premium Features**: Fully unlocked for all profiles except Commercial and Site Admin

## Demo Account Structure

### École Démonstration Educafric (Premium School)
All demo accounts are connected to this premium school environment.

#### School Management
- **Director**: director.demo@test.educafric.com
- **School Admin**: school.admin@test.educafric.com
- **Password**: `password`

#### Educational Staff
- **Teacher**: teacher.demo@test.educafric.com
- **Freelancer/Tutor**: freelancer.demo@test.educafric.com
- **Password**: `password`

#### Family Unit
- **Parent**: parent.demo@test.educafric.com
- **Student (Child)**: student.demo@test.educafric.com
- **Password**: `password`
- **Relationship**: student.demo is the child of parent.demo
- **Tutoring**: freelancer.demo provides tutoring services to student.demo

#### Commercial
- **Commercial**: commercial.demo@test.educafric.com
- **Password**: `password`
- **Note**: Limited access (no premium features in sandbox)

## Premium Features Available in Sandbox

### For All Profiles (except Commercial/Site Admin)
- ✅ GPS tracking and geolocation services
- ✅ Advanced SMS/WhatsApp notifications
- ✅ Complete school management system
- ✅ Full parent-child monitoring capabilities
- ✅ Professional teacher tools and resources
- ✅ Comprehensive freelancer features
- ✅ Real-time attendance and grade tracking
- ✅ Advanced communication systems
- ✅ Payment processing and subscription management
- ✅ Multi-language support (French/English)

### Subscription Plans in Sandbox
- **Parent**: Premium Parent Plan (1,500 CFA/month equivalent)
- **Teacher**: Premium Teacher Plan (25,000 CFA/year equivalent)
- **Student**: Premium Student Plan (full access)
- **Freelancer**: Premium Freelancer Plan (25,000 CFA/year equivalent)
- **School**: Premium School Plan (50,000 CFA/year equivalent)

## Testing Scenarios

### Family Monitoring Test
1. Login as **parent.demo@test.educafric.com**
2. Access child monitoring features
3. View student.demo's grades, attendance, and activities
4. Test SMS/WhatsApp notification preferences

### Educational Management Test
1. Login as **teacher.demo@test.educafric.com**
2. Manage classes and student records
3. Create assignments and track student progress
4. Communicate with parents through integrated messaging

### Student Learning Test
1. Login as **student.demo@test.educafric.com**
2. Access assignments and course materials
3. View grades and attendance records
4. Interact with teacher and tutor communications

### Freelancer Services Test
1. Login as **freelancer.demo@test.educafric.com**
2. Manage tutoring sessions with student.demo
3. Track progress and create reports for parent.demo
4. Handle payment tracking and invoicing

### School Administration Test
1. Login as **director.demo@test.educafric.com**
2. Oversee school-wide operations
3. Manage staff, students, and parent communications
4. Access analytics and reporting features

## Sandbox Environment Benefits

### No Freemium Restrictions
- All premium features are immediately accessible
- No payment prompts or upgrade notices
- Full functionality testing without limitations

### Realistic Data Relationships
- Authentic parent-child connections
- Teacher-student class assignments
- Freelancer-student tutoring relationships
- School-wide administrative oversight

### Comprehensive Feature Testing
- Test all user role interactions
- Verify cross-profile communications
- Validate notification systems
- Assess mobile responsiveness

## Developer Testing Features

### Sandbox Dashboard Modules
1. **Overview**: Environment status and relationships
2. **API Testing**: Live endpoint testing tools
3. **UI Components**: Component showcase and testing
4. **Data Modeling**: Database relationship viewer
5. **Device Testing**: Mobile/tablet compatibility
6. **Performance**: Speed and optimization metrics
7. **Security**: Authentication and access testing
8. **Playground**: Interactive feature testing

## Important Notes

- All sandbox data is isolated from production
- Premium features work exactly as in live environment
- Family relationships are pre-configured for immediate testing
- Language switching (French/English) fully functional
- Mobile-responsive design tested across all viewports

## Support

For sandbox-related issues or feature requests, the sandbox environment provides comprehensive logging and debugging tools through the developer dashboard at `/sandbox`.

---

**Last Updated**: January 2025
**Environment**: Comprehensive Premium Sandbox
**Status**: Fully Operational