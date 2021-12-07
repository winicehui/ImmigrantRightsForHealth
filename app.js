/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const sass = require('node-sass-middleware');
const multer = require('multer');

// additional dependencies
const fs = require('fs');
const util = require('util');
fs.readFileAsync = util.promisify(fs.readFile);

// const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Controllers (route handlers).
 */
// const homeController = require('./controllers/home');
// const userController = require('./controllers/user');
// const apiController = require('./controllers/api');
// const contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
// const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);
// mongoose.connect(process.env.MONGODB_URI);
// mongoose.connection.on('error', (err) => {
//   console.error(err);
//   console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
//   process.exit();
// });

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// Compresses all responses: Compression decreases the downloadable amount of data that is served to users. Through the use of compression, we can improve the performance of the Node.js application as our payload size is reduced drastically.
app.use(compression());
// https://www.npmjs.com/package/node-sass-middleware Put JS, CSS, HTML files below the public directory, and they will be compressed.
app.use(sass({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Define our session.
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    // store: new MongoStore({
    //   url: process.env.MONGODB_URI,
    //   autoReconnect: true,
    // })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    if (req.path === '/api/upload') {
        // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
        next();
    } else {
        lusca.csrf()(req, res, next);
    }
});

// security settings in our http header
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');

// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });
// app.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user
//     && req.path !== '/login'
//     && req.path !== '/signup'
//     && !req.path.match(/^\/auth/)
//     && !req.path.match(/\./)) {
//     req.session.returnTo = req.originalUrl;
//   } else if (req.user
//     && (req.path === '/account' || req.path.match(/^\/api/))) {
//     req.session.returnTo = req.originalUrl;
//   }
//   next();
// });

// All of our static files that express will automatically server for us.
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/semantic', express.static(path.join(__dirname, 'semantic'), { maxAge: 31557600000 }));

// app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
// app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
// app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
// app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
// app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 * (In alphabetical order)
 */

// Main route is the landing page
app.get('/', async function(req, res) {
    let headerInfo;
    const headerData = await fs.readFileAsync(`${__dirname}/public/json/headerInfo.json`);
    headerInfo = JSON.parse(headerData.toString());

    let homeInfo;
    const homeData = await fs.readFileAsync(`${__dirname}/public/json/homePageInfo.json`);
    homeInfo = JSON.parse(homeData.toString());

    res.render('home', {
        title: 'Home',
        headerInfo,
        affiliationsInformation: homeInfo["affiliationsInformation"],
        faqsInformation: homeInfo["faqsInformation"]
    });
});

// route for resources
app.get('/resources/:sectionValue?', async function(req, res) {
    let headerInfo;
    const headerData = await fs.readFileAsync(`${__dirname}/public/json/headerInfo.json`);
    headerInfo = JSON.parse(headerData.toString());

    let resourcesInfo;
    const resourcesData = await fs.readFileSync(`${__dirname}/public/json/resourcesInfo.json`);
    resourcesInfo = JSON.parse(resourcesData.toString());

    const sectionTitles = [
        'General',
        'COVID-19'
    ];

    // if sub_section is not defined, it is defaulted to the first subsection value
    const activeSubsection = req.params.sectionValue || 'general_resources_for_immigrant_communities';

    res.render('resources3', {
        title: 'Resources',
        headerInfo,
        sectionTitles,
        resourcesInfo,
        activeSubsection
    });
});

// route for resources2
app.get('/resources2/:sectionValue?', async function(req, res) {
    let headerInfo;
    const headerData = await fs.readFileAsync(`${__dirname}/public/json/headerInfo.json`);
    headerInfo = JSON.parse(headerData.toString());

    let resourcesInfo;
    const resourcesData = await fs.readFileSync(`${__dirname}/public/json/resourcesInfo.json`);
    resourcesInfo = JSON.parse(resourcesData.toString());

    const sectionTitles = [
        'General',
        'COVID-19'
    ];

    // if sub_section is not defined, it is defaulted to the first subsection value
    const activeSubsection = req.params.sectionValue || 'general_resources_for_immigrant_communities';

    res.render('resources2', {
        title: 'Resources',
        headerInfo,
        sectionTitles,
        resourcesInfo,
        activeSubsection
    });
});

// route for Questions and Answers
app.get('/QandA/:sectionValue?', async function(req, res) {
    let headerInfo;
    const headerData = await fs.readFileAsync(`${__dirname}/public/json/headerInfo.json`);
    headerInfo = JSON.parse(headerData.toString());

    let pregnancyQandAInfo;
    const pregnancyQandAData = await fs.readFileAsync(`${__dirname}/public/json/pregnancyFAQInfo2.json`);
    pregnancyQandAInfo = JSON.parse(pregnancyQandAData.toString());

    const sectionTitles = [
        'Pregnancy',
        'COVID-19',
        'Public Charge'
    ]

    const activeSubsection = req.params.sectionValue || 'pregnancy_planning';

    res.render('QandA2', {
        title: 'Questions and Answers',
        headerInfo,
        sectionTitles,
        pregnancyQandAInfo,
        activeSubsection
    });
});

// route for Team page
app.get('/team', async function(req, res) {
    let headerInfo;
    const headerData = await fs.readFileAsync(`${__dirname}/public/json/headerInfo.json`);
    headerInfo = JSON.parse(headerData.toString());

    res.render('team', {
        title: 'Team',
        headerInfo
    });
})

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorHandler());
} else {
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).send('Server Error');
    });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;