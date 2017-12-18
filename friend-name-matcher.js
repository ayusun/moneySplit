const distance = require('jaro-winkler');
const MATCH_THRESHOLD = 0.7;
process.once('message', (msg) => {
    var friendsData = JSON.parse(msg.friendObj);
    var searchName = msg.searchName;
    var fullMatch = [];
    var phoenaticMatch = [];
    friendsData.forEach(function(element) {
        var friend = {};
        var name = element.name.split(" ");
        if(name[0].toLowerCase() === searchName.toLowerCase()){
            //full match
            fullMatch.push(element);
        } else {
            //unmatched
            var matchVal = distance(searchName, name[0]);
            if(matchVal >= MATCH_THRESHOLD) {
                phoenaticMatch.push({"matchval": matchVal, "friend" : element});
            }
        }
    }, this);
    var returnObj = {fullMatch: fullMatch, phoenaticMatch: phoenaticMatch};
    process.send(returnObj);
});



