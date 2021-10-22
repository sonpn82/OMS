const { cloudinary } = require('../cloudinary'); // cloud storage
const Product = require('../models/product');  // product model import

module.exports.index = async (req, res) => {

    let products = {};

    // have filter or not
    if (req.query.q)    {
        if (req.query.q.charAt(0) === '#') {
            // Find by manufacturer
            products = await Product.find({ manufacturer: { $regex: req.query.q.slice(1)}});
        } else {
            // Find by product name
            products = await Product.find({ name: { $regex: req.query.q}});
        }
       
    } else {
        products = await Product.find({})
    }   
    
    res.render('products/index', {products})
}

module.exports.renderNewForm = (req, res) => {    
    res.render('products/new')
}

module.exports.createProduct = async (req, res, next) => {
    const product = new Product(req.body.product);   
    product.quantity_sale = 0; // set sale qty = 0
    product.images = req.files.map(f => ({url: f.path, filename: f.filename}));
   
    await product.save()
    req.flash('success', 'Tạo sản phẩm thành công!')
    res.redirect(`/products/${product._id}`)  
}

module.exports.showProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if(!product) {
        req.flash('error', 'Không tìm thấy sản phẩm!')
        return res.redirect('/products')
    }
    res.render('products/show', {product})
}

module.exports.renderEditForm = async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if(!product) {
        req.flash('error', 'Không tìm thấy sản phẩm!')
        return res.redirect('/products')
    }   
    
    res.render('products/edit', {product})
}

module.exports.updateProduct = async (req, res, next) => {
    const {id} = req.params;
    const product = await Product.findByIdAndUpdate(id, {...req.body.product})
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));  

    product.images.push(...imgs); // spread out array before using push
    await product.save();
    req.flash('success', 'Cập nhật sản phẩm thành công!')
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            console.log(filename);
            await cloudinary.uploader.destroy(filename);
        }
        await product.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    res.redirect(`/products/${product._id}`)
}

module.exports.deleteProduct = async (req, res, next) => {
    const {id} = req.params;
    const product = await Product.findByIdAndDelete(id)
    req.flash('success', 'Xóa sản phẩm thành công!')
    res.redirect('/products')
}