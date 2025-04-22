// TodaysAdditions.tsx
import React from 'react';
import { Car } from '../Car';
import './AddForm.css'; // reuse existing styling if you like

interface Props {
  cars: Car[];
  onClose: () => void;
}

const TodaysAdd: React.FC<Props> = ({ cars, onClose }) => {
  const today = new Date().toISOString().split('T')[0];
  const filtered = cars.filter(car => car.last === today);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Today's Additions</h2>
        {filtered.length === 0 ? (
          <p>No inspections scheduled for today.</p>
        ) : (
          <div className="form-scroll-container">
            <ul>
              {filtered.map(car => (
                <li key={car.id} style={{ marginBottom: '10px' }}>
                  <strong>{car.plate}</strong> - {car.name} ({car.phone})  
                  <div>Type: {car.type} | Age: {car.age}</div>
                  <div>Next: {car.next}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TodaysAdd;
