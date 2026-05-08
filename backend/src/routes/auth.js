const express = require('express');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', verifyToken, async (req, res) => {
  const { email, displayName } = req.body || {};
  const userData = {
    uid: req.user.uid,
    email: email || req.user.email,
    displayName: displayName || req.user.email?.split('@')[0] || 'User',
  };

  await User.findOneAndUpdate(
    { uid: req.user.uid },
    {
      $set: {
        email: userData.email,
        displayName: userData.displayName,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        uid: req.user.uid,
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  res.json({ success: true, user: userData });
});

router.post('/me', verifyToken, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
