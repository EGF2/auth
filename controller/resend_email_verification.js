"use strict";

/* eslint camelcase: 0 */

const clientData = require("../components").clientData;
const errors = require("./errors");
const crypto = require("crypto");
const commons = require("./commons");
const _ = require("underscore");

exports.resendEmailVerification = function(req) {
    let authorization = req.headers.authorization;
    if (!authorization) {
        throw new errors.UnauthorizedDenied();
    }
    let token = authorization.substr(7);
    if (!token) {
        throw new errors.UnauthorizedDenied();
    }
    return clientData.getObject(token.substring(0, 39))
        .catch(err => {
            if (err.statusCode === 404) {
                throw new errors.TokenNotFound();
            }
            throw err;
        })
        .then(session => {
            if (session.token === token) {
                return clientData.getObject(session.user);
            }
            throw new errors.InvalidAccessToken();
        })
        .then(user => {
            if (user.verified) {
                throw new errors.EmailAlreadyVerified();
            }
            let verifyToken = crypto.randomBytes(64).toString("hex");
            let systemUser = clientData.updateObject(user.system, {verify_token: user.id + "|" + verifyToken});
            return Promise.all([user, systemUser]);
        })
        .then(users => commons.sendVerifyEmail(users[0], users[1]))
        .then(_.noop);
};
