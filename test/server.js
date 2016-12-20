"use strict";

/* eslint camelcase: 0 */

var expect = require("chai").expect;
require("chai").should();
var request = require("supertest");
var components = require("../components");
var clientData;
var config;
var server;
var mockPusher;
var searcher;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe("test server", function() {
    this.timeout(3000);
    this.slow(500);

    before(function() {
        components.init().then(() => {
            clientData = components.clientData;
            config = components.config;
            searcher = components.searcher;
            Promise.all([
                new Promise(resolve => {
                    mockPusher = require("http")
                        .createServer((req, res) => {
                            res.writeHead(200);
                            res.end();
                        });
                    mockPusher.listen(config.pusher.split(":")[2], () => resolve());
                }),
                server = require("../server")
            ]);
        });
    });

    describe("register", () => {
        it("new user", done => {
            request(server)
                .post("/v1/register")
                .send({
                    email: "test@example.com",
                    password: "123",
                    first_name: "John",
                    last_name: "Doe",
                    date_of_birth: "1999-01-01T00:00:00.001Z"
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body).to.have.property("token");
                    delay(1000).then(() => done());
                });
        });

        it("yet another user with the same email", done => {
            request(server)
                .post("/v1/register")
                .send({
                    email: "test@example.com",
                    password: "sdf",
                    first_name: "John",
                    last_name: "Doe",
                    date_of_birth: "1999-01-01T00:00:00.001Z"
                })
                .expect(409, {
                    code: "UniqueConstraintViolated",
                    message: "Unique constraint violated for 'user-email-test@example.com'"
                })
                .end(done);
        });

        it("new user with missing field", done => {
            request(server)
                .post("/v1/register")
                .send({
                    email: "test@example.com",
                    password: "123",
                    first_name: "John",
                    date_of_birth: "1999-01-01T00:00:00.001Z"
                })
                .expect(400)
                .end(done);
        });
    });

    describe("verify", () => {
        var verifyToken;
        before(done => {
            searcher.search({object: "user", filters: {email: "test@example.com"}, count: 1})
                .then(found => clientData.getObject(found.results[0]))
                .then(user => clientData.getObject(user.system))
                .then(systemUser => {
                    verifyToken = systemUser.verify_token;
                    done();
                })
                .catch(done);
        });

        it("with wrong token", done => {
            request(server)
                .get("/v1/verify_email")
                .query({
                    token: "wrong token"
                })
                .expect(404, {code: "TokenNotFound", message: "token not found"})
                .end(done);
        });

        it("with right token", done => {
            request(server)
                .get("/v1/verify_email")
                .query({
                    token: verifyToken
                })
                .expect(200)
                .end(done);
        });
    });

    var sessionToken;
    describe("login", () => {
        it("with wrong credentials", done => {
            request(server)
                .post("/v1/login")
                .send({
                    email: "test@example.com",
                    password: "1234"
                })
                .expect(401, {code: "WrongCredentials", message: "wrong email or password"})
                .end(done);
        });

        it("without password", done => {
            request(server)
                .post("/v1/login")
                .send({
                    email: "test@example.com"
                })
                .expect(400, {code: "MissingParameter", message: "required parameter \"password\" is missed"}
                )
                .end(done);
        });

        it("with right credentials", done => {
            request(server)
                .post("/v1/login")
                .send({
                    email: "test@example.com",
                    password: "123"
                })
                .expect(200)
                .end((err, res) => {
                    sessionToken = res.body.token;
                    done(err);
                });
        });
    });

    describe("session", () => {
        it("get user by session", done => {
            request(server)
                .get("/v1/internal/session")
                .query({
                    token: sessionToken
                })
                .expect(200)
                .expect(function(res) {
                    var data = res.body;
                    expect(data).to.have.property("expires_at");
                    expect(data).to.have.property("token");
                    expect(data).to.have.property("user").match(/(([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12})/);
                })

                .end(done);
        });

        it("get user by wrong session", done => {
            request(server)
                .get("/v1/internal/session")
                .query({
                    token: "wrong token"
                })
                .expect(404, {code: "TokenNotFound", message: "token not found"})
                .end(done);
        });
    });

    describe("logout", () => {
        it("with wrong session", done => {
            request(server)
                .get("/v1/logout")
                .set("authorization", "wrong token")
                .expect(200)
                .end(done);
        });

        it("with right session", done => {
            request(server)
                .get("/v1/logout")
                .set("authorization", `Bearer ${sessionToken}`)
                .expect(200)
                .end(done);
        });
    });

    describe("forgot and reset password, login", () => {
        it("forgot password without email", done => {
            request(server)
                .get("/v1/forgot_password")
                .query({
                    email: ""
                })
                .expect(400, {code: "MissingParameter", message: "required parameter \"email\" is missed"})
                .end(done);
        });

        it("forgot password with wrong email", done => {
            request(server)
                .get("/v1/forgot_password")
                .query({
                    email: "wrong_email@example.com"
                })
                .expect(404, {code: "EmailNotFound", message: "email not found"})
                .end(done);
        });

        it("forgot password", done => {
            request(server)
                .get("/v1/forgot_password")
                .query({
                    email: "test@example.com"
                })
                .expect(200)
                .end(done);
        });

        describe("reset password", () => {
            var resetToken;
            before(done => {
                searcher.search({object: "user", filters: {email: "test@example.com"}, count: 1})
                .then(found => clientData.getObject(found.results[0]))
                .then(user => clientData.getObject(user.system))
                .then(systemUser => {
                    resetToken = systemUser.reset_token;
                    done();
                })
                .catch(done);
            });

            it("reset password with wrong token", done => {
                request(server)
                    .post("/v1/reset_password")
                    .send({
                        reset_token: "wrong token",
                        new_password: "456"
                    })
                    .expect(404)
                    .end(done);
            });

            it("reset password without token at all", done => {
                request(server)
                    .post("/v1/reset_password")
                    .send({
                        new_password: "456"
                    })
                    .expect(400)
                    .end(done);
            });

            it("reset password", done => {
                request(server)
                    .post("/v1/reset_password")
                    .send({
                        reset_token: resetToken,
                        new_password: "456"
                    })
                    .expect(200)
                    .end(done);
            });

            it("reset password one more time with the same token", done => {
                request(server)
                    .post("/v1/reset_password")
                    .send({
                        reset_token: resetToken,
                        new_password: "789"
                    })
                    .expect(404)
                    .end(done);
            });

            it("login with previous password", done => {
                request(server)
                    .post("/v1/login")
                    .send({
                        email: "test@example.com",
                        password: "123"
                    })
                    .expect(401, {code: "WrongCredentials", message: "wrong email or password"})
                    .end(done);
            });

            it("login with new password", done => {
                request(server)
                    .post("/v1/login")
                    .send({
                        email: "test@example.com",
                        password: "456"
                    })
                    .expect(200)
                    .end((err, res) => {
                        sessionToken = res.body.token;
                        done(err);
                    });
            });
        });
    });

    describe("change password", () => {
        it("unauthorized access", done => {
            request(server)
                .post("/v1/change_password")
                .query({
                    old_password: "456",
                    new_password: "123"
                })
                .expect(403, {code: "UnauthorizedDenied", message: "unauthorized access denied"})
                .end(done);
        });

        it("with wrong old password", done => {
            request(server)
                .post("/v1/change_password")
                .set("authorization", `Bearer ${sessionToken}`)
                .query({
                    old_password: "wrong password",
                    new_password: "123"
                })
                .expect(401, {code: "WrongOldPassword", message: "wrong old password"})
                .end(done);
        });

        it("with right old password", done => {
            request(server)
                .post("/v1/change_password")
                .set("authorization", `Bearer ${sessionToken}`)
                .query({
                    old_password: "456",
                    new_password: "123"
                })
                .expect(200)
                .end(done);
        });

        it("login with previous password", done => {
            request(server)
                .post("/v1/login")
                .send({
                    email: "test@example.com",
                    password: "456"
                })
                .expect(401, {code: "WrongCredentials", message: "wrong email or password"})
                .end(done);
        });

        it("login with new password", done => {
            request(server)
                .post("/v1/login")
                .send({
                    email: "test@example.com",
                    password: "123"
                })
                .expect(200)
                .end(done);
        });
    });

    after(done => {
        searcher.search({object: "user", filters: {email: "test@example.com"}, count: 1})
            .then(found => clientData.deleteObject(found.results[0]))
            .then(() => done());
    });
});
