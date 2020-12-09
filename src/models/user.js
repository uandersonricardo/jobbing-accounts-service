/* eslint-disable func-names */
const bcrypt = require('bcryptjs');

const mongoose = require('../config/db');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  name: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: false
  },
  birthday: {
    type: Date,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
