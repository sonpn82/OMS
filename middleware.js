const { productSchema, customerSchema, orderSchema, productOrderSchema, customerOrderSchema } = require('./schemas'); // joi schema validiation
const ExpressError = require('./utils/ExpressError'); // customized error class

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Cần đăng nhập!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAdmin = (req, res, next) => {
    if(!req.user.isAdmin) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Cần đăng nhập bằng Admin')
        return res.redirect('/login');
    }
    next();
}

module.exports.isOwner = (req, res, next) => {
    if(!req.user.isOwner) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Cần đăng nhập bằng Owner')
        return res.redirect('/login');
    }
    next();
}

// to validate Product schema from req body
module.exports.validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(','); // extract message from each error detail
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// to validate Product schema of order from req body
module.exports.validateProductOrder = (req, res, next) => {
    const { error } = productOrderSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(','); // extract message from each error detail
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// to validate Customer schema from req body
module.exports.validateCustomer = (req, res, next) => {
    const { error } = customerSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(','); // extract message from each error detail
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// to validate Customer schema of order from req body
module.exports.validateCustomerOrder = (req, res, next) => {
    const { error } = customerOrderSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(','); // extract message from each error detail
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// to validate Order schema from req body
module.exports.validateOrder = (req, res, next) => {
    const { error } = orderSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(','); // extract message from each error detail
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// to validate quantity for product of order
module.exports.validateProductQuantity = (req, res, next) => {
    // Check if quantity of item is valid
    const productQuantity = req.body.productQuantity[0];      

    let isErr = !isPositiveNumber(productQuantity);
    let msg = 'Số lượng không hợp lệ!'

    if (isErr) {
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// to validate quantity for product of order
module.exports.validateCustomerInfo = (req, res, next) => {    

    // Check if address is valid
    const customerAddress = req.body.customerAddress[0];
    const forbidCharacters = ['<', '>', '*'];  

    let isErr = false;
    if (!customerAddress) isErr = true;

    for (let c in forbidCharacters) {
        if (customerAddress.includes(forbidCharacters[c])) {
            isErr = true;          
            break;
        }
    }    

    let msg = 'Địa chỉ không hợp lệ!'

    if (!isErr) {
        const shipFee = req.body.shipFee[0]; 
        isErr = !isPositiveNumber(shipFee);
        if (isErr) msg = 'Phí ship không hợp lệ!'
    }       
    
    if (isErr) {
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Check if a number is positive (>=0) or not
const isPositiveNumber = function(x) {
    let isErr = isNaN(x);
    if (!isErr) {
        isErr = parseInt(x) < 0 ? true : false;
    }
    return !isErr
}

