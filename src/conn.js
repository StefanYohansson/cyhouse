"use strict";

var mongojs = require("mongojs");

var uri = "mongodb://127.0.0.1:27017/cyhouse";
var collections = ["modules", "actions", "logger", "users", "user_module", "agenda"];
var db = mongojs.connect(uri, collections);

module.exports = db;