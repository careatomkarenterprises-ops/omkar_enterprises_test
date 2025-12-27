/* ===========================================
   SHEETDB AUTHENTICATION SYSTEM
   Version: 2.0 | Google Sheets + Secure Login
   =========================================== */

// Configuration - REPLACE WITH YOUR VALUES
const CONFIG = {
    // ⚠️ REPLACE THIS WITH YOUR SHEETDB API URL
    SHEETDB_API: 'https://sheetdb.io/api/v1/23ccjjpytkbtl',
    
    // ⚠️ API Key (leave empty for Free plan, or add if you have paid plan)
    API_KEY: '',
    
    // Demo mode (set to false when using real SheetDB)
    DEMO_MODE: true,
    
    // Demo credentials for testing
    DEMO_CREDENTIALS: {
        'OE-INV-1001': { 
            password: 'demo123', 
            name: 'Rajesh Kumar', 
            tier: 'Growth', 
            portfolio: 1000000,
            investments: [
                { id: 'INV-001', amount: 500000, date: '2024-01-15', status: 'Active' },
                { id: 'INV-002', amount: 500000, date: '2024-03-20', status: 'Active' }
            ]
        },
        'OE-INV-1002': { 
            password: 'demo456', 
            name: 'Priya Sharma', 
            tier: 'Premium', 
            portfolio: 5000000 
        },
        'OE-INV-1003': { 
            password: 'demo789', 
            name: 'Amit Patel', 
            tier: 'Emerging', 
            portfolio: 250000 
        }
    },
    
    // Demo investor data
    DEMO_INVESTOR_DATA: {
        'OE-INV-1001': {
            investorId: 'OE-INV-1001',
            fullName: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            phone: '+91 9876543210',
            tier: 'Growth',
            totalInvested: 1000000,
            currentValue: 1105000,
            monthlyReturn: 25000,
            totalReturns: 105000,
            nextPaymentDate: '2024-02-10',
            status: 'Active',
            joinDate: '2023-12-15',
            documents: [
                { name: 'Loan Agreement.pdf', date: '2023-12-15', type: 'agreement' },
                { name: 'January Returns.pdf', date: '2024-01-31', type: 'statement' },
                { name: 'KYC Document.pdf', date: '2023-12-10', type: 'kyc' }
            ],
            transactions: [
                { date: '2024-01-31', type: 'Interest', amount: 25000, status: 'Completed' },
                { date: '2024-01-15', type: 'Investment', amount: 500000, status: 'Active' },
                { date: '2023-12-15', type: 'Investment', amount: 500000, status: 'Active' }
            ]
        },
        'OE-INV-1002': {
            investorId: 'OE-INV-1002',
            fullName: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '+91 9876543211',
            tier: 'Premium',
            totalInvested: 5000000,
            currentValue: 5250000,
            monthlyReturn: 125000,
            totalReturns: 250000,
            nextPaymentDate: '2024-02-12',
            status: 'Active',
            joinDate: '2023-11-20'
        },
        'OE-INV-1003': {
            investorId: 'OE-INV-1003',
            fullName: 'Amit Patel',
            email: 'amit@example.com',
            phone: '+91 9876543212',
            tier: 'Emerging',
            totalInvested: 250000,
            currentValue: 262500,
            monthlyReturn: 6250,
            totalReturns: 12500,
            nextPaymentDate: '2024-02-08',
            status: 'Active',
            joinDate: '2024-01-10'
        }
    }
};

