/* ===========================================
   INVESTOR DASHBOARD FUNCTIONALITY
   Version: 2.0 | Complete Dashboard System
   =========================================== */

class InvestorDashboard {
    constructor() {
        // Dashboard state
        this.state = {
            currentSection: 'overview',
            currentCategory: 'all',
            user: null,
            isLoading: false,
            notifications: [],
            unreadCount: 0
        };
        
        // DOM Elements cache
        this.elements = {};
        
        // Chart instances
        this.charts = {};
        
        // Initialize
        this.init();
    }
    
    async init() {
        console.log('📊 Investor Dashboard Initializing...');
        
        // Wait for DOM to be ready
        await this.waitForDOM();
        
        // Find all dashboard elements
        this.findElements();
        
        // Check authentication
        if (!this.checkAuth()) {
            window.location.href = 'investor-login.html';
            return;
        }
        
        // Load user data
        await this.loadUserData();
        
        // Setup dashboard components
        this.setupNavigation();
        this.setupSidebar();
        this.setupFileUpload();
        this.setupNotifications();
        this.setupCharts();
        this.setupEventListeners();
        this.setupSessionManager();
        
        // Load initial data
        await this.loadDashboardData();
        
        console.log('✅ Dashboard initialized for:', this.state.user?.name);
    }
    
    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    findElements() {
        // Core elements
        this.elements = {
            // Sidebar & Navigation
            sidebarToggle: document.getElementById('sidebarToggle'),
            dashboardSidebar: document.getElementById('dashboardSidebar'),
            dashboardMain: document.getElementById('dashboardMain'),
            navLinks: document.querySelectorAll('.nav-link'),
            dashboardSections: document.querySelectorAll('.dashboard-section'),
            
            // User info
            userName: document.querySelector('.user-name'),
            investorId: document.querySelector('.investor-id'),
            userTier: document.querySelector('.user-tier'),
            userAvatar: document.querySelector('.user-avatar'),
            
            // Stats & Metrics
            totalInvested: document.querySelector('.total-invested'),
            currentValue: document.querySelector('.current-value'),
            monthlyReturn: document.querySelector('.monthly-return'),
            totalReturns: document.querySelector('.total-returns'),
            nextPayment: document.querySelector('.next-payment'),
            roiPercentage: document.querySelector('.roi-percentage'),
            
            // Tables & Lists
            transactionsTable: document.querySelector('.transactions-table tbody'),
            documentsList: document.querySelector('.documents-list'),
            investmentsList: document.querySelector('.investments-list'),
            
            // Charts
            roiChart: document.getElementById('roiChart'),
            monthlyChart: document.getElementById('monthlyChart'),
            portfolioChart: document.getElementById('portfolioChart'),
            
            // File Upload
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            uploadList: document.getElementById('uploadList'),
            browseFiles: document.getElementById('browseFiles'),
            
            // Notifications
            notifBtn: document.getElementById('notifBtn'),
            notifDropdown: document.getElementById('notifDropdown'),
            notifCount: document.querySelector('.notif-count'),
            notifList: document.querySelector('.notif-list'),
            
            // Profile
            profileBtn: document.getElementById('profileBtn'),
            profileDropdown: document.getElementById('profileDropdown'),
            
            // Messages
            closeMessages: document.getElementById('closeMessages'),
            messagesPanel: document.querySelector('.dashboard-messages'),
            
            // Buttons & Actions
            logoutBtns: document.querySelectorAll('.logout-btn, .btn-logout'),
            exportBtns: document.querySelectorAll('[class*="export"]'),
            printBtns: document.querySelectorAll('[class*="print"]'),
            refreshBtn: document.querySelector('.refresh-btn'),
            
            // Document Categories
            catBtns: document.querySelectorAll('.cat-btn'),
            docCategories: document.querySelectorAll('.document-category'),
            
            // Loading states
            loadingSkeletons: document.querySelectorAll('.skeleton-loading'),
            dataContainers: document.querySelectorAll('.data-container')
        };
    }
    
