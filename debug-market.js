const { isMarketOpen } = require('./src/lib/market-time');
console.log('Is Market Open?', isMarketOpen());
const now = new Date();
console.log('Current Time:', now.toString());
