const { Order, ProductOrder, CustomerOrder } = require('../models/order');  // order model import
const Product = require('../models/product'); // product model import
const Customer = require('../models/customer'); // customer model import

module.exports.index = async (req, res) => {  

    let orders = {};

    // have filter or not
    if (req.query.q)    {
        if (req.query.q.charAt(0) === '#') {
            // Find by order id
            orders = await Order.find({ no: { $regex: req.query.q }}) 
        } else {
            // Find by customer name
            orders = await Order.find({'customers.name': { $regex: req.query.q}});
        }               
    } else {
        orders = await Order.find({})     
    }

    res.render('orders/index', { orders })
}

module.exports.renderNewForm = (req, res) => {
    res.render('orders/new')
}

module.exports.createOrder = async (req, res, next) => {
    const order = new Order(req.body.order);
    order.close = false;
    await order.save()
    req.flash('success', 'Tạo đơn hàng thành công!')
    res.redirect(`/orders/${order._id}`)
}

module.exports.showOrder = async (req, res, next) => {

    const order = await Order.findById(req.params.id)
    if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    }
  
    let findProducts = {}  
    let findCustomers = {}    

    res.render('orders/show', { order, findProducts, findCustomers })    
}

module.exports.printOrder = async (req, res, next) => {

    const order = await Order.findById(req.params.id)
    if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    } 
   
    res.render('orders/print', { order })    
}

module.exports.closeOrder = async (req, res, next) => {

    const order = await Order.findById(req.params.id)
    
    if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    } 
  
    order.close = !order.close; // change status of order

    for (let productOrder of order.products) {
        const product = await Product.findById(productOrder.id_origin);
        const quantity_sale = order.close ? product.quantity_sale + productOrder.quantity : product.quantity_sale - productOrder.quantity;
        
        if (quantity_sale > product.quantity) {
            // flash message can not update product
            req.flash('error', `Hàng đặt: ${quantity_sale} nhiều hơn hàng tồn: ${product.quantity_remain}`)
        } else {
            product.quantity_sale = quantity_sale;
        }
        await product.save()
    }  

    await order.save();
    req.flash('success', order.close ? 'Chốt đơn thành công!' : 'Hủy đơn thành công!');

    res.redirect(`/orders/${order._id}`)
}

module.exports.renderEditForm = async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if(!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    }
    res.render('orders/edit', {order})
}

module.exports.updateOrder = async (req, res, next) => {
    const {id} = req.params;   
    const order = await Order.findByIdAndUpdate(id, {...req.body.order})
    await order.save();
 
    req.flash('success', 'Cập nhật đơn hàng thành công!')
    res.redirect(`/orders/${order._id}`)
}

module.exports.renderCustomerEditForm = async (req, res, next) => {
    const { id } = req.params; 
    const order = await Order.findById(id)
    if(!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    }
   
    res.render('orders/customerEdit', {order})
}

module.exports.updateCustomerOrder = async (req, res, next) => {
    const {id} = req.params;   
    const customers = req.body.customers

    const order = await Order.findById(id)
    if(!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    }

    order.customers = customers
    await order.save();
 
    req.flash('success', 'Cập nhật khách hàng thành công!')
    res.redirect(`/orders/${order._id}`)
}

module.exports.renderProductEditForm = async (req, res, next) => {
    const { id, productId } = req.params; 
    const order = await Order.findById(id)
    if(!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    }
    const products = order.products.id(productId);
    if(!products) {
        req.flash('error', 'Không tìm thấy sản phẩm!')
        return res.redirect('/orders')
    }
    res.render('orders/productEdit', {order, products})
}

module.exports.updateProductOrder = async (req, res, next) => {
    const {id, productId} = req.params;   
    const products = req.body.products

    const order = await Order.findById(id)
    if(!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    }

    if(!order.products.id(productId)) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    }    

    order.products.id(productId).price_sell = products.price_sell
    order.products.id(productId).sale = products.sale
    order.products.id(productId).quantity = products.quantity

    await order.save();
 
    req.flash('success', 'Cập nhật sản phẩm thành công!')
    res.redirect(`/orders/${order._id}`)
}


