const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (request, response) => response.json({retruned: "nothing, we are just in the deve;opemtn phase"}))

module.exports = app