"use strict";

/* eslint camelcase: 0 */

var clientData = require("../components").clientData;
var crypto = require("crypto");
var commons = require("./commons");
var config = require("../components").config;
var pusher = require("commons/pusher")(config.pusher);
var errors = require("./errors");

exports.register = function(req) {
    var email = req.params.email;
    var password = req.params.password;
    var firstName = req.params.first_name;
    var lastName = req.params.last_name;
    var dateOfBirth = req.params.date_of_birth;

    if (!email) {
        throw new errors.MissingParameter("email");
    }
    if (!password) {
        throw new errors.MissingParameter("password");
    }
    if (!firstName) {
        throw new errors.MissingParameter("first_name");
    }
    if (!lastName) {
        throw new errors.MissingParameter("last_name");
    }
    if (!dateOfBirth) {
        throw new errors.MissingParameter("date_of_birth");
    }

    var salt = crypto.randomBytes(64).toString("hex");
    var passwordHash = commons.getPasswordHash(password, salt);
    var verifyToken = crypto.randomBytes(44).toString("hex");

    return Promise.resolve().then(() => {
        return clientData.createObject({
            object_type: "user",
            name: {
                given: firstName,
                family: lastName
            },
            email: email,
            date_of_birth: dateOfBirth
        }).then(user =>
            clientData.createObject({
                object_type: "system_user",
                salt,
                password_hash: passwordHash,
                verify_token: user.id + "|" + verifyToken
            }).then(systemUser =>
                clientData.updateObject(user.id, {system: systemUser.id})
                    .then(user => [user, systemUser])
            )
        )
        .then(res => {
            var user = res[0];
            var systemUser = res[1];
            return commons.sendVerifyEmail(user, systemUser)
                .then(() => user);
        })
        .then(user => commons.createSession(user.id))
        .then(session => ({type: "Bearer", token: session.token}));
    });
};
