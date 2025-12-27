/* ===========================================
   ROI CALCULATOR & AMORTIZATION SYSTEM
   Version: 2.0 | Complete Investment Calculator
   =========================================== */

class ROICalculator {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            monthlyRate: 0.025,      // 2.5% monthly
            termMonths: 13,          // 13 month term
            lockInMonths: 8,         // 8 month lock-in
            earlyWithdrawalPenalty: 0.02, // 2% penalty
            performanceBonusRate: 0.005,  // 0.5% bonus for premium tiers
            ...options
        };
        
        // DOM Elements
        this.elements = {
            amountInput: null,
            currentAmount: null,
            monthlyReturn: null,
            annualReturn: null,
            totalReturn: null,
            calculatorLink: null
        };
        
        // Formatter for Indian Rupees
        this.formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        // Current values
        this.currentInvestment = 100000; // Default 1 lakh
        this.currentTier = 'growth';     // Default tier
        this.includePerformanceBonus = false;
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('🧮 ROI Calculator Initializing...');
        
        // Find calculator elements
        this.findElements();
        
        if (!this.elements.amountInput) {
            console.warn('Calculator elements not found');
            return;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Add tier selector
        this.addTierSelector();
        
        // Add quick amount buttons
        this.addQuickAmountButtons();
        
        // Initial calculation
        this.updateCalculator();
        
        // Setup amortization link
        this.setupAmortizationLink();
        
        console.log('✅ ROI Calculator Ready');
    }
    
    findElements() {
        // Try to find elements by various selectors
        this.elements.amountInput = document.getElementById('investmentAmount') || 
                                   document.querySelector('input[type="range"]');
        
        this.elements.currentAmount = document.getElementById('currentAmount') ||
                                     document.querySelector('.current-amount');
        
        this.elements.monthlyReturn = document.getElementById('monthlyReturn') ||
                                     document.querySelector('.monthly-return');
        
        this.elements.annualReturn = document.getElementById('annualReturn') ||
                                    document.querySelector('.annual-return');
        
        this.elements.totalReturn = document.getElementById('totalReturn') ||
                                   document.querySelector('.total-return');
        
        this.elements.calculatorLink = document.querySelector('.calculator-link') ||
                                      document.querySelector('[href*="#calculator"]');
    }
    
    setupEventListeners() {
        // Amount slider input
        if (this.elements.amountInput) {
            this.elements.amountInput.addEventListener('input', () => {
                this.currentInvestment = parseInt(this.elements.amountInput.value);
                this.updateCalculator();
            });
        }
        
        // Direct amount input (if exists)
        const amountInputField = document.querySelector('.amount-input');
        if (amountInputField) {
            amountInputField.addEventListener('input', (e) => {
                let value = parseInt(e.target.value) || 0;
                if (value < 25000) value = 25000;
                if (value > 2500000) value = 2500000;
                
                this.currentInvestment = value;
                this.elements.amountInput.value = value;
                this.updateCalculator();
            });
        }
    }
    
    updateCalculator() {
        const amount = this.currentInvestment;
        
        // Update current amount display
        if (this.elements.currentAmount) {
            this.elements.currentAmount.textContent = this.formatter.format(amount);
        }
        
        // Calculate returns
        const monthlyReturn = this.calculateMonthlyReturn(amount);
        const annualReturn = this.calculateAnnualReturn(amount);
        const totalReturn = this.calculateTotalReturn(amount);
        
        // Update displays
        if (this.elements.monthlyReturn) {
            this.elements.monthlyReturn.textContent = this.formatter.format(monthlyReturn);
        }
        
        if (this.elements.annualReturn) {
            this.elements.annualReturn.textContent = this.formatter.format(annualReturn);
        }
        
        if (this.elements.totalReturn) {
            this.elements.totalReturn.textContent = this.formatter.format(totalReturn);
        }
        
        // Update slider background
        this.updateSliderBackground(amount);
        
        // Update tier-specific calculations
        this.updateTierCalculations(amount);
    }
    
    calculateMonthlyReturn(amount) {
        let monthly = amount * this.config.monthlyRate;
        
        // Add performance bonus for premium tiers
        if (this.includePerformanceBonus && this.currentTier === 'premium') {
            monthly += amount * this.config.performanceBonusRate;
        }
        
        return monthly;
    }
    
    calculateAnnualReturn(amount) {
        return this.calculateMonthlyReturn(amount) * 12;
    }
    
    calculateTotalReturn(amount) {
        return this.calculateAnnualReturn(amount);
    }
    
    calculateEarlyWithdrawal(amount, monthsInvested) {
        if (monthsInvested >= this.config.termMonths) {
            return {
                penalty: 0,
                netAmount: amount + (this.calculateMonthlyReturn(amount) * monthsInvested),
                message: 'Full term completed, no penalty'
            };
        }
        
        if (monthsInvested < this.config.lockInMonths) {
            const penalty = amount * this.config.earlyWithdrawalPenalty;
            const interestEarned = this.calculateMonthlyReturn(amount) * monthsInvested;
            
            return {
                penalty: penalty,
                netAmount: amount + interestEarned - penalty,
                message: `Early withdrawal penalty applied (${this.config.lockInMonths} month lock-in)`
            };
        }
        
        // After lock-in period but before term completion
        const interestEarned = this.calculateMonthlyReturn(amount) * monthsInvested;
        
        return {
            penalty: 0,
            netAmount: amount + interestEarned,
            message: 'Lock-in period completed, no penalty'
        };
    }
    
    updateSliderBackground(amount) {
        if (!this.elements.amountInput) return;
        
        const min = parseInt(this.elements.amountInput.min) || 25000;
        const max = parseInt(this.elements.amountInput.max) || 2500000;
        const percentage = ((amount - min) / (max - min)) * 100;
        
        this.elements.amountInput.style.background = `
            linear-gradient(to right, 
                #D4AF37 0%, 
                #D4AF37 ${percentage}%, 
                #E0E0E0 ${percentage}%, 
                #E0E0E0 100%
            )`;
    }
    
    addTierSelector() {
        const calculatorCard = this.elements.amountInput?.closest('.calculator-card');
        if (!calculatorCard) return;
        
        // Create tier selector
        const tierSelector = document.createElement('div');
        tierSelector.className = 'tier-selector';
        tierSelector.innerHTML = `
            <p style="margin: 15px 0 10px; font-weight: 600; color: #001F3F;">Select Investment Tier:</p>
            <div class="tier-buttons">
                <button class="tier-btn active" data-tier="growth">
                    <i class="fas fa-chart-line"></i>
                    <span>Growth</span>
                    <small>Standard Returns</small>
                </button>
                <button class="tier-btn" data-tier="premium">
                    <i class="fas fa-crown"></i>
                    <span>Premium</span>
                    <small>+ Performance Bonus</small>
                </button>
            </div>
            <div class="tier-info" style="margin-top: 10px; font-size: 0.9em; color: #666;">
                <i class="fas fa-info-circle"></i>
                <span>Premium tier includes additional 0.5% performance bonus</span>
            </div>
        `;
        
        // Insert after amount slider
        const amountSlider = calculatorCard.querySelector('.amount-slider');
        if (amountSlider) {
            amountSlider.parentNode.insertBefore(tierSelector, amountSlider.nextSibling);
        }
        
        // Add tier button functionality
        setTimeout(() => {
            document.querySelectorAll('.tier-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update active button
                    document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update calculator tier
                    this.currentTier = btn.getAttribute('data-tier');
                    this.includePerformanceBonus = this.currentTier === 'premium';
                    
                    // Recalculate
                    this.updateCalculator();
                });
            });
        }, 100);
    }
    
    addQuickAmountButtons() {
        const calculatorCard = this.elements.amountInput?.closest('.calculator-card');
        if (!calculatorCard) return;
        
        const quickAmounts = [
            { amount: 25000, label: '₹25K' },
            { amount: 100000, label: '₹1L' },
            { amount: 500000, label: '₹5L' },
            { amount: 1000000, label: '₹10L' },
            { amount: 2500000, label: '₹25L' }
        ];
        
        const quickButtons = document.createElement('div');
        quickButtons.className = 'quick-amount-buttons';
        quickButtons.innerHTML = `
            <p style="margin: 15px 0 10px; font-weight: 600; color: #001F3F;">Quick Select:</p>
            <div class="amount-buttons-grid">
                ${quickAmounts.map(item => `
                    <button class="amount-btn" data-amount="${item.amount}">
                        ${item.label}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Find where to insert (after tier selector or amount slider)
        const tierSelector = calculatorCard.querySelector('.tier-selector');
        const insertAfter = tierSelector || calculatorCard.querySelector('.amount-slider');
        
        if (insertAfter) {
            insertAfter.parentNode.insertBefore(quickButtons, insertAfter.nextSibling);
        }
        
        // Add button functionality
        setTimeout(() => {
            document.querySelectorAll('.amount-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const amount = parseInt(btn.getAttribute('data-amount'));
                    this.currentInvestment = amount;
                    
                    // Update slider
                    if (this.elements.amountInput) {
                        this.elements.amountInput.value = amount;
                    }
                    
                    // Update direct input field
                    const amountInputField = document.querySelector('.amount-input');
                    if (amountInputField) {
                        amountInputField.value = amount;
                    }
                    
                    // Recalculate
                    this.updateCalculator();
                    
                    // Add visual feedback
                    btn.classList.add('active');
                    setTimeout(() => btn.classList.remove('active'), 300);
                });
            });
        }, 100);
    }
    
    updateTierCalculations(amount) {
        // Update any tier-specific displays
        const tierInfo = document.querySelector('.tier-calculations');
        if (!tierInfo) return;
        
        const monthly = this.calculateMonthlyReturn(amount);
        const performanceBonus = this.includePerformanceBonus ? 
            amount * this.config.performanceBonusRate : 0;
        
        tierInfo.innerHTML = `
            <div class="calculation-breakdown">
                <h5>Calculation Breakdown:</h5>
                <div class="breakdown-item">
                    <span>Base Return (2.5%):</span>
                    <span>${this.formatter.format(amount * this.config.monthlyRate)}/month</span>
                </div>
                ${this.includePerformanceBonus ? `
                <div class="breakdown-item">
                    <span>Performance Bonus (0.5%):</span>
                    <span>+${this.formatter.format(performanceBonus)}/month</span>
                </div>
                ` : ''}
                <div class="breakdown-item total">
                    <span>Total Monthly Return:</span>
                    <span>${this.formatter.format(monthly)}</span>
                </div>
            </div>
        `;
    }
    
    setupAmortizationLink() {
        if (!this.elements.calculatorLink) return;
        
        this.elements.calculatorLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAmortizationModal();
        });
    }
    
    generateAmortizationTable(principal) {
        const table = document.createElement('table');
        table.className = 'amortization-table';
        
        // Calculate dates starting from next month
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() + 1);
        
        let html = `
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Payment Date</th>
                    <th>Fixed Return</th>
                    <th>Cumulative Returns</th>
                    <th>Principal Balance</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        let cumulativeReturns = 0;
        let totalInterest = 0;
        
        for (let month = 1; month <= this.config.termMonths; month++) {
            const isPrincipalMonth = month === this.config.termMonths;
            const returnAmount = isPrincipalMonth ? 0 : this.calculateMonthlyReturn(principal);
            cumulativeReturns += returnAmount;
            totalInterest += returnAmount;
            const principalBalance = isPrincipalMonth ? 0 : principal;
            
            // Calculate payment date (1st-7th of each month)
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(paymentDate.getMonth() + (month - 1));
            
            const formattedDate = paymentDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            
            // Determine status
            let status = 'Pending';
            let statusClass = 'pending';
            
            if (month === 1) {
                status = 'Next Payment';
                statusClass = 'next';
            } else if (month < this.config.lockInMonths) {
                status = 'Locked';
                statusClass = 'locked';
            } else if (month > this.config.lockInMonths && !isPrincipalMonth) {
                status = 'Available';
                statusClass = 'available';
            } else if (isPrincipalMonth) {
                status = 'Principal Repayment';
                statusClass = 'principal';
            }
            
            html += `
                <tr>
                    <td>${month}</td>
                    <td>${formattedDate}</td>
                    <td>${isPrincipalMonth ? '-' : this.formatter.format(returnAmount)}</td>
                    <td>${this.formatter.format(cumulativeReturns)}</td>
                    <td>${isPrincipalMonth ? 'Repaid' : this.formatter.format(principalBalance)}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                </tr>
            `;
        }
        
        // Summary row
        html += `
                <tr class="summary-row">
                    <td colspan="2"><strong>Total (${this.config.termMonths-1} months)</strong></td>
                    <td><strong>${this.formatter.format(totalInterest)}</strong></td>
                    <td><strong>${this.formatter.format(totalInterest)}</strong></td>
                    <td><strong>${this.formatter.format(principal)}</strong></td>
                    <td><strong>Completed</strong></td>
                </tr>
            </tbody>
        `;
        
        table.innerHTML = html;
        return table;
    }
    
    showAmortizationModal() {
        const principal = this.currentInvestment;
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'amortization-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-calendar-alt"></i>
                        Amortization Schedule for ${this.formatter.format(principal)}
                    </h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="schedule-summary">
                        <div class="summary-item">
                            <i class="fas fa-money-bill-wave"></i>
                            <div>
                                <small>Investment Amount</small>
                                <strong>${this.formatter.format(principal)}</strong>
                            </div>
                        </div>
                        <div class="summary-item">
                            <i class="fas fa-chart-line"></i>
                            <div>
                                <small>Monthly Return</small>
                                <strong>${this.formatter.format(this.calculateMonthlyReturn(principal))}</strong>
                            </div>
                        </div>
                        <div class="summary-item">
                            <i class="fas fa-calendar"></i>
                            <div>
                                <small>Term</small>
                                <strong>${this.config.termMonths} months</strong>
                            </div>
                        </div>
                        <div class="summary-item">
                            <i class="fas fa-lock"></i>
                            <div>
                                <small>Lock-in Period</small>
                                <strong>${this.config.lockInMonths} months</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <!-- Table will be inserted here -->
                    </div>
                    
                    <div class="modal-notes">
                        <div class="note">
                            <i class="fas fa-info-circle"></i>
                            <div>
                                <strong>Note:</strong>
                                <ul>
                                    <li>Monthly returns are paid by the 10th working day of each month</li>
                                    <li>Principal is repaid in the ${this.config.termMonths}th month</li>
                                    <li>Performance-based returns (if any) are additional</li>
                                    <li>All dates are approximate and may vary by ±3 days</li>
                                </ul>
                            </div>
                        </div>
                        <div class="note warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <div>
                                <strong>Early Withdrawal:</strong>
                                <p>Withdrawals before ${this.config.lockInMonths} months incur a ${this.config.earlyWithdrawalPenalty*100}% penalty.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-primary print-schedule">
                            <i class="fas fa-print"></i> Print Schedule
                        </button>
                        <button class="btn btn-outline download-schedule">
                            <i class="fas fa-download"></i> Download as PDF
                        </button>
                        <button class="btn btn-outline modal-close-btn">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Insert amortization table
        const tableContainer = modal.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.appendChild(this.generateAmortizationTable(principal));
        }
        
        // Add modal styles if not present
        this.addModalStyles();
        
        // Setup modal functionality
        this.setupModalFunctionality(modal, principal);
    }
    
    addModalStyles() {
        if (document.querySelector('#amortization-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'amortization-modal-styles';
        styles.textContent = `
            .amortization-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .amortization-modal .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1;
            }
            
            .amortization-modal .modal-content {
                background: white;
                border-radius: 12px;
                width: 95%;
                max-width: 1000px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                z-index: 2;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }
            
            .amortization-modal .modal-header {
                padding: 20px 25px;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                background: white;
                z-index: 3;
            }
            
            .amortization-modal .modal-header h3 {
                margin: 0;
                color: #001F3F;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .amortization-modal .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #666;
                cursor: pointer;
                padding: 5px;
                line-height: 1;
            }
            
            .amortization-modal .modal-body {
                padding: 25px;
            }
            
            .amortization-modal .schedule-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .amortization-modal .summary-item {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .amortization-modal .summary-item i {
                font-size: 1.5rem;
                color: #D4AF37;
            }
            
            .amortization-modal .table-container {
                overflow-x: auto;
                margin: 20px 0;
                border: 1px solid #e9ecef;
                border-radius: 8px;
            }
            
            .amortization-modal .amortization-table {
                width: 100%;
                border-collapse: collapse;
                min-width: 800px;
            }
            
            .amortization-modal .amortization-table th {
                background: #001F3F;
                color: white;
                padding: 12px 15px;
                text-align: left;
                font-weight: 600;
                position: sticky;
                top: 0;
            }
            
            .amortization-modal .amortization-table td {
                padding: 10px 15px;
                border-bottom: 1px solid #e9ecef;
            }
            
            .amortization-modal .amortization-table tr:hover {
                background: #f8f9fa;
            }
            
            .amortization-modal .amortization-table .summary-row {
                background: #f8f9fa;
                font-weight: 600;
            }
            
            .amortization-modal .amortization-table .summary-row td {
                border-top: 2px solid #001F3F;
            }
            
            .amortization-modal .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85em;
                font-weight: 500;
            }
            
            .amortization-modal .status-badge.pending {
                background: #fff3cd;
                color: #856404;
            }
            
            .amortization-modal .status-badge.next {
                background: #d1ecf1;
                color: #0c5460;
            }
            
            .amortization-modal .status-badge.locked {
                background: #f8d7da;
                color: #721c24;
            }
            
            .amortization-modal .status-badge.available {
                background: #d4edda;
                color: #155724;
            }
            
            .amortization-modal .status-badge.principal {
                background: #cce5ff;
                color: #004085;
            }
            
            .amortization-modal .modal-notes {
                margin: 30px 0;
                display: grid;
                gap: 15px;
            }
            
            .amortization-modal .note {
                display: flex;
                gap: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .amortization-modal .note.warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
            }
            
            .amortization-modal .note i {
                font-size: 1.2rem;
                color: #001F3F;
                margin-top: 2px;
            }
            
            .amortization-modal .note.warning i {
                color: #856404;
            }
            
            .amortization-modal .note ul {
                margin: 5px 0 0 0;
                padding-left: 20px;
            }
            
            .amortization-modal .note li {
                margin-bottom: 5px;
            }
            
            .amortization-modal .modal-footer {
                padding: 20px 25px;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 15px;
                justify-content: flex-end;
            }
            
            @media (max-width: 768px) {
                .amortization-modal .modal-content {
                    width: 98%;
                    max-height: 95vh;
                }
                
                .amortization-modal .schedule-summary {
                    grid-template-columns: 1fr;
                }
                
                .amortization-modal .modal-footer {
                    flex-direction: column;
                }
                
                .amortization-modal .modal-footer .btn {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    setupModalFunctionality(modal, principal) {
        // Close modal function
        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        };
        
        // Close buttons
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        
        // Close on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Print functionality
        modal.querySelector('.print-schedule').addEventListener('click', () => {
            this.printAmortizationSchedule(principal);
        });
        
        // Download functionality
        modal.querySelector('.download-schedule').addEventListener('click', () => {
            this.downloadAmortizationSchedule(principal);
        });
    }
    
    printAmortizationSchedule(principal) {
        const printContent = `
            <html>
                <head>
                    <title>Omkar Enterprises - Amortization Schedule</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            color: #333;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 2px solid #001F3F;
                            padding-bottom: 20px;
                        }
                        
                        .header h1 {
                            color: #001F3F;
                            margin: 0 0 10px 0;
                        }
                        
                        .header h2 {
                            color: #D4AF37;
                            margin: 0;
                            font-weight: normal;
                        }
                        
                        .summary {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 15px;
                            margin-bottom: 30px;
                            padding: 15px;
                            background: #f8f9fa;
                            border-radius: 5px;
                        }
                        
                        .summary-item {
                            text-align: center;
                        }
                        
                        .summary-item small {
                            display: block;
                            color: #666;
                            font-size: 12px;
                            margin-bottom: 5px;
                        }
                        
                        .summary-item strong {
                            font-size: 16px;
                            color: #001F3F;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        
                        th {
                            background: #001F3F;
                            color: white;
                            padding: 10px;
                            text-align: left;
                            font-weight: 600;
                        }
                        
                        td {
                            padding: 8px 10px;
                            border-bottom: 1px solid #ddd;
                        }
                        
                        tr.summary-row {
                            background: #f8f9fa;
                            font-weight: bold;
                        }
                        
                        .footer {
                            margin-top: 40px;
                            font-size: 12px;
                            color: #666;
                            border-top: 1px solid #ddd;
                            padding-top: 20px;
                        }
                        
                        .disclaimer {
                            background: #fff3cd;
                            padding: 15px;
                            border-radius: 5px;
                            margin-top: 20px;
                            font-size: 11px;
                        }
                        
                        @media print {
                            body {
                                padding: 10px;
                                font-size: 12px;
                            }
                            
                            .no-print {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Omkar Enterprises</h1>
                        <h2>Amortization Schedule</h2>
                        <p>Investment Amount: ${this.formatter.format(principal)}</p>
                        <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                    
                    <div class="summary">
                        <div class="summary-item">
                            <small>Monthly Return</small>
                            <strong>${this.formatter.format(this.calculateMonthlyReturn(principal))}</strong>
                        </div>
                        <div class="summary-item">
                            <small>Term</small>
                            <strong>${this.config.termMonths} months</strong>
                        </div>
                        <div class="summary-item">
                            <small>Lock-in Period</small>
                            <strong>${this.config.lockInMonths} months</strong>
                        </div>
                        <div class="summary-item">
                            <small>Total Returns</small>
                            <strong>${this.formatter.format(this.calculateTotalReturn(principal))}</strong>
                        </div>
                    </div>
                    
                    ${this.generateAmortizationTable(principal).outerHTML}
                    
                    <div class="footer">
                        <p><strong>Notes:</strong></p>
                        <ul>
                            <li>Monthly returns are paid by the 10th working day of each month</li>
                            <li>Principal is repaid in the ${this.config.termMonths}th month</li>
                            <li>Performance-based returns are additional for Premium tier</li>
                            <li>Early withdrawal before ${this.config.lockInMonths} months incurs ${this.config.earlyWithdrawalPenalty*100}% penalty</li>
                        </ul>
                        
                        <div class="disclaimer">
                            <strong>Disclaimer:</strong> This is a computer-generated schedule. For official documents, 
                            refer to your signed Loan Agreement. Omkar Enterprises is not a bank deposit, not insured, 
                            and not regulated by RBI/SEBI as a deposit-taking entity.
                        </div>
                        
                        <p style="margin-top: 20px;">
                            Generated by Omkar Enterprises Investor Portal<br>
                            ${window.location.origin}
                        </p>
                    </div>
                    
                    <div class="no-print" style="text-align: center; margin-top: 30px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #001F3F; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Print This Schedule
                        </button>
                        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                            Close Window
                        </button>
                    </div>
                    
                    <script>
                        window.onload = function() {
                            window.print();
                        };
                    </script>
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
    }
    
    downloadAmortizationSchedule(principal) {
        // In a real implementation, this would generate a PDF
        // For now, we'll create a downloadable HTML file
        
        const scheduleData = {
            investmentAmount: principal,
            monthlyReturn: this.calculateMonthlyReturn(principal),
            termMonths: this.config.termMonths,
            lockInMonths: this.config.lockInMonths,
            totalReturns: this.calculateTotalReturn(principal),
            generatedDate: new Date().toISOString(),
            schedule: this.generateScheduleData(principal)
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scheduleData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `amortization-schedule-${principal}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        // Show notification
        this.showNotification('Schedule downloaded as JSON file', 'success');
    }
    
    generateScheduleData(principal) {
        const schedule = [];
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() + 1);
        
        for (let month = 1; month <= this.config.termMonths; month++) {
            const isPrincipalMonth = month === this.config.termMonths;
            const returnAmount = isPrincipalMonth ? 0 : this.calculateMonthlyReturn(principal);
            
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(paymentDate.getMonth() + (month - 1));
            
            schedule.push({
                month: month,
                paymentDate: paymentDate.toISOString().split('T')[0],
                returnAmount: returnAmount,
                principalAmount: isPrincipalMonth ? principal : 0,
                isPrincipalMonth: isPrincipalMonth,
                isLocked: month < this.config.lockInMonths
            });
        }
        
        return schedule;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `calculator-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#d4edda' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : '#0c5460'};
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            animation: slideInUp 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
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
    
    // Public method to calculate early withdrawal
    calculateEarlyWithdrawalAmount(amount, monthsInvested) {
        return this.calculateEarlyWithdrawal(amount, monthsInvested);
    }
    
    // Public method to get amortization schedule
    getAmortizationSchedule(amount) {
        return this.generateScheduleData(amount);
    }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if calculator exists on page
    const calculatorElement = document.getElementById('investmentAmount') || 
                             document.querySelector('.calculator-card');
    
    if (calculatorElement) {
        window.roiCalculator = new ROICalculator();
        console.log('🎯 ROI Calculator initialized');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ROICalculator;
}

/* ========== GLOBAL HELPER FUNCTIONS ========== */

// Format currency helper (can be used elsewhere)
function formatCurrencyINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate ROI percentage
function calculateROIPercentage(invested, returns) {
    if (!invested || invested === 0) return '0%';
    return ((returns / invested) * 100).toFixed(1) + '%';
}

// Calculate monthly payment
function calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 12 / 100;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) {
        return principal / numberOfPayments;
    }
    
    const x = Math.pow(1 + monthlyRate, numberOfPayments);
    return principal * monthlyRate * x / (x - 1);
}

// Export global helpers
window.OE = window.OE || {};
window.OE.Calculator = {
    formatCurrency: formatCurrencyINR,
    calculateROI: calculateROIPercentage,
    calculateMonthlyPayment: calculateMonthlyPayment
};
