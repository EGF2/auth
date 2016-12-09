"use strict";

/* eslint camelcase: 0 */

var clientData = require("../components").clientData;
var errors = require("./errors");
var _ = require("underscore");

exports.verify_email = function(req) {
    var verifyToken = req.params.token;

    if (!verifyToken) {
        throw new errors.MissingParameter("token");
    }
    var id = verifyToken.substring(0, 39);

    return clientData.getObject(id)
        .catch(() => {
            throw new errors.TokenNotFound();
        })
        .then(user => clientData.getObject(user.system))
        .then(systemUser => {
            if (systemUser.verify_token !== verifyToken) {
                throw new errors.TokenNotFound();
            }
            var cleanToken = clientData.updateObject(systemUser.id, {delete_fields: ["verify_token"]});
            var verify = clientData.updateObject(id, {verified: true});

            return Promise.all([cleanToken, verify]);
        }).then(_.noop);
};
