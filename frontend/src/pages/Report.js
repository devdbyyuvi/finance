import React, { useState, useEffect } from 'react';
import { Navbar } from "../components/Navbar";

export function Report() {
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const token = localStorage.getItem('token')
    useEffect(() => {
        if(!token){
            window.location.href='/login'
        }
        fetchReportData();
    }, [selectedMonth, selectedYear]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view your report');
                setLoading(false);
                return;
            }

            // Fetch user budgets
            const budgetResponse = await fetch(`${process.env.REACT_APP_BACKEND}api/budgets/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: getUserIdFromToken(token)
                })
            });

            // Fetch user transactions
            const transactionResponse = await fetch(`${process.env.REACT_APP_BACKEND}api/transactions/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userid: getUserIdFromToken(token)
                })
            });

            if (!budgetResponse.ok || !transactionResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const budgetData = await budgetResponse.json();
            const transactionData = await transactionResponse.json();

            setBudgets(budgetData.budgets || []);
            setTransactions(transactionData.transactions || []);

            generateReport(budgetData.budgets || [], transactionData.transactions || []);

        } catch (err) {
            setError('Failed to fetch report data');
            console.error('Error fetching report data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getUserIdFromToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.id;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    };

    const generateReport = (budgets, transactions) => {
        const monthlyBudgets = budgets.filter(budget => 
            budget.month === selectedMonth && budget.year === selectedYear
        );

        const monthlyExpenses = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date || transaction.createdAt);
            return transaction.type === 'expense' && 
                   transactionDate.getMonth() + 1 === selectedMonth && 
                   transactionDate.getFullYear() === selectedYear;
        });

        // Group expenses by category
        const expensesByCategory = monthlyExpenses.reduce((acc, transaction) => {
            const category = transaction.category;
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += transaction.amount;
            return acc;
        }, {});

        // Create report data
        const report = monthlyBudgets.map(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            const remaining = budget.limitAmount - spent;
            const percentageUsed = (spent / budget.limitAmount) * 100;
            const isOverBudget = spent > budget.limitAmount;

            return {
                category: budget.category,
                budgetAmount: budget.limitAmount,
                spent,
                remaining,
                percentageUsed,
                isOverBudget,
                status: isOverBudget ? 'Over Budget' : remaining > 0 ? 'Within Budget' : 'Fully Used'
            };
        });

        // Add categories with spending but no budget
        Object.keys(expensesByCategory).forEach(category => {
            if (!monthlyBudgets.find(b => b.category === category)) {
                report.push({
                    category,
                    budgetAmount: 0,
                    spent: expensesByCategory[category],
                    remaining: -expensesByCategory[category],
                    percentageUsed: 0,
                    isOverBudget: true,
                    status: 'No Budget Set'
                });
            }
        });

        setReportData(report);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Within Budget':
                return '#10b981';
            case 'Over Budget':
                return '#ef4444';
            case 'No Budget Set':
                return '#f59e0b';
            case 'Fully Used':
                return '#8b5cf6';
            default:
                return '#6b7280';
        }
    };

    const getProgressBarColor = (percentageUsed, isOverBudget) => {
        if (isOverBudget) return '#ef4444';
        if (percentageUsed >= 80) return '#f59e0b';
        if (percentageUsed >= 60) return '#eab308';
        return '#10b981';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getMonthName = (month) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1];
    };

    const totalBudget = reportData.reduce((sum, item) => sum + item.budgetAmount, 0);
    const totalSpent = reportData.reduce((sum, item) => sum + item.spent, 0);
    const overBudgetCount = reportData.filter(item => item.isOverBudget).length;

    if (loading) {
        return (
            <div className="report">
                <div className="report-body">
                    <h2 className="welcome-header">Loading Report...</h2>
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="report">
                <div className="report-body">
                    <h2 className="welcome-header">Error</h2>
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .report{
                    min-height: 100vh;
                    padding: 20px;
                    margin: 0;
                }
                .report-body{
                    max-width: 1200px;
                    margin: 0 auto;
                    background: rgba(30, 32, 47, 0.95);
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    padding: 30px;
                    backdrop-filter: blur(10px);
                    font-family: 'Inter', Tahoma, Geneva, Verdana, sans-serif;
                }
                .welcome-header {
                    font-size: 2.5rem;
                    color: #e2e8f0;
                    margin-bottom: 30px;
                    text-align: center;
                    font-weight: 300;
                }

                .month-selector {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 30px;
                    align-items: center;
                }

                .month-selector select {
                    padding: 10px 15px;
                    border-radius: 10px;
                    border: 1px solid #4a5568;
                    background: #2d3748;
                    color: #e2e8f0;
                    font-size: 1rem;
                    cursor: pointer;
                }

                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .summary-card {
                    background: linear-gradient(135deg, #2d3748, #4a5568);
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    text-align: center;
                }

                .summary-card h3 {
                    color: #a0aec0;
                    margin-bottom: 10px;
                    font-size: 1rem;
                    font-weight: 500;
                }

                .summary-card .value {
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #e2e8f0;
                }

                .budget-report-grid {
                    display: grid;
                    gap: 20px;
                }

                .budget-item {
                    background: rgba(45, 55, 72, 0.8);
                    border-radius: 15px;
                    padding: 25px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    border-left: 4px solid;
                }

                .budget-item.within-budget {
                    border-left-color: #10b981;
                }

                .budget-item.over-budget {
                    border-left-color: #ef4444;
                }

                .budget-item.no-budget {
                    border-left-color: #f59e0b;
                }

                .budget-item.fully-used {
                    border-left-color: #8b5cf6;
                }

                .budget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .category-name {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #e2e8f0;
                    text-transform: capitalize;
                }

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: white;
                }

                .budget-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .detail-item {
                    text-align: center;
                }

                .detail-label {
                    font-size: 0.9rem;
                    color: #a0aec0;
                    margin-bottom: 5px;
                }

                .detail-value {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #e2e8f0;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #1a202c;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 10px;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .no-data {
                    text-align: center;
                    color: #a0aec0;
                    font-size: 1.2rem;
                    margin: 40px 0;
                }

                .loading-spinner {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 200px;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #4a5568;
                    border-top: 3px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error-message {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    border-radius: 10px;
                    padding: 15px;
                    color: #dc2626;
                    text-align: center;
                    margin: 20px 0;
                }

                .navbar {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    width: 90%;
                    align-items: center;
                    margin: 40px auto 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #2d3748, #4a5568);
                    border-radius: 15px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
            `}</style>
            <div className="report">
                <div className="report-body">
                    <h2 className="welcome-header">Budget Report</h2>
                    <Navbar />
                    <br />
                    <div className="month-selector">
                        <label style={{ color: '#e2e8f0' }}>Select Month:</label>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <option key={month} value={month}>
                                    {getMonthName(month)}
                                </option>
                            ))}
                        </select>
                    
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3>Total Budget</h3>
                            <div className="value">{formatCurrency(totalBudget)}</div>
                        </div>
                        <div className="summary-card">
                            <h3>Total Spent</h3>
                            <div className="value">{formatCurrency(totalSpent)}</div>
                        </div>
                        <div className="summary-card">
                            <h3>Categories Over Budget</h3>
                            <div className="value">{overBudgetCount}</div>
                        </div>
                        <div className="summary-card">
                            <h3>Overall Status</h3>
                            <div className="value" style={{ 
                                color: totalSpent > totalBudget ? '#ef4444' : '#10b981',
                                fontSize: '1.2rem'
                            }}>
                                {totalSpent > totalBudget ? 'Over Budget' : 'Within Budget'}
                            </div>
                        </div>
                    </div>

                    <div className="budget-report-grid">
                        {reportData.length === 0 ? (
                            <div className="no-data">
                                No budget data found for {getMonthName(selectedMonth)} {selectedYear}
                            </div>
                        ) : (
                            reportData.map((item, index) => (
                                <div 
                                    key={index} 
                                    className={`budget-item ${item.status.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    <div className="budget-header">
                                        <div className="category-name">{item.category}</div>
                                        <div 
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(item.status) }}
                                        >
                                            {item.status}
                                        </div>
                                    </div>
                                    
                                    <div className="budget-details">
                                        <div className="detail-item">
                                            <div className="detail-label">Budget</div>
                                            <div className="detail-value">
                                                {item.budgetAmount > 0 ? formatCurrency(item.budgetAmount) : 'Not Set'}
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Spent</div>
                                            <div className="detail-value">{formatCurrency(item.spent)}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Remaining</div>
                                            <div className="detail-value" style={{ 
                                                color: item.remaining < 0 ? '#ef4444' : '#10b981' 
                                            }}>
                                                {formatCurrency(item.remaining)}
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Usage</div>
                                            <div className="detail-value">
                                                {item.budgetAmount > 0 ? `${item.percentageUsed.toFixed(1)}%` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {item.budgetAmount > 0 && (
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ 
                                                    width: `${Math.min(item.percentageUsed, 100)}%`,
                                                    backgroundColor: getProgressBarColor(item.percentageUsed, item.isOverBudget)
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    
                </div>
            </div>
        </>
    );
}