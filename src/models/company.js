const mongoose = require('../config/db');

const CompanySchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  foundation: {
    type: Date,
    required: true
  },
  sector: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  }
});

const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;
