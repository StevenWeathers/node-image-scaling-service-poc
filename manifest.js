"use strict";
// $lab:coverage:off$
/**
 * Falkor - Application Config
 */

/**
 * Plugins
 */
var manifest = {
  "plugins" : {
    "./falkor": null
  }
};

/**
 * Server Config
 */
manifest.server = manifest.server || {};
manifest.connections = [
    {
      "port" : process.env.PORT || 3000
    }
];
manifest.server.app = manifest.server.app || {};

module.exports = manifest;
// $lab:coverage:on$
