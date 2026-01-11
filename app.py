"""
Smart Crime Scene Reconstruction System
Flask Backend Application
Author: Forensic Tech Team
"""

import os
import json
import uuid
import shutil
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from werkzeug.utils import secure_filename

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'forensic-secure-key-2024'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'pdf', 'txt', 'doc', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Dummy database (in-memory storage for demo purposes)
cases = []
evidence_items = []
collaboration_logs = []

# Sample data for demonstration
def initialize_sample_data():
    """Initialize sample data for demonstration"""
    global cases, evidence_items, collaboration_logs
    
    cases = [
        {
            'id': 'CASE-001',
            'title': 'Bank Robbery - Downtown Branch',
            'date': '2024-03-15',
            'status': 'Active',
            'location': '123 Main St, Downtown',
            'officer': 'Det. Sarah Miller',
            'priority': 'High',
            'evidence_count': 8,
            'last_updated': '2024-03-20 14:30'
        },
        {
            'id': 'CASE-002',
            'title': 'Art Gallery Theft',
            'date': '2024-03-10',
            'status': 'Under Review',
            'location': '456 Art Ave, Uptown',
            'officer': 'Det. James Wilson',
            'priority': 'Medium',
            'evidence_count': 12,
            'last_updated': '2024-03-19 09:15'
        },
        {
            'id': 'CASE-003',
            'title': 'Cyber Fraud Investigation',
            'date': '2024-03-05',
            'status': 'Closed',
            'location': 'Virtual/Online',
            'officer': 'Det. Alex Chen',
            'priority': 'High',
            'evidence_count': 23,
            'last_updated': '2024-03-18 16:45'
        }
    ]
    
    evidence_items = [
        {
            'id': 'EVD-001',
            'case_id': 'CASE-001',
            'name': 'Surveillance Footage - Entrance',
            'type': 'Video',
            'date_collected': '2024-03-15 10:30',
            'collected_by': 'Officer Rodriguez',
            'status': 'Processed',
            'notes': 'Shows suspect entering bank'
        },
        {
            'id': 'EVD-002',
            'case_id': 'CASE-001',
            'name': 'Fingerprint Sample A',
            'type': 'Image',
            'date_collected': '2024-03-15 11:15',
            'collected_by': 'Forensic Tech Kim',
            'status': 'Analyzed',
            'notes': 'Partial print from counter'
        },
        {
            'id': 'EVD-003',
            'case_id': 'CASE-002',
            'name': 'Security System Logs',
            'type': 'Document',
            'date_collected': '2024-03-10 21:00',
            'collected_by': 'Det. Wilson',
            'status': 'Processing',
            'notes': 'System was tampered with'
        }
    ]
    
    collaboration_logs = [
        {
            'id': 'LOG-001',
            'case_id': 'CASE-001',
            'user': 'Det. Sarah Miller',
            'action': 'Added new evidence',
            'timestamp': '2024-03-20 14:30',
            'details': 'Uploaded surveillance footage from ATM camera'
        },
        {
            'id': 'LOG-002',
            'case_id': 'CASE-001',
            'user': 'Forensic Analyst Chen',
            'action': 'Completed analysis',
            'timestamp': '2024-03-20 10:15',
            'details': 'Fingerprint match found in database'
        }
    ]

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes
@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard with cases overview"""
    return render_template('dashboard.html', cases=cases, total_cases=len(cases))

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    """Case and evidence upload page"""
    if request.method == 'POST':
        # Handle case creation
        case_title = request.form.get('case_title')
        case_date = request.form.get('case_date')
        case_location = request.form.get('case_location')
        case_description = request.form.get('case_description')
        
        if case_title and case_date:
            new_case = {
                'id': f'CASE-{len(cases)+100:03d}',
                'title': case_title,
                'date': case_date,
                'status': 'Active',
                'location': case_location,
                'officer': 'User',
                'priority': 'Medium',
                'evidence_count': 0,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M'),
                'description': case_description
            }
            cases.append(new_case)
            flash(f'Case {new_case["id"]} created successfully!', 'success')
        
        # Handle file uploads
        if 'evidence_files' in request.files:
            files = request.files.getlist('evidence_files')
            for file in files:
                if file and file.filename != '' and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4().hex}_{filename}"
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    file.save(filepath)
                    
                    # Create evidence record
                    new_evidence = {
                        'id': f'EVD-{len(evidence_items)+100:03d}',
                        'case_id': new_case['id'] if 'new_case' in locals() else 'CASE-001',
                        'name': filename,
                        'type': filename.split('.')[-1].upper(),
                        'date_collected': datetime.now().strftime('%Y-%m-%d %H:%M'),
                        'collected_by': 'User',
                        'status': 'Uploaded',
                        'notes': request.form.get('evidence_notes', ''),
                        'filename': unique_filename
                    }
                    evidence_items.append(new_evidence)
                    
                    # Update case evidence count
                    for case in cases:
                        if case['id'] == new_evidence['case_id']:
                            case['evidence_count'] += 1
                            case['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M')
                    
                    flash(f'Evidence {filename} uploaded successfully!', 'success')
        
        return redirect(url_for('upload'))
    
    return render_template('upload.html')

@app.route('/evidence')
def evidence():
    """Evidence management page"""
    return render_template('evidence.html', evidence_items=evidence_items, cases=cases)

@app.route('/reconstruction', methods=['GET', 'POST'])
def reconstruction():
    """AI-assisted reconstruction page"""
    reconstruction_results = []
    
    if request.method == 'POST':
        # Mock AI processing
        analysis_type = request.form.get('analysis_type')
        case_id = request.form.get('case_id')
        
        # Simulate AI processing with mock results
        mock_results = {
            'blood_pattern': {
                'title': 'Blood Pattern Analysis',
                'findings': ['Impact spatter detected', 'Directionality: NW to SE', 'Estimated velocity: Medium velocity impact'],
                'confidence': 87,
                'recommendations': ['Check for weapon matching impact pattern', 'Reconstruct victim position']
            },
            'fingerprint': {
                'title': 'Fingerprint Analysis',
                'findings': ['6 points of comparison identified', 'Match found in criminal database', 'Right index finger'],
                'confidence': 94,
                'recommendations': ['Suspect: John Doe (ID: CR-78432)', 'Cross-reference with alibis']
            },
            'bullet_trajectory': {
                'title': 'Bullet Trajectory Reconstruction',
                'findings': ['Entry point: 5.2ft from ground', 'Trajectory angle: 12 degrees downward', 'Estimated shooter position: 15ft from victim'],
                'confidence': 79,
                'recommendations': ['Check for ballistic evidence at estimated position', 'Review witness statements for shooter description']
            },
            'digital_footprint': {
                'title': 'Digital Footprint Analysis',
                'findings': ['Encrypted communication detected', 'VPN usage identified', 'Data exfiltration pattern recognized'],
                'confidence': 91,
                'recommendations': ['Request ISP records', 'Check for malware on victim systems']
            }
        }
        
        result = mock_results.get(analysis_type, {
            'title': 'General Analysis',
            'findings': ['Multiple evidence points analyzed', 'Pattern recognition complete'],
            'confidence': 75,
            'recommendations': ['Continue evidence collection', 'Review preliminary findings']
        })
        
        reconstruction_results.append({
            'id': len(reconstruction_results) + 1,
            'case_id': case_id,
            'type': analysis_type,
            'result': result,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
        })
        
        flash(f'AI analysis completed for {analysis_type.replace("_", " ").title()}!', 'success')
    
    return render_template('reconstruction.html', 
                          reconstruction_results=reconstruction_results, 
                          cases=cases)

@app.route('/visualization')
def visualization():
    """3D/VR visualization page"""
    return render_template('visualization.html')

@app.route('/collaboration')
def collaboration():
    """Collaborative review page"""
    return render_template('collaboration.html', 
                          collaboration_logs=collaboration_logs,
                          cases=cases)

@app.route('/security')
def security():
    """Security and ethics information page"""
    return render_template('security.html')

@app.route('/api/get_evidence/<case_id>')
def get_evidence_by_case(case_id):
    """API endpoint to get evidence by case ID"""
    case_evidence = [e for e in evidence_items if e['case_id'] == case_id]
    return jsonify(case_evidence)

@app.route('/api/add_collaboration', methods=['POST'])
def add_collaboration():
    """API endpoint to add collaboration log"""
    data = request.get_json()
    new_log = {
        'id': f'LOG-{len(collaboration_logs)+100:03d}',
        'case_id': data.get('case_id'),
        'user': data.get('user', 'User'),
        'action': data.get('action'),
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'details': data.get('details')
    }
    collaboration_logs.append(new_log)
    return jsonify({'success': True, 'log': new_log})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

# Initialize sample data
initialize_sample_data()

if __name__ == '__main__':
    app.run(debug=True, port=5000)