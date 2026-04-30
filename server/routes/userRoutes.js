const express = require('express');
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .get(protect, getUsers);

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
