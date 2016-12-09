"use strict";

var _ = require("underscore");

module.exports = _.extend(
    require("./register"),
    require("./verify_email"),
    require("./login"),
    require("./logout"),
    require("./forgot_password"),
    require("./reset_password"),
    require("./session"),
    require("./change_passowrd")
);
