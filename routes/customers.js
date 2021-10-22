const express = require('express');
const router = express.Router();
const customers = require('../controllers/customers'); // controller for customer
const {validateCustomer, isLoggedIn, isAdmin} = require('../middleware'); // middleware for validation 
const catchAsync = require('../utils/catchAsync'); // wraper for error catching of async func.

router.route('/')
    .get(isLoggedIn, catchAsync(customers.index))
    .post(isLoggedIn, isAdmin, validateCustomer, catchAsync(customers.createCustomer))

router.get('/new',isLoggedIn, customers.renderNewForm)

router.route('/:id')
    .get(isLoggedIn, catchAsync(customers.showCustomer))
    .put(isLoggedIn, isAdmin, validateCustomer, catchAsync(customers.updateCustomer))
    .delete(isLoggedIn, isAdmin, catchAsync(customers.deleteCustomer))

router.get('/:id/edit',isLoggedIn, catchAsync(customers.renderEditForm))

// Put new before /:id to prevent route /:id to process
module.exports = router;