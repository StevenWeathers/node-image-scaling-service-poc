"use strict";
let manifest = require("./manifest.js"); // Get the Application Config
const Glue = require('glue'); // Compose the application

let compose = function (callback) {
    Glue.compose(manifest, {
        relativeTo: process.cwd() + '/server'
    }, function (err, server) {
        if (err) throw err;

        if (!module.parent) {
            // Start the Server based on Application Config
            server.start(function (err) {
                console.log(`\ Falkor Server started at ${server.info.uri}`);
            });
        }

        if (typeof callback !== 'undefined') {
            callback(null, server);
        }
    });
};

// If this module is not being required by another one, compose the server.
// $lab:coverage:off$
if (!module.parent) {
    compose();
}
// $lab:coverage:on$

module.exports = compose;
