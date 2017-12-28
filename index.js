const market = require('coinmarketcap-cli-api');
const dbManager = require('./service/db.js');
const SymbolModel = require('./model/symbolModel.js');
const Notifier = require('./service/notifier.js');

const CryptoBot = {
  delay:120000,
  nextIndex:0,
  init(){
    console.log('Started CryptoBot');
    dbManager.init();
    this.getNextMarket();
  },
  getNextMarket(){
    let symbol = this.getNextSymbol();
    if(symbol) {
      console.log('Getting symbol ',SymbolModel[symbol].symbol);
      let promise = market.getMarkets(SymbolModel[symbol].symbol);
      promise.catch(this.getNextMarket.bind(this));
      promise.then(this.onMarkets.bind(this));
    }else{
      this.reset();
    }
  },
  onMarkets(markets){
    let name = this.getNextSymbol();
    let price = markets[0].Price;
    this.checkPrice(price,SymbolModel[name].symbol,name);
    dbManager.addSymbol(SymbolModel[name].symbol,price,name);
    this.nextIndex++;
    this.getNextMarket();
  },
  checkPrice(price,symbol,name){
    let row  = dbManager.getSymbol(symbol);
    Notifier.check(price,symbol,row);
  },
  getNextSymbol(){
    if(this.nextIndex >= Object.keys(SymbolModel).length)return;
    return Object.keys(SymbolModel)[this.nextIndex];
  },
  reset(){
    console.log('waiting ',this.delay/1000, ' before checking again');
    this.nextIndex = 0;
    setTimeout(()=>{
      this.getNextMarket();
    },this.delay);
  }
};

CryptoBot.init();