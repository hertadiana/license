// Example using Express.js

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
const { Sequelize, Model, DataTypes, Op } = require('sequelize');
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});

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


/////////////////////////////////



//-------------------------------------------------
//  ✦  Image upload + license-plate detection ✦
//-------------------------------------------------

const multer  = require('multer');
const { PythonShell } = require('python-shell');

const upload  = multer({ dest: 'uploads/' });

function runPlateDetector(imagePath) {
  return new Promise((resolve, reject) => {
    PythonShell.run('plate-detector-env/detection_plate.py', {
  mode: 'text',
  pythonPath: 'C:\\Users\\herta\\Documents\\Licenta\\license\\itp-app\\back\\plate-detector-env\\Scripts\\python.exe', // 👈 this is crucial
  args: [imagePath]
}, (err, results) => {
  if (err) return reject(err);
  try {
    const { plate } = JSON.parse(results.pop());
    resolve(plate);
  } catch (e) {
    reject(new Error('Bad detector output'));
  }
});
;
  });
}

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const todayISO = new Date().toISOString().split('T')[0];
    const plate     = await runPlateDetector(req.file.path);

    // insert skeleton record (other fields null)
    const car = await Car.create({
      plate,
      last: todayISO,
      next: '',  // calculate if you already know the interval
      age: null,
      type: '',
      name: '',
      phone: '',
      email: ''
    });

    res.json({ success: true, car });   // send full row back
  } catch (err) {
    console.error(err);
    res.status(422).json({ error: 'Plate not detected' });
  } finally {
    // optional: fs.unlink(req.file.path, ()=>{});
  }
});

app.get('/cars/today', async (_, res) => {
  const todayISO = new Date().toISOString().split('T')[0];
  const rows = await Car.findAll({ where: { last: todayISO }, order:[['id','ASC']]});
  res.json(rows);
});




/////////////////////////////////
app.get('/cars', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Build where clause only if search param exists
    const whereClause = search
      ? {
          [Op.or]: [
            { plate: { [Op.like]: `%${search}%` } },
            { type: { [Op.like]: `%${search}%` } },
            { name: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await Car.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['id', 'ASC']],
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

  app.post('/api/messages', (req, res) => {
    res.header('Content-Type', 'application/json');
    client.messages
    .create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: req.body.to,
      body: req.body.body
    })
    .then(() => {
      res.send(JSON.stringify({ success: true }));
    })
    
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