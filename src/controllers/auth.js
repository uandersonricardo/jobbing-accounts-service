const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const mailer = require('../modules/mailer');
const authConfig = require('../config/auth');
const Account = require('../models/account');
const Applicant = require('../models/applicant');
const Company = require('../models/company');

const generateToken = (params = {}) =>
  jwt.sign(params, authConfig.secret, { expiresIn: 86400 });

const register = async (req, res) => {
  const { email } = req.body;

  try {
    if (await Account.findOne({ email })) {
      return res.status(400).send({ error: 'Account already exists' });
    }

    const {
      applicant: applicantBody,
      company: companyBody,
      ...accountBody
    } = req.body;

    const account = new Account(accountBody);

    if (applicantBody) {
      const applicant = new Applicant({
        ...applicantBody,
        account: account._id
      });

      await applicant.save();

      account._applicant = applicant;
    } else if (companyBody) {
      const company = new Company({
        ...companyBody,
        account: account._id
      });

      company.save();

      account._company = company;
    }

    await account.save();

    account.password = undefined;

    const token = generateToken({ id: account.id });

    return res.json(token);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const account = await Account.findOne({ email }).select('+password');

  if (!account) {
    return res.status(400).send({ error: 'Account not found' });
  }

  if (!(await bcrypt.compare(password, account.password))) {
    return res.status(400).send({ error: 'Invalid password' });
  }

  account.password = undefined;

  const token = generateToken({ id: account.id });

  return res.json(token);
};

const validate = async (req, res) => {
  try {
    const account = await Account.findById(req.accountId).populate([
      '_applicant',
      '_company'
    ]);

    return res.json(account);
  } catch (err) {
    return res.status(400).send({ error: 'Error validating token' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const account = await Account.findOne({ email });

    if (!account) {
      return res.status(400).send({ error: 'Account not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await Account.findByIdAndUpdate(account.id, {
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
    const account = await Account.findOne({ email }).select(
      '+passwordResetToken passwordResetExpires'
    );

    if (!account) {
      return res.status(400).send({ error: 'Account not found' });
    }

    if (token !== account.passwordResetToken) {
      return res.status(400).send({ error: 'Token invalid' });
    }

    const now = new Date();

    if (now > account.passwordResetExpires) {
      return res
        .status(400)
        .send({ error: 'Token expired, generate a new one' });
    }

    account.password = password;

    await account.save();

    res.send();
  } catch (err) {
    res.status(400).send({ error: 'Cannot reset password, try again' });
  }
};

const auth = {
  register,
  login,
  forgotPassword,
  resetPassword,
  validate
};

module.exports = auth;
