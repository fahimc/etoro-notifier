const SymbolModel = require('../model/symbolModel.js');
const Util = require('../util/util.js');
const push = require('pushover-notifications');

const pushoverUser = 'u88s1ta7se5c4s6ykdx64miahdjvpn';
const pushoverApplicationToken = 'ajpjvyvhpnpgfi45uvht79j1uxgfob';

const Notifier = {
    CURRENCY:'$',
    averageLength:20,
    checkedAverage:{

    },
    checkedHighLow:{

    },
    check(price, symbol, row) {
        price = Number(price.substring(1, price.length));
        this.checkLowest(price, symbol, row);
        this.checkHighest(price, symbol, row);
        // this.checkPercentageChange(price,symbol,row);
        this.checkAverageChangeOverPeriod(price, symbol, row);
    },
    checkPercentageChange(price, symbol, row) {
        if (!row) return;
        let lastRow = row.prices[row.prices.length - 1];
        if (lastRow) {
            let lastPrice = lastRow.price;
            let changePercentage = (Math.abs(price - lastPrice) / lastPrice);
            console.log('changePercentage', changePercentage);
        }
    },
    checkAverageChangeOverPeriod(price, symbol, row) {
        if (!row || !row.prices.length) return;
        if(this.checkedAverage[symbol])
        {
          let checkedLength = this.checkedAverage[symbol];
          if((checkedLength + this.averageLength) > row.prices.length)return; 
        }
        let length = row.prices.length > this.averageLength ? this.averageLength : row.prices.length;
        let raises = 0;
        let falls = 0;
        let lowestPrice = row.prices[row.prices.length - 1].price;
        let highestPrice = row.prices[row.prices.length - 1].price;
        for (let a = 0; a < length; ++a) {
            let item = row.prices[a];
            if (item.price < lowestPrice) lowestPrice = item.price;
            if (item.price > highestPrice) highestPrice = item.price;
            if (a) {
                lastItem = row.prices[a - 1];
                if (lastItem.price < item.price) raises++;
                if (lastItem.price > item.price) falls++;
            }
        }
        let changePercentage = (Math.abs(price - lowestPrice) / lowestPrice);
        console.log('number of price falls', falls, '/', falls + raises);
        console.log('number of price raises', raises, '/', falls + raises);
        console.log('change percentage of period', changePercentage);
        if (changePercentage >= 0.01) {
          this.send('Crypto Alert',row.name + ' has changed by ' + (changePercentage * 100).toFixed(2) +'%. \nNumber of Raises ' + raises + '/' + (falls + raises) + ' and the number of falls ' + falls + '/' +  (falls + raises) + '.\nCurrent price is ' + this.CURRENCY +  Util.formatMoney(price,2));
        }
        this.checkedAverage[symbol] = row.prices.length;
    },
    checkLowest(price, symbol, row) {
        if (!row) return;
        if (price < row.lowest) {
          if(this.checkedHighLow[symbol] && this.checkedHighLow[symbol].lowest == price){
            return;
          }else{
            this.checkedHighLow[symbol] = {};
          }
          this.checkedHighLow[symbol].lowest = price;
           console.log(symbol, ' is currently at it lowest price at', price);
           this.send('Lowest price met',row.name + ' is currently at it lowest price at ' + this.CURRENCY + Util.formatMoney(price,2));
        }
    },
    checkHighest(price, symbol, row) {
        if (!row) return;
        if (price > row.highest){
           if(this.checkedHighLow[symbol] && this.checkedHighLow[symbol].highest == price){
            return;
          }
          this.checkedHighLow[symbol].highest = price;
           console.log(symbol, ' is currently at it highest price at', price);
           this.send('Highest price met',row.name + ' is currently at it highest price at ' + this.CURRENCY + Util.formatMoney(price,2));
        }
    },
    send(title,message) {
        var p = new push({
            user: pushoverUser,
            token: pushoverApplicationToken
        });
        var msg = {
            message: message,
            title:title,
            sound: '',
            device: '',
            priority: 1
        };

        p.send(msg, function(err, result) {
            if (err) {
                throw err;
            }
        });
    }
};

module.exports = Notifier;