"use strict";

const clientData = require("../../components").clientData;
const commons = require("./../commons");
const errors = require("./../errors");
const searcher = require("../../components").searcher;

module.exports = function loginByEmail(email, password) {
    if (!email) {
        throw new errors.MissingParameter("email");
    }

    if (!password) {
        throw new errors.MissingParameter("password");
    }
    return searcher.search({object: "user", filters: {email}, count: 1})
        .then(found => {
            if (!found.count || found.count === 0) {
                throw new errors.WrongCredentials();
            }
            return clientData.getObject(found.results[0]);
        })
        .then(user => {
            return clientData.getObject(user.system)
                .then(systemUser => {
                    if (!systemUser.password_hash) {
                        throw new errors.WrongCredentials();
                    }
                    var passwordHash = commons.getPasswordHash(password, systemUser.salt);
                    if (passwordHash !== systemUser.password_hash) {
                        throw new errors.WrongCredentials();
                    }

                    return commons.createSession(user.id);
                });
        });
};
