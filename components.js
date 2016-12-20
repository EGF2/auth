"use strict";

const option = require("commons/option");
const bunyan = require("bunyan");
const search = require("commons/search");

function init() {
    return option().config.then(config => {
        module.exports.config = config;
        module.exports.clientData = require("commons/client-data")(config["client-data"]);
        module.exports.logger = bunyan.createLogger({
            name: "auth",
            level: config.log_level
        });
        var elasticConfig = Object.assign({}, config.elastic);
        module.exports.searcher = new search.Searcher(elasticConfig);
        return module.exports;
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = {
    init
};
