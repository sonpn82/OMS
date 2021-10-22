const mongoose = require('mongoose');  // connect to mongo database
const Schema = mongoose.Schema;  // mongoose schema

const ProductOrderSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    price_base: {
        type: Number,
        required: true
    },
    price_sell: {
        type: Number,
        required: true
    },
    sale: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    id_origin: {
        type: String,
        required: true
    }
})

ProductOrderSchema.virtual('price_afterSale').get(function() {
    return Math.round((this.price_sell * (1 - this.sale/100))/100)*100;
})

ProductOrderSchema.virtual('price_total').get(function() {
    return this.price_afterSale * this.quantity
})

ProductOrderSchema.virtual('price_base_total').get(function() {
    return this.price_base * this.quantity
})

const CustomerOrderSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    shipFee: {
        type: Number
    }
})

const OrderSchema = new Schema({      
    no: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true               
    },
    note: {
        type: String
    },
    close: {
        type: Boolean,
        required: true
    },
    products: [ProductOrderSchema],
    customers: CustomerOrderSchema,    
})

OrderSchema.virtual('totalPrice').get(function() {   
   
    if (!this.customers || !this.products || !this.products.length) return 0;
    
    let total = 0

    for(let i=0; i< this.products.length; i++) {      
        total += parseFloat(this.products[i].price_total)
    }  

    return total + this.customers.shipFee;
})

OrderSchema.virtual('profit').get(function() {
    if (this.totalPrice === 0) return 0;

    let total = 0

    for(let i=0; i< this.products.length; i++) {     
        total += parseFloat(this.products[i].price_base_total)
    }  

    return this.totalPrice - total - this.customers.shipFee
})

const Order = mongoose.model('Order', OrderSchema);
const ProductOrder = mongoose.model('ProductOrder', ProductOrderSchema);
const CustomerOrder = mongoose.model('CustomerOrder', CustomerOrderSchema);
module.exports = {Order, ProductOrder, CustomerOrder};


