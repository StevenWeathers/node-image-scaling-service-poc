"use strict";
module.exports = function (server) {
    server.handler('ProductImageHandler', function (route, options) {
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
            let image = `/product/converted/${request.params.imageFolder}/${request.params.imageId}.jpg`;
            let width = request.query.width || 402;
            let quality = request.query.quality || 80;
            let imageFormat = request.query.imgFormat || "jpeg";

            let badge = request.query.badge || null;
            let badgePosition = request.query.badgePos || "southeast";
            let badgePercent = request.query.badgePercent || 15;

            switch(templateName) {
                case "Innovation":
                    badge = "new-innovation";
                    badgePercent = 20;
                    badgePosition = "southeast";
                    break;
                case "FreeDeliveryAssembly":
                    badge = "free-delivery-assembly";
                    badgePercent = 20;
                    badgePosition = "northwest";
                    break;
                case "FreeDelivery":
                    badge = "free-delivery";
                    badgePercent = 20;
                    badgePosition = "northwest";
                    break;
                case "FreeAssembly":
                    badge = "free-assembly";
                    badgePercent = 20;
                    badgePosition = "northwest";
                    break;
                case "Save100":
                    badge = "Save100asterisk";
                    badgePercent = 20;
                    badgePosition = "northeast";
                    break;
                case "EnergyStar":
                    badge = "energy_star_logo";
                    badgePosition = "southeast";
                    break;
                default:
                    break;
            }

            async.parallel([
                function(callback) {
                    if (badge) {
                        let badgePadding = {top: 0, bottom: 15, left: 0, right: 15};

                        switch(badgePosition) {
                            case "southwest":
                                badgePadding = {top: 0, bottom: 15, left: 15, right: 0};
                                break;
                            case "northwest":
                                badgePadding = {top: 15, bottom: 0, left: 15, right: 0};
                                break;
                            case "northeast":
                                badgePadding = {top: 15, bottom: 0, left: 0, right: 15};
                                break;
                            default:
                                break;
                        }

                        fs.readFile(`${process.cwd()}/badges/${badge}.png`, function(err, data) {
                            if (err) throw err; // Fail if the file can't be read.

                            sharp(data)
                            .resize( Math.trunc(parseInt(width,10) * (badgePercent / 100)) )
                            .extend(badgePadding)
                            .quality(100)
                            .sharpen()
                            .background({r: 0, g: 0, b: 0, a: 0})
                            .embed()
                            .toFormat(sharp.format.png)
                            .toBuffer(function(err, badgeImg) {
                                if (err) {
                                    console.log(err);
                                    throw err;
                                }

                                callback(null, badgeImg);
                            });
                        });
                    } else {
                        callback(null, null);
                    }
                },
                function(callback) {
                    Conduit.get(image, function(err, payload, response) {
                        callback(null, payload);
                    });
                }
            ],
            function(err, results){
                let badgeImg = results[0];
                let payload = results[1];

                let finalImage;

                if (badgeImg) {
                    finalImage = sharp(payload)
                        .overlayWith(badgeImg, { gravity: sharp.gravity[badgePosition] })
                        .resize(parseInt(width,10));
                } else {
                    finalImage = sharp(payload)
                        .resize(parseInt(width,10));
                }

                finalImage.quality(parseInt(quality,10))
                    .sharpen()
                    .embed()
                    .toFormat(sharp.format[imageFormat])
                    .toBuffer(function(err, outputBuffer) {
                        if (err) {
                            console.log(err);
                            reply(err);
                        }

                        reply(outputBuffer).type(`image/${imageFormat}`);
                    });
            });
        }; // request handler
    }); // server handler
};
