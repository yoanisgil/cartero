/**
 * Created by ygil on 7/15/15.
 */

let express = require("express");
let app = express();
let bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use("/doc", express.static('apidoc'));
app.use("/", require("./router"));

app.use(function (err, req, res, next) {
  res.status(400).json(err);
});

module.exports = app;
