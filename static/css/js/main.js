/**
 * Smart Crime Scene Reconstruction System
 * Main JavaScript File
 * Author: Forensic Tech Team
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initFileUpload();
    initAnimations();
    initNotifications();
    initProgressBars();
    initSecurityScan();
    
    // Add loading animation
    showLoadingAnimation();
    
    // Update current year in footer
    updateCurrentYear();
    
    // Initialize tooltips
    initTooltips();
});

/**
 * Initialize file upload functionality
 */
function initFileUpload() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('evidence_files');
    const fileList = document.getElementById('fileList');
    
    if (!dropArea || !fileInput) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    // Handle click to select files
    dropArea.addEventListener('click', () => fileInput.click());
    
    // Handle file selection via input
    fileInput.addEventListener('change', handleFiles);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.style.borderColor = 'var(--primary-blue)';
        dropArea.style.backgroundColor = 'rgba(0, 168, 255, 0.1)';
    }
    
    function unhighlight() {
        dropArea.style.borderColor = 'var(--border-color)';
        dropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    function handleFiles(e) {
        const files = e.target.files;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validate file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                showNotification('File too large: ' + file.name + '. Max size is 50MB.', 'error');
                continue;
            }
            
            // Validate file type
            const fileType = file.name.split('.').pop().toLowerCase();
            const allowedTypes = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'pdf', 'txt', 'doc', 'docx'];
            
            if (!allowedTypes.includes(fileType)) {
                showNotification('Invalid file type: ' + file.name, 'error');
                continue;
            }
            
            // Add file to list
            addFileToList(file);
        }
    }
    
    function addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file file-icon"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
            </div>
            <div class="file-remove" onclick="removeFile(this)">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    }
}

/**
 * Remove file from upload list
 */
function removeFile(element) {
    const fileItem = element.closest('.file-item');
    fileItem.remove();
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Initialize animations
 */
function initAnimations() {
    // Animate elements when they come into view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all feature cards, case cards, etc.
    document.querySelectorAll('.feature-card, .case-card, .evidence-card, .capability-card').forEach(el => {
        observer.observe(el);
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .feature-card:nth-child(2) { animation-delay: 0.1s; }
        .feature-card:nth-child(3) { animation-delay: 0.2s; }
        .feature-card:nth-child(4) { animation-delay: 0.3s; }
        .feature-card:nth-child(5) { animation-delay: 0.4s; }
        .feature-card:nth-child(6) { animation-delay: 0.5s; }
    `;
    
    document.head.appendChild(style);
}

/**
 * Initialize notifications system
 */
function initNotifications() {
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'error' ? 'exclamation-circle' : 
                    type === 'success' ? 'check-circle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    };
}

/**
 * Initialize progress bars
 */
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 300);
    });
}

/**
 * Initialize security scan simulation
 */
function initSecurityScan() {
    const scanButtons = document.querySelectorAll('[onclick*="runSecurityScan"]');
    
    scanButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
            this.disabled = true;
            
            // Simulate scanning process
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
                
                // Show scan results
                showSecurityScanResults();
            }, 3000);
        });
    });
}

/**
 * Show security scan results
 */
function showSecurityScanResults() {
    const results = {
        totalScanned: 152,
        vulnerabilities: 2,
        criticalIssues: 0,
        warnings: 2,
        recommendations: 5
    };
    
    const message = `
        Security Scan Complete:<br>
        • Scanned ${results.totalScanned} files<br>
        • ${results.vulnerabilities} vulnerabilities found<br>
        • ${results.criticalIssues} critical issues<br>
        • ${results.warnings} warnings<br>
        • ${results.recommendations} recommendations
    `;
    
    showNotification(message, 'success');
}

/**
 * Show loading animation
 */
function showLoadingAnimation() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--primary-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    
    loadingOverlay.innerHTML = `
        <div class="loading-content" style="text-align: center;">
            <div class="loading-spinner" style="
                width: 60px;
                height: 60px;
                border: 4px solid var(--border-color);
                border-top-color: var(--primary-blue);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <h3 style="color: var(--text-primary); margin-bottom: 10px;">ForensicRecon System</h3>
            <p style="color: var(--text-secondary);">Initializing secure environment...</p>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
    
    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Remove loading overlay after 2 seconds
    setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
        }, 500);
    }, 2000);
}

/**
 * Update current year in footer
 */
function updateCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');
    
    elementsWithTooltip.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
            tooltip.style.cssText = `
                position: absolute;
                background: var(--card-bg);
                color: var(--text-primary);
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.9rem;
                border: 1px solid var(--border-color);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                white-space: nowrap;
                pointer-events: none;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            
            this.tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this.tooltip && this.tooltip.parentNode) {
                this.tooltip.parentNode.removeChild(this.tooltip);
            }
        });
    });
}

/**
 * Export data as JSON
 */
function exportData(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 */
function importData(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                callback(data);
                showNotification('Data imported successfully!', 'success');
            } catch (error) {
                showNotification('Error importing data: Invalid JSON format', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Generate random ID
 */
function generateId(prefix = 'ID') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Make functions available globally
window.removeFile = removeFile;
window.showNotification = showNotification;
window.exportData = exportData;
window.importData = importData;
window.formatDate = formatDate;
window.generateId = generateId;