var http = require('http')
  , querystring = require('querystring');

var mail_parser = require('./mail-parser');

// Initialization class
var Mailjet = function(apiKey, secretKey) {
  this._apiKey = apiKey;
  this._secretKey = secretKey;
  this._authentificate = new Buffer(apiKey + ':' + secretKey).toString('base64');
};

Mailjet.prototype = {};

// Email sending code
Mailjet.prototype.sendContent = function(from, to, subject, type, content, trackOpen, trackClick) {

    if (typeof(to) === 'string') {
        to = [to];
    }

    var recipients = mail_parser.parse_recipient_type(to);

    // Build the HTTP POST body
    var query = 'from=' + encodeURIComponent(from) + '&subject=' + encodeURIComponent(subject);
    var i = 0;

    for (i = 0; i < recipients.to.length; i += 1) {
        query += '&to=' + recipients.to[i];
    }
    for (i = 0; i < recipients.cc.length; i += 1) {
        query += '&cc=' + recipients.cc[i];
    }
    for (i = 0; i < recipients.bcc.length; i += 1) {
        query += '&bcc=' + recipients.bcc[i];
    }

    if (type === 'text') {
        query += '&text=' + encodeURIComponent(content);
    }
    else {
        query += '&html=' + encodeURIComponent(content);
    }

    if(null !== trackOpen && undefined !== trackOpen) {
        query += '&mj-trackopen=';
        query += trackOpen ? 'true' : 'false';
    }

    if(null !== trackClick && undefined !== trackClick) {
        query += '&mj-trackclick=';
        query += trackClick ? 'true' : 'false';
    }

    console.log(query);
    var body = query;

    var options = {
        hostname: 'api.mailjet.com',
        port: 80,
        path: '/v3/send/',
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + this._authentificate,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body)
        }
    };

    // API request
    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
    });

    // Checking errors
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // Send the body
    console.log(body);
    req.end(body);
};

module.exports = Mailjet;