    checkAuth() {
        const session = localStorage.getItem('oe_investor_session');
        if (!session) return false;
        
        try {
            const userData = JSON.parse(session);
            
            // Check session expiry (30 minutes)
            const loginTime = new Date(userData.loginTime);
            const now = new Date();
            const sessionAge = now - loginTime;
            
            if (sessionAge > 30 * 60 * 1000) { // 30 minutes
                localStorage.removeItem('oe_investor_session');
                return false;
            }
            
            this.state.user = userData;
            return true;
            
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }
    
    async loadUserData() {
        if (!this.state.user) return;
        
        // Update UI with user data
        this.updateUserInfo();
        
        // Load additional user data from SheetDB or demo
        await this.fetchUserDetails();
    }
    
    updateUserInfo() {
        const { user } = this.state;
        if (!user) return;
        
        // Update user name
        if (this.elements.userName) {
            this.elements.userName.textContent = user.name;
        }
        
        // Update investor ID
        if (this.elements.investorId) {
            this.elements.investorId.textContent = user.id;
        }
        
        // Update tier badge
        if (this.elements.userTier) {
            this.elements.userTier.textContent = user.tier;
            this.elements.userTier.className = `tier-badge ${user.tier.toLowerCase()}`;
        }
        
        // Update avatar initials
        if (this.elements.userAvatar) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            this.elements.userAvatar.textContent = initials;
        }
    }
    
    async fetchUserDetails() {
        try {
            // Simulate API call - replace with actual SheetDB call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Demo data - replace with actual data from your SheetDB
            const demoData = {
                'OE-INV-1001': {
                    totalInvested: 1000000,
                    currentValue: 1105000,
                    monthlyReturn: 25000,
                    totalReturns: 105000,
                    nextPayment: '2024-02-10',
                    roi: '10.5%',
                    joinDate: '2023-12-15',
                    status: 'Active',
                    tier: 'Growth',
                    documents: 5,
                    activeInvestments: 2
                },
                'OE-INV-1002': {
                    totalInvested: 5000000,
                    currentValue: 5250000,
                    monthlyReturn: 125000,
                    totalReturns: 250000,
                    nextPayment: '2024-02-12',
                    roi: '10.0%',
                    joinDate: '2023-11-20',
                    status: 'Active',
                    tier: 'Premium',
                    documents: 8,
                    activeInvestments: 3
                },
                'OE-INV-1003': {
                    totalInvested: 250000,
                    currentValue: 262500,
                    monthlyReturn: 6250,
                    totalReturns: 12500,
                    nextPayment: '2024-02-08',
                    roi: '10.0%',
                    joinDate: '2024-01-10',
                    status: 'Active',
                    tier: 'Emerging',
                    documents: 3,
                    activeInvestments: 1
                }
            };
            
            const userData = demoData[this.state.user.id] || demoData['OE-INV-1001'];
            this.state.user.details = userData;
            
        } catch (error) {
            console.error('Failed to fetch user details:', error);
        }
    }
    