// Session management
class AuthSession {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.init();
    }
    
    init() {
        this.checkExistingSession();
        this.setupActivityTracking();
    }
    
    // Check for existing valid session
    checkExistingSession() {
        const session = localStorage.getItem('oe_investor_session');
        if (!session) return null;
        
        try {
            const userData = JSON.parse(session);
            
            // Check if session expired
            const loginTime = new Date(userData.loginTime);
            const now = new Date();
            
            if ((now - loginTime) > this.sessionTimeout) {
                this.logout('Session expired');
                return null;
            }
            
            this.currentUser = userData;
            console.log('✅ Session restored:', userData.name);
            return userData;
            
        } catch (error) {
            console.error('Session parse error:', error);
            localStorage.removeItem('oe_investor_session');
            return null;
        }
    }
    
    // Login with SheetDB or Demo
    async login(investorId, password) {
        console.log('🔐 Login attempt for:', investorId);
        
        // Show loading
        showAuthMessage('Verifying credentials...', 'info');
        
        let result;
        
        if (CONFIG.DEMO_MODE) {
            result = this.demoLogin(investorId, password);
        } else {
            result = await this.sheetDBLogin(investorId, password);
        }
        
        if (result.success) {
            // Create session
            this.createSession(result.user);
            
            // Show success message
            showAuthMessage(`Welcome back, ${result.user.name}!`, 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'investor-dashboard.html';
            }, 1500);
            
        } else {
            showAuthMessage(result.error, 'error');
        }
        
        return result;
    }
    
    // Demo login (for testing)
    demoLogin(investorId, password) {
        const investor = CONFIG.DEMO_CREDENTIALS[investorId];
        
        if (!investor) {
            return {
                success: false,
                error: 'Investor ID not found'
            };
        }
        
        if (investor.password !== password) {
            return {
                success: false,
                error: 'Incorrect password'
            };
        }
        
        return {
            success: true,
            user: {
                id: investorId,
                name: investor.name,
                tier: investor.tier,
                portfolio: investor.portfolio,
                loginTime: new Date().toISOString(),
                token: this.generateToken()
            }
        };
    }
    
    // SheetDB login (real authentication)
    async sheetDBLogin(investorId, password) {
        try {
            console.log('📡 Connecting to SheetDB...');
            
            // Build request headers
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (CONFIG.API_KEY) {
                headers['Authorization'] = `Bearer ${CONFIG.API_KEY}`;
            }
            
            // Search for investor in SheetDB
            const response = await fetch(`${CONFIG.SHEETDB_API}/search?InvestorID=${encodeURIComponent(investorId)}`, {
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`SheetDB error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || data.length === 0) {
                return {
                    success: false,
                    error: 'Investor ID not found in database'
                };
            }
            
            const investor = data[0];
            
            // Check password (in production, use hashed passwords)
            if (investor.Password !== password) {
                return {
                    success: false,
                    error: 'Incorrect password'
                };
            }
            
            // Login successful
            return {
                success: true,
                user: {
                    id: investor.InvestorID,
                    name: investor.FullName,
                    tier: investor.Tier || 'Growth',
                    portfolio: parseInt(investor.TotalInvested) || 0,
                    loginTime: new Date().toISOString(),
                    token: this.generateToken()
                }
            };
            
        } catch (error) {
            console.error('SheetDB login error:', error);
            
            // Fallback to demo mode
            return {
                success: false,
                error: 'Database connection failed. Using demo mode.',
                fallback: true
            };
        }
    }
    
    // Create session
    createSession(user) {
        this.currentUser = user;
        
        // Store in localStorage
        localStorage.setItem('oe_investor_session', JSON.stringify(user));
        
        // Start session timer
        this.startSessionTimer();
        
        console.log('✅ Session created for:', user.name);
    }
    
    // Logout
    logout(reason = '') {
        this.currentUser = null;
        localStorage.removeItem('oe_investor_session');
        
        if (reason) {
            console.log('👋 Logout:', reason);
        }
        
        // Redirect to login
        window.location.href = 'investor-login.html?logout=true';
    }
    
    // Generate token
    generateToken() {
        return 'tok_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Start session timer
    startSessionTimer() {
        setTimeout(() => {
            if (this.currentUser) {
                showSessionWarning();
            }
        }, this.sessionTimeout - 60000); // Warn 1 minute before expiry
    }
    
    // Setup activity tracking
    setupActivityTracking() {
        const events = ['click', 'keypress', 'mousemove', 'scroll'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser) {
                    this.resetSessionTimer();
                }
            });
        });
    }
    
    // Reset session timer
    resetSessionTimer() {
        if (this.currentUser) {
            this.currentUser.loginTime = new Date().toISOString();
            localStorage.setItem('oe_investor_session', JSON.stringify(this.currentUser));
        }
    }
}

// Data manager for investor data
class InvestorDataManager {
    constructor() {
        this.currentInvestorId = null;
    }
    
    // Get investor data
    async getInvestorData(investorId) {
        this.currentInvestorId = investorId;
        
        if (CONFIG.DEMO_MODE) {
            return this.getDemoInvestorData(investorId);
        } else {
            return await this.getSheetDBInvestorData(investorId);
        }
    }
    
    // Get demo investor data
    getDemoInvestorData(investorId) {
        const data = CONFIG.DEMO_INVESTOR_DATA[investorId] || CONFIG.DEMO_INVESTOR_DATA['OE-INV-1001'];
        
        // Add calculated fields
        data.monthlyReturnFormatted = this.formatCurrency(data.monthlyReturn);
        data.totalInvestedFormatted = this.formatCurrency(data.totalInvested);
        data.currentValueFormatted = this.formatCurrency(data.currentValue);
        data.totalReturnsFormatted = this.formatCurrency(data.totalReturns);
        
        return {
            success: true,
            data: data
        };
    }
    
    // Get SheetDB investor data
    async getSheetDBInvestorData(investorId) {
        try {
            const headers = {};
            if (CONFIG.API_KEY) {
                headers['Authorization'] = `Bearer ${CONFIG.API_KEY}`;
            }
            
            const response = await fetch(`${CONFIG.SHEETDB_API}/search?InvestorID=${encodeURIComponent(investorId)}`, {
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`SheetDB error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || data.length === 0) {
                return {
                    success: false,
                    error: 'Investor data not found'
                };
            }
            
            const investor = data[0];
            
            // Format data
            const formattedData = {
                investorId: investor.InvestorID,
                fullName: investor.FullName,
                email: investor.Email || '',
                phone: investor.Phone || '',
                tier: investor.Tier || 'Growth',
                totalInvested: parseInt(investor.TotalInvested) || 0,
                currentValue: parseInt(investor.CurrentValue) || 0,
                monthlyReturn: parseInt(investor.MonthlyReturn) || 0,
                totalReturns: parseInt(investor.TotalReturns) || 0,
                nextPaymentDate: investor.NextPaymentDate || '',
                status: investor.Status || 'Active',
                joinDate: investor.JoinDate || '',
                documents: [],
                transactions: []
            };
            
            // Add formatted currency values
            formattedData.monthlyReturnFormatted = this.formatCurrency(formattedData.monthlyReturn);
            formattedData.totalInvestedFormatted = this.formatCurrency(formattedData.totalInvested);
            formattedData.currentValueFormatted = this.formatCurrency(formattedData.currentValue);
            formattedData.totalReturnsFormatted = this.formatCurrency(formattedData.totalReturns);
            
            return {
                success: true,
                data: formattedData
            };
            
        } catch (error) {
            console.error('SheetDB data fetch error:', error);
            
            // Fallback to demo data
            return {
                success: false,
                error: 'Database connection failed',
                fallback: true,
                data: this.getDemoInvestorData(investorId).data
            };
        }
    }
    
    // Format currency in Indian Rupees
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    // Format date
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    // Calculate ROI percentage
    calculateROI(totalInvested, totalReturns) {
        if (!totalInvested || totalInvested === 0) return '0%';
        
        const roi = (totalReturns / totalInvested) * 100;
        return roi.toFixed(1) + '%';
    }
}

