// Trading Journal Application
class TradingJournal {
    constructor() {
        this.trades = [];
        this.deposits = [];
        this.withdrawals = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.setupTheme();
        this.updateDashboard();
        this.renderTrades();
        this.renderDeposits();
        this.renderWithdrawals();
        this.setDefaultDates();
    }

    // Local Storage Methods
    loadFromLocalStorage() {
        const savedTrades = localStorage.getItem('tradingJournal_trades');
        const savedDeposits = localStorage.getItem('tradingJournal_deposits');
        const savedWithdrawals = localStorage.getItem('tradingJournal_withdrawals');

        if (savedTrades) this.trades = JSON.parse(savedTrades);
        if (savedDeposits) this.deposits = JSON.parse(savedDeposits);
        if (savedWithdrawals) this.withdrawals = JSON.parse(savedWithdrawals);
    }

    saveToLocalStorage() {
        localStorage.setItem('tradingJournal_trades', JSON.stringify(this.trades));
        localStorage.setItem('tradingJournal_deposits', JSON.stringify(this.deposits));
        localStorage.setItem('tradingJournal_withdrawals', JSON.stringify(this.withdrawals));
    }

    // Theme Methods
    setupTheme() {
        const savedTheme = localStorage.getItem('tradingJournal_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('tradingJournal_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Hamburger menu
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                
                // Smooth scroll to section
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }

                // Update active link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Trade modal
        document.getElementById('addTradeBtn').addEventListener('click', () => this.openTradeModal());
        document.getElementById('addTradeBtn2').addEventListener('click', () => this.openTradeModal());
        document.getElementById('closeTradeModal').addEventListener('click', () => this.closeTradeModal());
        document.getElementById('cancelTradeBtn').addEventListener('click', () => this.closeTradeModal());
        document.getElementById('tradeForm').addEventListener('submit', (e) => this.handleTradeSubmit(e));

        // Deposit modal
        document.getElementById('addDepositBtn').addEventListener('click', () => this.openDepositModal());
        document.getElementById('addDepositBtn2').addEventListener('click', () => this.openDepositModal());
        document.getElementById('closeDepositModal').addEventListener('click', () => this.closeDepositModal());
        document.getElementById('cancelDepositBtn').addEventListener('click', () => this.closeDepositModal());
        document.getElementById('depositForm').addEventListener('submit', (e) => this.handleDepositSubmit(e));

        // Withdrawal modal
        document.getElementById('addWithdrawalBtn').addEventListener('click', () => this.openWithdrawalModal());
        document.getElementById('addWithdrawalBtn2').addEventListener('click', () => this.openWithdrawalModal());
        document.getElementById('closeWithdrawalModal').addEventListener('click', () => this.closeWithdrawalModal());
        document.getElementById('cancelWithdrawalBtn').addEventListener('click', () => this.closeWithdrawalModal());
        document.getElementById('withdrawalForm').addEventListener('submit', (e) => this.handleWithdrawalSubmit(e));

        // Filter and sort
        document.getElementById('filterType').addEventListener('change', () => this.renderTrades());
        document.getElementById('sortTrades').addEventListener('change', () => this.renderTrades());

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('tradeDate').value = today;
        document.getElementById('depositDate').value = today;
        document.getElementById('withdrawalDate').value = today;
    }

    // Trade Methods
    openTradeModal(trade = null) {
        const modal = document.getElementById('tradeModal');
        const form = document.getElementById('tradeForm');
        const title = document.getElementById('tradeModalTitle');

        if (trade) {
            title.textContent = 'Edit Trade';
            document.getElementById('tradeId').value = trade.id;
            document.getElementById('tradeDate').value = trade.date;
            document.getElementById('tradeSymbol').value = trade.symbol;
            document.getElementById('tradeType').value = trade.type;
            document.getElementById('tradeEntry').value = trade.entry;
            document.getElementById('tradeExit').value = trade.exit;
            document.getElementById('tradeSize').value = trade.size;
            document.getElementById('tradePL').value = trade.pl;
            document.getElementById('tradeNotes').value = trade.notes || '';
        } else {
            title.textContent = 'Add New Trade';
            form.reset();
            this.setDefaultDates();
        }

        modal.classList.add('active');
    }

