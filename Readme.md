
# Machine Test – MERN Stack Developer

## Objective

To build a MERN stack application with the following core features:

- Admin authentication
- Agent creation and management
- Uploading CSV/XLSX/XLS files and distributing list items evenly among agents


## 🧰 Tech Stack

- **Frontend:** React.js (Vite)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (local)
- **Authentication:** JSON Web Tokens (JWT)
- **File Handling:** Multer
- **Other:** XLSX, CSV Parser


## 📁 Project Structure

```
project-root/
├── frontend/    # React.js frontend (Vite)
├── backend/     # Express.js backend
└── book1/       # Sample or uploaded Excel/CSV files
```


## ⚙️ Prerequisites

Ensure the following are installed on your local system:

- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)


## 🚀 Setup Instructions

### 🔧 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=3000
JWT_SECRET=fsjvnleknvk
MONGO_URI=mongodb://localhost:27017/agent
NODE_ENV=production
```

Start the backend server:

```bash
npx nodemon
```

The backend will run at: `http://localhost:3000`


### 💻 Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:3000
```
Start the Frontend server:

```bash
npm run dev
```

The frontend will run at: [http://localhost:5173/](http://localhost:5173/)


## 🧩 Features

### 🔐 Admin Login

- Login using Email and Password
- JWT-based authentication
- Redirects to dashboard upon successful login


### 👨‍💼 Agent Management

- Admin can create agents with:
  - Name
  - Email
  - Mobile Number (with country code)
  - Password
- Agents are stored in MongoDB


### 📄 File Upload and Distribution

- Admin can upload a file in `.csv`, `.xlsx`, or `.xls` formats
- File must include:
  - FirstName – Text
  - Phone – Number
  - Notes – Text
- File is validated before processing
- Items are equally distributed among 5 agents
- If items aren't divisible by 5, the remaining items are distributed one by one to agents
- Distributed data is stored in MongoDB and displayed per agent


### 🧾 Agent Dashboard

- Each agent can log in
- View only their assigned data/tasks


## 📸 Demo Video

🔗 [Google Drive Demo Video](https://drive.google.com/file/d/1dUj8Zcby4ipEcbkWKGd4INK5dEP4qc55/view?usp=sharing)



## 👤 Author

- **Your Name**
- GitHub: [@Vikram-Madhikunta](https://github.com/Vikram-Madhikunta)
- Email: vikrammadhikunta96gmail.com




## ✅ Deliverables Recap

- Admin Login with JWT
- Agent Creation
- Upload & Distribute Lists (CSV/XLSX/XLS)
- Agent Dashboard with Assigned Tasks
- Clean, commented code
- `.env` configuration
- Working Demo Video
