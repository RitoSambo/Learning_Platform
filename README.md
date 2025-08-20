# Student Learning Platform

A comprehensive web-based learning platform built with Flask, featuring user authentication, video tutorial management, and student interaction tracking.

## 🚀 Features

### Authentication System
- **User Registration**: Students and teachers can create accounts
- **Secure Login**: Password hashing with Werkzeug
- **Role-based Access**: Separate dashboards for students and teachers
- **Session Management**: Secure user sessions

### Student Features
- **Browse Tutorials**: View all available video tutorials
- **Video Player**: Embedded video player with YouTube support
- **Interaction Tracking**: Automatic tracking of video interactions (play, pause, replay)
- **Progress Monitoring**: Real-time interaction counters

### Teacher Features
- **Tutorial Management**: Add new video tutorials with descriptions
- **Dashboard Analytics**: View student interaction statistics
- **Content Creation**: Upload video links and descriptions
- **Student Monitoring**: Track how students interact with content

### Technical Features
- **Responsive Design**: Modern UI with Bootstrap 5
- **Database**: SQLite for data persistence
- **API Endpoints**: RESTful API for interaction tracking
- **Video Integration**: YouTube video embedding with API
- **Real-time Updates**: Live interaction tracking

## 🛠️ Technology Stack

- **Backend**: Python Flask
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome
- **Video**: YouTube API

## 📁 Project Structure

```
student-learning-platform/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── run.py                # Startup script
├── README.md             # Project documentation
├── .gitignore            # Git ignore rules
├── learning_platform.db  # SQLite database
├── static/               # Static files
│   ├── css/
│   │   └── style.css     # Custom styles
│   └── js/
│       ├── main.js       # General functionality
│       └── video-player.js # Video player logic
└── templates/            # HTML templates
    ├── base.html         # Base template
    ├── login.html        # Login page
    ├── signup.html       # Signup page
    ├── student_dashboard.html
    ├── teacher_dashboard.html
    ├── add_tutorial.html
    └── view_tutorial.html
```

## 📋 Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

## 🚀 Installation & Setup

### 1. Clone or Download the Project
```bash
# If using git
git clone <repository-url>
cd student-learning-platform

# Or download and extract the ZIP file
```

### 2. Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```

### 5. Access the Application
Open your web browser and navigate to:
```
http://localhost:5000
```

## 👥 Default Accounts

The application creates a default teacher account on first run:

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Teacher

**⚠️ Important**: Change these credentials in production!

## 📖 Usage Guide

### For Teachers

1. **Login**: Use the default admin account or create a new teacher account
2. **Add Tutorials**: 
   - Click "Add Tutorial" from the dashboard
   - Fill in title, description, and video URL
   - Submit to create the tutorial
3. **Monitor Students**:
   - View interaction statistics on the dashboard
   - See which students are engaging with content
   - Track play, pause, and replay counts

### For Students

1. **Create Account**: Sign up as a student
2. **Browse Tutorials**: View all available tutorials on the dashboard
3. **Watch Videos**: Click on any tutorial to start learning
4. **Track Progress**: See your interaction counts in real-time

### Video URL Format

The platform supports various video URL formats:
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube Short: `https://youtu.be/VIDEO_ID`
- Other platforms: Links will open in new tabs

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tutorials Table
```sql
CREATE TABLE tutorials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    teacher_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users (id)
);
```

### Video Interactions Table
```sql
CREATE TABLE video_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    tutorial_id INTEGER,
    interaction_type TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (tutorial_id) REFERENCES tutorials (id)
);
```

## 🔧 API Endpoints

### Record Interaction
```
POST /api/interaction
Content-Type: application/json

{
    "tutorial_id": 1,
    "interaction_type": "play"
}
```

### Get Statistics (Teachers Only)
```
GET /api/stats
```

## 🎨 Customization

### Styling
- Modify CSS variables in `static/css/style.css`
- Update Bootstrap classes for different themes
- Customize color scheme in the `:root` section

### JavaScript
- General functionality: `static/js/main.js`
- Video player logic: `static/js/video-player.js`
- Add new modules as needed

### Adding Features
- Extend the database schema in `app.py`
- Add new routes for additional functionality
- Create new templates for additional pages
- Add new static files in the appropriate directories

## 🔒 Security Considerations

### Production Deployment
1. **Change Secret Key**: Update `app.secret_key` in `app.py`
2. **Use HTTPS**: Configure SSL certificates
3. **Database Security**: Use a production database (PostgreSQL, MySQL)
4. **Environment Variables**: Store sensitive data in environment variables
5. **Input Validation**: Add more robust input validation
6. **Rate Limiting**: Implement API rate limiting

### Current Security Features
- Password hashing with Werkzeug
- SQL injection prevention with parameterized queries
- Session-based authentication
- Role-based access control

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in app.py
   app.run(debug=True, host='0.0.0.0', port=5001)
   ```

2. **Database Errors**
   ```bash
   # Delete the database file and restart
   rm learning_platform.db
   python app.py
   ```

3. **Video Not Loading**
   - Check if the video URL is valid
   - Ensure the video is publicly accessible
   - Try different video platforms

### Debug Mode
The application runs in debug mode by default. For production:
```python
app.run(debug=False, host='0.0.0.0', port=5000)
```

