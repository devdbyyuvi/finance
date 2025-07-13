import React, { useState } from 'react';
import { Input } from './Input';
export function Modal({ type, onClose }) {
    const [formData, setFormData] = useState({
        // Transaction fields
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Form submitted:', formData);
        if (onClose) onClose();
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
                    overflow-y: hidden;
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
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
                    color: white;
                    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
                }

                .btn-primary:hover {
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

                    <div onSubmit={handleSubmit}>
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
                                    <div className="amount-input">
                                        <span className="currency-symbol">$</span>
                                        <Input
                                            label="Amount"
                                            type="number"
                                            name="amount"
                                            placeholder="0.00"
                                            onchange={handleInputChange}
                                        />
                                    </div>

                                    <Input
                                        label="Date"
                                        type="date"
                                        name="date"
                                        placeholder=""
                                        onchange={handleInputChange}
                                    />
                                </div>

                                <Input
                                    label="Category"
                                    type="text"
                                    name="category"
                                    placeholder="e.g., Food, Salary, Entertainment"
                                    onchange={handleInputChange}
                                />

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
                                <Input
                                    label="Category"
                                    type="text"
                                    name="category"
                                    placeholder="e.g., Food, Entertainment, Transportation"
                                    onchange={handleInputChange}
                                />

                                <div className="amount-input">
                                    <span className="currency-symbol">$</span>
                                    <Input
                                        label="Budget Limit"
                                        type="number"
                                        name="limitAmount"
                                        placeholder="0.00"
                                        onchange={handleInputChange}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="input-field">
                                        <label htmlFor="month">Month</label>
                                        <select
                                            name="month"
                                            id="month"
                                            value={formData.month}
                                            onChange={handleInputChange}
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

                                    <Input
                                        label="Year"
                                        type="number"
                                        name="year"
                                        placeholder="2025"
                                        onchange={handleInputChange}
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {type === 'transaction' ? 'Add Transaction' : 'Create Budget'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}