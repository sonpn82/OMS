// To verify submit data after form-submision
// To prevent invalid data submit which by-pass the html validation
const BaseJoi = require('joi'); // input validation
const sanitizeHTML = require('sanitize-html');

// Extension for joi to prevent HTML injection
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
})

const Joi = BaseJoi.extend(extension);

module.exports.productSchema = Joi.object({
    product: Joi.object({
        name: Joi.string().required().escapeHTML(),
        manufacturer: Joi.string().required().escapeHTML(),
        quantity: Joi.number().required().min(0),
        quantity_sale: Joi.number().min(0),
        price_base: Joi.number().required().min(0),
        price_sell: Joi.number().required().min(0),
        sale: Joi.number().required().min(0).max(100),
        date: Joi.date().required(),
        note: Joi.string().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.customerSchema = Joi.object({
    customer: Joi.object({
        name: Joi.string().required().escapeHTML(),
        address: Joi.string().required().escapeHTML(),
        phone: Joi.string().required().escapeHTML(),
        note: Joi.string().escapeHTML()
    }).required()
})

module.exports.orderSchema = Joi.object({
    order: Joi.object({
        no: Joi.string().required().escapeHTML(),
        date: Joi.date().required(),
        note: Joi.string().escapeHTML(),
        close: Joi.boolean(),
        products: Joi.object({
            name: Joi.string().required().escapeHTML(),
            price_base: Joi.number().min(0),
            price_sell: Joi.number().required().min(0),
            sale: Joi.number().required().min(0).max(100),
            quantity: Joi.number().required().min(0)
        }),
        customers: Joi.object({
            name: Joi.string().required().escapeHTML(),
            address: Joi.string().required().escapeHTML(),
            phone: Joi.string().required().escapeHTML(),
            shipFee: Joi.number().min(0)
        })
    }).required()
})

module.exports.customerOrderSchema = Joi.object({
    customers: Joi.object({
        name: Joi.string().required().escapeHTML(),
        address: Joi.string().required().escapeHTML(),
        phone: Joi.string().required().escapeHTML(),
        shipFee: Joi.number().min(0)
    }).required()
})

module.exports.productOrderSchema = Joi.object({
    products: Joi.object({
        name: Joi.string().required().escapeHTML(),
        manufacturer: Joi.string().required().escapeHTML(),
        price_base: Joi.number().min(0),
        price_sell: Joi.number().required().min(0),
        sale: Joi.number().required().min(0).max(100),
        quantity: Joi.number().required().min(0)
    }).required()
})


