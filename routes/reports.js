const express = require('express');
const router = express.Router();
const reports = require('../controllers/reports'); // controller for report
const catchAsync = require('../utils/catchAsync'); // wraper for error catching of async func.
const {isLoggedIn} = require('../middleware'); // middleware for validation 

router.route('/productRemain')
    .get(isLoggedIn, catchAsync(reports.productRemainReport))

router.route('/saleDetail')
    .get(isLoggedIn, catchAsync(reports.saleDetailReport))
    .post(isLoggedIn, catchAsync(reports.saleDetailReport))

// Put new before /:id to prevent route /:id to process
module.exports = router;