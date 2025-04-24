import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Car } from '../Car';
import { isNonEmpty, isPositiveNumber, isValidEmail } from '../utils/validation';

const EditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await fetch(`http://localhost:3000/cars/${id}`);
        const data = await response.json();
        setCar(data);
      } catch (error) {
        console.error('Error fetching car:', error);
      }
    };
    fetchCar();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!car) { console.log(car); return; }
    const { name, value } = e.target;
    setCar({ ...car, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    const { plate, age, type, last, next, name, phone, email } = car;

    if (
      !isPositiveNumber(String(age)) ||
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

    try {
      const response = await fetch(`http://localhost:3000/cars/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(car),
      });

      if (response.ok) {
        navigate('/');
      } else {
        console.error('Failed to update car');
      }
    } catch (error) {
      console.error('Error updating car:', error);
    }
  };

  if (!car) return <div>Loading...</div>;

  return (
    <div className="edit-form-container">
      <h2>Edit Car</h2>
      <form onSubmit={handleSubmit}>
        {['plate', 'age', 'type', 'last', 'next', 'name', 'phone', 'email'].map((field) => (
          <div key={field} className="input-group">
            <input
              type={field === 'age' ? 'number' : field === 'email' ? 'email' : 'text'}
              name={field}
              value={(car as any)[field]}
              onChange={handleChange}
              placeholder=" " // This ensures the floating label effect
              id={field}
              required
              {...(field === 'plate' && {
                title: 'Format: AB 123 CD',
              })}
              {...(field === 'age' && {
                min: 1,
                title: 'Age must be greater than 0',
              })}
              {...(field === 'name' && {
                pattern: '^[a-zA-Z\\s]+$',
                title: 'Only letters and spaces allowed',
              })}
              {...(field === 'email' && {
                pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
                title: 'Email must be in format example@domain.com',
              })}
            />
            <label htmlFor={field}>{field.toUpperCase()}</label>
          </div>
        ))}
        
        <div className="form-actions">
          <button type="submit" className="save-btn">Save</button>
          <button type="button" onClick={() => navigate('/')} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditForm;
