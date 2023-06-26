/// <reference path="jquery-3.7.0.js" />

"use strict";

$(() => {

    
  $("a.nav-link").click(function () {
    // Pill UI:
    $("a.nav-link").removeClass("active");
    $(this).addClass("active");

    // Display correct section:
    const sectionId = $(this).attr("data-section");
    $("section").hide();
    $("#" + sectionId).show();
  });

  $("#coinsContainer").on("click", ".more-info", async function () {
    const coinId = $(this).attr("id").substring(7);
    await handleMoreInfo(coinId);
  });

  $("#homeLink").click(async () => await handleHome());
  $("#reportsLink").click(() => {});
  $("#aboutSection").click(() => {});

  async function handleHome() {
    const coins = await getJson("coins.json");
    displayCoins(coins);
  }

  // Search Button
  function searchButton() {
    const coinList = document.getElementById("coinsContainer");
    const cards = coinList.getElementsByClassName("card");

    $("#searchButton").on("click", function () {
      const filter = searchInput.value.toLowerCase();

      for (let i = 0; i < cards.length; i++) {
        const item = cards[i];
        const text = item.textContent.toLowerCase();

        if (text.includes(filter) || filter === "") {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      }
    });
  }

  searchButton();

  function displayCoins(coins) {
    coins = coins.filter((c) => c.id.length <= 7);
    let html = "";
    for (let i = 0; i < 100; i++) {
      html += `
        <div id="card" class="card" style="width: 15rem; height:18rem; overflow:auto;">
          <div id="cardBody" class="card-body">
            <label class="switch">
              <input id="slider_${coins[i].id}" type="checkbox">
              <span id="sliderButton" class="slider round"></span>
            </label>
            <h5 class="card-title">${coins[i].symbol}</h5>
            <p class="card-text">${coins[i].name}</p>
            <button id="button_${coins[i].id}" class="btn btn-primary more-info" data-bs-toggle="collapse" data-bs-target="#collapse_${coins[i].id}">
              Coin Info
            </button>
            <div id="coinMoreInfo">
              <div class="collapse collapse-vertical" id="collapse_${coins[i].id}">
                <div class="card card-body" style="width: 200px;"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    $("#coinsContainer").html(html);

    let selectedCoins = [];
    const maxCoins = 5;
    checkSelectedCoins();

    function checkSelectedCoins() {
      if (selectedCoins.length > maxCoins) {
        $("#maxCoinsModal").modal("show");
        return;
      }
    }

    for (let i = 0; i < 100; i++) {
      const checkbox = $(`#slider_${coins[i].id}`);

      checkbox.on("change", function () {
        const isChecked = checkbox.prop("checked");
        const coinId = checkbox.attr("id").substring(7);
        const coinsSelected = document.getElementById("coinsSelected");

        if (isChecked) {
          if (selectedCoins.length < maxCoins) {
            const coin = coins.find((c) => c.id === coinId);
            if (!selectedCoins.some((c) => c.id === coinId)) {
              selectedCoins.push(coin);
            }
          } else {
            const modalHeader = $("#sixthCoin");
            const sixthCoin = `
          <p> To add the "<b>${coinId}</b>" coin,<br> you must unselect other coin : <br></p>`;
            modalHeader.empty();
            modalHeader.append(sixthCoin);
            checkbox.prop("checked", false);
            $("#maxCoinsModal").modal("show");
          }
        } else {
          selectedCoins = selectedCoins.filter((c) => c.id !== coinId);
        }
        coinsSelected.innerHTML = "";

        // Add only the symbols of selected coins to coinsSelected
        selectedCoins.forEach((coin) => {
          const coinSymbol = coin.symbol;
          const coinSymbolElement = document.createElement("span");
          coinSymbolElement.innerText = coinSymbol + " ";
          coinsSelected.appendChild(coinSymbolElement);
        });
        console.log(selectedCoins);
        updateSelectedCoinsModal();
      });
    }

    function updateSelectedCoinsModal() {
      const modalBody = $("#maxCoinsModal .modal-body");
      modalBody.empty();

      selectedCoins.forEach((coin) => {
        const coinCheckbox = $(`#slider_${coin.id}`);
        coinCheckbox.prop("checked", true);

        modalBody.on("change", ".model-slider", function () {
          const coinId = $(this).data("coin-id");
          const isChecked = $(this).prop("checked");

          if (isChecked) {
            console.log("Coin selected:", coinId);
            coinCheckbox.prop("checked", true);
          } else {
            console.log("Coin unselected:", coinId);
            coinCheckbox.prop("checked", false);
          }
        });

        const coinInfo = `
      <div>
        <div id="coinName">
          <p>${coin.name} (${coin.symbol})</p>
        </div>
        <div id="slider">
          <label class="switch">
            <input class="unselect-slider" type="checkbox" data-coin-id="${coin.id}" checked>
            <span class="slider round"></span>
          </label>
        </div>
      </div>
    `;
        modalBody.append(coinInfo);
      });

      $(".unselect-slider").on("change", function () {
        const isChecked = $(this).prop("checked");
        const coinId = $(this).data("coin-id");

        if (!isChecked) {
          // Remove the unselected coin from the array
          selectedCoins = selectedCoins.filter((coin) => coin.id !== coinId);

          // Check if there is a sixth coin available
          if (selectedCoins.length >= 6) {
            // Replace the unselected coin with the sixth coin
            selectedCoins.splice(5, 1, selectedCoins[5]);
          }

          $(`#slider_${coinId}`).prop("checked", false);
          updateSelectedCoinsModal(); // Call this function to update the modal content
          console.log(selectedCoins);
          $("#maxCoinsModal").modal("hide");

          checkSelectedCoins();
        }
      });
    }
    
    
    // getCoinsData();

    // async function getCoinsData() {
    //   const symbols = selectedCoins.map((coin) => coin.symbol).join(",");
    //   const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD,ILS`;

    //   try {
    //     const response = await fetch(url);
    //     const data = await response.json();

    //     console.log("API response:", data); // Log the API response to check its structure

    //     for (const coin of selectedCoins) {
    //       const symbol = coin.symbol;
    //       const coinData = data[symbol]; // Get the coin's data object from the API response

    //       if (coinData) {
    //         const usdPrice = coinData.USD; // Access the USD price property
    //         const ilsPrice = coinData.ILS; // Access the ILS price property
    //         const timestamp = new Date().getTime();

    //         const dataPoint = {
    //           x: timestamp,
    //           y: usdPrice,
    //         };

    //         const dataSeriesIndex = dataSeries.findIndex(
    //           (series) => series.name === symbol
    //         );
    //         if (dataSeriesIndex !== -1) {
    //           dataSeries[dataSeriesIndex].dataPoints.push(dataPoint);
    //         }
    //     }
    //     }

    //     // Update the chart with the new data points
    //     $("#chartContainer").CanvasJSChart().render();
    //   } catch (error) {
    //     console.log("Error fetching data:", error);
    //   }

    //   // Schedule the next update after a certain time interval
    //   setTimeout(getCoinsData, 5000); // Update every 5 seconds (adjust the interval as needed)
    // }








  };


  

  async function handleMoreInfo(coinId) {
    const localStorageKey = "coin_" + coinId;
    const storedData = localStorage.getItem(localStorageKey);

    if (storedData) {
      const data = JSON.parse(storedData);
      const currentTime = new Date().getTime();

      if (currentTime - data.timestamp < 120000 /*2 Minutes*/) {
        const { imageSource, usd, eur, ils } = data;
        const moreInfo = `
        <img src="${imageSource}"><br>
        USD: $${usd} <br>
        USD: €${eur} <br>
        USD: ₪${ils} <br>
      `;
        $(`#collapse_${coinId}`).html(moreInfo);
        return;
      }
    }

    const coin = await getJson(
      "https://api.coingecko.com/api/v3/coins/" + coinId
    );
    const imageSource = coin.image.thumb;
    const usd = coin.market_data.current_price.usd;
    const eur = coin.market_data.current_price.eur;
    const ils = coin.market_data.current_price.ils;
    const moreInfo = `
    <img src="${imageSource}"><br>
    USD: $${usd} <br>
    USD: €${eur} <br>
    USD: ₪${ils} <br>
  `;
    $(`#collapse_${coinId}`).html(moreInfo);

    const newData = {
      imageSource,
      usd,
      eur,
      ils,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(localStorageKey, JSON.stringify(newData));
  }
  async function getJson(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  }

});




