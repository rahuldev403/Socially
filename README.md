# Socially

A modern social media platform built with React and Django, featuring real-time posts, nested comments, and a karma-based leaderboard system.

## 🚀 Features

- **Authentication**: User signup and login with session-based authentication
- **Posts**: Create and share posts with the community
- **Likes**: Like posts from other users
- **Nested Comments**: Threaded comment system with unlimited nesting depth
- **Leaderboard**: 24-hour karma ranking based on user activity
- **Dark/Light Theme**: Toggle between dark and light modes with persistence
- **Responsive Design**: Fully responsive UI built with Tailwind CSS
- **Smooth Animations**: Framer Motion animations throughout the app

## 🛠️ Tech Stack

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **shadcn/ui** - UI component system

### Backend

- **Django 6.0** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (default)
- **Session Authentication** - Cookie-based auth

## 📁 Project Structure

```
green-itt/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # Reusable UI components
│   │   │   ├── Comment.jsx
│   │   │   └── Feed.jsx
│   │   ├── context/       # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── api.js         # API client functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── .env               # Environment variables
│   └── package.json
│
└── server/                # Django backend
    ├── config/            # Project settings
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── core/              # Main app
    │   ├── models.py      # Database models
    │   ├── serializers.py # DRF serializers
    │   ├── views.py       # API views
    │   ├── views_auth.py  # Authentication views
    │   └── urls.py        # URL routing
    ├── manage.py
    └── venv/              # Python virtual environment
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd green-itt
   ```

2. **Set up the backend**

   ```bash
   cd server

   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   # Install dependencies from requirements.txt
   pip install -r requirements.txt

   # Run migrations
   python manage.py migrate

   # Create a superuser (optional)
   python manage.py createsuperuser
   ```

3. **Set up the frontend**

   ```bash
   cd ../client

   # Install dependencies
   npm install
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd server
   venv\Scripts\activate  # or source venv/bin/activate on macOS/Linux
   python manage.py runserver
   ```

   Backend will run at: `http://localhost:8000`

2. **Start the frontend dev server** (in a new terminal)

   ```bash
   cd client
   npm run dev
   ```

   Frontend will run at: `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` and start using the app!

## 🔑 Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

## 📝 API Endpoints

### Authentication

- `POST /api/auth/signup/` - Create new account
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/me/` - Get current user

### Posts

- `GET /api/posts/` - List all posts
- `POST /api/posts/create/` - Create a post
- `POST /api/posts/:id/like/` - Like a post

### Comments

- `GET /api/posts/:id/comments/` - Get post comments
- `POST /api/comments/` - Create a comment

### Leaderboard

- `GET /api/leaderboard/` - Get top users (24h)

## 🎨 Features in Detail

### Theme System

The app includes a complete light/dark theme system:

- Theme persists across sessions (localStorage)
- Smooth transitions between themes
- All components adapt to the current theme
- Toggle via the sun/moon icon in the header

### Comment System

- Nested comments with unlimited depth
- Reply to any comment
- Tree structure visualization
- Smooth expand/collapse animations

### Karma System

- Points awarded for posts, likes, and comments
- 24-hour rolling leaderboard
- Real-time karma updates

## 🚧 Development

### Frontend Development

```bash
cd client
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development

```bash
cd server
python manage.py runserver  # Start dev server
python manage.py shell      # Django shell
python manage.py test       # Run tests
```

## 📦 Build for Production

### Frontend

```bash
cd client
npm run build
```

Output will be in `client/dist/`

### Backend

For production deployment:

1. Set `DEBUG = False` in environment variables
2. Configure a production database (PostgreSQL recommended)
3. Set up a proper WSGI server (Gunicorn included in requirements.txt)
4. Configure static files serving (WhiteNoise included)
5. Set up HTTPS

### Deploy to Render

This project is configured for easy deployment to Render:

1. **Push your code to GitHub**

2. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - **Root Directory**: `server`
   - **Build Command**: `bash build.sh`
   - **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2`

3. **Set Environment Variables**

   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=your-app-name.onrender.com
   FRONTEND_URL=https://your-frontend-url.com
   DB_NAME=your-db-name
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_HOST=your-db-host
   DB_PORT=5432
   ```

4. **Create a PostgreSQL Database**
   - Add a PostgreSQL database on Render
   - Copy the connection details to your environment variables

Alternatively, use the included `render.yaml` for Blueprint deployment:

- Simply connect your repository to Render
- It will automatically provision the database and web service
- Set the required environment variables in the Render dashboard

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

Built with ❤️ using modern web technologies.

## 🐛 Known Issues

- None at the moment! Report issues on the GitHub repository.

## 📮 Support

For support, questions, or feedback, please open an issue on GitHub.