    setupNavigation() {
        // Navigation between sections
        if (this.elements.navLinks && this.elements.dashboardSections) {
            this.elements.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const targetId = link.getAttribute('href').substring(1);
                    
                    // Update active nav link
                    this.elements.navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Show target section
                    this.elements.dashboardSections.forEach(section => {
                        section.classList.remove('active');
                        if (section.id === targetId) {
                            section.classList.add('active');
                            
                            // Scroll to top of section
                            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            
                            // Update state
                            this.state.currentSection = targetId;
                            
                            // Load section-specific data
                            this.loadSectionData(targetId);
                        }
                    });
                    
                    // Close sidebar on mobile
                    if (window.innerWidth <= 768) {
                        this.closeSidebar();
                    }
                });
            });
            
            // Set first section as active by default
            if (this.elements.dashboardSections.length > 0 && this.elements.navLinks.length > 0) {
                this.elements.dashboardSections[0].classList.add('active');
                this.elements.navLinks[0].classList.add('active');
                this.state.currentSection = this.elements.dashboardSections[0].id;
            }
        }
    }
    
    setupSidebar() {
        // Mobile sidebar toggle
        if (this.elements.sidebarToggle && this.elements.dashboardSidebar) {
            this.elements.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                this.elements.dashboardSidebar?.classList.contains('open') &&
                !this.elements.dashboardSidebar.contains(e.target) &&
                !this.elements.sidebarToggle?.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.dashboardSidebar?.classList.contains('open')) {
                this.closeSidebar();
            }
        });
    }
    
    toggleSidebar() {
        if (!this.elements.dashboardSidebar) return;
        
        this.elements.dashboardSidebar.classList.toggle('open');
        
        // Create overlay for mobile
        if (window.innerWidth <= 768) {
            if (this.elements.dashboardSidebar.classList.contains('open')) {
                this.createSidebarOverlay();
            } else {
                this.removeSidebarOverlay();
            }
        }
    }
    
    closeSidebar() {
        if (!this.elements.dashboardSidebar) return;
        
        this.elements.dashboardSidebar.classList.remove('open');
        this.removeSidebarOverlay();
    }
    
    createSidebarOverlay() {
        // Remove existing overlay
        this.removeSidebarOverlay();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        `;
        
        overlay.addEventListener('click', () => {
            this.closeSidebar();
        });
        
        document.body.appendChild(overlay);
        this.elements.sidebarOverlay = overlay;
    }
    
    removeSidebarOverlay() {
        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.remove();
            this.elements.sidebarOverlay = null;
        }
    }
    
    setupFileUpload() {
        if (!this.elements.uploadArea || !this.elements.fileInput) return;
        
        // Click to browse
        if (this.elements.browseFiles) {
            this.elements.browseFiles.addEventListener('click', () => {
                this.elements.fileInput.click();
            });
        }
        
        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.elements.uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });
        
        // Highlight on drag
        ['dragenter', 'dragover'].forEach(eventName => {
            this.elements.uploadArea.addEventListener(eventName, this.highlightUploadArea, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.elements.uploadArea.addEventListener(eventName, this.unhighlightUploadArea, false);
        });
        
        // Handle drop
        this.elements.uploadArea.addEventListener('drop', this.handleDrop.bind(this), false);
        
        // Handle file input change
        this.elements.fileInput.addEventListener('change', () => {
            this.handleFiles(this.elements.fileInput.files);
        });
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    highlightUploadArea() {
        this.style.borderColor = '#28a745';
        this.style.backgroundColor = '#f8f9fa';
    }
    
    unhighlightUploadArea() {
        this.style.borderColor = '#007bff';
        this.style.backgroundColor = 'transparent';
    }
    
    handleDrop(e) {
        const files = e.dataTransfer.files;
        this.handleFiles(files);
    }
    
    handleFiles(files) {
        if (!files.length) return;
        
        // Create upload list if it doesn't exist
        if (!this.elements.uploadList) {
            this.createUploadList();
        }
        
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.addFileToUploadList(file);
            }
        });
    }
    
    validateFile(file) {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            this.showNotification('Invalid file type. Please upload PDF, JPG, PNG, or DOC files only.', 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            this.showNotification('File size must be less than 10MB.', 'error');
            return false;
        }
        
        return true;
    }
    
    createUploadList() {
        const uploadList = document.createElement('div');
        uploadList.id = 'uploadList';
        uploadList.className = 'upload-list';
        
        const uploadSection = document.querySelector('.upload-section');
        if (uploadSection) {
            uploadSection.appendChild(uploadList);
            this.elements.uploadList = uploadList;
        }
    }
    
    addFileToUploadList(file) {
        if (!this.elements.uploadList) return;
        
        const fileItem = document.createElement('div');
        fileItem.className = 'upload-file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-${this.getFileIcon(file.type)}"></i>
                <div>
                    <h6>${file.name}</h6>
                    <small>${this.formatFileSize(file.size)} • Uploading...</small>
                </div>
            </div>
            <div class="file-progress">
                <div class="progress">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>
                <button class="btn-icon cancel-upload" title="Cancel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        this.elements.uploadList.appendChild(fileItem);
        
        // Simulate upload (replace with actual upload in production)
        this.simulateUpload(fileItem, file);
        
        // Cancel upload button
        fileItem.querySelector('.cancel-upload').addEventListener('click', () => {
            fileItem.remove();
            this.showNotification('Upload cancelled', 'warning');
        });
    }
    
    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return 'file-pdf';
        if (fileType.includes('image')) return 'file-image';
        if (fileType.includes('word')) return 'file-word';
        return 'file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    simulateUpload(fileItem, file) {
        const progressBar = fileItem.querySelector('.progress-bar');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Mark as uploaded
                fileItem.classList.add('uploaded');
                fileItem.querySelector('small').textContent = 
                    `${this.formatFileSize(file.size)} • Uploaded ${new Date().toLocaleTimeString()}`;
                
                this.showNotification(`"${file.name}" uploaded successfully`, 'success');
                
                // Add to documents list
                this.addToDocumentsList(file);
            }
            progressBar.style.width = `${progress}%`;
        }, 200);
    }
    
    addToDocumentsList(file) {
        if (!this.elements.documentsList) return;
        
        const docCard = document.createElement('div');
        docCard.className = 'document-card';
        docCard.innerHTML = `
            <div class="doc-icon">
                <i class="fas fa-${this.getFileIcon(file.type)}"></i>
            </div>
            <div class="doc-info">
                <h5>${file.name}</h5>
                <p>Uploaded: ${new Date().toLocaleDateString()}</p>
                <span class="doc-tag">Personal</span>
            </div>
            <div class="doc-actions">
                <button class="btn-icon" title="Download" onclick="dashboard.downloadDocument('${file.name}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon" title="Delete" onclick="dashboard.deleteDocument(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        this.elements.documentsList.appendChild(docCard);
    }
    
    setupNotifications() {
        // Notification dropdown toggle
        if (this.elements.notifBtn && this.elements.notifDropdown) {
            this.elements.notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationDropdown();
            });
            
            // Mark all as read
            const markAllRead = document.querySelector('.mark-all-read');
            if (markAllRead) {
                markAllRead.addEventListener('click', () => {
                    this.markAllNotificationsRead();
                });
            }
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            if (this.elements.notifDropdown) {
                this.elements.notifDropdown.style.display = 'none';
            }
            if (this.elements.profileDropdown) {
                this.elements.profileDropdown.style.display = 'none';
            }
        });
        
        // Load notifications
        this.loadNotifications();
    }
    
    toggleNotificationDropdown() {
        if (!this.elements.notifDropdown) return;
        
        const currentDisplay = this.elements.notifDropdown.style.display;
        this.elements.notifDropdown.style.display = currentDisplay === 'block' ? 'none' : 'block';
        
        // Close profile dropdown if open
        if (this.elements.profileDropdown) {
            this.elements.profileDropdown.style.display = 'none';
        }
    }
    
    loadNotifications() {
        // Demo notifications - replace with actual data from SheetDB
        this.state.notifications = [
            {
                id: 1,
                title: 'Monthly Return Credited',
                message: '₹25,000 has been credited to your account for January 2024.',
                time: '2 hours ago',
                type: 'success',
                read: false
            },
            {
                id: 2,
                title: 'Document Update',
                message: 'Your quarterly statement for Q4 2023 is now available.',
                time: '1 day ago',
                type: 'info',
                read: false
            },
            {
                id: 3,
                title: 'Upcoming Payment',
                message: 'Next monthly return of ₹25,000 is scheduled for Feb 10, 2024.',
                time: '3 days ago',
                type: 'warning',
                read: true
            },
            {
                id: 4,
                title: 'Investment Renewal',
                message: 'Your investment #INV-001 is due for renewal on March 15, 2024.',
                time: '1 week ago',
                type: 'info',
                read: true
            }
        ];
        
        this.state.unreadCount = this.state.notifications.filter(n => !n.read).length;
        this.renderNotifications();
    }
    
    renderNotifications() {
        if (!this.elements.notifList) return;
        
        this.elements.notifList.innerHTML = '';
        
        if (this.state.notifications.length === 0) {
            this.elements.notifList.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }
        
        this.state.notifications.forEach(notification => {
            const notifItem = document.createElement('div');
            notifItem.className = `notif-item ${notification.read ? '' : 'unread'}`;
            notifItem.innerHTML = `
                <div class="notif-icon ${notification.type}">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notif-content">
                    <h6>${notification.title}</h6>
                    <p>${notification.message}</p>
                    <small>${notification.time}</small>
                </div>
                <button class="btn-icon mark-read" onclick="dashboard.markNotificationRead(${notification.id})">
                    <i class="fas fa-check"></i>
                </button>
            `;
            
            this.elements.notifList.appendChild(notifItem);
        });
        
        // Update notification count
        if (this.elements.notifCount) {
            this.elements.notifCount.textContent = this.state.unreadCount;
            this.elements.notifCount.style.display = this.state.unreadCount > 0 ? 'flex' : 'none';
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'info': 'info-circle',
            'warning': 'exclamation-triangle',
            'error': 'exclamation-circle'
        };
        return icons[type] || 'bell';
    }
    
    markNotificationRead(id) {
        const notification = this.state.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.state.unreadCount--;
            this.renderNotifications();
        }
    }
    
    markAllNotificationsRead() {
        this.state.notifications.forEach(notification => {
            notification.read = true;
        });
        this.state.unreadCount = 0;
        this.renderNotifications();
        this.showNotification('All notifications marked as read', 'success');
    }
    
    setupCharts() {
        // Initialize charts if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, skipping charts');
            return;
        }
        
        // ROI Chart
        if (this.elements.roiChart) {
            this.initROIChart();
        }
        
        // Monthly Returns Chart
        if (this.elements.monthlyChart) {
            this.initMonthlyChart();
        }
        
        // Portfolio Chart
        if (this.elements.portfolioChart) {
            this.initPortfolioChart();
        }
    }
    
    initROIChart() {
        const ctx = this.elements.roiChart.getContext('2d');
        
        this.charts.roi = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'ROI %',
                    data: [2.5, 5.1, 7.6, 10.2, 12.7, 15.3, 17.8, 20.4, 22.9, 25.5, 28.0, 30.6],
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `ROI: ${context.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `${value}%`
                        }
                    }
                }
            }
        });
    }
    
    initMonthlyChart() {
        const ctx = this.elements.monthlyChart.getContext('2d');
        
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Monthly Returns (₹)',
                    data: [25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000],
                    backgroundColor: '#001F3F',
                    borderColor: '#001F3F',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `₹${context.parsed.y.toLocaleString('en-IN')}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `₹${value.toLocaleString('en-IN')}`
                        }
                    }
                }
            }
        });
    }
    
    initPortfolioChart() {
        const ctx = this.elements.portfolioChart.getContext('2d');
        
        this.charts.portfolio = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active Investments', 'Returns Earned', 'Pending Returns'],
                datasets: [{
                    data: [1000000, 105000, 25000],
                    backgroundColor: ['#001F3F', '#D4AF37', '#28a745'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ₹${value.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    setupEventListeners() {
        // Profile dropdown
        if (this.elements.profileBtn && this.elements.profileDropdown) {
            this.elements.profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleProfileDropdown();
            });
        }
        
        // Close messages panel
        if (this.elements.closeMessages) {
            this.elements.closeMessages.addEventListener('click', () => {
                if (this.elements.messagesPanel) {
                    this.elements.messagesPanel.style.display = 'none';
                }
            });
        }
        
        // Logout buttons
        if (this.elements.logoutBtns) {
            this.elements.logoutBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            });
        }
        
        // Export buttons
        if (this.elements.exportBtns) {
            this.elements.exportBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.handleExport(btn);
                });
            });
        }
        
        // Print buttons
        if (this.elements.printBtns) {
            this.elements.printBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    window.print();
                });
            });
        }
        
        // Refresh button
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }
        
        // Document category filtering
        if (this.elements.catBtns && this.elements.docCategories) {
            this.elements.catBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const category = btn.getAttribute('data-category');
                    this.filterDocuments(category);
                });
            });
        }
    }
    
    toggleProfileDropdown() {
        if (!this.elements.profileDropdown) return;
        
        const currentDisplay = this.elements.profileDropdown.style.display;
        this.elements.profileDropdown.style.display = currentDisplay === 'block' ? 'none' : 'block';
        
        // Close notification dropdown if open
        if (this.elements.notifDropdown) {
            this.elements.notifDropdown.style.display = 'none';
        }
    }
    
    filterDocuments(category) {
        // Update active button
        this.elements.catBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Show corresponding category
        this.elements.docCategories.forEach(cat => {
            cat.classList.remove('active');
            if (cat.id === category) {
                cat.classList.add('active');
            }
        });
        
        // Update state
        this.state.currentCategory = category;
    }
    
    setupSessionManager() {
        // Auto-logout after 30 minutes of inactivity
        let timeout;
        
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.showSessionWarning();
            }, 29 * 60 * 1000); // Warn at 29 minutes
        };
        
        // Reset timer on user activity
        ['click', 'keypress', 'mousemove', 'scroll'].forEach(event => {
            document.addEventListener(event, resetTimer);
        });
        
        // Initial timer start
        resetTimer();
    }
    
    showSessionWarning() {
        if (confirm('Your session will expire in 1 minute due to inactivity. Extend session?')) {
            // Reset session timer
            const session = localStorage.getItem('oe_investor_session');
            if (session) {
                const userData = JSON.parse(session);
                userData.loginTime = new Date().toISOString();
                localStorage.setItem('oe_investor_session', JSON.stringify(userData));
            }
            this.showNotification('Session extended for 30 minutes', 'success');
        } else {
            this.logout('Session expired due to inactivity');
        }
    }
    
    async loadDashboardData() {
        this.showLoading(true);
        
        try {
            // Load transactions
            await this.loadTransactions();
            
            // Load documents
            await this.loadDocuments();
            
            // Load investments
            await this.loadInvestments();
            
            // Update stats
            this.updateStats();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Failed to load dashboard data. Please refresh.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async loadSectionData(sectionId) {
        switch (sectionId) {
            case 'transactions':
                await this.loadTransactions();
                break;
            case 'documents':
                await this.loadDocuments();
                break;
            case 'investments':
                await this.loadInvestments();
                break;
            case 'calculator':
                this.initCalculator();
                break;
        }
    }
    
    async loadTransactions() {
        if (!this.elements.transactionsTable) return;
        
        // Demo data - replace with SheetDB data
        const transactions = [
            { id: 'TXN-001', date: '2024-01-31', type: 'Interest', amount: 25000, status: 'Completed', description: 'Monthly return for January' },
            { id: 'TXN-002', date: '2024-01-15', type: 'Investment', amount: 500000, status: 'Active', description: 'Additional investment' },
            { id: 'TXN-003', date: '2023-12-31', type: 'Interest', amount: 25000, status: 'Completed', description: 'Monthly return for December' },
            { id: 'TXN-004', date: '2023-12-15', type: 'Investment', amount: 500000, status: 'Active', description: 'Initial investment' },
            { id: 'TXN-005', date: '2023-11-30', type: 'Interest', amount: 25000, status: 'Completed', description: 'Monthly return for November' }
        ];
        
        this.renderTransactions(transactions);
    }
    
    renderTransactions(transactions) {
        if (!this.elements.transactionsTable) return;
        
        this.elements.transactionsTable.innerHTML = '';
        
        if (transactions.length === 0) {
            this.elements.transactionsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-history text-muted"></i>
                        <p class="mt-2">No transactions yet</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        transactions.forEach(txn => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(txn.date)}</td>
                <td>
                    <span class="badge ${this.getTransactionBadgeClass(txn.type)}">
                        ${txn.type}
                    </span>
                </td>
                <td>${txn.description}</td>
                <td>₹${txn.amount.toLocaleString('en-IN')}</td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(txn.status)}">
                        ${txn.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="dashboard.viewTransactionDetail('${txn.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            this.elements.transactionsTable.appendChild(row);
        });
    }
    
    async loadDocuments() {
        if (!this.elements.documentsList) return;
        
        // Demo data - replace with SheetDB data
        const documents = [
            { name: 'Loan Agreement.pdf', date: '2023-12-15', type: 'agreement', size: '2.4 MB' },
            { name: 'January Returns Statement.pdf', date: '2024-01-31', type: 'statement', size: '1.8 MB' },
            { name: 'KYC Document.pdf', date: '2023-12-10', type: 'kyc', size: '3.2 MB' },
            { name: 'Welcome Letter.pdf', date: '2023-12-01', type: 'other', size: '1.5 MB' },
            { name: 'Investment Certificate.pdf', date: '2023-12-20', type: 'certificate', size: '2.1 MB' }
        ];
        
        this.renderDocuments(documents);
    }
    
    renderDocuments(documents) {
        if (!this.elements.documentsList) return;
        
        this.elements.documentsList.innerHTML = '';
        
        if (documents.length === 0) {
            this.elements.documentsList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-folder-open text-muted"></i>
                    <p class="mt-2">No documents available</p>
                </div>
            `;
            return;
        }
        
        documents.forEach(doc => {
            const docCard = document.createElement('div');
            docCard.className = 'document-card';
            docCard.innerHTML = `
                <div class="doc-icon">
                    <i class="fas fa-${this.getFileIconByType(doc.type)}"></i>
                </div>
                <div class="doc-info">
                    <h5>${doc.name}</h5>
                    <p>${this.formatDate(doc.date)} • ${doc.size}</p>
                    <span class="doc-tag ${doc.type}">${doc.type.toUpperCase()}</span>
                </div>
                <div class="doc-actions">
                    <button class="btn-icon" title="Download" onclick="dashboard.downloadDocument('${doc.name}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" title="View" onclick="dashboard.viewDocument('${doc.name}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            this.elements.documentsList.appendChild(docCard);
        });
    }
    
    getFileIconByType(type) {
        const icons = {
            'agreement': 'file-contract',
            'statement': 'file-invoice',
            'kyc': 'id-card',
            'certificate': 'award',
            'other': 'file'
        };
        return icons[type] || 'file';
    }
    
    async loadInvestments() {
        if (!this.elements.investmentsList) return;
        
        // Demo data - replace with SheetDB data
        const investments = [
            { id: 'INV-001', amount: 500000, date: '2023-12-15', term: '13 months', returns: 25000, status: 'Active', roi: '10.5%' },
            { id: 'INV-002', amount: 500000, date: '2024-01-15', term: '13 months', returns: 25000, status: 'Active', roi: '10.5%' }
        ];
        
        this.renderInvestments(investments);
    }
    
    renderInvestments(investments) {
        if (!this.elements.investmentsList) return;
        
        this.elements.investmentsList.innerHTML = '';
        
        investments.forEach(inv => {
            const invCard = document.createElement('div');
            invCard.className = 'investment-card';
            invCard.innerHTML = `
                <div class="investment-header">
                    <h5>Investment #${inv.id}</h5>
                    <span class="badge ${inv.status.toLowerCase()}">${inv.status}</span>
                </div>
                <div class="investment-details">
                    <div class="detail">
                        <small>Amount</small>
                        <strong>₹${inv.amount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div class="detail">
                        <small>Start Date</small>
                        <strong>${this.formatDate(inv.date)}</strong>
                    </div>
                    <div class="detail">
                        <small>Term</small>
                        <strong>${inv.term}</strong>
                    </div>
                    <div class="detail">
                        <small>Monthly Returns</small>
                        <strong>₹${inv.returns.toLocaleString('en-IN')}</strong>
                    </div>
                    <div class="detail">
                        <small>ROI</small>
                        <strong class="roi">${inv.roi}</strong>
                    </div>
                </div>
                <div class="investment-actions">
                    <button class="btn btn-outline btn-sm" onclick="dashboard.viewInvestment('${inv.id}')">
                        <i class="fas fa-chart-line"></i> Details
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="dashboard.downloadStatement('${inv.id}')">
                        <i class="fas fa-download"></i> Statement
                    </button>
                </div>
            `;
            this.elements.investmentsList.appendChild(invCard);
        });
    }
    
    updateStats() {
        const { user } = this.state;
        if (!user || !user.details) return;
        
        const { details } = user;
        
        // Update stat cards
        if (this.elements.totalInvested) {
            this.elements.totalInvested.textContent = this.formatCurrency(details.totalInvested);
        }
        
        if (this.elements.currentValue) {
            this.elements.currentValue.textContent = this.formatCurrency(details.currentValue);
        }
        
        if (this.elements.monthlyReturn) {
            this.elements.monthlyReturn.textContent = this.formatCurrency(details.monthlyReturn);
        }
        
        if (this.elements.totalReturns) {
            this.elements.totalReturns.textContent = this.formatCurrency(details.totalReturns);
        }
        
        if (this.elements.nextPayment) {
            this.elements.nextPayment.textContent = this.formatDate(details.nextPayment);
        }
        
        if (this.elements.roiPercentage) {
            this.elements.roiPercentage.textContent = details.roi;
        }
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    getTransactionBadgeClass(type) {
        const classes = {
            'Investment': 'bg-success',
            'Interest': 'bg-info',
            'Withdrawal': 'bg-warning',
            'Penalty': 'bg-danger'
        };
        return classes[type] || 'bg-secondary';
    }
    
    getStatusBadgeClass(status) {
        const classes = {
            'Completed': 'bg-success',
            'Pending': 'bg-warning',
            'Active': 'bg-info',
            'Failed': 'bg-danger'
        };
        return classes[status] || 'bg-secondary';
    }
    
    showLoading(show) {
        this.state.isLoading = show;
        
        if (this.elements.loadingSkeletons) {
            this.elements.loadingSkeletons.forEach(skeleton => {
                skeleton.style.display = show ? 'block' : 'none';
            });
        }
        
        if (this.elements.dataContainers) {
            this.elements.dataContainers.forEach(container => {
                container.style.opacity = show ? '0.5' : '1';
                container.style.pointerEvents = show ? 'none' : 'auto';
            });
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Add styles if not present
        if (!document.querySelector('#dashboard-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'dashboard-notification-styles';
            styles.textContent = `
                .dashboard-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 9999;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    animation: slideInRight 0.3s ease;
                }
                
                .dashboard-notification.success {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                
                .dashboard-notification.error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                
                .dashboard-notification.warning {
                    background: #fff3cd;
                    color: #856404;
                    border: 1px solid #ffeaa7;
                }
                
                .dashboard-notification.info {
                    background: #d1ecf1;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                }
                
                .notification-content i {
                    font-size: 1.2rem;
                }
                
                .close-notification {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    padding: 5px;
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    handleExport(button) {
        const type = button.textContent.includes('CSV') ? 'CSV' : 'PDF';
        
        this.showNotification(`Preparing ${type} export...`, 'info');
        
        // Simulate export generation
        setTimeout(() => {
            this.showNotification(`${type} export ready for download`, 'success');
            
            // Create and trigger download (demo)
            if (type === 'CSV') {
                this.exportToCSV();
            } else {
                this.exportToPDF();
            }
        }, 2000);
    }
    
    exportToCSV() {
        const data = [
            ['Date', 'Type', 'Description', 'Amount', 'Status'],
            ['2024-01-31', 'Interest', 'Monthly return for January', '25000', 'Completed'],
            ['2024-01-15', 'Investment', 'Additional investment', '500000', 'Active'],
            ['2023-12-31', 'Interest', 'Monthly return for December', '25000', 'Completed']
        ];
        
        const csvContent = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }
    
    exportToPDF() {
        // In a real implementation, use a PDF library like jsPDF
        this.showNotification('PDF export would be generated here', 'info');
    }
    
    refreshDashboard() {
        this.showLoading(true);
        
        // Refresh all data
        setTimeout(async () => {
            await this.loadDashboardData();
            this.showNotification('Dashboard refreshed successfully', 'success');
        }, 1000);
    }
    
    initCalculator() {
        // Initialize calculator if not already initialized
        if (!window.roiCalculator && typeof ROICalculator !== 'undefined') {
            window.roiCalculator = new ROICalculator();
        }
    }
    
    logout() {
        if (confirm('Are you sure you want to log out?')) {
            // Clear session
            localStorage.removeItem('oe_investor_session');
            
            // Redirect to login
            window.location.href = 'investor-login.html?logout=true';
        }
    }
    
    // Public methods for HTML onclick handlers
    viewTransactionDetail(id) {
        this.showNotification(`Viewing transaction details for ${id}`, 'info');
        // In a real implementation, show a modal with transaction details
    }
    
    viewInvestment(id) {
        this.showNotification(`Viewing investment details for ${id}`, 'info');
        // In a real implementation, show a modal with investment details
    }
    
    downloadDocument(name) {
        this.showNotification(`Downloading ${name}...`, 'info');
        // In a real implementation, trigger file download
    }
    
    viewDocument(name) {
        this.showNotification(`Viewing ${name}...`, 'info');
        // In a real implementation, open document viewer
    }
    
    deleteDocument(button) {
        if (confirm('Are you sure you want to delete this document?')) {
            const card = button.closest('.document-card');
            if (card) {
                card.remove();
                this.showNotification('Document deleted', 'success');
            }
        }
    }
    
    downloadStatement(id) {
        this.showNotification(`Downloading statement for ${id}...`, 'info');
        // In a real implementation, generate and download statement
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a dashboard page
    if (window.location.pathname.includes('dashboard')) {
        window.dashboard = new InvestorDashboard();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvestorDashboard;
}
