var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');

utils = require("./api/utils");
appConfig = require("./config/dev.json");
texts = require("./asset/texts.json");
logger = require("./api/services/logService");

// MQService = require("./api/services/MQService");
// MQService.consume('actions');

const neo4j = require('neo4j-driver')
neo4jDriver = neo4j.driver(appConfig.neo4j.url, neo4j.auth.basic(appConfig.neo4j.user, appConfig.neo4j.password), {
    maxTransactionRetryTime: 30000
})

app.listen(port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var userRoutes = require('./api/routes/userRoutes');
userRoutes(app);

var foldersRoutes = require('./api/routes/foldersRoutes');
foldersRoutes(app);

var classRoutes = require('./api/routes/classRoutes');
classRoutes(app);

var objectRoutes = require('./api/routes/objectRoutes');
objectRoutes(app);

var eventRoutes = require('./api/routes/eventRoutes');
eventRoutes(app);

var myRoutes = require('./api/routes/myRoutes');
myRoutes(app);

var systemRoutes = require('./api/routes/systemRoutes');
systemRoutes(app);

// Post token.
// app.post('/oauth/token', app.oauth.token());

// Get authorization.
app.get('/oauth/authorize', function(req, res) {
    // Redirect anonymous users to login page.
    if (!req.app.locals.user) {
        return res.redirect(util.format('/login?redirect=%s&client_id=%s&redirect_uri=%s', req.path, req.query.client_id, req.query.redirect_uri));
    }

    return render('authorize', {
        client_id: req.query.client_id,
        redirect_uri: req.query.redirect_uri
    });
});

// Post authorization.
app.post('/oauth/authorize', function(req, res) {
    // Redirect anonymous users to login page.
    if (!req.app.locals.user) {
        return res.redirect(util.format('/login?client_id=%s&redirect_uri=%s', req.query.client_id, req.query.redirect_uri));
    }

    return app.oauth.authorize();
});

// app.get('/login', function(req) {
    // return render('login', {
        // redirect: req.query.redirect,
        // client_id: req.query.client_id,
        // redirect_uri: req.query.redirect_uri
    // });
// });

// app.post('/login', function(req, res) {
    // console.log('login, req.body', req.body);
    // if (req.body.email !== 'a@a.a') {
        // return render('login', {
            // redirect: req.body.redirect,
            // client_id: req.body.client_id,
            // redirect_uri: req.body.redirect_uri
        // });
    // }

    // var path = req.body.redirect || '/home';

    // return res.redirect(util.format('/%s?client_id=%s&redirect_uri=%s', path, req.query.client_id, req.query.redirect_uri));
// });

// Get secret.
// app.get('/', app.oauth.authenticate(), function(req, res) {
    // Will require a valid access_token.
    // res.send('Secret area');
// })

app.get('/public', function(req, res) {
    // Does not require an access_token.
    res.send('Public area');
});

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'});
});

// Catch exit
function exitHandler(options, exitCode) {
    if (options.cleanup) {
        console.log('cleaning');
        neo4jDriver.close();
    }
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

// process.stdin.resume();//so the program will not close instantly

// process.on('exit', exitHandler.bind(null, {cleanup:true}, 1));//do something when app is closing
// process.on('SIGINT', exitHandler.bind(null, {exit:true}, 2));//catches ctrl+c event
// process.on('SIGUSR1', exitHandler.bind(null, {exit:true}, 3));// catches "kill pid" (for example: nodemon restart)
// process.on('SIGUSR2', exitHandler.bind(null, {exit:true}, 4));
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}, 5));//catches uncaught exceptions

console.log('Graphsystem server started on: ' + port);