global.__base = __dirname + '/';

var
    use_https     = true,
    argv          = require('minimist')(process.argv.slice(2)),
    https         = require('https'),
    fs            = require('fs'),
    app           = require('express')(),
    _             = require('lodash'),
    parser        = require('xmldom').DOMParser,
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    sendPostRequest = require('request').post;
    nodemailer = require('nodemailer');

var gameport;

const gmailCreds = require('./gmail_creds.json');
require('dotenv/config');

if(argv.gameport) {
    gameport = argv.gameport;
    console.log('using port ' + gameport);
} else {
    gameport = 9002;
    console.log(`no gameport specified: using ${gameport}\nUse the --gameport flag to change`);
}

var mode;
if(argv.mode) {
    mode = argv.mode;
    console.log('using mode ' + mode);
} else {
    mode = "CDM";
    console.log('no mode specified: using CDM\nUse the --mode flag to change');
}

try {
    let credentials = process.env.CREDENTIALS_PATH || 'credentials/';
    var privateKey  = fs.readFileSync(`${credentials}ssl_key.pem`),
        certificate = fs.readFileSync(`${credentials}ssl_cert.pem`),
        options     = {key: privateKey, cert: certificate},
        server      = require('https').createServer(options,app).listen(gameport),
        io          = require('socket.io')(server, {
			path: '/kiddraw/socket.io'});
} catch (err) {
    console.log("cannot find SSL certificates; falling back to http");
    var server      = app.listen(gameport),
        io          = require('socket.io')(server, {
			path: '/kiddraw/socket.io'});
}

app.get('/*', (req, res) => {
    serveFile(req, res);
});


// var socket = io.connect('http://localhost:8001');

io.on('connection', function (socket) {
    socket.on('current_data', function(data) {
        console.log('current_data received: ' + JSON.stringify(data));
        writeDataToMongo(data);
    });

    socket.on('stroke', function(data) {
        console.log('stroke data received: ' + JSON.stringify(data));
        var xmlDoc = new parser().parseFromString(data['svg']);
        var svgData = xmlDoc.documentElement.getAttribute('d');
        data['svg'] = svgData;
        writeDataToMongo(data);
    })

});

var serveFile = function(req, res) {
    var fileName = req.params[0] || 'index.html';

    if (fileName == "send"){
        console.log('sending the consent form to the parent email');
        sendEmail(req,res);

    }else if(fileName == "mode"){
        console.log ("mode: " + mode);
        res.send({'mode':mode});

    }else{
        console.log('\t :: Express :: file requested: ' + fileName);
        if (req.query.mode) {
            res.set('X-App-Mode', req.query.mode);  
            console.log('Query mode set in header:', req.query.mode);
        }
        return res.sendFile(fileName, {root: __dirname});
    }

};

var writeDataToMongo = function(data) {
    sendPostRequest(
        'http://ucsdlearninglabs.org:9001/db/insert',
        { json: data },
        (error, res, body) => {
        if (!error && res.statusCode === 200) {
            console.log(`sent data to store`);
        } else {
            console.log(`error sending data to store: ${error} ${body}`);
        }
    });
};

var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: gmailCreds.user,
        pass: gmailCreds.password
    }
});

function sendEmail(req,res) {
    var mailOptions = {
        from: 'tsepuri@ucsd.edu',
        to: req.query.email,
        subject: 'Copy of Consent Form - Stanford Language and Cognition Lab',
        text: "Dear parents, Please find attached the copy of the consent form from the drawing station at the CDM. Thank you!!",
        attachments: [
        {
            filename: 'consentForm.pdf',
            path:'consentForm.pdf',
            contentType: 'application/pdf'
        }]
    };

    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            res.end("error");
        } else {
            console.log("Email sent");
            res.end("sent");
        }
    });
}


