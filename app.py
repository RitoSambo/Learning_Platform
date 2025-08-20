from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime
import json

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'

# Database initialization
def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect('learning_platform.db')
    cursor = conn.cursor()
    
    # Users table (students and teachers)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tutorials table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tutorials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            video_url TEXT NOT NULL,
            teacher_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users (id)
        )
    ''')
    
    # Video interactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS video_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            tutorial_id INTEGER,
            interaction_type TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (tutorial_id) REFERENCES tutorials (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Database helper functions
def get_db_connection():
    """Get a database connection"""
    conn = sqlite3.connect('learning_platform.db')
    conn.row_factory = sqlite3.Row
    return conn

def create_user(username, email, password, role='student'):
    """Create a new user in the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        password_hash = generate_password_hash(password)
        cursor.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            (username, email, password_hash, role)
        )
        conn.commit()
        return cursor.lastrowid
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def verify_user(username, password):
    """Verify user credentials and return user data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user and check_password_hash(user['password_hash'], password):
        return dict(user)
    return None

def get_tutorials():
    """Get all tutorials with teacher information"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT t.*, u.username as teacher_name 
        FROM tutorials t 
        JOIN users u ON t.teacher_id = u.id 
        ORDER BY t.created_at DESC
    ''')
    tutorials = cursor.fetchall()
    conn.close()
    
    return [dict(tutorial) for tutorial in tutorials]

def add_tutorial(title, description, video_url, teacher_id):
    """Add a new tutorial"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO tutorials (title, description, video_url, teacher_id) VALUES (?, ?, ?, ?)',
        (title, description, video_url, teacher_id)
    )
    conn.commit()
    conn.close()

def record_interaction(user_id, tutorial_id, interaction_type):
    """Record a video interaction"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO video_interactions (user_id, tutorial_id, interaction_type) VALUES (?, ?, ?)',
        (user_id, tutorial_id, interaction_type)
    )
    conn.commit()
    conn.close()

def get_interaction_stats():
    """Get interaction statistics for teacher dashboard"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            t.title,
            u.username as student_name,
            vi.interaction_type,
            COUNT(*) as count
        FROM video_interactions vi
        JOIN tutorials t ON vi.tutorial_id = t.id
        JOIN users u ON vi.user_id = u.id
        GROUP BY t.title, u.username, vi.interaction_type
        ORDER BY t.title, u.username
    ''')
    
    stats = cursor.fetchall()
    conn.close()
    
    return [dict(stat) for stat in stats]

# Routes
@app.route('/')
def index():
    """Home page - redirect to login if not authenticated"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if session.get('role') == 'teacher':
        return redirect(url_for('teacher_dashboard'))
    else:
        return redirect(url_for('student_dashboard'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = verify_user(username, password)
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            
            if user['role'] == 'teacher':
                return redirect(url_for('teacher_dashboard'))
            else:
                return redirect(url_for('student_dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """Signup page"""
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        role = request.form.get('role', 'student')
        
        user_id = create_user(username, email, password, role)
        if user_id:
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Username or email already exists', 'error')
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    """Logout user"""
    session.clear()
    return redirect(url_for('login'))

@app.route('/student/dashboard')
def student_dashboard():
    """Student dashboard with available tutorials"""
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
    
    tutorials = get_tutorials()
    return render_template('student_dashboard.html', tutorials=tutorials)

@app.route('/teacher/dashboard')
def teacher_dashboard():
    """Teacher dashboard with tutorial management and stats"""
    if 'user_id' not in session or session.get('role') != 'teacher':
        return redirect(url_for('login'))
    
    tutorials = get_tutorials()
    stats = get_interaction_stats()
    return render_template('teacher_dashboard.html', tutorials=tutorials, stats=stats)

@app.route('/teacher/add_tutorial', methods=['GET', 'POST'])
def add_tutorial_page():
    """Page for teachers to add new tutorials"""
    if 'user_id' not in session or session.get('role') != 'teacher':
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        video_url = request.form['video_url']
        
        add_tutorial(title, description, video_url, session['user_id'])
        flash('Tutorial added successfully!', 'success')
        return redirect(url_for('teacher_dashboard'))
    
    return render_template('add_tutorial.html')

@app.route('/tutorial/<int:tutorial_id>')
def view_tutorial(tutorial_id):
    """View a specific tutorial"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT t.*, u.username as teacher_name 
        FROM tutorials t 
        JOIN users u ON t.teacher_id = u.id 
        WHERE t.id = ?
    ''', (tutorial_id,))
    
    tutorial = cursor.fetchone()
    conn.close()
    
    if not tutorial:
        flash('Tutorial not found', 'error')
        return redirect(url_for('student_dashboard'))
    
    return render_template('view_tutorial.html', tutorial=dict(tutorial))

# API endpoints for video interactions
@app.route('/api/interaction', methods=['POST'])
def api_interaction():
    """API endpoint to record video interactions"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    tutorial_id = data.get('tutorial_id')
    interaction_type = data.get('interaction_type')
    
    if not tutorial_id or not interaction_type:
        return jsonify({'error': 'Missing required fields'}), 400
    
    record_interaction(session['user_id'], tutorial_id, interaction_type)
    return jsonify({'success': True})

@app.route('/api/stats')
def api_stats():
    """API endpoint to get interaction statistics"""
    if 'user_id' not in session or session.get('role') != 'teacher':
        return jsonify({'error': 'Not authorized'}), 401
    
    stats = get_interaction_stats()
    return jsonify(stats)

if __name__ == '__main__':
    # Initialize database on first run
    init_db()
    
    # Create a default teacher account if none exists
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM users WHERE role = "teacher"')
    teacher_count = cursor.fetchone()[0]
    conn.close()
    
    if teacher_count == 0:
        create_user('admin', 'admin@example.com', 'admin123', 'teacher')
        print("Default teacher account created: admin/admin123")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
