const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const indexRouter = require('./routes/index');

const db = process.env.DB_URI;

const app = express();

// mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
//     .then(() => console.log('MongoDB Connected...'))
//     .catch(err => console.log(err));
// mongoose.set('useFindAndModify', false);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use('/', indexRouter);


const port = process.env.PORT || 5000;
app.listen(port, (err) => {
    console.log(`Server started on ${port}!`);
    if (err) throw err;
});

module.exports = app;