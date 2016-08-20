'use strict';

var _     = require('lodash');
var mcapi = require('mailchimp-api/mailchimp');

var validateSubscribeRequest = function (body) {
    return _.every(['email'], function (key) {
        return _.has(body, key);
    });
};

var EARLYACCESSLIST = '8abea401d2';

exports.earlyAccess = function (request, res) {
    var requestObj = request.body,
    mc         = new mcapi.Mailchimp('22a2a1aa2c1b9ba2ca514f95fe99a019-us10');

    if (!validateSubscribeRequest(requestObj)) {
        return res.send(400, {success: 400, error: 'Malformed request. Request should contain email.'});
    }

    var mergeVars = {
        FNAME: (requestObj.firstName) || '',
        LNAME: (requestObj.lastName) || '',
        GROUPINGS: [
            {name: 'Applications', groups: []}
        ]
    };

    mc.lists.subscribe({
        'id': EARLYACCESSLIST,
        'email': {email: requestObj.email},
        'double_optin': false,
        'merge_vars': mergeVars
    }, function () {
        res.send(200, {success: true});
    }, function (error) {
        error.success = false;
        error.id = EARLYACCESSLIST;
        res.send(403, error);
    });
};