    closeTradeModal() {
        document.getElementById('tradeModal').classList.remove('active');
        document.getElementById('tradeForm').reset();
        this.currentEditId = null;
    }

    handleTradeSubmit(e) {
        e.preventDefault();

        const tradeId = document.getElementById('tradeId').value;
        const trade = {
            id: tradeId || Date.now().toString(),
            date: document.getElementById('tradeDate').value,
            symbol: document.getElementById('tradeSymbol').value.toUpperCase(),
            type: document.getElementById('tradeType').value,
            entry: parseFloat(document.getElementById('tradeEntry').value),
            exit: parseFloat(document.getElementById('tradeExit').value),
            size: parseFloat(document.getElementById('tradeSize').value),
            pl: parseFloat(document.getElementById('tradePL').value),
            notes: document.getElementById('tradeNotes').value
        };

        if (tradeId) {
            // Edit existing trade
            const index = this.trades.findIndex(t => t.id === tradeId);
            if (index !== -1) {
                this.trades[index] = trade;
            }
        } else {
            // Add new trade
            this.trades.push(trade);
        }

        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderTrades();
        this.closeTradeModal();
    }

    editTrade(id) {
        const trade = this.trades.find(t => t.id === id);
        if (trade) {
            this.openTradeModal(trade);
        }
    }

    deleteTrade(id) {
        if (confirm('Are you sure you want to delete this trade?')) {
            this.trades = this.trades.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.updateDashboard();
            this.renderTrades();
        }
    }

