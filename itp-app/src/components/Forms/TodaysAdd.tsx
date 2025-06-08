import React, { useEffect, useState } from 'react';
import { Car } from '../Car';
import './AddForm.css';

interface Props {
  onClose: () => void;
}

const TodaysAdd: React.FC<Props> = ({ onClose }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/cars/today')
      .then(res => res.json())
      .then(data => {
        setCars(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching today's cars:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Today's Additions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : cars.length === 0 ? (
          <p>No inspections scheduled for today.</p>
        ) : (
          <div className="form-scroll-container">
            <ul>
              {cars.map(car => (
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
