const expenseDao = require('./expense-dao');
const { fork } = require('child_process');
const groupMatcher = require('./group-name-matcher');

const MAX_PROCESS = 3;
const MAX_FRIEND_MATCH = 3;
const CURRENCY_DECIMAL_PLACE = 2;

module.exports.getMoneyYouOwe = function(accessToken, callback){

    expenseDao.getFriendsAndTheirExpenses(accessToken, function(json){
        var friendList = getAllFriendBalance(json.friends);
        var speech = '';
        friendList.sort(function(a,b){
            return a.balance - b.balance;
        });
        friendList.forEach(function(friend, index, array) {
            if(index > 0){
                speech += " ";
            }
            if(friend.balance < 0) {
                speech += makeFriendMoneyOweSpeech(friend);
            }
        });
        console.log("Speech was "+ speech);
        if(speech.length == 0) {
            speech = "Nice!!! you Don't owe anybody anything.";
        }
        callback(speech);
    });

};

module.exports.getTotalMoneyYouOwe = function(accessToken, callback){
    expenseDao.getFriendsAndTheirExpenses(accessToken, function(json){
        var friendList = getAllFriendBalance(json.friends);
        var moneySum = 0;
        var speech = "Nice!!! you Don't owe anybody anything.";
        var currency = friendList[0].currency;
        friendList.forEach(function(friend) {

            if(friend.balance < 0) {
                currency = friend.currency;
                moneySum += parseFloat(friend.balance); 
            }
        });
        if(moneySum < 0) {
            speech = 'You owe a total of ' + (-1 * moneySum).toFixed(CURRENCY_DECIMAL_PLACE) + ' ' + currency;
        }
        callback(speech);
    });
};

module.exports.getTotalMoneyYouPaid = function(accessToken, callback){
    expenseDao.getFriendsAndTheirExpenses(accessToken, function(json){
        var friendList = getAllFriendBalance(json.friends);
        var moneySum = 0;
        var speech = 'Sadly!!! No Body Owes You anything.';
        var currency = friendList[0].currency;
        friendList.forEach(function(friend) {

            if(friend.balance > 0) {
                currency = friend.currency;
                moneySum += parseFloat(friend.balance);
            }
        });
        if(moneySum > 0) {
            speech = 'You are owed ' + moneySum.toFixed(CURRENCY_DECIMAL_PLACE) + ' ' + currency;
        }
        callback(speech);
    });
};

module.exports.getMoneyYouPaid = function(accessToken, callback){
    var self = this;
    expenseDao.getFriendsAndTheirExpenses(accessToken, function(json){
        var friendList = getAllFriendBalance(json.friends);
        var speech = '';
        friendList.sort(function(a,b){
            return b.balance - a.balance;
        });
        friendList.forEach(function(friend, index, array) {
            if(index > 0){
                speech += " ";
            }
            if(friend.balance > 0) {                
                speech += makeFriendMoneyOweSpeech(friend);
            }
        });
        console.log("Speech was "+ speech);
        if(speech.length == 0) {
            speech = 'Sadly!!! No Body Owes You anything.';
        }
        callback(speech);
    });
};

module.exports.getMoneyIOweToFriend = function(accessToken, friendName, callback){
    var processExecuted = 0;
    expenseDao.getFriendsAndTheirExpenses(accessToken, function(json){
        var friendList = getAllFriendBalance(json.friends);
        getOneFriendBalance(friendList, friendName, function(matchData){
            processExecuted++;
            if(processExecuted === MAX_PROCESS) {
                var speech;
                if(matchData.fullMatch.length == 0 && matchData.phoenaticMatch.length == 0) {
                    speech = "Sorry, we could not find any match for the name " + friendName;
                } else {
                    if(matchData.fullMatch.length == 1){
                        speech = makeFriendMoneyOweSpeech(matchData.fullMatch[0]);
                    } else if(matchData.fullMatch.length > 1) {
                        speech = "There are multiple matches for the name " + friendName + ". They are "
                        matchData.fullMatch.forEach(function(friendMatch, indexMatch, arrays){
                            if(index > 0){
                                speech += " ";
                            }
                            speech += makeFriendMoneyOweSpeech(friendMatch.friend);
                        });
                    } else {
                        matchData.phoenaticMatch.sort(function(a,b){
                            return b.matchval - a.matchval;
                        });
                        speech = "Sorry, We couldn't directly match the name " + friendName + 
                        ". The closest we found were ";
                        matchData.phoenaticMatch.forEach(function(friendMatch, index, array){
                            if(index > 0){
                                speech += " ";
                            }
                            if(index < MAX_FRIEND_MATCH){
                                speech += makeFriendMoneyOweSpeech(friendMatch.friend);
                            }
                        });
                    }

                }
                callback(speech);
            }
        });
        
    })
}

module.exports.createExpense = function(accessToken, callback){
    expenseDao.createExpense(accessToken, undefined, function(){
        callback("expense Created");
    })
}

