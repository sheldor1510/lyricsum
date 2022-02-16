const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use('/', require('./routes'));

const port = process.env.PORT || 5000;
app.listen(port, (err) => {
    console.log(`Server started on ${port}!`);
    if (err) throw err;
});

module.exports = app;