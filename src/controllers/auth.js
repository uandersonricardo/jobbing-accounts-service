const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const mailer = require('../modules/mailer');
const authConfig = require('../config/auth');
const User = require('../models/user');

const generateToken = (params = {}) =>
  jwt.sign(params, authConfig.secret, { expiresIn: 86400 });

const register = async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'User already exists' });
    }

    const user = await User.create(req.body);

    user.password = undefined;

    const token = generateToken({ id: user.id });

    return res.send({ user, token });
  } catch (err) {
    return res.status(400).send({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(400).send({ error: 'User not found' });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ error: 'Invalid password' });
  }

  user.password = undefined;

  const token = generateToken({ id: user.id });

  res.send({ user, token });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ error: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    });

    mailer.sendMail(
      {
        to: email,
        from: 'naoresponda@jobbing.com',
        template: 'auth/forgot_password',
        context: { token, url: process.env.WEBSITE_URL }
      },
      err => {
        if (err) {
          res.status(400).send({ error: 'Cannot send forgot password email' });
        }

        return res.send();
      }
    );
  } catch (err) {
    res.status(400).send({ error: 'Error on forgot password, try again' });
  }
};

const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      '+passwordResetToken passwordResetExpires'
    );

    if (!user) {
      return res.status(400).send({ error: 'User not found' });
    }

    if (token !== user.passwordResetToken) {
      return res.status(400).send({ error: 'Token invalid' });
    }

    const now = new Date();

    if (now > user.passwordResetExpires) {
      return res
        .status(400)
        .send({ error: 'Token expired, generate a new one' });
    }

    user.password = password;

    await user.save();

    res.send();
  } catch (err) {
    res.status(400).send({ error: 'Cannot reset password, try again' });
  }
};

const auth = {
  register,
  login,
  forgotPassword,
  resetPassword
};

module.exports = auth;
