var elastic = require("elasticsearch");
var config = require("./components").config;
var hosts = Object.assign({}, config.elastic.hosts);
var client = new elastic.Client({
    hosts: hosts
});

var objectMapping = {
    user: {
        properties: {
            email: {type: "string", index: "not_analyzed"}
        }
    }
};

module.exports.clean = () =>
    client.indices.exists({index: "user"})
    .then(exists =>
        exists ? client.indices.delete({index: "user"}) : Promise.resolve()
    )
    .then(() => client.indices.create({ // create index
        index: "user",
        body: {
            mappings: {
                user: objectMapping.user
            }
        }
    }));