// Dashboard updater
class DashboardUpdater {
    constructor() {
        this.dataManager = new InvestorDataManager();
    }
    
    // Update dashboard with investor data
    async updateDashboard(investorId) {
        console.log('📊 Updating dashboard for:', investorId);
        
        // Show loading
        this.showLoading();
        
        // Get investor data
        const result = await this.dataManager.getInvestorData(investorId);
        
        if (result.success) {
            this.updateUI(result.data);
            this.hideLoading();
        } else {
            console.error('Failed to load investor data:', result.error);
            this.showError(result.error);
        }
    }
    
    // Update UI elements
    updateUI(data) {
        console.log('🎨 Updating UI with data:', data);
        
        // Update welcome message
        this.updateElement('.user-name, .welcome-message', data.fullName);
        this.updateElement('.investor-id-display', `Investor ID: ${data.investorId}`);
        this.updateElement('.investor-tier', data.tier);
        
        // Update portfolio stats
        this.updateElement('.total-invested', data.totalInvestedFormatted);
        this.updateElement('.current-value', data.currentValueFormatted);
        this.updateElement('.monthly-return', data.monthlyReturnFormatted);
        this.updateElement('.total-returns', data.totalReturnsFormatted);
        this.updateElement('.next-payment-date', this.dataManager.formatDate(data.nextPaymentDate));
        
        // Update ROI
        const roi = this.dataManager.calculateROI(data.totalInvested, data.totalReturns);
        this.updateElement('.roi-percentage', roi);
        
        // Update charts if they exist
        this.updateCharts(data);
        
        // Update recent transactions
        this.updateTransactions(data.transactions || []);
        
        // Update documents
        this.updateDocuments(data.documents || []);
        
        console.log('✅ Dashboard updated successfully');
    }
    
