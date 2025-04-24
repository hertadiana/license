// Example using Express.js
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
const { Sequelize, Model, DataTypes } = require('sequelize');

// Example defining a route in Express
app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});

// Create Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
  });
class Car extends Model{}  
Car.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey:true},
    plate: DataTypes.STRING,
    age: DataTypes.INTEGER,
    type: DataTypes.STRING,
    last: DataTypes.STRING,
    next: DataTypes.STRING,
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
}, {sequelize,modelName: 'car'})
sequelize.sync();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/cars', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Car.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']], // optional: you can sort however you want
    });

    res.json({
      cars: rows,
      total: count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/cars/:id', async (req, res) => {
    const car = await Car.findByPk(req.params.id);
    res.json(car);
  });
  
  app.post('/cars', async (req, res) => {
    const car = await Car.create(req.body);
    res.json(car);
  });

  app.put('/cars/:id', async (req, res) => {
    const car = await Car.findByPk(req.params.id);
    if (car) {
      await car.update(req.body); 
      res.json(car);
    } else {
      res.status(404).json({ message: 'car not found' });
    }
  });
  

  app.delete('/cars/:id', async (req, res) => {
    const car = await Car.findByPk(req.params.id);
    if (car) {
      await car.destroy(); // Deletes the car record
      res.json({ message: 'Car deleted' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  });
  
// Example specifying the port and starting the server
const port = process.env.PORT || 3000; // You can use environment variables for port configuration
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});