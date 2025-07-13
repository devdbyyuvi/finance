import React, { useState } from 'react';
import { Input } from './Input';

export function Modal({ type, onClose, onSuccess, userId }) {
    const token = localStorage.getItem('token')
    const [formData, setFormData] = useState({
        transactionType: 'income',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        // Budget fields
        limitAmount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const validateForm = () => {
        if (type === 'transaction') {
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                setError('Amount must be a positive number');
                return false;
            }
            if (!formData.category.trim()) {
                setError('Category is required');
                return false;
            }
            if (!formData.date) {
                setError('Date is required');
                return false;
            }
        } else if (type === 'budget') {
            if (!formData.limitAmount || parseFloat(formData.limitAmount) <= 0) {
                setError('Budget limit must be a positive number');
                return false;
            }
            if (!formData.category.trim()) {
                setError('Category is required');
                return false;
            }
            if (!formData.month || formData.month < 1 || formData.month > 12) {
                setError('Please select a valid month');
                return false;
            }
            if (!formData.year) {
                setError('Year is required');
                return false;
            }
        }
        return true;
    };

    const submitTransaction = async (transactionData) => {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}api/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to create transaction');
        }

        return response.json();
    };

    const submitBudget = async (budgetData) => {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}api/budgets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },
            body: JSON.stringify(budgetData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to create budget');
        }

        return response.json();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            let result;

            if (type === 'transaction') {
                const transactionData = {
                    type: formData.transactionType,
                    amount: parseFloat(formData.amount),
                    category: formData.category.trim(),
                    note: formData.note.trim(),
                    userid: userId
                };
                console.log(transactionData)
                result = await submitTransaction(transactionData);
            } else {
                const budgetData = {
                    category: formData.category.trim(),
                    limitAmount: parseFloat(formData.limitAmount),
                    month: parseInt(formData.month),
                    year: parseInt(formData.year),
                    userId: userId
                };

                result = await submitBudget(budgetData);
            }

            console.log('Success:', result);

            if (onSuccess) {
                onSuccess(result);
            }

            if (onClose) onClose();

        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err.message || 'An error occurred while submitting the form');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            if (onClose) onClose();
        }
    };

    return (
        <>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }

                .modal {
                    background: rgba(30, 32, 47, 0.98);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    position: relative;
                    font-family: 'Inter', Tahoma, Geneva, Verdana, sans-serif;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .modal-title {
                    font-size: 1.8rem;
                    color: #e2e8f0;
                    font-weight: 500;
                    margin: 0;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #a0aec0;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                }

                .close-btn:hover {
                    color: #f56565;
                    background: rgba(245, 101, 101, 0.1);
                }

                .error-message {
                    background: rgba(245, 101, 101, 0.1);
                    border: 1px solid rgba(245, 101, 101, 0.3);
                    color: #f56565;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                }

                .input-field {
                    margin-bottom: 20px;
                }

                .input-field label {
                    display: block;
                    color: #a0aec0;
                    font-size: 0.9rem;
                    font-weight: 500;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .input-field input, .input-field select, .input-field textarea {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(45, 55, 72, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #e2e8f0;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }

                .input-field input:focus, .input-field select:focus, .input-field textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background: rgba(45, 55, 72, 1);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .input-field textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .radio-group {
                    display: flex;
                    gap: 20px;
                    margin-top: 8px;
                }

                .radio-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .radio-input {
                    width: 16px;
                    height: 16px;
                    accent-color: #3b82f6;
                }

                .radio-label {
                    color: #e2e8f0;
                    font-size: 0.9rem;
                    cursor: pointer;
                }

                .form-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-end;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
                    color: white;
                    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
                }

                .btn-secondary {
                    background: rgba(45, 55, 72, 0.8);
                    color: #a0aec0;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .btn-secondary:hover {
                    background: rgba(45, 55, 72, 1);
                    color: #e2e8f0;
                }

                .loading-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid transparent;
                    border-top: 2px solid currentColor;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .amount-input {
                    position: relative;
                }

                .currency-symbol {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #a0aec0;
                    font-size: 1rem;
                    pointer-events: none;
                }

                .amount-input .input-field input {
                    padding-left: 35px;
                }

                @media (max-width: 600px) {
                    .modal {
                        margin: 20px;
                        padding: 20px;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .form-actions {
                        flex-direction: column;
                    }
                }
            `}</style>

            <div className="modal-overlay" onClick={handleOverlayClick}>
                <div className="modal">
                    <div className="modal-header">
                        <h2 className="modal-title">
                            {type === 'transaction' ? 'Add Transaction' : 'Add Budget'}
                        </h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {type === 'transaction' ? (
                            <>
                                <div className="input-field">
                                    <label className="form-label">Transaction Type</label>
                                    <div className="radio-group">
                                        <div className="radio-item">
                                            <input
                                                type="radio"
                                                id="income"
                                                name="transactionType"
                                                value="income"
                                                checked={formData.transactionType === 'income'}
                                                onChange={handleInputChange}
                                                className="radio-input"
                                            />
                                            <label htmlFor="income" className="radio-label">Income</label>
                                        </div>
                                        <div className="radio-item">
                                            <input
                                                type="radio"
                                                id="expense"
                                                name="transactionType"
                                                value="expense"
                                                checked={formData.transactionType === 'expense'}
                                                onChange={handleInputChange}
                                                className="radio-input"
                                            />
                                            <label htmlFor="expense" className="radio-label">Expense</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-field">
                                        <label htmlFor="amount">Amount</label>
                                        <div className="amount-input">
                                            <span className="currency-symbol">$</span>
                                            <input
                                                type="number"
                                                id="amount"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                required
                                                style={{ paddingLeft: '35px' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="input-field">
                                        <label htmlFor="date">Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-field">
                                    <label htmlFor="category">Category</label>
                                    <input
                                        type="text"
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Food, Salary, Entertainment"
                                        required
                                    />
                                </div>

                                <div className="input-field">
                                    <label htmlFor="note">Note (Optional)</label>
                                    <textarea
                                        name="note"
                                        id="note"
                                        value={formData.note}
                                        onChange={handleInputChange}
                                        placeholder="Add a note about this transaction..."
                                        maxLength="200"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="input-field">
                                    <label htmlFor="category">Category</label>
                                    <input
                                        type="text"
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Food, Entertainment, Transportation"
                                        required
                                    />
                                </div>

                                <div className="input-field">
                                    <label htmlFor="limitAmount">Budget Limit</label>
                                    <div className="amount-input">
                                        <span className="currency-symbol">$</span>
                                        <input
                                            type="number"
                                            id="limitAmount"
                                            name="limitAmount"
                                            value={formData.limitAmount}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            required
                                            style={{ paddingLeft: '35px' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-field">
                                        <label htmlFor="month">Month</label>
                                        <select
                                            name="month"
                                            id="month"
                                            value={formData.month}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value={1}>January</option>
                                            <option value={2}>February</option>
                                            <option value={3}>March</option>
                                            <option value={4}>April</option>
                                            <option value={5}>May</option>
                                            <option value={6}>June</option>
                                            <option value={7}>July</option>
                                            <option value={8}>August</option>
                                            <option value={9}>September</option>
                                            <option value={10}>October</option>
                                            <option value={11}>November</option>
                                            <option value={12}>December</option>
                                        </select>
                                    </div>

                                    <div className="input-field">
                                        <label htmlFor="year">Year</label>
                                        <input
                                            type="number"
                                            id="year"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            placeholder="2025"
                                            min="2020"
                                            max="2030"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        {type === 'transaction' ? 'Adding...' : 'Creating...'}
                                    </>
                                ) : (
                                    type === 'transaction' ? 'Add Transaction' : 'Create Budget'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}