const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const url = process.env.MONGODB_URI;
mongoose.connect(url).then(()=> {
  console.log('Database connected')
})
.catch(error => {
  console.log("Connection fault", error.message);
}) 


app.use(cors());
app.use(express.json());

app.get('/', (request, response) => response.json({retruned: "nothing, we are just in the deve;opemtn phase"}))

console.log(process.env);
console.log("the uri", process.env.MONGODB_URI);
module.exports = app