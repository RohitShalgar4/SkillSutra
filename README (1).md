# SkillSutra - Modern Learning Management System


SkillSutra is a comprehensive Learning Management System (LMS) built with modern web technologies, offering a seamless learning experience for both instructors and students. The platform features real-time interactions, course management, progress tracking, and certification capabilities.

[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.0+-black?style=for-the-badge&logo=express)](https://expressjs.com/)

## 🌟 Features

- **User Authentication & Authorization**
  - Secure user registration and login
  - Role-based access control (Students/Instructors)
  - JWT-based authentication

- **Course Management**
  - Create and manage courses
  - Upload and manage course content
  - Support for various media types
  - Course progress tracking

- **Interactive Learning**
  - Real-time chat functionality
  - Course progress tracking
  - Interactive course content
  - Certificate generation upon completion

- **Payment Integration**
  - Secure payment processing with Stripe
  - Course purchase management
  - Transaction history

- **AI-Powered Features**
  - Integration with the gemini-1.5 flash

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Redux Toolkit | State Management |
| React Router | Navigation |
| TailwindCSS | Styling |
| Radix UI | Component Library |
| Socket.IO | Real-time Features |
| React Player | Media Playback |
| React Quill | Rich Text Editing |
| Recharts | Data Visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| Socket.IO | Real-time Communication |
| JWT | Authentication |
| Cloudinary | Media Storage |
| Stripe | Payment Processing |
| Multer | File Uploads |
| PDFKit | Certificate Generation |
|Ai Model | gemini-1.5 flash |

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn



### Installation

1. Clone the repository
```bash
git clone https://github.com/RohitShalgar4/SkillSutra.git
cd SkillSutra
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Start the development servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
SkillSutra/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
│
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── services/
    ├── middleware/
    ├── utils/
    ├── database/
    └── index.js
```

## 🔒 Security Features

- 🔐 JWT-based authentication
- 🔑 Password hashing with bcrypt
- 🛡️ CORS protection
- 📤 Secure file uploads
- 🔒 Environment variable protection
- ✅ Input validation and sanitization

## 🤝 Contributing

- Fork the repository
- Create your feature branch (`git checkout -b feature/AmazingFeature`)
- Commit your changes (`git commit -m 'Add some AmazingFeature'`)
- Push to the branch (`git push origin feature/AmazingFeature`)
- Open a Pull Request


## 👥 Authors

- Rohit Shalgar 
- Vaibhavi Belamkar 
- Bhargav Katkam 
- Uday More 

## 🙏 Acknowledgments

- All the open-source libraries and tools used in this project
- The amazing developer community for their support and guidance