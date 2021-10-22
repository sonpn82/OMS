const Customer = require('../models/customer');  // customer model import

module.exports.index = async (req, res) => {   

    let customers = {};

    // have filter or not
    if (req.query.q)    {
        if (isNaN(req.query.q.charAt(0))) {
           // Tìm theo tên khách
           customers = await Customer.find({ name: { $regex: req.query.q}})

        } else {
             // Tìm theo số điện thoại         
             customers = await Customer.find({ phone: { $regex: req.query.q}})                    
        }        
    } else {
        customers = await Customer.find({})
    }

    res.render('customers/index', {customers})
}

module.exports.renderNewForm = (req, res) => {    
    res.render('customers/new')
}

module.exports.createCustomer = async (req, res, next) => {
    const customer = new Customer(req.body.customer);  
    await customer.save() 
    req.flash('success', 'Tạo khách hàng mới thành công!')   
    res.redirect(`/customers/${customer._id}`)  
}

module.exports.showCustomer = async (req, res, next) => {
    const customer = await Customer.findById(req.params.id)
    if(!customer) {
        req.flash('error', 'Không tìm được khách hàng!')
        return res.redirect('/customers')
    }
    res.render('customers/show', {customer})
}

module.exports.renderEditForm = async (req, res, next) => {
    const customer = await Customer.findById(req.params.id)
    if(!customer) {
        req.flash('error', 'Không tìm được khách hàng!')
        return res.redirect('/customers')
    }   
    
    res.render('customers/edit', {customer})
}

module.exports.updateCustomer = async (req, res, next) => {
    const {id} = req.params;
    const customer = await Customer.findByIdAndUpdate(id, {...req.body.customer});
    if(!customer) {
        req.flash('error', 'Không tìm được khách hàng!')
        return res.redirect('/customers')
    }  
    await customer.save(); 
    req.flash('success', 'Cập nhật khách hàng thành công!')
    res.redirect(`/customers/${customer._id}`)
}

module.exports.deleteCustomer = async (req, res, next) => {
    const {id} = req.params;
    const customer = await Customer.findByIdAndDelete(id)
    req.flash('success', 'Xóa khách hàng thành công!')
    res.redirect('/customers')
}