    // Update element with new content
    updateElement(selector, content) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.tagName === 'INPUT') {
                element.value = content;
            } else {
                element.textContent = content;
            }
        });
    }
    
    // Update charts (placeholder - implement with Chart.js if needed)
    updateCharts(data) {
        const chartContainers = document.querySelectorAll('.chart-container');
        
        if (chartContainers.length > 0) {
            // Example: Update a simple progress bar
            const roiPercentage = parseFloat(this.dataManager.calculateROI(data.totalInvested, data.totalReturns));
            document.querySelectorAll('.roi-progress').forEach(progress => {
                progress.style.width = Math.min(roiPercentage, 100) + '%';
            });
        }
    }
    
    // Update transactions table
    updateTransactions(transactions) {
        const table = document.querySelector('.transactions-table tbody');
        if (!table) return;
        
        table.innerHTML = '';
        
        if (transactions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="fas fa-history text-muted"></i>
                        <p class="mt-2">No transactions yet</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.dataManager.formatDate(transaction.date)}</td>
                <td>
                    <span class="badge ${this.getTransactionBadgeClass(transaction.type)}">
                        ${transaction.type}
                    </span>
                </td>
                <td>${this.dataManager.formatCurrency(transaction.amount)}</td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(transaction.status)}">
                        ${transaction.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewTransaction('${transaction.id || ''}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            table.appendChild(row);
        });
    }
    
    // Update documents list
    updateDocuments(documents) {
        const container = document.querySelector('.documents-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (documents.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-folder-open text-muted"></i>
                    <p class="mt-2">No documents available</p>
                </div>
            `;
            return;
        }
        
        documents.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'document-card';
            docElement.innerHTML = `
                <div class="doc-icon">
                    <i class="fas fa-${this.getDocumentIcon(doc.type)}"></i>
                </div>
                <div class="doc-info">
                    <h6>${doc.name}</h6>
                    <small>${this.dataManager.formatDate(doc.date)} • ${doc.type.toUpperCase()}</small>
                </div>
                <div class="doc-actions">
                    <button class="btn-icon" onclick="downloadDocument('${doc.name}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" onclick="viewDocument('${doc.name}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            container.appendChild(docElement);
        });
    }
    
    // Get transaction badge class
    getTransactionBadgeClass(type) {
        const classes = {
            'Investment': 'bg-success',
            'Interest': 'bg-info',
            'Withdrawal': 'bg-warning',
            'Penalty': 'bg-danger'
        };
        return classes[type] || 'bg-secondary';
    }
    
    // Get status badge class
    getStatusBadgeClass(status) {
        const classes = {
            'Completed': 'bg-success',
            'Pending': 'bg-warning',
            'Active': 'bg-info',
            'Failed': 'bg-danger'
        };
        return classes[status] || 'bg-secondary';
    }
    
    // Get document icon
    getDocumentIcon(type) {
        const icons = {
            'agreement': 'file-contract',
            'statement': 'file-invoice',
            'kyc': 'id-card',
            'receipt': 'file-invoice-dollar',
            'other': 'file'
        };
        return icons[type] || 'file';
    }
    
    // Show loading state
    showLoading() {
        document.querySelectorAll('.data-loading').forEach(el => {
            el.style.display = 'block';
        });
        
        document.querySelectorAll('.data-content').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Hide loading state
    hideLoading() {
        setTimeout(() => {
            document.querySelectorAll('.data-loading').forEach(el => {
                el.style.display = 'none';
            });
            
            document.querySelectorAll('.data-content').forEach(el => {
                el.style.display = 'block';
            });
        }, 500); // Small delay for better UX
    }
    
    // Show error
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <strong>Error:</strong> ${message}
            <button class="btn btn-sm btn-outline" onclick="retryDashboard()">Retry</button>
        `;
        
        const container = document.querySelector('.dashboard-content');
        if (container) {
            container.prepend(errorDiv);
        }
    }
}

// Global instances
const auth = new AuthSession();
const dashboardUpdater = new DashboardUpdater();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth System Initializing...');
    
    // Check which page we're on
    const path = window.location.pathname;
    
    if (path.includes('investor-login.html')) {
        initLoginPage();
    } else if (path.includes('investor-dashboard.html')) {
        initDashboardPage();
    } else if (path.includes('dashboard')) {
        protectDashboard();
    }
});

/* ========== LOGIN PAGE INITIALIZATION ========== */
function initLoginPage() {
    console.log('🔑 Initializing login page...');
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }
    
    // Add demo button
    addDemoButton();
    
    // Setup form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const investorId = document.getElementById('investorId').value.trim().toUpperCase();
        const password = document.getElementById('password').value;
        
        // Validate inputs
        if (!investorId || !password) {
            showAuthMessage('Please enter Investor ID and password', 'error');
            return;
        }
        
        // Validate Investor ID format
        if (!investorId.match(/^OE-INV-\d{4,5}$/)) {
            showAuthMessage('Invalid Investor ID format. Format: OE-INV-XXXX', 'error');
            return;
        }
        
        // Attempt login
        await auth.login(investorId, password);
    });
    
    // Setup password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Check for logout parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('logout')) {
        showAuthMessage('You have been successfully logged out.', 'info');
    }
    
    if (urlParams.has('session')) {
        showAuthMessage('Your session has expired. Please log in again.', 'warning');
    }
    
    console.log('✅ Login page initialized');
}

/* ========== DASHBOARD PAGE INITIALIZATION ========== */
function initDashboardPage() {
    console.log('📊 Initializing dashboard page...');
    
    // Check authentication
    const user = auth.checkExistingSession();
    if (!user) {
        window.location.href = 'investor-login.html?session=expired';
        return;
    }
    
    // Update user info
    updateUserInfo(user);
    
    // Load investor data
    dashboardUpdater.updateDashboard(user.id);
    
    // Setup logout button
    setupLogoutButton();
    
    // Setup session warning
    setupSessionWarning();
    
    console.log('✅ Dashboard page initialized for:', user.name);
}

/* ========== PROTECT DASHBOARD PAGES ========== */
function protectDashboard() {
    const user = auth.checkExistingSession();
    if (!user) {
        window.location.href = 'investor-login.html';
    }
}

/* ========== UPDATE USER INFO ========== */
function updateUserInfo(user) {
    // Update welcome message
    document.querySelectorAll('.user-name, .welcome-message').forEach(el => {
        el.textContent = user.name;
    });
    
    // Update investor ID
    document.querySelectorAll('.investor-id').forEach(el => {
        el.textContent = user.id;
    });
    
    // Update tier badge
    document.querySelectorAll('.tier-badge').forEach(el => {
        el.textContent = user.tier;
        el.className = `tier-badge ${user.tier.toLowerCase()}`;
    });
}

/* ========== SETUP LOGOUT BUTTON ========== */
function setupLogoutButton() {
    document.querySelectorAll('.logout-btn, .btn-logout').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to log out?')) {
                auth.logout('User initiated');
            }
        });
    });
}

/* ========== SETUP SESSION WARNING ========== */
function setupSessionWarning() {
    // This will be called 1 minute before session expiry
    window.showSessionWarning = function() {
        const warningModal = document.createElement('div');
        warningModal.className = 'session-warning-modal';
        warningModal.innerHTML = `
            <div class="modal-content">
                <h4><i class="fas fa-clock"></i> Session Expiring Soon</h4>
                <p>Your session will expire in 1 minute due to inactivity.</p>
                <p>Would you like to extend your session?</p>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="extendSession()">
                        <i class="fas fa-sync-alt"></i> Extend Session
                    </button>
                    <button class="btn btn-outline" onclick="auth.logout()">
                        Log Out
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(warningModal);
        
        // Add styles if not present
        if (!document.querySelector('#session-warning-styles')) {
            const styles = document.createElement('style');
            styles.id = 'session-warning-styles';
            styles.textContent = `
                .session-warning-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }
                
                .session-warning-modal .modal-content {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                }
                
                .session-warning-modal h4 {
                    color: #dc3545;
                    margin-bottom: 15px;
                }
                
                .session-warning-modal p {
                    margin-bottom: 10px;
                }
                
                .modal-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                    justify-content: center;
                }
            `;
            document.head.appendChild(styles);
        }
    };
    
    // Extend session function
    window.extendSession = function() {
        auth.resetSessionTimer();
        document.querySelector('.session-warning-modal')?.remove();
        showAuthMessage('Session extended for 30 minutes', 'success');
    };
}

