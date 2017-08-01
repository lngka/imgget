'use strict';
// requirements
const express = require('express');
const https = require('https');
const DB = require('./helper.js');

// CONSTANT
const app = express();
const API_KEY = process.env.API_KEY;
const CX = process.env.CX;


app.use('/public', express.static(process.cwd() + '/public'));

/*
* serve homepage on "/"
*/
app.get('/', function(req, res, next) {
  if (req.query.searchTerm === undefined )
    res.sendFile(process.cwd() + '/views/index.html');
  else next();
});

/*
* answer a request on "/"
*/
app.get('/', function(req, res, next) {
  
  // parsing query
  var searchTerm = req.query.searchTerm;
  var offset = Number(req.query.offset);
  offset = (offset === NaN || offset == 0)? 1 : offset;
  
  // build link
  var getURL = "https://www.googleapis.com/customsearch/v1?q=" + searchTerm + "&cx=" + CX + "&filter=1&searchType=image&start=" + offset + "&fields=items(image%2Clink%2Csnippet%2Ctitle)&key=" + API_KEY;
  
  // call google api
  https.get(getURL, function(googleResponse) {
    // error handling
    if (googleResponse.statusCode != 200){
      res.send(googleResponse.statusCode, "Request to Google API failed: " + googleResponse.statusMessage);
    }
    
    // googleResponse.on('data', function (chunk) {
    //   str += chunk;
    // });
    // googleResponse.on('end', function () {
    //   console.log(req.data);
    //   console.log(str);
    // });
    
    // use https://www.npmjs.com/package/bl to handle data
    const bl = require('bl');
    // googleResponse.setEncoding('utf8');
    googleResponse.pipe(bl(function (err, data) {
      if (err) res.send(300, "Request to Google API failed: " + err.message);
      else {
        var result = JSON.parse(data.toString('utf8'));
        DB.saveHistory(searchTerm);
        res.json(result.items);
      }
    }));
  });
});

/*
* 
*/
app.get('/history', function(req, res) {
  DB.loadHistory(function(err, data){
    if (err) res.send(err);
    else res.json(data);
    
  });
});


// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

