"use strict";

/* eslint camelcase: 0 */

const clientData = require("../components").clientData;
const commons = require("./commons");
const errors = require("./errors");
const _ = require("underscore");

exports.changePassword = function(req) {
    var authorization = req.headers.authorization;
    if (!authorization) {
        throw new errors.UnauthorizedDenied();
    }
    var token = authorization.substr(7);
    if (!token) {
        throw new errors.UnauthorizedDenied();
    }

    var oldPassword = req.params.old_password;
    if (!oldPassword) {
        throw new errors.MissingParameter("old_password");
    }

    var newPassword = req.params.new_password;
    if (!newPassword) {
        throw new errors.MissingParameter("new_password");
    }
    var id = token.substring(0, 39);
    return clientData.getObject(id)
        .catch(err => {
            if (err.statusCode === 404) {
                throw new errors.TokenNotFound();
            }
        })
        .then(session => clientData.getObject(session.user))
        .then(user => clientData.getObject(user.system))
        .then(systemUser => {
            var oldPasswordHash = commons.getPasswordHash(oldPassword, systemUser.salt);
            if (systemUser.password_hash !== oldPasswordHash) {
                throw new errors.WrongOldPassword();
            }
            var newPasswordHash = commons.getPasswordHash(newPassword, systemUser.salt);
            return clientData.updateObject(systemUser.id, {password_hash: newPasswordHash});
        }).then(_.noop);
};
