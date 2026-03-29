# MedSync - Medicine Management Application

A comprehensive medicine management and safety application built with React, Vite, TypeScript, and Supabase. Track your medications, set reminders, monitor adherence, and manage emergency contacts all in one place.

## Features

### Core Functionality
- **User Authentication** - Secure email/password authentication with Supabase Auth
- **Medicine Management** - Add, edit, and track all your medications with detailed information
- **Smart Reminders** - Set up daily or weekly medication reminders with multiple time slots
- **Intake Tracking** - Log when you take your medications and track adherence
- **Health Records** - Store allergies, medical conditions, and emergency health information
- **Emergency Contacts** - Manage family and emergency contacts with notification preferences
- **Emergency Alerts** - Trigger emergency notifications to your contacts when needed

### User Interface
- Clean, modern design with Tailwind CSS
- Fully responsive layout that works on mobile, tablet, and desktop
- Intuitive navigation with sidebar and mobile menu
- Real-time data updates
- Interactive dashboards with statistics and insights

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **date-fns** - Date formatting and manipulation

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication
  - Auto-generated REST API

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier available)

### Installation

1. Clone the repository
```bash
git clone https://github.com/purvamehta2007/MedTest.git
cd MedTest
```

2. Install dependencies
```bash
npm install
```

3. Environment variables are already configured in `.env`

4. Start the development server
```bash
npm run dev
```

5. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Database Schema

The application uses the following database tables:

### medicines
Stores medication information including name, dosage, form, frequency, expiry date, instructions, and side effects.

### reminders
Manages medication reminders with configurable times, frequency (daily/weekly), and date ranges.

### intakes
Tracks medication intake history with scheduled time, actual time taken, status (taken/missed/pending), and notes.

### health_records
Stores user health information including allergies, existing conditions, medical history, blood type, height, weight, and emergency notes.

### family_contacts
Manages emergency and family contacts with phone numbers, emails, and notification preferences.

### emergency_alerts
Tracks emergency alerts with type, message, location, resolution status, and notified contacts.

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Application Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client and type definitions
│   └── auth-context.tsx     # Authentication context and hooks
├── components/
│   └── DashboardLayout.tsx  # Main dashboard layout with navigation
├── pages/
│   ├── LoginPage.tsx        # Login page
│   ├── SignupPage.tsx       # Registration page
│   ├── DashboardHome.tsx    # Dashboard overview
│   ├── MedicinesPage.tsx    # Medicine management
│   ├── RemindersPage.tsx    # Reminder management
│   ├── IntakesPage.tsx      # Intake tracking and history
│   ├── HealthRecordPage.tsx # Health information management
│   ├── ContactsPage.tsx     # Emergency contacts management
│   └── EmergencyPage.tsx    # Emergency alerts
├── App.tsx                  # Main app component with routing
├── main.tsx                 # Application entry point
└── index.css                # Global styles

```

## Usage Guide

### Getting Started
1. **Sign Up** - Create an account with your email and password
2. **Add Medicines** - Go to the Medicines page and add your medications
3. **Set Reminders** - Create reminders for each medicine with specific times
4. **Track Intake** - Mark medications as taken or missed on the Intakes page
5. **Add Health Info** - Fill out your health record with allergies and conditions
6. **Add Contacts** - Add emergency contacts who should be notified in emergencies

### Managing Medicines
- Add detailed information about each medication
- Track expiry dates
- Store instructions and side effects
- Edit or delete medications as needed

### Setting Reminders
- Link reminders to specific medicines
- Set multiple reminder times per day
- Choose daily or weekly frequency
- Set start and optional end dates

### Tracking Adherence
- View all scheduled and past intakes
- Mark doses as taken or missed
- Filter by status (all, taken, missed, pending)
- View adherence statistics and rates

### Emergency Features
- Add family members and emergency contacts
- Set notification preferences
- Trigger emergency alerts when needed
- Track alert history and resolution

## Security

- All user data is protected with Row Level Security (RLS)
- Passwords are securely hashed
- JWT-based authentication
- Users can only access their own data
- HTTPS encryption in production

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- React hooks best practices
- Proper error handling
- Responsive design principles

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.

---

Built with React, Vite, TypeScript, and Supabase
