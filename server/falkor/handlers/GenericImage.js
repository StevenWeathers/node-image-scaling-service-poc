"use strict";
module.exports = function (server) {
    server.handler('GenericImageHandler', function (route, options) {
        const _ = require("lodash");
        const sharp = require('sharp');
        const async = require('async');
        const fs = require('fs');
        const Wreck = require('wreck');
        const Conduit = Wreck.defaults({
            baseUrl: "https://images.lowes.com",
            json: "false"
        });

        return function (request, reply) {
            let templateName = request.params.template;
            let image = request.query.imgSrc;
            let width = request.query.width || 1012;
            let quality = request.query.quality || 80;
            let imageFormat = request.query.imgFormat || "jpeg";

            async.waterfall([
                function(callback) {
                    if (image.indexOf("example_images") > -1) {
                        fs.readFile(`${process.cwd()}/${image}`, function(err, data) {
                            callback(null, data);
                        });
                    } else {
                        Conduit.get(image, function(err, payload, response) {
                            callback(null, payload);
                        });
                    }
                },
                function(payload, callback) {
                    let finalImage;

                    if (imageFormat === "png") {
                        finalImage = sharp(payload)
                            .resize(parseInt(width,10))
                            .sharpen()
                            .compressionLevel(9)
                            .toFormat(sharp.format[imageFormat]);
                    } else {
                        finalImage = sharp(payload)
                            .resize(parseInt(width,10))
                            .sharpen()
                            .quality(parseInt(quality,10))
                            .toFormat(sharp.format[imageFormat]);
                    }

                    finalImage.toBuffer(function(err, outputBuffer) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }

                        callback(null, outputBuffer);
                    });
                }
            ], function (err, result) {
                if (err) {
                    console.log(err);
                    reply(err);
                }

                reply(result).type(`image/${imageFormat}`);
            });
        };
    });
};
