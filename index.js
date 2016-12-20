"use strict";

const components = require("./components");

components.init().then(() => {
    const config = components.config;
    const logger = components.logger;
    const server = require("./server");
    server.listen(config.port, () => logger.info(`server started at port ${config.port}`));
}).catch(err => {
    console.error(err);
    process.exit(1);
});
