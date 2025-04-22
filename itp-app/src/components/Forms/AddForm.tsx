import React, { useEffect, useState } from 'react';
import './AddForm.css'; // Import the CSS file

interface AddFormProps {
  onClose: () => void;
  onAddCar: (newCar: any) => void;
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

const AddForm: React.FC<AddFormProps> = ({ onClose, onAddCar }) => {
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
    if (last && type && age !== '') {
      const nextDate = calculateNextInspection(last, { type, age: parseInt(age) });
      setNext(nextDate);
    }
  }, [last, type, age]); // Depend on last, type, and age

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCar),
      });
      const data = await response.json();
      onAddCar(data); // Add the new car to the table
      onClose(); // Close the form
    } catch (error) {
      console.error('Error adding car:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Car</h2>

        <div className="form-scroll-container">
          <form onSubmit={handleSubmit}>
            <label>Plate:
              <input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} required />
            </label>
            <label>Age:
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
            </label>
            <label>Type:
              <input type="text" value={type} onChange={(e) => setType(e.target.value)} required />
            </label>
            <label>Last Inspection:
              <input
                type="date"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                required
              />
            </label>
            <label>Next Inspection:
              <input type="date" value={next} onChange={(e) => setNext(e.target.value)} required disabled />
            </label>
            <label>Owner Name:
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>Phone:
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>
            <label>Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="close-btn">Close</button>
          <button type="submit" onClick={handleSubmit}>Add Car</button>
        </div>
      </div>
    </div>
  );
};

export default AddForm;
