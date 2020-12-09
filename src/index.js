require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./routes/index')(app);

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Socket is running on port ${PORT}.`);
});
