const https = require('https');


const SPLITWISE_DOMAIN = 'secure.splitwise.com';
const GET_FRIENDS_ENDPOINT = '/api/v3.0/get_friends';
const CURRENT_USER_ENDPOINT = '/api/v3.0/get_current_user';
const GET_GROUPS = '/api/v3.0/get_groups';
const CREATE_EXPENSE = '/api/v3.0/create_expense';

const SSL_PORT = 443;

module.exports.getFriendsAndTheirExpenses = function(accessToken, callback) {
    var options = {
        hostname : SPLITWISE_DOMAIN,
        path : GET_FRIENDS_ENDPOINT,
        port : SSL_PORT,
        headers: {
            Authorization: ' Bearer ' + accessToken
        }
    };

    https.get(options, function(res){
        var json = '';

        res.on('data', function(chunk){
            json += chunk;
        });
        res.on('end', function() {
            if(res.statusCode === 200){
                var data = JSON.parse(json);
                callback(data);
            }
        });
    });
}

/**
 * Get All the Details of the friends and return a promise
 * which will return the data when resolved
 */
module.exports.getFriendsAndTheirExpensesPromise = function(accessToken) {
    var options = {
        hostname : SPLITWISE_DOMAIN,
        path : GET_FRIENDS_ENDPOINT,
        port : SSL_PORT,
        headers: {
            Authorization: ' Bearer ' + accessToken
        }
    };

    return new Promise((resolve, reject) => {
        https.get(options, function(res){
            var json = '';
    
            res.on('data', function(chunk){
                json += chunk;
            });
            res.on('end', function() {
                if(res.statusCode === 200){
                    var data = JSON.parse(json);
                    resolve(data);
                } else {
                    console.log("error");
                    reject("some error occured");
                }
            });
        });
    })
}

module.exports.getCurrentUserInfo = function(accessToken, callback) {
    var options = {
        hostname : SPLITWISE_DOMAIN,
        path : CURRENT_USER_ENDPOINT,
        port : SSL_PORT,
        headers: {
            Authorization: ' Bearer ' + accessToken
        }

    };
    https.get(options, function(res){
        var json = '';

        res.on('data', function(chunk){
            json += chunk;
        });
        res.on('end', function() {
            if(res.statusCode === 200){
                var data = JSON.parse(json);
                callback(data);
            }
        });
    });
}

module.exports.getGroupsAndPeople = function(accessToken, callback) {
    var options = {
        hostname : SPLITWISE_DOMAIN,
        path : GET_GROUPS,
        port : SSL_PORT,
        headers: {
            Authorization: ' Bearer ' + accessToken
        }

    };
    https.get(options, function(res){
        var json = '';

        res.on('data', function(chunk){
            json += chunk;
        });
        res.on('end', function() {
            if(res.statusCode === 200){
                var data = JSON.parse(json);
                callback(data);
            }
        });
    });
}

module.exports.createExpense = function(accessToken, postDataStr, callback) {
    var options = {
        hostname : SPLITWISE_DOMAIN,
        path : CREATE_EXPENSE,
        port : SSL_PORT,
        method: 'POST',
        headers: {
            Authorization: ' Bearer ' + accessToken
        }

    };

    var req = https.request(options, (res) => {
      
        res.on('data', (d) => {
        });

        res.on("end", function(){
            console.log("Status code is" + res.statusCode);
            callback(true);
        });
        res.on("close", () => {
            callback(true);
        });
    });
    req.on('error', (e) => {
        callback(false);
        console.error(e);
    });
    req.write(postDataStr);
    req.end();

}

// module.exports.createExpenseTemp = function(accessToken, postDataStr, callback) {
//     var options = {
//         hostname : 'secure.splitwise.com',
//         path:'/api/v3.0/create_expense',
//         port:443,
//         method: 'POST',
//         headers: {
//             Authorization: ' Bearer ' + accessToken
//         }
//     };
//     var req = https.request(options, (res) => {
//         res.on('data', (d) => {
//             console.log(d.toString());
//         });
//         res.on("end", function(){
//             console.log("Status code is" + res.statusCode);
//             callback(true);
//         })
//         res.on("close", () => {
//             callback(true);
//         });
//     });
//     req.on('error', (e) => {
//         console.log(JSON.stringify(e));
//         callback(false);
//     });
//     req.write(postDataStr);
//     req.end();
// }