const distance = require('jaro-winkler');

const NON_GROUP_EXPENSE_GROUP = 0;
const MATCH_THRESHOLD = 0.7;
const SPACE = " ";

module.exports.groupMatch = function(groups, searchName){
    var returnGroup = undefined;
    var phoenaticMatch = [];
    var splitPercentMatch
    groups.forEach(function(group) {
        if(group.id != NON_GROUP_EXPENSE_GROUP) {
            var groupName = group.name;
            if(searchName.toLowerCase().trim().replace(SPACE, "") === groupName.toLowerCase().trim().replace(SPACE, "")) {
                returnGroup = group;
                return true;
            } else {
                //last resort Check the difference
                var matchVal = distance(searchName, groupName);
                phoenaticMatch.push({"matchval": matchVal, "group" : group})
            }
        }
    });
    phoenaticMatch.sort(function(a, b){
        return b.matchVal - a.matchVal;
    });
    if(returnGroup === undefined){
        returnGroup = phoenaticMatch[0];
    }

    return returnGroup;

}