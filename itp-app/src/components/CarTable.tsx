import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from './Car';
import './CarTable.css';
import AddForm from './Forms/AddForm';
import TodaysAdd from './Forms/TodaysAdd';

const CarTable: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]); 
  const [selectedCars, setSelectedCars] = useState<Set<number>>(new Set());
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [showTodays, setShowTodays] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage] = useState(5);
  const [totalCars, setTotalCars] = useState(0);

  const navigate = useNavigate();

  const fetchCars = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:3000/cars?page=${page}&limit=${carsPerPage}`);
      const data = await response.json();
      setCars(data.cars);
      setTotalCars(data.total);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

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

  const deleteSelectedCars = async () => {
    try {
      for (let carId of selectedCars) {
        await fetch(`http://localhost:3000/cars/${carId}`, {
          method: 'DELETE',
        });
      }
      fetchCars(currentPage);
      setSelectedCars(new Set());
    } catch (error) {
      console.error('Error deleting selected cars:', error);
    }
  };

  const addCar = (newCar: Car) => {
    setCars((prevCars) => [...prevCars, newCar]);
    setTotalCars((prev) => prev + 1);
  };

  const deleteCar = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/cars/${id}`, {
        method: 'DELETE',
      });
      fetchCars(currentPage);
      setSelectedCars((prevSelected) => {
        const updatedSelected = new Set(prevSelected);
        updatedSelected.delete(id);
        return updatedSelected;
      });
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  useEffect(() => {
    fetchCars(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalCars / carsPerPage);

  return (
    <div className="car-table-container">
      <h1 className="table-heading">ITP Solutions</h1>

      <button className="add-btn" onClick={() => setIsAddFormOpen(true)}>Add Car</button>
      {isAddFormOpen && <AddForm onClose={() => setIsAddFormOpen(false)} onAddCar={addCar} />}
      <button className="delete-btn" onClick={deleteSelectedCars} disabled={selectedCars.size === 0}>
        Delete Selected
      </button>

      {showTodays && <TodaysAdd cars={cars} onClose={() => setShowTodays(false)} />}
<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px', gap: '10px' }}>
  <button onClick={() => setShowTodays(true)} className="todays-add-btn">
    Today's Add
  </button>
  <button className="settings-btn" onClick={() => navigate(`/settings`)}>
    Settings
  </button>
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
                <div className="button-container">
                  <button className="edit-btn" onClick={() => navigate(`/edit/${car.id}`)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => deleteCar(car.id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default CarTable;
