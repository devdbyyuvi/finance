import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Modal } from '../components/Modal';

export function Dashboard() {
    const [isModalTransaction, setModalTransaction] = useState(false);
    const [isModalBudget, setModalBudget] = useState(false);
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transactionSummary, setTransactionSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    });
    
    const API_BASE_URL = process.env.REACT_APP_BACKEND;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login if no token found
            window.location.href = '/login';
            return;
        }
        fetchUserData();
        fetchTransactions();
        fetchBudgets();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = getUserIdFromToken(token);

            if (!userId) {
                setError('User not authenticated');
                return;
            }

            const response = await fetch(`${API_BASE_URL}api/auth/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setError('Failed to fetch user data');
            }
        } catch (err) {
            setError('Error fetching user data');
            console.error('Error fetching user data:', err);
        }
    };

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await fetch(`${API_BASE_URL}api/transactions/user`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userid: getUserIdFromToken(token) }),
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json()
            setTransactions(data.transactions || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching transactions:', err);
        }
    };

    const fetchBudgets = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = getUserIdFromToken(token);

            const response = await fetch(`${API_BASE_URL}api/budgets/user`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setBudgets(data.budgets || []);
            } else {
                setError('Failed to fetch budgets');
            }
        } catch (err) {
            setError('Error fetching budgets');
            console.error('Error fetching budgets:', err);
        } finally {
            setLoading(false);
        }
    };
    function summarize(transactions) {
        let totalIncome = 0;
        let totalExpense = 0;
        transactions.forEach(tx => {
            if (tx.type === 'income') {
                totalIncome += Number(tx.amount);
            } else if (tx.type === 'expense') {
                totalExpense += Number(tx.amount);
            }
        });
        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        };
    }

    useEffect(() => {
        setTransactionSummary(summarize(transactions));
    }, [transactions]);
    const deleteTransaction = async (transactionId) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userId = getUserIdFromToken(token);

            const response = await fetch(`${API_BASE_URL}api/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userid: userId }),
                credentials: 'include'
            });

            if (response.ok) {
                fetchTransactions();
            } else {
                setError('Failed to delete transaction');
            }
        } catch (err) {
            setError('Error deleting transaction');
            console.error('Error deleting transaction:', err);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit'
        });
    };


    const getUserIdFromToken = (token) => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id;
        } catch (err) {
            return null;
        }
    };

    const handleTransactionModalClose = () => {
        setModalTransaction(false);
        fetchTransactions();
    };

    const handleBudgetModalClose = () => {
        setModalBudget(false);
        fetchBudgets();
    };
    if (loading) {
        return (
            <div className="dashboard-body">
                <div className="dashboard">
                    <div style={{ textAlign: 'center', color: '#e2e8f0', fontSize: '1.2rem' }}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-body">
                <div className="dashboard">
                    <div style={{ textAlign: 'center', color: '#f56565', fontSize: '1.2rem' }}>
                        Error: {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .dashboard-body {
                    min-height: 100vh;
                    padding: 20px;
                    margin: 0;
                }

                .dashboard {
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

                .navbar {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    width: 90%;
                    align-items:center;
                    margin-bottom: 40px;
                    padding: 20px;
                    background: linear-gradient(135deg, #2d3748, #4a5568);
                    border-radius: 15px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }

                .nav-item {
                    padding: 12px 24px;
                    background: #1a202c;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    color: #a0aec0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }

                .nav-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
                    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
                    color: white;
                }

                .nav-item-active {
                    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
                    color: white;
                }

                .balance-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 40px;
                }

                .balance-card {
                    background: rgba(45, 55, 72, 0.9);
                    padding: 30px;
                    border-radius: 15px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    transition: transform 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .balance-card:hover {
                    transform: translateY(-5px);
                }

                .balance-card::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
                }

                .icon {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                    color: #667eea;
                }

                .icon-income {
                    color: #48bb78;
                }

                .icon-expense {
                    color: #f56565;
                }

                .card-title {
                    font-size: 1.2rem;
                    color: #a0aec0;
                    margin-bottom: 10px;
                    font-weight: 400;
                }

                .amount {
                    font-size: 2rem;
                    font-weight: 600;
                    color: #e2e8f0;
                }

                .amount-income {
                    color: #48bb78;
                }

                .amount-expense {
                    color: #f56565;
                }

                .add-transaction-section {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .add-btn {
                    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-size: 1.1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
                }

                .add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                }

                .transaction-section {
                    background: rgba(45, 55, 72, 0.9);
                    border-radius: 15px;
                    padding: 30px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .transaction-header {
                    font-size: 1.5rem;
                    color: #e2e8f0;
                    margin-bottom: 25px;
                    font-weight: 500;
                }

                .transaction-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                .table-header {
                    padding: 15px;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(26, 32, 44, 0.5);
                    font-weight: 600;
                    color: #a0aec0;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .table-cell {
                    padding: 15px;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    color: #e2e8f0;
                }

                .table-row {
                    transition: background 0.3s ease;
                }

                .table-row:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .transaction-type {
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .type-income {
                    background: rgba(72, 187, 120, 0.2);
                    color: #48bb78;
                }

                .type-expense {
                    background: rgba(245, 101, 101, 0.2);
                    color: #f56565;
                }

                .action-btn {
                    background: none;
                    border: none;
                    color: #667eea;
                    cursor: pointer;
                    font-size: 0.9rem;
                    margin-right: 10px;
                    padding: 5px 10px;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                }

                .action-btn:hover {
                    background: #667eea;
                    color: white;
                }

                .delete-btn {
                    color: #f56565;
                }

                .delete-btn:hover {
                    background: #f56565;
                    color: white;
                }

                .amount-positive {
                    color: #48bb78;
                    font-weight: 600;
                }

                .amount-negative {
                    color: #f56565;
                    font-weight: 600;
                }

                .empty-state {
                    text-align: center;
                    color: #a0aec0;
                    font-style: italic;
                    padding: 40px;
                }

                @media (max-width: 768px) {
                    .balance-section {
                        grid-template-columns: 1fr;
                    }
                    
                    .dashboard {
                        padding: 20px;
                    }
                    
                    .welcome-header {
                        font-size: 2rem;
                    }
                }
            `}</style>

            <div className="dashboard-body">
                {isModalTransaction && (
                    <Modal
                        type="transaction"
                        onClose={handleTransactionModalClose}
                        userId={user.id}
                    />
                )}
                {isModalBudget && (
                    <Modal
                        type="budget"
                        onClose={handleBudgetModalClose}
                        userId={user.id}
                    />
                )}
                <div className="dashboard">
                    <h2 className="welcome-header">
                        Hello, {user ? `${user.firstName} ${user.lastName}` : 'User'}
                    </h2>

                    <Navbar t={user.role} />

                    <div className="balance-section">
                        <div className="balance-card">
                            <div className="icon">💰</div>
                            <h3 className="card-title">Current Balance</h3>
                            <div className="amount">{formatCurrency(transactionSummary.balance)}</div>
                        </div>

                        <div className="balance-card">
                            <div className="icon icon-income">↗️</div>
                            <h3 className="card-title">Total Income</h3>
                            <div className="amount amount-income">{formatCurrency(transactionSummary.totalIncome)}</div>
                        </div>

                        <div className="balance-card">
                            <div className="icon icon-expense">↘️</div>
                            <h3 className="card-title">Total Expenses</h3>
                            <div className="amount amount-expense">{formatCurrency(transactionSummary.totalExpense)}</div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                    }}>
                        <div className="add-transaction-section">
                            <button className="add-btn" onClick={() => {
                                setModalTransaction(true);
                            }}>
                                + Add Transaction
                            </button>
                        </div>

                        <div className="add-transaction-section">
                            <button className="add-btn" onClick={() => {
                                setModalBudget(true);
                            }}>
                                + Add Budget
                            </button>
                        </div>
                    </div>

                    <div className="transaction-section">
                        <h3 className="transaction-header">Transaction History</h3>

                        {transactions.length === 0 ? (
                            <div className="empty-state">
                                No transactions found. Add your first transaction to get started!
                            </div>
                        ) : (
                            <table className="transaction-table">
                                <thead>
                                    <tr>
                                        <th className="table-header">Date</th>
                                        <th className="table-header">Category</th>
                                        <th className="table-header">Amount</th>
                                        <th className="table-header">Type</th>
                                        <th className="table-header">Note</th>
                                        <th className="table-header">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction._id} className="table-row">
                                            <td className="table-cell">{formatDate(transaction.date)}</td>
                                            <td className="table-cell">{transaction.category}</td>
                                            <td className="table-cell">
                                                <span className={transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                                                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                <span className={`transaction-type type-${transaction.type}`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className="table-cell">{transaction.note || '-'}</td>
                                            <td className="table-cell">
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => deleteTransaction(transaction._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}