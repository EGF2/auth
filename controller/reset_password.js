"use strict";

/* eslint camelcase: 0 */

var clientData = require("../components").clientData;
var commons = require("./commons");
var errors = require("./errors");
var _ = require("underscore");

exports.resetPassword = function(req) {
    var resetToken = req.params.reset_token;
    var password = req.params.new_password;

    if (!resetToken) {
        throw new errors.MissingParameter("reset_token");
    }
    var id = resetToken.substring(0, 39);
    return clientData.getObject(id)
        .catch(() => {
            throw new errors.TokenNotFound();
        })
        .then(user => clientData.getObject(user.system))
        .then(systemUser => {
            if (systemUser.reset_token !== resetToken) {
                throw new errors.TokenNotFound();
            }

            var salt = commons.newSalt();
            return clientData.updateObject(systemUser.id, {
                password_hash: commons.getPasswordHash(password, salt),
                salt: salt,
                delete_fields: ["reset_token"]
            })
            .then(() => clientData.updateObject(id, {no_password: false}));
        })
        .then(_.noop);
};
