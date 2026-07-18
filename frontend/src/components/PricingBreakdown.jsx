import React from 'react';
import './PricingBreakdown.css';

const PricingBreakdown = ({ items, taxRate = 18, deposit = 0 }) => {
    const subtotal = items.reduce((sum, item) => {
        const itemPrice = item.price * item.quantity;
        return sum + itemPrice;
    }, 0);

    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount + deposit;

    const formatCurrency = (amount) => {
        return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="pricing-breakdown">
            <h3>Pricing Summary</h3>

            <div className="pricing-rows">
                <div className="pricing-row">
                    <span className="pricing-label">Subtotal</span>
                    <span className="pricing-value">{formatCurrency(subtotal)}</span>
                </div>

                <div className="pricing-row">
                    <span className="pricing-label">Tax ({taxRate}%)</span>
                    <span className="pricing-value">{formatCurrency(taxAmount)}</span>
                </div>

                {deposit > 0 && (
                    <div className="pricing-row">
                        <span className="pricing-label">Security Deposit</span>
                        <span className="pricing-value deposit">{formatCurrency(deposit)}</span>
                    </div>
                )}

                <div className="pricing-divider"></div>

                <div className="pricing-row total">
                    <span className="pricing-label">Total Amount</span>
                    <span className="pricing-value">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};

export default PricingBreakdown;
