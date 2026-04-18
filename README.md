# 🚀 JobApplyAI: AI-Powered Resume Matching & Auto-Apply Platform

**The industry’s first glassmorphic, AI-driven job application engine designed to automate your career journey.**

JobApplyAI is a high-performance, autonomous platform that bridges the gap between candidates and recruiters using advanced **NLP-powered resume parsing**, real-time **ATS scoring**, and machine learning-driven job matching.

![JobApplyAI Preview](https://github.com/BLACKDEVIL4114/JobApplyAI-Platform/raw/main/preview.png)

## ✨ Key Features

- **🧠 Advanced NLP Parsing**: Powered by **spaCy**, the system extracts skills, experience, and entities from PDF resumes with high precision.
- **🎯 Dynamic ATS Scoring**: Instantly analyze your resume against industrial technical keywords with an intelligent density-based algorithm.
- **🤖 Autonomous Auto-Apply**: Experience the future of job hunting with an automated application system and real-time matcher.
- **🖼️ Premium Glassmorphic UI**: A stunning interface built with **React 19** and **Framer Motion** for smooth, buttery transitions and a tailored dark-mode experience.
- **📊 Real-Time Matching Center**: A centralized dashboard to track application metrics, success rates, and ranked job matches.

## 🛠️ Tech Stack

### Frontend
- **React 19** & **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)

### Backend (The Intelligence Engine)
- **FastAPI** (High-performance Python API)
- **spaCy** (Industrial-strength Natural Language Processing)
- **scikit-learn** (Skill matching & similarity algorithms)
- **PyPDF2** (PDF processing)

### Infrastructure
- **Supabase** (Auth & Database architecture)

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```
Accessible at: `http://localhost:5173`

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install requirements
pip install -r requirements.txt

# Download NLP model
python -m spacy download en_core_web_sm

# Start the API server
uvicorn main:app --reload
```
Accessible at: `http://localhost:8000/docs`

## 🔐 Environment Configuration
Rename `.env.example` to `.env` and configure your Supabase credentials to enable the Secure Auth Vault.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by [BLACKDEVIL4114](https://github.com/BLACKDEVIL4114)
