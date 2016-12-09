"use strict";

var clientData = require("../components").clientData;
var errors = require("./errors");
var _ = require("underscore");

exports.logout = function(req) {
    var authorization = req.headers.authorization;
    var token = authorization.substr(7);
    var id = token.substr(0, 39);

    if (!token) {
        throw new errors.MissingParameter("token");
    }
    return clientData.getObject(id)
        .then(session => {
            if (session.reset_token !== token) {
                throw new errors.InvalidAccessToken();
            }
            return clientData.deleteObject(id);
        })
        .catch(() => {})
        .then(_.noop);
};
