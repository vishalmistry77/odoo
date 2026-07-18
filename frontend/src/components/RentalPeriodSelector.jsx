import React, { useState } from 'react';
import './RentalPeriodSelector.css';

const RentalPeriodSelector = ({ onPeriodChange, initialStart, initialEnd }) => {
    const [startDate, setStartDate] = useState(initialStart || '');
    const [endDate, setEndDate] = useState(initialEnd || '');
    const [duration, setDuration] = useState({ days: 0, hours: 0 });

    const calculateDuration = (start, end) => {
        if (!start || !end) return { days: 0, hours: 0 };

        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();

        if (endTime <= startTime) return { days: 0, hours: 0 };

        const diffMs = endTime - startTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffHours / 24);
        const hours = diffHours % 24;

        return { days, hours };
    };

    const handleStartChange = (e) => {
        const newStart = e.target.value;
        setStartDate(newStart);

        const newDuration = calculateDuration(newStart, endDate);
        setDuration(newDuration);

        if (onPeriodChange) {
            onPeriodChange({
                startDate: newStart,
                endDate,
                duration: newDuration
            });
        }
    };

    const handleEndChange = (e) => {
        const newEnd = e.target.value;
        setEndDate(newEnd);

        const newDuration = calculateDuration(startDate, newEnd);
        setDuration(newDuration);

        if (onPeriodChange) {
            onPeriodChange({
                startDate,
                endDate: newEnd,
                duration: newDuration
            });
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <div className="rental-period-selector">
            <h3>Select Rental Period</h3>

            <div className="date-inputs">
                <div className="date-input-group">
                    <label htmlFor="start-date">Start Date</label>
                    <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={handleStartChange}
                        min={getTodayDate()}
                        required
                    />
                </div>

                <div className="date-arrow">→</div>

                <div className="date-input-group">
                    <label htmlFor="end-date">End Date</label>
                    <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={handleEndChange}
                        min={startDate || getTodayDate()}
                        required
                    />
                </div>
            </div>

            {duration.days > 0 && (
                <div className="duration-display">
                    <span className="duration-label">Rental Duration:</span>
                    <span className="duration-value">
                        {duration.days} {duration.days === 1 ? 'day' : 'days'}
                        {duration.hours > 0 && ` ${duration.hours} ${duration.hours === 1 ? 'hour' : 'hours'}`}
                    </span>
                </div>
            )}
        </div>
    );
};

export default RentalPeriodSelector;