module.exports.searchProductOrder = async (req, res, next) => {

    const order = await Order.findById(req.params.id)
    if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    }
    // Check if have any search term

    let findProducts = {}
    let findCustomers = {}   

    if (req.query.q) {
        // Find product with name              
        findProducts = await Product.find({ name: { $regex: req.query.q } })               
    }

    res.render('orders/show', { order, findProducts, findCustomers })
}

module.exports.searchCustomerOrder = async (req, res, next) => {

    const order = await Order.findById(req.params.id)
    if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect('/orders')
    }
    // Check if have any search term
    let findProducts = {}
    let findCustomers = {}   

    if (req.query.q) {
        // Find customer with name
        findCustomers = await Customer.find({ name: { $regex: req.query.q } })
    }

    res.render('orders/show', { order, findProducts, findCustomers })
}

// Input product into list of product in a Order
module.exports.createProductOrder = async (req, res, next) => {

    const { id, productId } = req.params;  
    const productQuantity = req.body.productQuantity[0]; 

    const order = await Order.findById(id)
    if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect(`/orders`)
    }

    // Find the product to add to order 
    const addProduct = await Product.findById(productId)
    if (addProduct) {

        // Check if quantity order > quantity remain
        if (productQuantity > addProduct.quantity_remain) {
             req.flash('error', `Hàng đặt: ${productQuantity} nhiều hơn hàng tồn: ${addProduct.quantity_remain}`)
            return res.redirect(`/orders/${id}`);
        }

        const productOrder = new ProductOrder({
            name: addProduct.name,
            manufacturer: addProduct.manufacturer,
            price_base: addProduct.price_base,
            price_sell: addProduct.price_sell,
            sale: addProduct.sale,
            quantity: productQuantity,
            id_origin: addProduct._id
        })
        order.products.push(productOrder)
        await order.save()        
        req.flash('success', 'Thêm sản phẩm thành công!') 
    }

    res.redirect(`/orders/${id}`)
}

module.exports.createCustomerOrder = async (req, res, next) => {

    const { id, customerId } = req.params;  
    const shipAddress = req.body.customerAddress[0]; 
    const shipFee = req.body.shipFee[0];

    const order = await Order.findById(id)
    if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect(`/orders`)
    }

    // Find the customer to add to order 
    const addCustomer = await Customer.findById(customerId)
    if (addCustomer) {
        order.customers = new CustomerOrder({
            name: addCustomer.name,
            address: shipAddress,
            phone: addCustomer.phone,
            shipFee: shipFee            
        })
        
        await order.save()        
         req.flash('success', 'Thêm khách hàng thành công!') 
    }

    res.redirect(`/orders/${id}`)
}

module.exports.deleteProductOrder = async (req, res, next) => {
    const { id, productId } = req.params;
    const order = await Order.findById(id)
    if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect(`/orders`)
    }

    // Find the product to add to order   
    if (!order.products.id(productId)) {
        req.flash('error', 'Không tìm thấy sản phẩm!')
        return res.redirect(`/orders`)
    }

    order.products.id(productId).remove();
    await order.save()
    req.flash('success', 'Xóa sản phẩm thành công!')

    res.redirect(`/orders/${id}`)

}

module.exports.deleteCustomerOrder = async (req, res, next) => {
    const { id, customerId } = req.params;
    const order = await Order.findById(id)
    if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!')
        return res.redirect(`/orders`)
    }

    // Find the customer to add to order   
    if (!order.customers) {
        req.flash('error', 'Không tìm thấy khách hàng!')
        return res.redirect(`/orders`)
    }

    order.customers.remove();
    await order.save()
    req.flash('success', 'Xóa khách hàng thành công!')

    res.redirect(`/orders/${id}`)

}

module.exports.deleteOrder = async (req, res, next) => {
    const {id} = req.params;
    const order = await Order.findByIdAndDelete(id)
    req.flash('success', 'Xóa đơn thành công!')
    res.redirect('/orders')
}
