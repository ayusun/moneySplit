var currencyMap = {
    singapore_dollar : 'SGD',
    singapore_dollars: 'SGD',
    indian_national_rupee : 'INR',
    dollar: 'USD',
    dollars: 'USD'
}

module.exports.getCurrencySymbol = function(currency, defaultSymbol) {
    if(currency.toLowerCase() === "bucks" || currency.toLowerCase() === "buck") {
        return defaultSymbol;
    } else {
        var convertedCurrency = currency.toLowerCase().replace(" ", "_");
        var currencySymbol = currencyMap[convertedCurrency];
        return currencySymbol === undefined? defaultSymbol : currencySymbol;
    }
};