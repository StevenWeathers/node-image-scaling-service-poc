"use strict";
const Code = require('code');
const expect = Code.expect;
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const nock = require('nock');
const _ = require("lodash");

describe('Page Routes', function() {
    let nocks;
    let server;
    let Channels = ['desktop', 'mobile'];

    let Routes = [
        {
            name: "Route for Falkor Page",
            url: "/{channel}/falkor",
        }
    ];

    before(function(done) {
        process.env.bcp_host = "bcptest.lowes.com";
        process.env.services_host = "service.lowes.com";

        require('../../')(function(err, obj) {
            server = obj;
            done();
        });
    });

    describe("Successful Page Load", function(){
        _.each(Channels, function(channel, index) {
            _.each(Routes, function(route, routeIndex) {
                var url = route.url.replace(/{channel}/g, channel);

                describe(`When ${channel} ${route.name} is requested`, function() {
                    it('should return a 200 HTTP Code with content-type set to text/html', function(done) {
                        server.inject({
                            url: url,
                            method: 'get'
                        }, function(response) {

                            expect(response.statusCode).to.equal(200);
                            expect(response.headers["content-type"]).to.equal("text/html");

                            done();
                        });
                    });
                });
            });
        });
    });
});