/* ========== ADD DEMO BUTTON ========== */
function addDemoButton() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    const demoBtn = document.createElement('button');
    demoBtn.type = 'button';
    demoBtn.className = 'demo-credentials-btn';
    demoBtn.innerHTML = `
        <i class="fas fa-user-secret"></i>
        Try Demo Account (OE-INV-1001)
    `;
    
    demoBtn.style.cssText = `
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px 20px;
        margin-top: 20px;
        border-radius: 8px;
        cursor: pointer;
        width: 100%;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.3s ease;
    `;
    
    demoBtn.onclick = function() {
        document.getElementById('investorId').value = 'OE-INV-1001';
        document.getElementById('password').value = 'demo123';
        showAuthMessage('Demo credentials filled. Click "Sign In" to continue.', 'info');
    };
    
    demoBtn.onmouseenter = function() {
        this.style.background = '#5a6268';
        this.style.transform = 'translateY(-2px)';
    };
    
    demoBtn.onmouseleave = function() {
        this.style.background = '#6c757d';
        this.style.transform = 'translateY(0)';
    };
    
    loginForm.appendChild(demoBtn);
}

/* ========== SHOW AUTH MESSAGE ========== */
function showAuthMessage(message, type = 'info') {
    // Remove existing messages
    const existing = document.querySelector('.auth-message');
    if (existing) {
        existing.remove();
    }
    
    // Create message element
    const msg = document.createElement('div');
    msg.className = `auth-message ${type}`;
    
    // Set icon
    let icon = 'info-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    msg.innerHTML = `
        <div class="message-content">
            <i class="fas fa-${icon}"></i>
            <div>${message}</div>
        </div>
        <button class="close-message">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not present
    if (!document.querySelector('#auth-message-styles')) {
        const styles = document.createElement('style');
        styles.id = 'auth-message-styles';
        styles.textContent = `
            .auth-message {
                padding: 15px 20px;
                border-radius: 8px;
                margin: 20px 0;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                animation: slideInDown 0.3s ease;
            }
            
            .auth-message.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .auth-message.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .auth-message.warning {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }
            
            .auth-message.info {
                background: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            
            .message-content {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                flex: 1;
            }
            
            .message-content i {
                margin-top: 2px;
                font-size: 1.2rem;
            }
            
            .close-message {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 5px;
                margin-left: 10px;
            }
            
            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Insert message
    const loginBox = document.querySelector('.login-box');
    if (loginBox) {
        loginBox.parentNode.insertBefore(msg, loginBox);
    } else {
        document.body.insertBefore(msg, document.body.firstChild);
    }
    
    // Close button functionality
    msg.querySelector('.close-message').addEventListener('click', function() {
        msg.remove();
    });
    
    // Auto-remove success messages
    if (type === 'success') {
        setTimeout(() => {
            if (msg.parentNode) {
                msg.remove();
            }
        }, 5000);
    }
}

/* ========== GLOBAL FUNCTIONS FOR DASHBOARD ========== */
// These functions can be called from HTML onclick attributes

// View transaction details
window.viewTransaction = function(transactionId) {
    alert(`Viewing transaction ${transactionId}\nThis would show detailed transaction information.`);
};

// Download document
window.downloadDocument = function(documentName) {
    alert(`Downloading: ${documentName}\nIn a real system, this would download the file.`);
};

// View document
window.viewDocument = function(documentName) {
    alert(`Viewing: ${documentName}\nIn a real system, this would open the document viewer.`);
};

// Retry dashboard loading
window.retryDashboard = function() {
    const user = auth.checkExistingSession();
    if (user) {
        dashboardUpdater.updateDashboard(user.id);
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthSession,
        InvestorDataManager,
        DashboardUpdater,
        auth,
        dashboardUpdater
    };
}

/* ========== INITIALIZATION COMPLETE ========== */
console.log('🎉 SheetDB Auth System Ready');
console.log('Mode:', CONFIG.DEMO_MODE ? 'DEMO' : 'PRODUCTION');
console.log('API Endpoint:', CONFIG.SHEETDB_API);

// Global access for debugging
window.oeAuth = auth;
window.oeDashboard = dashboardUpdater;
