import React, { useEffect, useState } from 'react';
import {
  isNonEmpty,
  isPositiveNumber,
  isValidEmail
} from '../utils/validation';
import "./Forms.css";

interface AddFormProps {
  onClose: () => void;
  onAddCar: (newCar: any) => void;
  defaultValues?: {
    plate: string;
    last: string;
  };
}


// Helper function to calculate the next inspection date
function calculateNextInspection(lastDate: string, car: { type: string; age: number }) {
  const settings = JSON.parse(localStorage.getItem("intervalSettings") || "{}");

  let interval = 1; // default

  switch (car.type) {
    case "autoturism":
      if (car.age < 3) interval = settings.autoturism?.under3 ?? 3;
      else if (car.age < 12) interval = settings.autoturism?.between3and12 ?? 2;
      else interval = settings.autoturism?.over12 ?? 1;
      break;
    case "utilitarUsor":
      interval = settings.utilitarUsor ?? 1;
      break;
    case "utilitarGreu":
    case "transportPersoane":
      interval = settings.utilitarGreu ?? 0.5;
      break;
    case "motociclete":
      interval = settings.motociclete ?? 2;
      break;
    case "remorcaUsoara":
      interval = settings.remorcaUsoara ?? 2;
      break;
    case "remorcaGrea":
      interval = settings.remorcaGrea ?? 1;
      break;
    case "taxi":
      interval = settings.taxi ?? 1;
      break;
  }

  const result = new Date(lastDate);
  result.setMonth(result.getMonth() + interval * 12); // e.g., 0.5 -> 6 months
  return result.toISOString().split("T")[0]; // format as YYYY-MM-DD
}

const AddForm: React.FC<AddFormProps> = ({ onClose, onAddCar, defaultValues }) => {
  const [plate, setPlate] = useState('');
  const [age, setAge] = useState('');
  const [type, setType] = useState('');
  const [last, setLast] = useState('');
  const [next, setNext] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Recalculate the next inspection date when the last inspection date, type, or age is updated
useEffect(() => {
  // Step 1: Prefill plate and last only once when defaultValues are received
  if (defaultValues) {
    setPlate((prev) => prev || defaultValues.plate); // don't overwrite if already typed
    setLast((prev) => prev || defaultValues.last);   // same for last
  }
}, [defaultValues]);

// Step 2: Always recalculate next inspection date if dependencies change
useEffect(() => {
  if (last && type && age !== '') {
    const nextDate = calculateNextInspection(last, { type, age: parseInt(age) });
    setNext(nextDate);
  }
}, [last, type, age]);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (
      !isPositiveNumber(age) ||
      !isNonEmpty(name) ||
      !isValidEmail(email) ||
      !isNonEmpty(type) ||
      !isNonEmpty(last) ||
      !isNonEmpty(next) ||
      !isNonEmpty(phone)
    ) {
      alert("Please fill all fields correctly:\n- Plate format: ABC123DE\n- Age must be > 0\n- Valid email");
      return;
    }
  
    const newCar = {
      plate,
      age: parseInt(age),
      type,
      last,
      next,
      name,
      phone,
      email,
    };
  
    try {
      const response = await fetch('http://localhost:3000/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCar),
      });
      const data = await response.json();
      onAddCar(data);
      onClose();
    } catch (error) {
      console.error('Error adding car:', error);
    }
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="table-heading">Add New Car</h2> {/* Reusing table-heading */}

        <div className="form-scroll-container">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                pattern="^[A-Z]{1,2}\s\d{2,3}\s[A-Z]{1,2}$"
                title="Format: AB 123 CD"
                required
                placeholder=" "
                id="add-plate"
              />
              <label htmlFor="add-plate">Plate</label>
            </div>

            <div className="input-group">
              <input
                type="number"
                min="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                placeholder=" "
                id="add-age"
              />
              <label htmlFor="add-age">Age</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                pattern="^[a-zA-Z\s]+$"
                title="Only letters and spaces allowed"
                required
                placeholder=" "
                id="add-owner-name"
              />
              <label htmlFor="add-owner-name">Owner Name</label>
            </div>

            <div className="input-group">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                pattern="\d{10}"
                title="Enter a valid phone number (10 digits)"
                required
                placeholder=" "
                id="add-phone"
              />
              <label htmlFor="add-phone">Phone</label>
            </div>

            <div className="input-group">
              <select value={type} onChange={(e) => setType(e.target.value)} required id="add-car-type">
                <option value="">Select type</option>
                <option value="autoturism">Autoturism</option>
                <option value="utilitarUsor">Utilitar Ușor</option>
                <option value="utilitarGreu">Utilitar Greu</option>
                <option value="transportPersoane">Transport Persoane</option>
                <option value="motociclete">Motocicletă</option>
                <option value="remorcaUsoara">Remorcă Ușoară</option>
                <option value="remorcaGrea">Remorcă Grea</option>
                <option value="taxi">Taxi</option>
              </select>
            </div>

            <div className="input-group">
              <input
                type="date"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                required
                placeholder=" "
                id="add-last-inspection"
              />
              <label htmlFor="add-last-inspection">Last Inspection Date</label>
            </div>

            <div className="input-group">
              <input
                type="date"
                value={next}
                readOnly
                placeholder=" "
                id="add-next-inspection"
              />
              <label htmlFor="add-next-inspection">Next Inspection Date</label>
            </div>

            <div className="input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                pattern="^[^@\s]+@[^@\s]+\.[^@\s]+$"
                title="Email must be in format example@domain.com"
                required
                placeholder=" "
                id="add-email"
              />
              <label htmlFor="add-email">Email</label>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="add-btn">Close</button> {/* Used cancel-btn */}
          <button type="submit" onClick={handleSubmit} className="delete-btn">Add Car</button> {/* Used add-btn */}
        </div>
      </div>
    </div>
  );
};

export default AddForm;