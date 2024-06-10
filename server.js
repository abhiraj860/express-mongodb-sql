const express = require('express');
const mongoose = require('mongoose');
const { Pool } = require('pg');

const app = express();
const port = 4000;

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB setup
mongoose.connect('mongodb+srv://abhiaditya860:ZHXUrjX1q1Rg18RV@cluster0.xnayn8w.mongodb.net/finalDocker');
const mongoDb = mongoose.connection;
mongoDb.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define a Mongoose schema and model
const Schema = mongoose.Schema;
const MyDataSchema = new Schema({
  name: String,
  value: Number,
});
const MyData = mongoose.model('MyData', MyDataSchema);

// Neon.tech PostgreSQL setup
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:1AYlNKyS2UdM@ep-old-hat-a5dd1p7o.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

pool.connect((err) => {
  if (err) {
    console.error('PostgreSQL connection error:', err.message);
  } else {
    console.log('Connected to the PostgreSQL database.');
    pool.query(`CREATE TABLE IF NOT EXISTS mydata (name TEXT, value INTEGER)`, (err, res) => {
      if (err) {
        console.error('Error creating table:', err.message);
      }
    });
  }
});

// Endpoint to insert data into both databases
app.post('/data', async (req, res) => {
  const { name, value } = req.body;

  if (!name || value == null) {
    return res.status(400).send('Invalid input data');
  }

  try {
    // Insert into MongoDB
    const mongoData = new MyData({ name, value });
    await mongoData.save();

    // Insert into PostgreSQL (Neon.tech)
    await pool.query('INSERT INTO mydata (name, value) VALUES ($1, $2)', [name, value]);

    res.status(200).send('Data inserted into both databases');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data into databases');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
