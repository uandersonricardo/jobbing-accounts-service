const Account = require('../models/account');
const Applicant = require('../models/applicant');
const Company = require('../models/company');

const list = async (req, res) => {
  try {
    const accounts = await Account.find().populate(['_applicant', '_company']);

    return res.json(accounts);
  } catch (err) {
    return res.status(400).send({ error: 'Error loading accounts' });
  }
};

const show = async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId).populate([
      '_applicant',
      '_company'
    ]);

    return res.json(account);
  } catch (err) {
    return res.status(400).send({ error: 'Error loading account' });
  }
};

const update = async (req, res) => {
  try {
    if (req.params.accountId !== req.accountId) {
      return res.status(400).send({ error: 'Cannot update this account' });
    }

    const { password } = req.body;
    delete req.body.password;

    const {
      company: companyBody,
      applicant: applicantBody,
      ...accountBody
    } = req.body;

    const account = await Account.findOneAndUpdate(
      req.params.accountId,
      accountBody,
      { new: true }
    ).populate(['_company', '_applicant']);

    if (applicantBody) {
      const applicant = await Applicant.findByIdAndUpdate(
        account._applicant._id,
        applicantBody,
        { new: true }
      );

      account._applicant = applicant;
    } else if (companyBody) {
      const company = await Company.findByIdAndUpdate(
        account._company._id,
        companyBody,
        { new: true }
      );

      account._company = company;
    }

    if (password) {
      account.password = password;

      await account.save();
    }

    account.password = undefined;

    return res.json(account);
  } catch (err) {
    return res.status(400).send({ error: 'Error updating account' });
  }
};

const search = async (req, res) => {
  try {
    const account = await Account.findOne({ email: req.query.email }).populate([
      '_applicant',
      '_company'
    ]);

    return res.json(account);
  } catch (err) {
    return res.status(400).send({ error: 'Error searching account' });
  }
};

const account = {
  list,
  show,
  update,
  search
};

module.exports = account;
