import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Car } from '../Car';

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
    if (!car) {console.log(car);return;}
    const { name, value } = e.target;
    setCar({ ...car, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    try {
      const response = await fetch(`http://localhost:3000/cars/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(car),
      });


      if (response.ok) {
        navigate('/'); // Redirect to main page after saving
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
          <div key={field}>
            <label>{field.toUpperCase()}:</label>
            <input
              type="text"
              name={field}
              value={(car as any)[field]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate('/')}>Cancel</button>
      </form>
    </div>
  );
};

export default EditForm;
