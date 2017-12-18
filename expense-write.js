const expenseDao = require('./expense-dao');
const querystring = require('querystring');
module.exports.createExpenseOnOneFriend = function(accessToken, expenseObj, currentUser, callback) {
    var postDataObj = {
        "payment" : false,
        "cost" : expenseObj.amount,
        "currency_code" : expenseObj.currency,
        "description" : expenseObj.reason,
        "users__0__user_id" : expenseObj.friends[0].id,
        "users__0__first_name" : expenseObj.friends[0].firstName,
        "users__0__last_name" : expenseObj.friends[0].lastName,
        "users__0__email" : expenseObj.friends[0].email,
        "users__0__paid_share": 0,
        "users__0__owed_share":expenseObj.amount,
        "users__1__user_id" : currentUser.id,
        "users__1__first_name" : currentUser.firstName,
        "users__1__last_name" : currentUser.lastName,
        "users__1__email" : currentUser.email,
        "users__1__paid_share": expenseObj.amount,
        "users__1__owed_share":0
    }
    var postDataStr = querystring.stringify(postDataObj);
    expenseDao.createExpense(accessToken, postDataStr, function(booleanResult){
        console.log("boolean result for dao is "+ booleanResult);
        callback(booleanResult);
    })
};

module.exports.createSettleExpense = function(accessToken, expenseObj, callback) {
    var postDataObj = {
        "payment" : true,
        "cost" : expenseObj.amount,
        "currency_code" : expenseObj.currency,
        "description" : 'Settling up',
        "users__0__user_id" : expenseObj.payer.id,
        "users__0__first_name" : expenseObj.payer.firstName,
        "users__0__last_name" : expenseObj.payer.lastName,
        "users__0__email" : expenseObj.payer.email,
        "users__0__paid_share": expenseObj.amount,
        "users__0__owed_share": 0,
        "users__1__user_id" : expenseObj.payee.id,
        "users__1__first_name" : expenseObj.payee.firstName,
        "users__1__last_name" : expenseObj.payee.lastName,
        "users__1__email" : expenseObj.payee.email,
        "users__1__paid_share": 0,
        "users__1__owed_share":expenseObj.amount
    }
    var postDataStr = querystring.stringify(postDataObj);
    expenseDao.createExpense(accessToken, postDataStr, function(booleanResult){
        console.log("boolean result for dao is "+ booleanResult);
        callback(booleanResult);
    })
};

module.exports.createExpenseOnGroup = function(accessToken, expenseObject, currentUser, callback) {
    var group = expenseObject.group;
    var members = group.members;

    var postDataObj = {
        "payment" : false,
        "cost" : expenseObject.amount,
        "currency_code" : expenseObject.currency,
        "description" : expenseObject.reason,
        "group_id" : group.id
    };
    var perHeadShare = (expenseObject.amount/members.length).toFixed(2);
    members.forEach(function(element, index, array) {
        postDataObj['users__' + index + '__user_id'] = element.id;
        postDataObj['users__' + index + '__first_name'] = element.first_name;
        postDataObj['users__' + index + '__last_name'] = element.last_name;
        if(currentUser.id === element.id){
            postDataObj['users__' + index + '__email'] = currentUser.email;
        } else {
            postDataObj['users__' + index + '__email'] = element.email;
        }
        if(currentUser.id === element.id){
            postDataObj['users__' + index + '__paid_share'] = expenseObject.amount;
        } else {
            postDataObj['users__' + index + '__paid_share'] = 0;
        }
        postDataObj['users__' + index + '__owed_share'] = perHeadShare;
    });


    var postDataStr = querystring.stringify(postDataObj);
    console.log(postDataStr);
    expenseDao.createExpense(accessToken, postDataStr, function(booleanResult){
        console.log("boolean result for dao is "+ booleanResult);
        callback(booleanResult);
    });
}