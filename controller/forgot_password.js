"use strict";

/* eslint camelcase: 0 */

const clientData = require("../components").clientData;
var crypto = require("crypto");
var config = require("../components").config;
var pusher = require("commons/pusher")(config.pusher);
var logger = require("../components").logger;
var errors = require("./errors");
var _ = require("underscore");
const searcher = require("../components").searcher;

function sendInstruction(user, systemUser) {
    return pusher.sendEmail({
        template: "forgot_password",
        to: user.email,
        from: config.email_from,
        params: {
            name: `${user.name.given} ${user.name.family}`,
            resetToken: systemUser.reset_token
        }
    });
}

exports.forgotPassword = function(req) {
    var email = req.params.email;

    if (!email) {
        throw new errors.MissingParameter("email");
    }
    return searcher.search({object: "user", filters: {email}, count: 1})
        .then(found => {
            if (!found.count || found.count === 0) {
                throw new errors.EmailNotFound();
            }
            return clientData.getObject(found.results[0]);
        })
        .then(user => {
            return clientData.getObject(user.system)
                .then(systemUser => {
                    var token = user.id + "|" + crypto.randomBytes(44).toString("hex");
                    return clientData.updateObject(systemUser.id, {reset_token: token});
                })
                .then(systemUser => sendInstruction(user, systemUser)
                    .catch(error => {
                        logger.error("send instruction email error: ", error);
                        throw new errors.SendInstructionEmailError(error);
                    }));
        }).then(_.noop);
};