    renderTrades() {
        const tbody = document.getElementById('tradesTableBody');
        const filterType = document.getElementById('filterType').value;
        const sortBy = document.getElementById('sortTrades').value;

        let filteredTrades = [...this.trades];

        // Filter
        if (filterType !== 'all') {
            filteredTrades = filteredTrades.filter(t => t.type === filterType);
        }

        // Sort
        filteredTrades.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'pl-desc':
                    return b.pl - a.pl;
                case 'pl-asc':
                    return a.pl - b.pl;
                default:
                    return 0;
            }
        });

        if (filteredTrades.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="9">
                        <i class="fas fa-chart-line"></i>
                        <p>No trades recorded. Start tracking your performance.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredTrades.map(trade => `
            <tr>
                <td>${this.formatDate(trade.date)}</td>
                <td><strong>${trade.symbol}</strong></td>
                <td><span class="trade-type ${trade.type}">${trade.type}</span></td>
                <td>$${trade.entry.toFixed(2)}</td>
                <td>$${trade.exit.toFixed(2)}</td>
                <td>${trade.size}</td>
                <td class="${trade.pl >= 0 ? 'pl-positive' : 'pl-negative'}">
                    ${trade.pl >= 0 ? '+' : ''}R${trade.pl.toFixed(2)}
                </td>
                <td>${trade.notes || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon" onclick="journal.editTrade('${trade.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon" onclick="journal.deleteTrade('${trade.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Deposit Methods
    openDepositModal() {
        document.getElementById('depositModal').classList.add('active');
        document.getElementById('depositForm').reset();
        this.setDefaultDates();
    }

    closeDepositModal() {
        document.getElementById('depositModal').classList.remove('active');
    }

    handleDepositSubmit(e) {
        e.preventDefault();

        const deposit = {
            id: Date.now().toString(),
            date: document.getElementById('depositDate').value,
            amount: parseFloat(document.getElementById('depositAmount').value),
            method: document.getElementById('depositMethod').value,
            notes: document.getElementById('depositNotes').value
        };

        this.deposits.push(deposit);
        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderDeposits();
        this.closeDepositModal();
    }

    deleteDeposit(id) {
        if (confirm('Are you sure you want to delete this deposit?')) {
            this.deposits = this.deposits.filter(d => d.id !== id);
            this.saveToLocalStorage();
            this.updateDashboard();
            this.renderDeposits();
        }
    }

    renderDeposits() {
        const tbody = document.getElementById('depositsTableBody');

        if (this.deposits.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="5">
                        <i class="fas fa-arrow-down"></i>
                        <p>No deposits recorded.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const sortedDeposits = [...this.deposits].sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedDeposits.map(deposit => `
            <tr>
                <td>${this.formatDate(deposit.date)}</td>
                <td class="pl-positive"><strong>+R${deposit.amount.toFixed(2)}</strong></td>
                <td>${this.formatPaymentMethod(deposit.method)}</td>
                <td>${deposit.notes || '-'}</td>
                <td>
                    <button class="btn btn-icon" onclick="journal.deleteDeposit('${deposit.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Withdrawal Methods
    openWithdrawalModal() {
        document.getElementById('withdrawalModal').classList.add('active');
        document.getElementById('withdrawalForm').reset();
        this.setDefaultDates();
    }

    closeWithdrawalModal() {
        document.getElementById('withdrawalModal').classList.remove('active');
    }

    handleWithdrawalSubmit(e) {
        e.preventDefault();

        const withdrawal = {
            id: Date.now().toString(),
            date: document.getElementById('withdrawalDate').value,
            amount: parseFloat(document.getElementById('withdrawalAmount').value),
            method: document.getElementById('withdrawalMethod').value,
            notes: document.getElementById('withdrawalNotes').value
        };

        this.withdrawals.push(withdrawal);
        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderWithdrawals();
        this.closeWithdrawalModal();
    }

    deleteWithdrawal(id) {
        if (confirm('Are you sure you want to delete this withdrawal?')) {
            this.withdrawals = this.withdrawals.filter(w => w.id !== id);
            this.saveToLocalStorage();
            this.updateDashboard();
            this.renderWithdrawals();
        }
    }

    renderWithdrawals() {
        const tbody = document.getElementById('withdrawalsTableBody');

        if (this.withdrawals.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="5">
                        <i class="fas fa-arrow-up"></i>
                        <p>No withdrawals recorded.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const sortedWithdrawals = [...this.withdrawals].sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedWithdrawals.map(withdrawal => `
            <tr>
                <td>${this.formatDate(withdrawal.date)}</td>
                <td class="pl-negative"><strong>-R${withdrawal.amount.toFixed(2)}</strong></td>
                <td>${this.formatPaymentMethod(withdrawal.method)}</td>
                <td>${withdrawal.notes || '-'}</td>
                <td>
                    <button class="btn btn-icon" onclick="journal.deleteWithdrawal('${withdrawal.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Dashboard Methods
    updateDashboard() {
        const totalTrades = this.trades.length;
        const winningTrades = this.trades.filter(t => t.pl > 0).length;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0;
        const totalPL = this.trades.reduce((sum, t) => sum + t.pl, 0);
        const totalDeposits = this.deposits.reduce((sum, d) => sum + d.amount, 0);
        const totalWithdrawals = this.withdrawals.reduce((sum, w) => sum + w.amount, 0);
        const accountBalance = totalDeposits - totalWithdrawals + totalPL;

        document.getElementById('totalTrades').textContent = totalTrades;
        document.getElementById('winRate').textContent = `${winRate}%`;
        
        const plElement = document.getElementById('totalPL');
        plElement.textContent = `${totalPL >= 0 ? '+' : ''}R${totalPL.toFixed(2)}`;
        plElement.className = `stat-value ${totalPL >= 0 ? 'pl-positive' : 'pl-negative'}`;

        const profitIcon = document.getElementById('profitIcon');
        profitIcon.className = `stat-icon ${totalPL >= 0 ? 'success' : 'danger'}`;

        const balanceElement = document.getElementById('accountBalance');
        balanceElement.textContent = `R${accountBalance.toFixed(2)}`;
        balanceElement.className = `stat-value ${accountBalance >= 0 ? 'pl-positive' : 'pl-negative'}`;
    }

    // Utility Methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatPaymentMethod(method) {
        const methods = {
            'bank-transfer': 'Bank Transfer',
            'credit-card': 'Credit Card',
            'debit-card': 'Debit Card',
            'paypal': 'PayPal',
            'crypto': 'Cryptocurrency',
            'other': 'Other'
        };
        return methods[method] || method;
    }
}

// Initialize the application
const journal = new TradingJournal();

// Make journal globally accessible for inline event handlers
window.journal = journal;
