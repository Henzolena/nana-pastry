# Nana Pastry - Luxury Cake Shop Web App 🍰✨

A visually stunning, feminine, and elegant cake shop web application built with React, TypeScript, Tailwind CSS, and Vite. This project features a soft, luxurious color palette with pink tones and gold accents that create a boutique-style aesthetic.

![Nana Pastry](./public/og-image.jpg)

## ✨ Features

- 🎨 **Elegant Design**: Soft, feminine color palette with pink tones and golden accents
- 📱 **Fully Responsive**: Optimized for all devices from mobile to desktop
- 🌟 **Modern UI**: Glassmorphism effects, subtle animations, and premium feel
- 🖼️ **Interactive Elements**: Hover effects, transitions, and micro-interactions
- 🔍 **Product Showcase**: Beautiful masonry grid layout for cake displays
- 📣 **Marketing-Focused**: Clear CTAs and contact information for customer conversion
- 🔥 **Firebase Integration**: User authentication, Firestore database, and storage
- 🛒 **Order Management**: Complete checkout flow with order history

## 🎨 Color Palette

- **Primary Color**: 🌸 Blush Pink (#FFC0CB) – Soft, welcoming, and delicate.
- **Accent Color**: 🌷 Hot Pink (#E91E63) – Vibrant and bold for contrast.
- **Secondary Color**: 🌺 Rose Pink (#FF69B4) – A rich, warm pink tone.
- **Gold Accents**: ✨ Soft Gold (#FFD700) – Adds a luxury touch.
- **Background Color**: 🕊 Ivory White (#FFF5EE) – Soft and airy, making pink tones stand out.
- **Deep Contrast**: 🍫 Chocolate Brown (#5D4037) – For elegant depth in typography and details.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn
- Firebase project (for authentication, database, and storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nana-pastry.git
   cd nana-pastry
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password), Firestore Database, and Storage
   - Create a `.env` file in the project root based on `.env.example`
   - Add your Firebase configuration values to the `.env` file

4. Create required Firestore indexes:
   - See [FIRESTORE-INDEXES.md](./src/pages/FIRESTORE-INDEXES.md) for detailed instructions
   - At minimum, create an index for the `orders` collection with fields:
     - `userId` (Ascending)
     - `createdAt` (Descending)

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
/nana-pastry
├── /public                 # Static assets
├── /src
│   ├── /assets             # Images, fonts, etc.
│   ├── /components         # Reusable UI components
│   │   ├── /layout         # Layout components (Navbar, Footer)
│   │   └── /ui             # UI components (Button, Card, etc.)
│   ├── /contexts           # React context providers
│   ├── /lib                # Library code (Firebase, etc.)
│   ├── /pages              # Page components
│   ├── /services           # Service functions (Firebase, etc.)
│   ├── /types              # TypeScript types and interfaces
│   ├── /utils              # Utility functions and data
│   ├── App.tsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.tsx            # Entry point
├── index.html              # HTML template
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies and scripts
```

## 🛠️ Built With

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Fast build tool and dev server
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Router](https://reactrouter.com/) - Routing
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [Lucide React](https://lucide.dev/) - Beautiful icons
- [Firebase](https://firebase.google.com/) - Authentication, Database, and Storage

## 🔥 Firebase Configuration

This application uses Firebase for several key features:

- **Authentication**: User accounts and login
- **Firestore**: Database for orders, products, and user profiles
- **Storage**: For storing images and other assets

See [README-FIREBASE.md](./README-FIREBASE.md) for detailed Firebase setup instructions.

## 📋 Documentation

The project includes various documentation to help developers understand and maintain the codebase:

- [Firebase Setup](./FIREBASE-SETUP.md) - Instructions for setting up Firebase services
- [Date Formatting](./src/docs/date-formatting.md) - Standards for date formatting across the application
- [Testing Plan](./testing-plan.md) - Testing strategies and procedures

## 🔧 Utilities

### Date Formatting 

The application uses a standardized date formatting system to ensure consistency across all user interfaces:

```tsx
import { formatDate } from '@/utils/formatters';

// Basic date formatting - "May 15, 2023"
formatDate(someDate);

// Format with day of week - "Monday, May 15, 2023"
formatDate(someDate, { type: 'dayDate' });

// Format with time - "May 15, 2023, 12:30 PM"
formatDate(someDate, { type: 'dateTime' });
```

Run the date format test script to verify formatting consistency:

```bash
./test/date-format-test.sh
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Images sourced from [Unsplash](https://unsplash.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Icons from [Lucide](https://lucide.dev/)

---

Made with ❤️ and 🍰