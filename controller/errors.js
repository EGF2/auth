"use strict";

const restify = require("restify");
const util = require("util");

function MissingParameter(param) {
    restify.RestError.call(this, {
        restCode: "MissingParameter",
        statusCode: 400,
        message: `required parameter "${param}" is missed`,
        constructorOpt: MissingParameter
    });
    this.name = "MissingParameter";
}
util.inherits(MissingParameter, restify.RestError);

function EmailAlreadyInUse() {
    restify.RestError.call(this, {
        restCode: "EmailAlreadyInUse",
        statusCode: 409,
        message: "email address already in use",
        constructorOpt: EmailAlreadyInUse
    });
    this.name = "EmailAlreadyInUse";
}
util.inherits(EmailAlreadyInUse, restify.RestError);

function SessionExpired() {
    restify.RestError.call(this, {
        restCode: "SessionExpired",
        statusCode: 419,
        message: "session is expired",
        constructorOpt: SessionExpired
    });
    this.name = "SessionExpired";
}
util.inherits(SessionExpired, restify.RestError);

function InvalidAccessToken() {
    restify.RestError.call(this, {
        restCode: "InvalidAccessToken",
        statusCode: 401,
        message: "invalid access token",
        constructorOpt: InvalidAccessToken
    });
    this.name = "InvalidAccessToken";
}
util.inherits(InvalidAccessToken, restify.RestError);

function UnknownServiceType() {
    restify.RestError.call(this, {
        restCode: "UnknownServiceType",
        statusCode: 400,
        message: "unknown service type",
        constructorOpt: UnknownServiceType
    });
    this.name = "UnknownServiceType";
}
util.inherits(UnknownServiceType, restify.RestError);

function WrongCredentials() {
    restify.RestError.call(this, {
        restCode: "WrongCredentials",
        statusCode: 401,
        message: "wrong email or password",
        constructorOpt: WrongCredentials
    });
    this.name = "WrongCredentials";
}
util.inherits(WrongCredentials, restify.RestError);

function EmailNotVerified() {
    restify.RestError.call(this, {
        restCode: "EmailNotVerified",
        statusCode: 409,
        message: "email is not verified",
        constructorOpt: EmailNotVerified
    });
    this.name = "EmailNotVerified";
}
util.inherits(EmailNotVerified, restify.RestError);

function EmailNotFound() {
    restify.RestError.call(this, {
        restCode: "EmailNotFound",
        statusCode: 404,
        message: "email not found",
        constructorOpt: EmailNotFound
    });
    this.name = "EmailNotFound";
}
util.inherits(EmailNotFound, restify.RestError);

function TokenNotFound() {
    restify.RestError.call(this, {
        restCode: "TokenNotFound",
        statusCode: 404,
        message: "token not found",
        constructorOpt: TokenNotFound
    });
    this.name = "TokenNotFound";
}
util.inherits(TokenNotFound, restify.RestError);

function WrongScope() {
    restify.RestError.call(this, {
        restCode: "WrongScope",
        statusCode: 403,
        message: "insufficient privileges",
        constructorOpt: WrongScope
    });
    this.name = "WrongScope";
}
util.inherits(WrongScope, restify.RestError);

function UnauthorizedDenied() {
    restify.RestError.call(this, {
        restCode: "UnauthorizedDenied",
        statusCode: 403,
        message: "unauthorized access denied",
        constructorOpt: UnauthorizedDenied
    });
    this.name = "UnauthorizedDenied";
}
util.inherits(UnauthorizedDenied, restify.RestError);

function OAuthServiceError(error) {
    restify.RestError.call(this, {
        restCode: "OAuthServiceError",
        statusCode: 401,
        message: `oauth service error: ${error}`,
        constructorOpt: OAuthServiceError
    });
    this.name = "OAuthServiceError";
}
util.inherits(OAuthServiceError, restify.RestError);

function SendEmailError(error) {
    restify.RestError.call(this, {
        restCode: "SendEmailError",
        statusCode: 503,
        message: `send email error: ${error}`,
        constructorOpt: SendEmailError
    });
    this.name = "SendEmailError";
}
util.inherits(SendEmailError, restify.RestError);

function SendInstructionEmailError(error) {
    restify.RestError.call(this, {
        restCode: "SendInstructionEmailError",
        statusCode: 503,
        message: `send instruction email error: ${error}`,
        constructorOpt: SendInstructionEmailError
    });
    this.name = "SendInstructionEmailError";
}
util.inherits(SendInstructionEmailError, restify.RestError);

module.exports = {
    MissingParameter,
    EmailAlreadyInUse,
    SessionExpired,
    InvalidAccessToken,
    UnknownServiceType,
    WrongCredentials,
    EmailNotVerified,
    EmailNotFound,
    TokenNotFound,
    WrongScope,
    UnauthorizedDenied,
    OAuthServiceError,
    SendEmailError,
    SendInstructionEmailError
};
