var http = require('http');
var qs = require('querystring');
var fs = require('fs');
var ejs = require('ejs');
var url = require('url');

const PORT = 8080;
const HOST = '0.0.0.0';

http.createServer((req, res) => {
  if(req.method === "GET") {
    var url_parts = url.parse(req.url, true);
    if (url_parts.pathname === "/favicon.ico") {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.write('404: Resource Not Found');
      res.end();
    } else if (url_parts.pathname === "/") {
      fs.readFile("view/main.ejs", (error, pgResp) => {
        if (error) {
          res.writeHead(404);
          res.write('Contents you are looking are Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(pgResp);
        }
        res.end();
      });
    }
    else if (url_parts.pathname === "/ext") {
      var MongoClient = require('mongodb').MongoClient;
      var dburl = 'mongodb://mongo:27017';

      MongoClient.connect(dburl, function(err, db) {
        var dbo = db.db("first-website");
        var myobj = { userName: url_parts.query.userName, password: url_parts.query.password, email: url_parts.query.email};

        if (err) throw err;
        dbo.collection("accounts").insertOne(myobj, function(err, ress) {
          if (err) throw err;
          if (err) {
            res.writeHead(404);
            res.write('Contents you are looking are Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write("1 user inserted");
          }
          res.end();
        });
        db.close();
      });
    }
  } else if(req.method === "POST") {
    if (req.url === "/") {
      fs.readFile("view/main.ejs", (error, pgResp) => {
        if (error) {
          res.writeHead(404);
          res.write('Contents you are looking are Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(pgResp);
        }
        res.end();
      });
    }
    else if (req.url === "/inbound") {
      var requestBody = '';
      
      req.on('data', (data) => {
        requestBody += data;
      });
      req.on('end', () => {
        var formData = qs.parse(requestBody);
        var MongoClient = require('mongodb').MongoClient;
        var dburl = 'mongodb://mongo:27017';

        MongoClient.connect(dburl, function(err, db) {
          var dbo = db.db("first-website");
          var myobj = { userName: formData.UserName, password: formData.Password, email: formData.Email};

          if (err) throw err;
          dbo.collection("accounts").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 user inserted");
          });
          dbo.collection("accounts").find({}).toArray(function(err, result) {
            if (err) throw err;
            fs.readFile('view/response.ejs', 'utf-8', (error, pgResp) => {
              if (error) {
                res.writeHead(404);
                res.write('Contents you are looking are Not Found');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                var htmlRenderized = ejs.render(pgResp, {results: result});
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(htmlRenderized);
              }
              res.end();
            });
          });
          db.close();
        });
      });
    }
  }
}).listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);