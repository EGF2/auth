"use strict";

var restify = require("restify");
var controller = require("./controller");
var logger = require("./components").logger;

var server = restify.createServer({
    name: "auth",
    log: logger
});

server.use(restify.queryParser());
server.use(restify.bodyParser());

function processResult(handler) {
    return function(req, res, next) {
        Promise.resolve()
            .then(() => handler(req, res))
            .then(result => res.send(result))
            .catch(next);
    };
}

server.post("/v1/register", processResult(controller.register));
server.get("/v1/verify_email", processResult(controller.verify_email));
server.post("/v1/login", processResult(controller.login));
server.get("/v1/logout", processResult(controller.logout));
server.get("/v1/forgot_password", processResult(controller.forgotPassword));
server.post("/v1/reset_password", processResult(controller.resetPassword));
server.post("/v1/change_password", processResult(controller.changePassword));
server.get("/v1/internal/session", processResult(controller.session));

module.exports = server;
