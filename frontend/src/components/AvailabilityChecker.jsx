import React, { useState, useEffect } from 'react';
import api from '../api/client';
import './AvailabilityChecker.css';

const AvailabilityChecker = ({ productId, quantity, startDate, endDate }) => {
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (productId && startDate && endDate && quantity > 0) {
            checkAvailability();
        }
    }, [productId, startDate, endDate, quantity]);

    const checkAvailability = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/products/${productId}/availability`, {
                params: {
                    startDate,
                    endDate,
                    quantity
                }
            });

            if (response.data.success) {
                setAvailability(response.data.data);
            }
        } catch (err) {
            console.error('Availability check error:', err);
            setError(err.response?.data?.message || 'Failed to check availability');
        } finally {
            setLoading(false);
        }
    };

    if (!startDate || !endDate) {
        return (
            <div className="availability-checker info">
                <span className="icon">ℹ️</span>
                <span>Select rental period to check availability</span>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="availability-checker loading">
                <span className="spinner"></span>
                <span>Checking availability...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="availability-checker error">
                <span className="icon">⚠️</span>
                <span>{error}</span>
            </div>
        );
    }

    if (!availability) {
        return null;
    }

    const isAvailable = availability.available >= quantity;

    return (
        <div className={`availability-checker ${isAvailable ? 'success' : 'warning'}`}>
            <span className="icon">{isAvailable ? '✓' : '⚠️'}</span>
            <div className="availability-info">
                {isAvailable ? (
                    <>
                        <span className="status">Available</span>
                        <span className="details">
                            {availability.available} units available for selected period
                        </span>
                    </>
                ) : (
                    <>
                        <span className="status">Limited Availability</span>
                        <span className="details">
                            Only {availability.available} units available (you requested {quantity})
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

export default AvailabilityChecker;
