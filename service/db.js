const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('data/db.json');
const db = low(adapter);

const DBManager = {
    init() {
        db.defaults({ history: [] })
            .write()
    },
    addSymbol(symbol, price,name) {
        price = Number(price.substring(1, price.length));
        let now = new Date();
        let jsonDate = now.toJSON();
        let priceItem = {price:price,datetime:jsonDate};
        let row = db.get('history').find({ symbol: symbol }).value();
        if (!row) {
            db.get('history').push({ name: name, symbol: symbol, prices: [priceItem], lowest: price, highest: price }).write()
        } else {
            if (row.lowest > price) {
              row.lowest = price;
              db.get('history').find({ symbol: symbol }).assign(row).write();
            } 
            if (row.highest < price) {
              row.highest = price;
              db.get('history').find({ symbol: symbol }).assign(row).write();
            }
            let lastPrice = row.prices[row.prices.length-1].price;
            let changePercantge = (Math.abs(price - lastPrice) / lastPrice);
            if(changePercantge > 0.005)
            {
              console.log('Saving price to DB as percentage change is ', changePercantge);
              row.prices.push(priceItem);
              db.get('history').find({ symbol: symbol }).assign(row).write();
            }else{
              console.log('percentage change is not enough to save. change is ', changePercantge);
            }
            
        }
    },
    getSymbol(symbol){
       let row = db.get('history').find({ symbol: symbol }).value();
       return row;
    }
};

module.exports = DBManager;