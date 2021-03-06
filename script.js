$(function() {
  getEthPrice();
  let refreshCountdown = 10;
  let $refreshDiv = $('.refresh');
  $refreshDiv.html(`Refreh in: ${refreshCountdown} seconds`);

  setInterval(function() {
    $refreshDiv.html(`Refresh in: ${refreshCountdown} seconds`);
    if (refreshCountdown < 1) {
      refreshCountdown = 10;
    }
    refreshCountdown -= 1;
  }, 1000);

  setInterval(function() {
    getEthPrice();
  }, 10000);


  $('.set-target').on('click', function(e) {
    const target = prompt('What is your price target?');
    if (target) {
      window.localStorage.priceTarget = target;
    }
  });
  
  $('.price-options').on('change', function() {
    getEthPrice();
  });
});


function getEthPrice(currency) {
   if (!currency) {
    currency = $('.price-options option:selected').text() || 'eth-usd';
    $('.currency-type').html(`${currency.toUpperCase()} Price`);
   }

   $.ajax(`https://api.gdax.com/products/${currency}/ticker`)
   .then((res) => {
      if (res) {
        const ethPrice = `$${round(res.price)}`;
        $('.price').html(ethPrice);
        document.title = ethPrice;
      }

      let priceTarget = window.localStorage.priceTarget || 500;
      const pricePercentage = parseFloat((res.price/priceTarget) * 100).toFixed(2);
      $('.target').html(`Price Target: $${priceTarget} (${pricePercentage}%)`);
    });

    getOrderBook(currency);
    get24HourStats(currency);
}

function getOrderBook(currency) {
  if (!currency) {
    currency = $('.price-options option:selected').text() || 'eth-usd';
  }

  $.ajax(`https://api.gdax.com/products/${currency}/book`)
  .then((res) => {
    if (res) {
      const asksPrice = res.asks[0][0];
      const asksAmount = res.asks[0][1];
      $('.asks').html(`Sells: $${asksPrice} / ${round(asksAmount)} Orders`);

      const bidsPrice = res.bids[0][0];
      const bidsAmount = res.bids[0][1];
      $('.bids').html(`Buys: $${bidsPrice} / ${round(bidsAmount)} Orders`);
    }
  });
}

function get24HourStats(currency) {
  if (!currency) {
    currency = $('.price-options option:selected').text() || 'eth-usd';
  }

  $.ajax(`https://api.gdax.com/products/${currency}/stats`)
  .then((res) => {
    if (res) {
      $('.daily-stats').html(`
        <p><u><b>24 Hour Stats</b></u></p>
        <p><b>Open:</b> ${round(res.open)}</p>
        <p><b>High:</b> ${round(res.high)}</p>
        <p><b>Low:</b> ${round(res.low)}</p>
        <p><b>Volume:</b> ${round(res.volume)}</p>`);
    }
  });  
}

function round(value) {
  return parseFloat(Math.round(value * 100) / 100).toFixed(2)
}