# 🔄 SkillXChange – A Skill-Swapping Platform

<p align="center">
  <em>Exchange Skills. Learn Together. Grow Together.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React.js-%2361DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-%23646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-%2306B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-%23FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
</p>

<p align="center">
  <a href="https://skillxchanged.netlify.app/" target="_blank">
    <img src="https://img.shields.io/badge/🔗_Live_Demo-Visit_Now-brightgreen?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [How It Works](#-how-it-works)
- [Screenshots](#-screenshots)
- [Team](#-team)

---

## 🌐 Overview

**SkillXChange** is a revolutionary web platform that facilitates **skill bartering** — enabling users to exchange expertise and services without monetary transactions. Whether you're a developer wanting to learn design, or a chef looking to improve your photography, SkillXChange connects you with like-minded individuals for mutually beneficial skill exchanges.

### 🎯 Mission
To create a collaborative learning ecosystem where knowledge and skills are shared freely, fostering personal growth and community building through peer-to-peer education.

---

## ✨ Key Features

### 🔐 **Authentication & Security**
- Secure Firebase authentication with email/password
- Protected routes and user session management
- Admin access control with UID whitelisting

### 🎯 **Smart Skill Matching**
- Intelligent algorithm to match users based on complementary skills
- Browse and discover skills offered by community members
- Send and receive skill exchange requests

### 💬 **Real-time Communication**
- Live chat system for matched users
- Dedicated chat rooms for each skill exchange
- Message history and timestamps

### 🧭 **Intuitive Navigation**
- Dynamic routing based on user status
- Responsive design for all devices
- Context-aware navigation bar

### 🛠️ **Admin Dashboard**
- Comprehensive user management
- Exchange monitoring and analytics
- Report handling and moderation tools

---

## 🧰 Tech Stack

### Frontend Technologies
```
⚛️  React.js        - Component-based UI framework
⚡  Vite.js         - Lightning-fast build tool
🎨  Tailwind CSS    - Utility-first CSS framework
🔥  Firebase Auth   - Authentication service
```

### Backend & Database
```
🔥  Firebase Firestore  - NoSQL document database
☁️  Firebase Hosting    - Web hosting service
🛡️  Firebase Security   - Database security rules
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/verma07ansh/SkillXChange.git
   cd SkillXChange
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

---

## 🔄 How It Works

### User Journey

#### 🆕 **New Users**
1. **Sign Up** → Create account with email/password
2. **Profile Setup** → Complete name, skills, and interests
3. **Browse Skills** → Discover what others are offering
4. **Make Connections** → Send skill exchange requests

#### 🔄 **Returning Users**
1. **Login** → Secure authentication
2. **Dashboard** → View active exchanges and requests
3. **Chat** → Communicate with matched users
4. **Manage** → Track ongoing skill swaps



### Skill Exchange Process

```mermaid
graph TD
    A[Browse Skills] --> B[Send Request]
    B --> C{Request Accepted?}
    C -->|Yes| D[Chat Room Opens]
    C -->|No| E[Try Different Skills]
    D --> F[Skill Exchange Begins]
    F --> G[Rate & Review]
```

---

## 📸 Screenshots

### Platform Overview (Landing Page)
![1753561591729](https://github.com/user-attachments/assets/aa1dc0e4-f65d-4494-ba4a-aea5954a6b70)


### User Dashboard (Profile Page)
![1753561591654](https://github.com/user-attachments/assets/ee486a98-1d31-4376-a8a3-749800a1efc4)


### Skill Matching Interface
![1753561591970](https://github.com/user-attachments/assets/70077ac5-c422-4e5c-be4d-d47ce49f7068)
![1753561591693](https://github.com/user-attachments/assets/33eb89e6-3465-4f4c-a834-a497c9562aeb)


### Real-time Chat System
![1753557166139](https://github.com/user-attachments/assets/4d214973-550f-4107-b130-ddee5d9c85aa)

### Admin Dashboard
![1753561591861](https://github.com/user-attachments/assets/12a542af-192f-4738-8f3b-382f91fc7208)

---

## 👥 Team

Meet the talented developers behind SkillXChange:

<table>
  <tr>
  <td align="center">
      <strong>Ansh Verma</strong><br>
      <a href="https://github.com/verma07ansh">
        <img src="https://img.shields.io/badge/GitHub-verma07ansh-blue?style=flat-square&logo=github" />
      </a>
    </td>
    <td align="center">
      <strong>Mit Gandhi</strong><br>
      <a href="https://github.com/Mit-Gandhi">
        <img src="https://img.shields.io/badge/GitHub-Mit--Gandhi-blue?style=flat-square&logo=github" />
      </a>
    </td>
    <td align="center">
      <strong>Rishit Srivastava</strong><br>
      <a href="https://github.com/rishitsrivastav">
        <img src="https://img.shields.io/badge/GitHub-rishitsrivastav-blue?style=flat-square&logo=github" />
      </a>
    </td>
  </tr>
</table>

---


<p align="center">
  <strong>Ready to start exchanging skills?</strong><br>
  <a href="https://skillxchanged.netlify.app/" target="_blank">
    🚀 Try SkillXChange Now
  </a>
</p>

