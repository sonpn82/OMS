const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');
const User = require('../models/user');
const {isLoggedIn, isOwner} = require('../middleware'); // middleware for validation 

router.route('/register')
    .get(isLoggedIn, isOwner, users.renderRegister)
    .post(isLoggedIn, isOwner, catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout',isLoggedIn, users.logout)

module.exports = router;

