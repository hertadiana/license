// Example using Express.js

require('dotenv').config();
const cron=require('node-cron');
const nodemailer=require('nodemailer');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
const { Sequelize, Model, DataTypes, Op } = require('sequelize');

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


//////////////////////////////////////////




// Setup nodemailer (example with Gmail SMTP, replace with your config)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send email
async function sendEmail(to, subject, plate, dueDate) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #2d89ef;">Vehicle Inspection Reminder</h2>
      <p>Dear Customer,</p>
      <p>This is a friendly reminder that your car with license plate <strong>${plate}</strong> is due for inspection on <strong>${dueDate}</strong>.</p>
      <p>Please ensure your vehicle is ready by then to avoid any penalties or issues.</p>
      <p>Thank you,<br>Your ITP Station</p>
      <hr>
      <small style="color: gray;">This is an automated message. Please do not reply.</small>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"ITP Reminder" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Pretty email sent to ${to}`);
  } catch (err) {
    console.error(`Error sending email to ${to}:`, err);
  }
}

// Reminder job
cron.schedule('0 9 * * *', async () => {  // Every day at 09:00 am server time
  try {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    // Dates 7 days and 1 day from today
    const date7 = new Date(today);
    date7.setDate(date7.getDate() + 7);
    const date1 = new Date(today);
    date1.setDate(date1.getDate() + 1);

    const date7ISO = date7.toISOString().split('T')[0];
    const date1ISO = date1.toISOString().split('T')[0];

    // Find cars with 'next' inspection date in 7 or 1 day
    const carsToNotify = await Car.findAll({
      where: {
        next: {
          [Sequelize.Op.in]: [date7ISO, date1ISO],
        },
      },
    });

    for (const car of carsToNotify) {
      if (car.email) {
await sendEmail(car.email, 'Inspection Reminder', car.plate, car.next);
      }
    }
  } catch (err) {
    console.error('Error in reminder cron job:', err);
  }
});

app.get('/test-email', async (req, res) => {
  try {
    await sendEmail(
      req.query.to || 'your_email@example.com',
      'Test Email from Node.js',
      'This is a test email sent from your Express server.'
    );
    res.send('Test email sent successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send test email.');
  }
});

app.get('/trigger-reminders', async (req, res) => {
  try {
    const today = new Date();
    const date7 = new Date(today);
    date7.setDate(today.getDate() + 7);
    const date1 = new Date(today);
    date1.setDate(today.getDate() + 1);

    const date7ISO = date7.toISOString().split('T')[0];
    const date1ISO = date1.toISOString().split('T')[0];

    const carsToNotify = await Car.findAll({
      where: {
        next: {
          [Sequelize.Op.in]: [date7ISO, date1ISO],
        },
      },
    });

    for (const car of carsToNotify) {
      const messageBody = `Reminder: Your car with plate ${car.plate} has an inspection due on ${car.next}.`;

     
      if (car.email) {
        await sendEmail(car.email, 'Inspection Reminder', car.plate, car.next);
      }
    }

    res.send('Reminders triggered manually.');
  } catch (err) {
    console.error('Error in test reminder trigger:', err);
    res.status(500).send('Error triggering reminders.');
  }
});
