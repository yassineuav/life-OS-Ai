# Life OS Project Walkthrough

I have successfully built the **Life OS** application, featuring a Django backend and a Next.js frontend with detailed tracking and AI predictions.

## 🚀 Running the Project

### 1. Backend (Django)
Open a terminal in the project root:
```bash
cd backend
.\venv\Scripts\activate
python manage.py runserver
```
The API will be available at `http://localhost:8000`.

### 2. Frontend (Next.js)
Open a new terminal:
```bash
cd frontend
npm run dev
```
Access the application at `http://localhost:3000`.

## 🏗 Implementation Details

### Backend Architecture
- **Authentication**: Custom User model with JWT support (`/auth/token/`).
- **Data Modules**:
    - **Tasks**: Unified task/habit tracking.
    - **Finance**: Income/Expense tracking.
    - **Health**: Daily logs (Sleep, Energy).
    - **Learning**: Course and progress logs.
- **AI Prediction Engine**:
    - **App**: `predictions`
    - **Logic**: Analyzes daily sleep hours, energy levels, and active task count to calculate a "Burnout Risk" score.
    - **API**: `/predictions/daily-insight/`

### Frontend Architecture
- **Dashboard**:
    - **Daily Progress**: Real-time aggregation of completed habits and tasks.
    - **AI Insight Card**: Dynamic card displaying daily tips based on burnout risk (High/Medium/Low).
    - **Stats**: Real-time Health score and Daily Spend.
    - **Visuals**: Circular progress rings and status-based styling.
- **Authentication**:
    - **Register Page**: New user registration with standard validation (`/register`).
    - **Login Integration**: Seamless flow between Login and Register.
- **Task Management**:
    - Real-time creation, completion toggling, and deletion of tasks.
    - Filtering by Active/Completed status.
- **Health Tracker**:
    - Daily log submission (Sleep, Energy, Gym).
    - **Charts**: 7-day Sleep Trend (Bar Chart) and Energy Trend (Area Chart) using `recharts`.
- **Learning Path**:
    - **CRUD**: Full Create, Read, Delete functionality for courses.
    - **Progress Tracking**: "Log Time" feature updates course progress and status automatically.
    - **Visuals**: Dynamic progress bars and status badges.
- **Finance Tracker**:
    - Recent transactions list.
    - Income vs Expense summary cards.
    - Add Expense modal.

## 🔮 Future Improvements
- **Advanced AI**: Train a real ML model on the accumulated user data in the `predictions` app.
- **Mobile App**: Wrap the Next.js PWA into a native container.
