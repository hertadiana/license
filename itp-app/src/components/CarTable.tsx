// src/components/CarTable.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from './Car';
import './CarTable.css'; // Import the CSS file
import AddForm from './Forms/AddForm';
import TodaysAdd from './Forms/TodaysAdd';
const CarTable: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCars, setSelectedCars] = useState<Set<number>>(new Set());
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);
  const [showTodays, setShowTodays] = useState(false);
  
  const navigate = useNavigate();

  // Fetch cars from backend
  const fetchCars = async () => {
    try {
      const response = await fetch('http://localhost:3000/cars');
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  // Handle selection of cars
  const toggleSelection = (id: number) => {
    setSelectedCars((prevSelected) => {
      const updatedSelected = new Set(prevSelected);
      if (updatedSelected.has(id)) {
        updatedSelected.delete(id);
      } else {
        updatedSelected.add(id);
      }
      return updatedSelected;
    });
  };

  // Delete selected cars
  const deleteSelectedCars = async () => {
    try {
      for (let carId of selectedCars) {
        await fetch(`http://localhost:3000/cars/${carId}`, {
          method: 'DELETE',
        });
      }
      // Remove the deleted cars from the state
      setCars(cars.filter((car) => !selectedCars.has(car.id)));
      setSelectedCars(new Set()); // Clear the selection
    } catch (error) {
      console.error('Error deleting selected cars:', error);
    }
  };

  // Function to add a new car to the table
  const addCar = (newCar: Car) => {
    setCars((prevCars) => [...prevCars, newCar]);
  };
  const deleteCar = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/cars/${id}`, {
        method: 'DELETE',
      });
      // Remove the deleted car from the state
      setCars(cars.filter((car) => car.id !== id));
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };
  useEffect(() => {
    fetchCars();
  }, []);
  
  return (
    <div className="car-table-container">
      <h1 className="table-heading">Car Table</h1>
      <button
  className="settings-btn"
  onClick={() => navigate(`/settings`)}
>
  Settings
</button>
      <button
        className="add-btn"
        onClick={() => setIsAddFormOpen(true)}
      >
        Add Car
      </button>

      {isAddFormOpen && (
        <AddForm onClose={() => setIsAddFormOpen(false)} onAddCar={addCar} />
      )}

      <button
        className="delete-btn"
        onClick={deleteSelectedCars}
        disabled={selectedCars.size === 0}
      >
        Delete Selected
      </button>
      {showTodays && (
  <TodaysAdd
    cars={cars}
    onClose={() => setShowTodays(false)}
  />
)}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
  <button onClick={() => setShowTodays(true)}>Today's Additions</button>
</div>

      <table className="car-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedCars.size === cars.length}
                onChange={() => {
                  if (selectedCars.size === cars.length) {
                    setSelectedCars(new Set());
                  } else {
                    setSelectedCars(new Set(cars.map((car) => car.id)));
                  }
                }}
              />
            </th>
            <th>Plate</th>
            <th>Age</th>
            <th>Type</th>
            <th>Last Inspection</th>
            <th>Next Inspection</th>
            <th>Owner Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedCars.has(car.id)}
                  onChange={() => toggleSelection(car.id)}
                />
              </td>
              <td>{car.plate}</td>
              <td>{car.age}</td>
              <td>{car.type}</td>
              <td>{car.last}</td>
              <td>{car.next}</td>
              <td>{car.name}</td>
              <td>{car.phone}</td>
              <td>{car.email}</td>
              <td>
              <button
  className="edit-btn"
  onClick={() => navigate(`/edit/${car.id}`)}
>
  Edit
</button>
  <button
    className="delete-btn"
    onClick={() => {
      deleteCar(car.id);
      setSelectedCars((prevSelected) => {
        const updatedSelected = new Set(prevSelected);
        updatedSelected.delete(car.id);
        return updatedSelected;
      });
    }}
  >
    Delete
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CarTable;
