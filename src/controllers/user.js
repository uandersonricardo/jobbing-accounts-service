const User = require('../models/user');

const list = async (req, res) => {
  try {
    const users = [
      {
        id: '5dsjdoqwd',
        name: 'Uanderson'
      },
      {
        id: '823103210',
        name: 'Carlos'
      }
    ];

    return res.json(users);
  } catch (err) {
    return res.status(400).send({ error: 'Error loading users' });
  }
};

const show = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    return res.send({ user });
  } catch (err) {
    return res.status(400).send({ error: 'Error loading user' });
  }
};

const update = async (req, res) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(400).send({ error: 'Cannot update this user' });
    }

    const { password } = req.body;
    delete req.body.password;

    const user = await User.findOneAndUpdate(req.params.userId, req.body, {
      new: true
    });

    if (password) {
      user.password = password;

      await user.save();
    }

    user.password = undefined;

    return res.send({ user });
  } catch (err) {
    return res.status(400).send({ error: 'Error updating user' });
  }
};

const search = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.query.email });

    return res.send({ user });
  } catch (err) {
    return res.status(400).send({ error: 'Error searching user' });
  }
};

const user = {
  list,
  show,
  update,
  search
};

module.exports = user;
