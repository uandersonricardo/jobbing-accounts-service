const mongoose = require('../config/db');

const ApplicantSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  birthday: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  maritalStatus: {
    type: String,
    required: true
  },
  educationLevel: {
    type: String,
    required: true
  },
  salaryExpectation: {
    type: Number,
    required: true
  },
  areaOfInterest: {
    type: String,
    required: true
  }
});

const Applicant = mongoose.model('Applicant', ApplicantSchema);

module.exports = Applicant;
