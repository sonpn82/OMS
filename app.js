if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express'); // frame work
const path = require('path'); //absolute path
const flash = require('connect-flash'); // flash for 1 time message
const mongoose = require('mongoose'); // connect with mongo
const ejsMate = require('ejs-mate'); // to make boiler plate
const session = require('express-session'); // to create session
const methodOverride = require('method-override'); // to do .put, .patch, .delete ...
const passport = require('passport'); // for authentication login
const LocalStrategy = require('passport-local'); // for authentication login
const User = require('./models/user'); 
const mongoSanitize = require('express-mongo-sanitize'); // to prevent sql like injection attack using $%: ... character
const helmet = require('helmet'); // security package
const ExpressError = require('./utils/ExpressError'); // our customized error class
const MongoStore = require('connect-mongo'); // save session data on mongo

const productRoutes = require('./routes/products'); // route for product
const customerRoutes = require('./routes/customers'); // route for customer
const orderRoutes = require('./routes/orders'); // route for order
const reportRoutes = require('./routes/reports'); // route for report
const userRoutes = require('./routes/users'); // route for user

const dbUrl = process.env.DB_URL; // url for online mongo
//const dbUrl = 'mongodb://localhost:27017/order-management'; // local database

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!')
})

const app = express();

app.engine('ejs', ejsMate); // set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // absolute path

app.use(express.urlencoded({extended: true})) // to parse body of req in urlencoded type
app.use(methodOverride('_method')); // let html use delete, put ... verb rather than get & post
app.use(express.static(path.join(__dirname, 'public'))) // serve public folder to client
app.use(mongoSanitize({replaceWith: '_'})); // prevent using $#: ... characters, replaced with _

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/tongyang/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret' ; // secret for session connect

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // interval between session update in sec
    crypto: {
        secret
    }
});  

const sessionConfig = {
    name: 'session',
    secret,
    store: store,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,   // only server can access client cookie, to improve security
        expires: Date.now() + 1000*60*60*24*7,   // in milisec, 1 week later
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); // should put after app.use(session)

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success'); // middleware to access flash local var. Put before all routes.
    res.locals.error = req.flash('error');
    next();
})

// Start of routes
app.use('/', userRoutes);
app.use('/products', productRoutes); // routes to all /products/xyz in the product routes folder
app.use('/customers', customerRoutes); // routes to all /customers/xyz in the customer routes folder
app.use('/orders', orderRoutes); // routes to all /orders/xyz in the order routes folder
app.use('/reports', reportRoutes); // routes to all reports

app.get('/', async (req, res) => {
    res.render('home')
})

// Error feedback for invalid link, should be put at final after all routes!
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404))
})

// Error catcher!
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error', {err})
})

const port = process.env.PORT || 3000; // port for listening
app.listen(port, () => {
    console.log(`Serving on port: ${port}`)
})