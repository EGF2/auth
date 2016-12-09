"use strict";

var emailLogin = require("./email_login");
var errors = require("../errors");

exports.login = function(req) {
    var email = req.params.email;

    var session;
    if (email) {
        var password = req.params.password;
        session = emailLogin(email, password);
    } else {
        throw new errors.MissingParameter("email");
    }

    return session
        .then(session => ({type: "Bearer", token: session.token}));
};
