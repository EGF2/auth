"use strict";

var clientData = require("../components").clientData;
var errors = require("./errors");

exports.session = function(req) {
    var token = req.params.token;
    if (!token) {
        throw new errors.MissingParameter("token");
    }
    var sessionId = token.substring(0, 39);
    return clientData.getObject(sessionId)
        .catch(err => {
            if (err) {
                throw new errors.TokenNotFound();
            }
        })
        .then(session => {
            if (session.token !== token) {
                throw new errors.TokenNotFound();
            }
            if (session.expires_at < Date.now()) {
                return clientData.deleteObject(session.id).then(() => {
                    throw new errors.SessionExpired();
                });
            }
            return session;
        });
};
