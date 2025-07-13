import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Modal } from '../components/Modal';

export function Dashboard() {
    let [isModalTransaction, setModalTransaction] = useState(false);
    let [isModalBudget, setModalBudget] = useState(false);
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

                .transaction-type {
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .type-in {
                    background: rgba(72, 187, 120, 0.2);
                    color: #48bb78;
                }

                .type-out {
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
            `}</style>

            <div className="dashboard-body">
                {isModalTransaction && (
                    <Modal
                        type="transaction"
                        onClose={() => setModalTransaction(false)}
                    />
                )}
                {isModalBudget && (
                    <Modal
                        type="budget"
                        onClose={() => setModalBudget(false)}
                    />
                ) }
                <div className="dashboard">
                    <h2 className="welcome-header">
                        Hello, John Doe
                    </h2>

                    <Navbar />
                    <div className="balance-section">
                        <div className="balance-card">
                            <div className="icon">💰</div>
                            <h3 className="card-title">Current Balance</h3>
                            <div className="amount">$3,250</div>
                        </div>

                        <div className="balance-card">
                            <div className="icon icon-income">↗️</div>
                            <h3 className="card-title">Total Income</h3>
                            <div className="amount amount-income">$4,000</div>
                        </div>

                        <div className="balance-card">
                            <div className="icon icon-expense">↘️</div>
                            <h3 className="card-title">Total Expenses</h3>
                            <div className="amount amount-expense">$750</div>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                    }}>
                        <div className="add-transaction-section">
                            <button className="add-btn" onClick={() => {
                                setModalTransaction(!isModalTransaction)
                            }}>
                                + Add Transaction
                            </button>
                        </div>

                        <div className="add-transaction-section">
                            <button className="add-btn" onClick={() => {
                                setModalBudget(!isModalBudget)
                            }}>
                                + Add Budget
                            </button>
                        </div>
                    </div>


                    <div className="transaction-section">
                        <h3 className="transaction-header">Transaction History</h3>

                        <table className="transaction-table">
                            <thead>
                                <tr>
                                    <th className="table-header">Date</th>
                                    <th className="table-header">Category</th>
                                    <th className="table-header">Amount</th>
                                    <th className="table-header">Type</th>
                                    <th className="table-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="table-row">
                                    <td className="table-cell">07/10/25</td>
                                    <td className="table-cell">Salary</td>
                                    <td className="table-cell amount-positive">$2,000</td>
                                    <td className="table-cell">
                                        <span className="transaction-type type-in">In</span>
                                    </td>
                                    <td className="table-cell">
                                        <button className="action-btn">
                                            Edit
                                        </button>
                                        <button className="action-btn delete-btn">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                                <tr className="table-row">
                                    <td className="table-cell">07/12/25</td>
                                    <td className="table-cell">Food</td>
                                    <td className="table-cell amount-negative">-$20</td>
                                    <td className="table-cell">
                                        <span className="transaction-type type-out">Out</span>
                                    </td>
                                    <td className="table-cell">
                                        <button className="action-btn">
                                            Edit
                                        </button>
                                        <button className="action-btn delete-btn">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}