function makeFriendMoneyOweSpeech(friend) {
    if(friend.balance === 0){
        return friend.name + ' owes you nothing';
    } else if(friend.balance < 0) {
        return 'You Owe ' + friend.name + ' ' + friend.currency +''+ (-1 * friend.balance) + '.';
    } else {
        return friend.name + ' Owes you ' + friend.currency +''+ friend.balance + '.';
    }
}
/**
 * Function Read Json Object and return and array of object {name:<>, balance:<>}
 * @param {Object} jsonObject 
 */
function getAllFriendBalance(jsonObject) {

    var returnArray = [];

    jsonObject.forEach(function(element) {
        var friend = {};
        friend.id = element.id;
        friend.firstName = element.first_name;
        friend.lastName = element.last_name;
        friend.email = element.email;
        friend.name = element.first_name;
        if(element.last_name != undefined || element.last_name != null) {
            friend.name = friend.name + ' ' + element.last_name;
        }
        if(element.balance.length > 0 && element.balance[0].amount != 0){
            friend.balance = element.balance[0].amount;
            friend.currency = element.balance[0].currency_code;
        } else {
            friend.balance = 0;
        }
        returnArray.push(friend);
    }, this);
    return returnArray;

}

/**
 * Function Read Json Object and return and array of object {name:<>, balance:<>}
 * @param {Object} jsonObject 
 */
function getOneFriendBalance(jsonObject, searchName, callback) {

    var fullMatch = [];
    var phoenaticMatch = [];

    var argsArrayObj = {};

    jsonObject.forEach(function(element, index, array) {
        if(argsArrayObj[index % MAX_PROCESS] == undefined){
            argsArrayObj[index % MAX_PROCESS] = [element];
        } else {
            argsArrayObj[index % MAX_PROCESS].push(element);
        }
    }, this);

    for(var i = 0; i < MAX_PROCESS; i++){
        (function(i){
            var child = fork('friend-name-matcher.js');
            // Listen for any errors:
            child.once('message', function (data) {
                var matchData = data;
                fullMatch = fullMatch.concat(matchData["fullMatch"]);
                phoenaticMatch = phoenaticMatch.concat(matchData["phoenaticMatch"]);
                var returnObj = {"fullMatch":fullMatch, "phoenaticMatch": phoenaticMatch};
                callback(returnObj);
            }); 
            child.send({friendObj : JSON.stringify(argsArrayObj[i]), searchName: searchName, index:i});
        })(i)
    }
}

/**
 * Get Friend Information from the name
 * This is not 100 percent guranteed. We will try to find the closes name to what was spoken
 * We generally search by first name only
 * 
 * @param acceeToken
 * @param friendName  Name of the friend, whose information is to be searched
 * @param callback    CallBack function in which the data will be returned. It expects 1 argument
 */
module.exports.getFriend = function(accessToken, friendName, callback) {
    processExecuted = 0;
    expenseDao.getFriendsAndTheirExpenses(accessToken, function(json){
        var friendList = getAllFriendBalance(json.friends);
        getOneFriendBalance(friendList, friendName, function(matchData){
            processExecuted++;
            if(processExecuted == MAX_PROCESS) {
                var friendObj;
                if(matchData.fullMatch.length > 0){
                    friendObj = matchData.fullMatch[0];
                } else {
                    matchData.phoenaticMatch.sort(function(a,b){
                        return b.matchval - a.matchval;
                    });
                    friendObj = matchData.phoenaticMatch[0].friend;
                }
                callback(friendObj);
            }
        });
    });
}

/**
 * Get Current User Info
 * @param accessToken
 * @returns Promise
 */
module.exports.getCurrentUserInfo = function(accessToken){

    return new Promise(function(resolve, reject){
        expenseDao.getCurrentUserInfo(accessToken, function(json){
            var userJson = json.user;
            var info = {};
            info.id = userJson.id;
            info.firstName = userJson.first_name;
            info.lastName = userJson.last_name;
            info.email = userJson.email;
            info.currency = userJson.default_currency;
            resolve(info);
        });
    })    
}

/**
 * @param accessToken string Access Token to connect to splitwise Api
 * @param groupName   string Group Name to search in splitwise
 */
module.exports.getGroupInfo = function(accessToken, groupName, callback) {

    var friendPromise = expenseDao.getFriendsAndTheirExpensesPromise(accessToken);
    expenseDao.getGroupsAndPeople(accessToken, function(json) {
        var defaultCurrency = 'USD';
        var groupMatched = groupMatcher.groupMatch(json.groups, groupName);
        friendPromise.then(friendJson => {
            // we will create a mapof friends id to map, wo that we we retrieve email in O(1)
            var friendIdToEmailMap = {};
            friendJson.friends.forEach(friendData => {
                friendIdToEmailMap[friendData.id] = friendData.email;
            });
            groupMatched.members.forEach(memberData => {
                var memberEmail = friendIdToEmailMap[memberData.id];
                memberData['email'] = memberEmail;

            });
            callback(groupMatched);
        })
        
    });

}

