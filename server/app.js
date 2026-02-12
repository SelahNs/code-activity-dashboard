const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (request, response) => response.json({retruned: "nothing, we are just in the deve;opemtn phase"}))

console.log(process.env);
console.log("the uri", process.env.MONGODB_URI);
module.exports = app