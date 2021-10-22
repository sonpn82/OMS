const express = require('express');
const router = express.Router();
const orders = require('../controllers/orders'); // controller for order
const {validateOrder, validateProductQuantity, validateCustomerInfo, validateCustomerOrder, 
       validateProductOrder, isLoggedIn, isAdmin} = require('../middleware'); // middleware for validation 
const catchAsync = require('../utils/catchAsync'); // wraper for error catching of async func.

router.route('/')
    .get(isLoggedIn, catchAsync(orders.index))
    .post(isLoggedIn, isAdmin, validateOrder, catchAsync(orders.createOrder))

router.get('/new',isLoggedIn, orders.renderNewForm)

router.route('/:id')
    .get(isLoggedIn, catchAsync(orders.showOrder))
    .put(isLoggedIn, isAdmin, validateOrder, catchAsync(orders.updateOrder))
    .delete(isLoggedIn, isAdmin, catchAsync(orders.deleteOrder))

router.get('/:id/edit',isLoggedIn, catchAsync(orders.renderEditForm))
router.get('/:id/print',isLoggedIn, catchAsync(orders.printOrder))

router.get('/:id/products',isLoggedIn, catchAsync(orders.searchProductOrder))
router.get('/:id/customers',isLoggedIn, catchAsync(orders.searchCustomerOrder))

router.post('/:id/close',isLoggedIn, isAdmin, catchAsync(orders.closeOrder))

router.get('/:id/customers/:customerId/edit',isLoggedIn, catchAsync(orders.renderCustomerEditForm))
router.get('/:id/products/:productId/edit',isLoggedIn, catchAsync(orders.renderProductEditForm))

router.route('/:id/products/:productId')
    .post(isLoggedIn, isAdmin, validateProductQuantity, catchAsync(orders.createProductOrder))    
    .put(isLoggedIn, isAdmin, validateProductOrder, catchAsync(orders.updateProductOrder))
    .delete(isLoggedIn, isAdmin, catchAsync(orders.deleteProductOrder))

router.route('/:id/customers/:customerId')
    .post(isLoggedIn, isAdmin, validateCustomerInfo, catchAsync(orders.createCustomerOrder)) 
    .put(isLoggedIn, isAdmin, validateCustomerOrder, catchAsync(orders.updateCustomerOrder))   
    .delete(isLoggedIn, isAdmin, catchAsync(orders.deleteCustomerOrder))

// Put new before /:id to prevent route /:id to process
module.exports = router;