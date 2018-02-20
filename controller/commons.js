"use strict";

/* eslint camelcase: 0 */

const crypto = require("crypto");
const config = require("../components").config;
const clientData = require("../components").clientData;
const pusher = require("commons/pusher")(config.pusher);
const lifetime = parseInt(config.session_lifetime) * 1000;
const errors = require("./errors");

exports.newSalt = function() {
    return crypto.randomBytes(64).toString("hex");
};

exports.getPasswordHash = function(password, salt) {
    return crypto.pbkdf2Sync(password, new Buffer(salt, "hex"), 10000, 64, "sha512").toString("hex");
};

exports.createSession = function(userId) {
    var token = crypto.randomBytes(12).toString("hex");
    var expiresAt = Date.now() + lifetime;

    return clientData.createObject({
        object_type: "session",
        user: userId,
        expires_at: new Date(expiresAt)
    }).then(session => {
        token = session.id + "|" + token;
        return clientData.updateObject(session.id, {token: token});
    });
};

exports.sendVerifyEmail = function(user, systemUser) {
    return pusher.sendEmail({
        template: "confirm_email",
        to: user.email,
        from: config.email_from,
        params: {
            name: `${user.name.given} ${user.name.family}`,
            verifyToken: systemUser.verify_token
        }
    })
    .catch(error => {
        throw new errors.SendEmailError(error.message);
    });
};
