var AWSregion = 'us-east-1';
const AWS = require('aws-sdk');
var Alexa = require('alexa-sdk');
var https = require('https');
const util = require('util');
const expenses = require('./expense-read');
const expensesWrite = require('./expense-write');
const currencyConverter = require('./currency-converter');
const expenseEnum = require('./expense-enums');
AWS.config.update({
    region: AWSregion
});

exports.handler = (event, context, callback) => {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.c7c7f5ec-c94e-49ec-b7db-9e09ec67f3b1'; 
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', 'welcome to spliwise', 'try again');
    },
    WhoOwesMe : function() {
        var self = this;
        expenses.getMoneyYouPaid(this.event.session.user.accessToken, function(speech){
            console.log(speech);
            self.emit(':tell', speech);
        });
    },
    WhomIOwe : function(){
        var self = this;
        expenses.getMoneyYouOwe(this.event.session.user.accessToken, function(speech){
            console.log(speech);
            self.emit(':tell', speech);
        });
    },
    TotalMoneyOthersOweMe : function() {
        var self = this;
        expenses.getTotalMoneyYouPaid(this.event.session.user.accessToken, function(speech){
            console.log(speech);
            self.emit(':tell', speech);
        });
    },
    TotalMoneyIOwe : function(){
        var self = this;
        expenses.getTotalMoneyYouOwe(this.event.session.user.accessToken, function(speech){
            console.log(speech);
            self.emit(':tell', speech);
        });
    },
    MoneyIOweTo : function(){
        var self = this;
        if(this.event.request.intent.slots.FriendName.value === undefined){
            self.emit(':tell', 'Could not here the name properly, try again');
        } else {
            expenses.getMoneyIOweToFriend(this.event.session.user.accessToken, this.event.request.intent.slots.FriendName.value, function(speech){
                console.log(speech);
                self.emit(':tell', speech);
            });
        }
    },
    MoneyToGetFrom : function(){
        var self = this;
        if(this.event.request.intent.slots.FriendName.value === undefined){
            self.emit(':tell', 'Could not here the name properly, try again');
        } else {
            expenses.getMoneyIOweToFriend(this.event.session.user.accessToken, this.event.request.intent.slots.FriendName.value, function(speech){
                console.log(speech);
                self.emit(':tell', speech);
            });
        }
    },

    IOUExpense : function(){
        var self = this;
        var money = this.event.request.intent.slots.money.value;
        var smallMoney = this.event.request.intent.slots.smallMoney.value;
        var currency = this.event.request.intent.slots.currency.value;
        var smallCurrency = this.event.request.intent.slots.smallCurrency.value;
        var friendName = this.event.request.intent.slots.FriendName.value;
        var expenseReason = this.event.request.intent.slots.expenseReason.value;

        var amount;


        console.log("Money is " + money);
        console.log("small Money is " + smallMoney);

        if(smallMoney !== undefined && smallCurrency !== undefined){
            amount = (money + parseFloat((smallMoney / 100).toFixed(2)));
        } else {
            amount = money;
        }

        if(friendName === undefined){
            self.emit(":tell", "Sorry I cannot understad the name, please repeat");
        } else {
            var currentUserInfo = expenses.getCurrentUserInfo(this.event.session.user.accessToken);
            var actualFriendName = expenses.getFriend(this.event.session.user.accessToken, friendName, function(friendObj){
                currentUserInfo.then(function(user){
                    var currencySymbol = currencyConverter.getCurrencySymbol(currency, user.currency);
                    var expenseCreationObj = {
                        "type" : expenseEnum.expenseCreationType.SINGLE_FRIEND_EXPENSE,
                        "amount": amount,
                        "currency": currencySymbol,
                        "friends":[friendObj],
                        "reason": expenseReason
                    };
                    self.event.session.attributes['expenseObject'] = expenseCreationObj;
                    self.event.session.attributes['currentUser'] = user;
                    var log = "We are about to add expense of " + currencySymbol + amount +" on " + friendObj.name  + " for " + expenseReason + ". Is it Correct?";
                    console.log(log);
                    self.emit(':ask', log , 'try again');
                })
            });
        }
    },
    GroupExpense : function() {
        var self = this;
        var accessToken = this.event.session.user.accessToken;
        var money = this.event.request.intent.slots.money.value;
        var smallMoney = this.event.request.intent.slots.smallMoney.value;
        var currency = this.event.request.intent.slots.currency.value;
        var smallCurrency = this.event.request.intent.slots.smallCurrency.value;
        var groupName = this.event.request.intent.slots.groupName.value;
        var expenseReason = this.event.request.intent.slots.expenseReason.value;

        var amount;
        
        
        console.log("Money is " + money);
        console.log("small Money is " + smallMoney);

        if(smallMoney !== undefined && smallCurrency !== undefined){
            amount = (money + parseFloat((smallMoney / 100).toFixed(2)));
        } else {
            amount = money;
        }

        if(groupName === undefined) {
            self.emit(":tell", "Sorry I cannot understad the group name, please repeat");
        } else {
            console.log(groupName);
            var currentUserInfo = expenses.getCurrentUserInfo(accessToken);
            expenses.getGroupInfo(accessToken, groupName, function(group){
                currentUserInfo.then(function(user) {
                    var currencySymbol = currencyConverter.getCurrencySymbol(currency, user.currency);
                    var expenseCreationObj = {
                        "type" : expenseEnum.expenseCreationType.GROUP_EXPENSE,
                        "amount": amount,
                        "currency": currencySymbol,
                        "group": group,
                        "reason": expenseReason
                    };
                    self.event.session.attributes['expenseObject'] = expenseCreationObj;
                    self.event.session.attributes['currentUser'] = user;
                    var speech = "We are about to add expense of " + currencySymbol + amount +" on " + group.name  + " for " + expenseReason + ". Is it Correct?";
                    self.emit(':ask', speech);
                    console.log(speech);
                });
            });
        }
    },
    "AMAZON.YesIntent" : function(){
        var self = this;

        var expenseObj = self.event.session.attributes['expenseObject'];
        var expenseType = expenseObj.type;
        var accessToken = self.event.session.user.accessToken;
        var currentUser = self.event.session.attributes['currentUser'];
        switch(expenseType){
            case expenseEnum.expenseCreationType.SINGLE_FRIEND_EXPENSE : {
                expensesWrite.createExpenseOnOneFriend(accessToken, expenseObj, currentUser, function(booleanResult){
                    if(booleanResult){
                        console.log("result is true");
                        self.emit(':tell', 'Expense Created');
                    } else {
                        console.log("Creation Problem");
                        self.emit(':tell', 'Sorry Cannot Create Expense. If there are some problem, report the developer immediately');
                    }
                });
            }
            break;
            case expenseEnum.expenseCreationType.GROUP_EXPENSE : {
                expensesWrite.createExpenseOnGroup(accessToken, expenseObj, currentUser, function(result){
                    if(result){
                        console.log("result is true");
                        self.emit(':tell', 'Expense Created');
                    } else {
                        console.log("Creation Problem");
                        self.emit(':tell', 'Sorry Cannot Create Expense. If there are some problem, report the developer immediately');
                    }
                });
            }
            break;
            case expenseEnum.expenseCreationType.FRIEND_SETTLE : {
                expensesWrite.createSettleExpense(accessToken, expenseObj, function(result) {
                    if(result){
                        console.log("result is true");
                        self.emit(':tell', 'Settle Complete');
                    } else {
                        console.log("Creation Problem");
                        self.emit(':tell', 'Sorry Cannot Create Expense. If there are some problem, report the developer immediately');
                    }
                })

            }
            break;
        }
    },
    "AMAZON.NoIntent" : function(){
        this.emit(":tell", "Ok! We are cancelling the expense Creation");
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
    },
    'SettleExpense': function () {
        var self = this;
        var accessToken = this.event.session.user.accessToken;
        var friendName = this.event.request.intent.slots.friendName.value;
        
        var friendObject;
        
        if(friendName === undefined){
            self.emit(":tell", "Sorry I cannot understad the name, please repeat");
        } else {
            var currentUserInfo = expenses.getCurrentUserInfo(accessToken);
            expenses.getFriend(accessToken, friendName, function(friendObj){
                var speech;
                if(friendObj.balance > 0) {
                    speech = friendObj.name + " will pay you " + friendObj.currency + "" + friendObj.balance;
                } else {
                    speech = "You will pay you " + friendObj.name + " " + friendObj.currency + "" + friendObj.balance;
                }
                speech += ". Do you agree?";

                currentUserInfo.then(user => {
                    var expenseObject = {
                        "type" : expenseEnum.expenseCreationType.FRIEND_SETTLE,
                        "payer": friendObj.balance > 0 ? friendObj : user,
                        "payee": friendObj.balance > 0 ? user : friendObj,
                        "amount" : friendObj.balance,
                        "currency": friendObj.currency
                    };
                    self.event.session.attributes['expenseObject'] = expenseObject;

                    self.emit(':ask', speech, 'try again!');
                })
            });

        }

        
    }



};