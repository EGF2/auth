"use strict";

/* eslint camelcase: 0 */

var clientData = require("../components").clientData;
var crypto = require("crypto");
var commons = require("./commons");
var config = require("../components").config;
var pusher = require("commons/pusher")(config.pusher);
var errors = require("./errors");
const searcher = require("../components").searcher;

function sendVerifyEmail(user, systemUser) {
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
}

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

    return searcher.search({object: "user", filters: {email}, count: 1})
        .then(found => {
            if (found.count) {
                throw new errors.EmailAlreadyInUse();
            }

            var salt = crypto.randomBytes(64).toString("hex");
            var passwordHash = commons.getPasswordHash(password, salt);
            var verifyToken = crypto.randomBytes(44).toString("hex");
            // TODO in lock
            return Promise.resolve().then(() => {
                return clientData.createObject({
                    object_type: "system_user",
                    salt,
                    password_hash: passwordHash
                })
                .then(systemUser =>
                    clientData.createObject({
                        object_type: "user",
                        name: {
                            given: firstName,
                            family: lastName
                        },
                        email: email,
                        date_of_birth: dateOfBirth,
                        system: systemUser.id
                    })
                    .then(user => {
                        verifyToken = user.id + "|" + verifyToken;
                        return clientData.updateObject(systemUser.id, {verify_token: verifyToken})
                            .then(systemUser => [user, systemUser]);
                    })
                )
                .then(res => {
                    var user = res[0];
                    var systemUser = res[1];
                    return sendVerifyEmail(user, systemUser)
                        .then(() => user);
                })
                .then(user => commons.createSession(user.id))
                .then(session => ({type: "Bearer", token: session.token}));
            });
        });
};
