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

  handleHome();
  async function handleHome() {
    const coins = await getJson("coins.json"); // Replace Before Public- https://api.coingecko.com/api/v3/coins/list
    displayCoins(coins);
  }

  // Search Button function
  function searchButton() {
    const coinList = document.getElementById("coinsContainer");
    const cards = coinList.getElementsByClassName("card");

    $("#searchButton").on("click", function () {
      const filter = searchInput.value.toLowerCase();

      for (let i = 0; i < cards.length; i++) {
        const item = cards[i];
        const text = item.textContent.toLowerCase();

        // Search filter by letter or full name
        if (text.includes(filter) || filter === "") {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      }
    });
  }

  searchButton();

  let selectedCoins = [];

  // Displaying Crypto Coins and adding them to the Page
  function displayCoins(coins) {
    coins = coins.filter(c => c.name.length <= 8);
    let html = "";
    for (let i = 506; i < 606; i++) {
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

    // If User Decided To Leave 5 Coin , Remove the Sixth from the Array.
    $("#exitModalButton").on("click", function () {
      if (selectedCoins.length > 0) {
        selectedCoins.pop();
        updateSelectedCoinsModal();
        console.log(selectedCoins);
      }
    });

    // Creating The Selected Coins By An Array:

    const maxCoins = 5;

    // Pop up a modal when user reach max coins (5 coins).
    if (selectedCoins.length === maxCoins) {
      $("#maxCoinsModal").modal("show");
      return;
    }

    for (let i = 506; i < 606; i++) {
      const checkbox = $(`#slider_${coins[i].id}`);

      checkbox.on("change", function () {
        const isChecked = checkbox.prop("checked");
        const coinId = checkbox.attr("id").substring(7);

        // When user check coin , it push it to the array:
        if (isChecked) {
          if (selectedCoins.length < maxCoins) {
            const coin = coins.find(c => c.id === coinId);
            if (!selectedCoins.some(c => c.id === coinId)) {
              selectedCoins.push(coin);
            }
            // When user check the sixth coin , create an offer for replacing on the modal:
          } else {
            const modalHeader = $("#sixthCoin");
            const sixthCoin = coinId;
            const addSixthCoinToArray = `
    <p>To add the "<b>${sixthCoin}</b>" coin, you must unselect another coin:</p>`;
            modalHeader.html(addSixthCoinToArray);
            checkbox.prop("checked", false);
            $("#maxCoinsModal").modal("show");

            const coin = coins.find(c => c.id === coinId);
            if (!selectedCoins.some(c => c.id === coinId)) {
              selectedCoins.push(coin);
            }
          }
        } else {
          selectedCoins = selectedCoins.filter(c => c.id !== coinId);
        }

        updateSelectedCoinsModal();
      });
    }

    // Create the the modal with coins and sliders:

    async function updateSelectedCoinsModal() {
      const modalBody = $("#maxCoinsModal .modal-body");
      modalBody.empty();

      const displayedCoins = selectedCoins.slice(0, 5);

      for (let i = 0; i < displayedCoins.length; i++) {
        const coin = displayedCoins[i];
        const coinCheckbox = $(`#slider_${coin.id}`);
        coinCheckbox.prop("checked", true);

        // Get image source from API
        const coinId = coin.id;
        const coinData = await getJson(
          "https://api.coingecko.com/api/v3/coins/" + coinId
        );
        const imageSource = coinData.image.small;

        // Modal content
        const coinInfo = `
      <div id="coinBoxModal">
        <div id="coinName">
          <img src="${imageSource}" alt="${coin.name} logo">
          <p id="modalCoin" class="card-title">${coin.name} (${coin.symbol})</p>
          </div>
        <div id="slider">
          <label id="modalSwitch" class="switch">
            <input class="unselect-slider" type="checkbox" data-coin-id="${coin.id}" checked>
            <span class="slider round"></span>
          </label>
        </div>
      </div>
    `;

        modalBody.append(coinInfo);

        // When user unselects a coin, it is unchecked
        const unselectSlider = modalBody.find(
          `.unselect-slider[data-coin-id="${coin.id}"]`
        );
        unselectSlider.on("change", function () {
          const isChecked = $(this).prop("checked");
          const coinId = $(this).data("coin-id");

          if (!isChecked) {
            // Remove the unselected coin from the array
            selectedCoins = selectedCoins.filter(coin => coin.id !== coinId);

            $(`#slider_${coinId}`).prop("checked", false);
            updateSelectedCoinsModal();
            console.log(selectedCoins);
            $("#maxCoinsModal").modal("hide");
          }
        });
      }

      const coinsSelected = document.getElementById("coinsSelected");
      coinsSelected.innerHTML = "";

      // Add only the symbols of selected coins to coinsSelected
      selectedCoins.forEach(coin => {
        const coinSymbol = coin.symbol;
        const coinSymbolElement = document.createElement("span");
        coinSymbolElement.classList.add("selectedCoins");
        coinSymbolElement.innerText = coinSymbol + " ";
        coinsSelected.appendChild(coinSymbolElement);
      });
    }
  }

  // Modal error when user try to leave without action:
  $("#maxCoinsModal").on("click", function (event) {
    var modalContent = $(this).find(".modal-content");
    var modalErrorMessage = $(this).find("#modalErrorMessage");

    // Check if the clicked element is outside the modal content
    if (
      !modalContent.is(event.target) &&
      modalContent.has(event.target).length === 0
    ) {
      modalErrorMessage.text(`Before You Leave 
        ,Uncheck One Coin , Or Stay With The Same`);
    } else {
      modalErrorMessage.text(""); // Clear the error message if the click is within the modal content
    }
  });

//   $("#reportsLink").on("click", function () {
//     if (selectedCoins.length === 0) {
//       $("#maincontainer").html(
//         `<div class="noneselectedmsg"> <h2>Please select up to 5 coins to display on the graph!</h2> </div>`
//       );
//     } else
//       var options = {
//         exportEnabled: true,
//         animationEnabled: true,
//         title: {
//           text: "Currency Price in USD",
//         },
//         axisX: {
//           title: "Time",
//         },
//         axisY: {
//           title: "Price in USD",
//           titleFontColor: "#4F81BC",
//           lineColor: "#4F81BC",
//           labelFontColor: "#4F81BC",
//           tickColor: "#4F81BC",
//         },
//         data: [
//           {
//             type: "spline",
//             name: "ETH",
//             showInLegend: true,
//             xValueFormatString: "HH:mm:ss",
//             yValueFormatString: "$#,##0.#",
//             dataPoints: [],
//           },
//           {
//             type: "spline",
//             name: "BTC",
//             showInLegend: true,
//             xValueFormatString: "HH:mm:ss",
//             yValueFormatString: "$#,##0.#",
//             dataPoints: [],
//           },
//         ],
//       };

//     var chart = new CanvasJS.Chart("chartContainer", options);
//     chart.render();

//     // Create the chart object
//     var chart = new CanvasJS.Chart("chartContainer", {
//       title: {
//         text: "Selected Coins Performance",
//       },
//       axisY: {
//         title: "Price",
//         includeZero: false,
//         prefix: "$",
//       },
//       data: [],
//     });

//     // Update data every 2 seconds
//     setInterval(function () {
//       fetch(
//         `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoins
//           .map(coin => coin.symbol)
//           .join(",")}&tsyms=USD`
//       )
//         .then(function (response) {
//           return response.json();
//         })
//         .then(function (data) {
//           var currentDate = new Date();

//           // Iterate over selected coins
//           selectedCoins.forEach(coin => {
//             var coinPrice = data[coin.symbol.toUpperCase()].USD; // Coin price in USD

//             // Find the data series for the current coin
//             var dataSeries = chart.data.find(
//               series => series.name === coin.symbol
//             );

//             // If the data series exists, update its data points
//             if (dataSeries) {
//               // Add new data point to the chart
//               dataSeries.dataPoints.push({
//                 x: currentDate,
//                 y: coinPrice,
//               });

//               // Remove data point if there are more than 12 data points
//               if (dataSeries.dataPoints.length > 12) {
//                 dataSeries.dataPoints.shift();
//               }
//             } else {
//               // Create a new data series for the coin
//               chart.data.push({
//                 type: "line",
//                 name: coin.symbol,
//                 showInLegend: true,
//                 dataPoints: [{ x: currentDate, y: coinPrice }],
//               });
//             }
//           });

//           chart.render();
//         })
//         .catch(function (error) {
//           console.log("Error:", error);
//         });
//     }, 2000); // 2 seconds interval
//   });

  // Take data for more info on every coin:

  async function handleMoreInfo(coinId) {
    const localStorageKey = "coin_" + coinId;
    const storedData = localStorage.getItem(localStorageKey);

    // Check if there is stored data already , every 2 minutes cooldown for the API:
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

    // API for the coins info:

    const coin = await getJson(
      "https://api.coingecko.com/api/v3/coins/" + coinId
    );
    const imageSource = coin.image.small;
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

    // Real time date :
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
