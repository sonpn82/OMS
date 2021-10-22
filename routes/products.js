const express = require('express');
const router = express.Router();
const products = require('../controllers/products'); // controller for product
const {validateProduct, isLoggedIn, isAdmin} = require('../middleware'); // middleware for validation 
const catchAsync = require('../utils/catchAsync'); // wraper for error catching of async func.
const multer = require('multer');  // middleware for upload file
const {storage} = require('../cloudinary');
const upload = multer({storage});
//const upload = multer({dest: 'uploads/'})

router.route('/')
    .get(isLoggedIn, catchAsync(products.index))
    .post(isLoggedIn, isAdmin, upload.array('images'), validateProduct, catchAsync(products.createProduct))

router.get('/new',isLoggedIn, products.renderNewForm)

router.route('/:id')
    .get(isLoggedIn, catchAsync(products.showProduct))
    .put(isLoggedIn, isAdmin, upload.array('images'),  validateProduct, catchAsync(products.updateProduct))
    .delete(isLoggedIn, isAdmin, catchAsync(products.deleteProduct))

router.get('/:id/edit',isLoggedIn, catchAsync(products.renderEditForm))

// Put new before /:id to prevent route /:id to process
module.exports = router;