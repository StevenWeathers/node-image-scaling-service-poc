exports.register = function (server, options, next) {
    "use strict";
    const _ = require("lodash");
    const Joi = require("joi");

    /**
     * Build the globalContext for views
     */
    let globalContext = {};

    server.bind(globalContext);

    server.settings.app.globalRouteConfig = {
        state: {
            failAction: 'ignore'
        },
        validate: {
            failAction: function (request, reply, source, error) {
                return reply().code(400);
            }
        }
    };

    /**
     * Register Route Handlers
     */
     require('./handlers/GenericImage.js')(server);
     require('./handlers/ProductImage.js')(server);

    /**
     * Register Routes
     */

    /**
     * Route for Falkor Page
     */
    server.route({
        method: 'GET',
        path:'/falkor',
        config: server.settings.app.globalRouteConfig,
        handler: { GenericImageHandler: { view: 'page' } }
    });

    server.route({
        method: 'GET',
        path:'/falkor/product/{imageFolder}/{imageId}/{template?}',
        config: server.settings.app.globalRouteConfig,
        handler: { ProductImageHandler: { view: 'page' } }
    });

  next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
