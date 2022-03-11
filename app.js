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
const flash = require('express-flash');
const path = require('path');
const passport = require('passport');
const sass = require('node-sass-middleware');

// additional dependencies
const fs = require('fs');
const util = require('util');
fs.readFileAsync = util.promisify(fs.readFile);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Create Express server.
 */
const app = express();

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

// All of our static files that express will automatically server for us.
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/semantic', express.static(path.join(__dirname, 'semantic'), { maxAge: 31557600000 }));

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
        'Topic'
    ];

    // if sub_section is not defined, it is defaulted to the first subsection value
    const activeSubsection = req.params.sectionValue || 'general_resources_for_immigrant_communities';

    res.render('resources', {
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

    let faqsInfo;
    const faqsData = await fs.readFileAsync(`${__dirname}/public/json/faqsInfo.json`);
    faqsInfo = JSON.parse(faqsData.toString());

    const sectionTitles = [
        'Topic',
        // 'Pregnancy',
        // 'COVID-19',
    ]

    const activeSubsection = req.params.sectionValue || 'public_benefits';

    res.render('QandA2', {
        title: 'Questions and Answers',
        headerInfo,
        sectionTitles,
        faqsInfo,
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