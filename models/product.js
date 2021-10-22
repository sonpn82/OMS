const mongoose = require('mongoose');  // connect to mongo database
const Schema = mongoose.Schema;  // mongoose schema
const { cloudinary } = require('../cloudinary');

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200'); // for create image thumbnail on Cloudinary
})

const opts = {toJSON: {virtuals: true}}; // allow JSON.stringify to print out virtual properties

const ProductSchema = new Schema({
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
    quantity: {
        type: Number,
        required: true
    },
    quantity_sale:{
        type: Number,
        required: true
    },
    note: String,
    images: [ImageSchema],
    date: {
        type: Date,
        required: true
    },
    sale: Number
}, opts);

ProductSchema.virtual('quantity_remain').get(function() {
    return this.quantity - this.quantity_sale;
})

// Delete product images on cloudinary also
ProductSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {      
        for(let i=0; i < doc.images.length; i++) {        
            await cloudinary.uploader.destroy(doc.images[i].filename);
        }
    }
})

module.exports = mongoose.model('Product', ProductSchema)