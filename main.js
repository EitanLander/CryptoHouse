/// <reference path="jquery-3.7.0.js" />

"use strict";

$(() => {

     
  $(window).scroll(function () {
    var navbar = $("#headerNav");
    if ($(window).scrollTop() > 0) {
      navbar.addClass("navbar-scrolled visible");
    } else {
      navbar.removeClass("navbar-scrolled visible");
    }
  });
    
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

    // Clear the selectedCoinIds from local storage
    localStorage.removeItem("selectedCoinIds");

    // Close any open modals
  }

  // Search Button function
  $("#searchButton").on("click", function () {
    const coinList = $("#coinsContainer");
    const cards = coinList.find(".card");
    const searchInput = $("#searchInput");
    const filter = searchInput.val().toLowerCase();

    for (let i = 0; i < cards.length; i++) {
      const item = $(cards[i]);
      const text = item.text().toLowerCase();

      // Search filter by letter or full name
      if (text.includes(filter) || filter === "") {
        item.show();
      } else {
        item.hide();
      }
    }
  });

  // Displaying Crypto Coins and adding them to the Page
  function displayCoins(coins) {
    coins = coins.filter(c => c.name.length <= 8);
    let html = "";
    for (let i = 0; i < 100; i++) {
      html += `
        <div id="card" class="card">
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
      if (selectedCoins.length > maxCoins) {
        selectedCoins.pop();
        updateSelectedCoinsModal();
        $("#maxCoinsModal").modal("hide");
      }
    });

    // Creating The Selected Coins By An Array:
    let selectedCoins = [];

    const maxCoins = 5;

    // Pop up a modal when user reach max coins (5 coins).
    if (selectedCoins.length === maxCoins) {
      $("#maxCoinsModal").modal("show");
      return;
    }

    for (let i = 0; i < 100; i++) {
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
            <input class="unselect-slider" type="checkbox" id="inlineCheckbox_${i}" data-coin-id="${coin.id}" checked>
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
            $("#maxCoinsModal").modal("hide");
            console.log(selectedCoins);
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

      // Create an array of selected coin IDs
      const selectedCoinIds = selectedCoins.map(coin => coin.symbol);

      // Store the selected coin IDs in the local storage
      localStorage.setItem("selectedCoinIds", JSON.stringify(selectedCoinIds));
    }
  }

  // Modal error when user try to leave without action:
  $("#maxCoinsModal").on("click", function (event) {
    let modalContent = $(this).find(".modal-content");
    let modalErrorMessage = $(this).find("#modalErrorMessage");

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
    
    
      $("#reportsLink").on("click", async function () {

        let dataIntervalId;
        clearInterval(dataIntervalId);
        $("#chartContainer").empty();

    const selectedCoinIds = JSON.parse(localStorage.getItem("selectedCoinIds"));

          if (!selectedCoinIds) {
      $("#chartMessage").html(
        `<div class="noData"> <h2>Please select up to 5 coins to display on the graph!</h2> </div>`
      );
    } else {


      let coinOne = [];
      let coinTwo = [];
      let coinThree = [];
      let coinFour = [];
      let coinFive = [];
      let coinName = [];

      function getData(event) {
        const coinsSelected = selectedCoinIds.slice(0, 5);
        $.ajax({
          type: "GET",
          url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsSelected.join(
            ","
          )}&tsyms=USD`,

          success: function (result) {
            if (result.Response === "Error") {
              clearInterval(dataIntervalId);
              $("#chartMessage").html(
                `<div class="noData"> <h2>No data on selected currencies - please try other coins!</h2> </div>`
              );
            } else {
              $("#chartMessage").html(
                ` <div id="chartContainer""></div>`
              );

              let dateNow = new Date();
              coinName = [];

              Object.entries(result).forEach(([key, value], index) => {
                const coinData = {
                  x: dateNow,
                  y: value.USD,
                };

                // Push the coin real-time data to the corresponding array
                switch (index) {
                  case 0:
                    coinOne.push(coinData);
                    break;
                  case 1:
                    coinTwo.push(coinData);
                    break;
                  case 2:
                    coinThree.push(coinData);
                    break;
                  case 3:
                    coinFour.push(coinData);
                    break;
                  case 4:
                    coinFive.push(coinData);
                    break;
                  default:
                    break;
                }

                // Push the coin name to the array of real-time names
                coinName.push(key);
              });

              createGraph();
            }
          },
        });
      }

      dataIntervalId = setInterval(() => {
        getData();
      }, 2000);

        function createGraph(event) {

        let chart = new CanvasJS.Chart("chartContainer", {
          exportEnabled: true,
          animationEnabled: false,
          theme: "light2",

          title: {
            text: "Real-time Price of Selected CryptoCurrencies in $USD",
          },
          axisX: {
            valueFormatString: "HH:mm:ss",
          },
          axisY: {
            title: "Coin Value",
            suffix: "$",
            titleFontColor: "#4F81BC",
            lineColor: "#00A0FF",
            labelFontColor: "#4F81BC",
            tickColor: "#4F81BC",
            includeZero: true,
          },
          toolTip: {
            shared: true,
          },
          legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries,
          },
          data: [
            {
              type: "stepLine",
              name: coinName[0],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: coinOne,
              lineThickness: 5,
              color: "#4F81BC",
            },
            {
              type: "stepLine",
              name: coinName[1],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: coinTwo,
              lineThickness: 5,
              color: "#C0504E",
            },
            {
              type: "stepLine",
              name: coinName[2],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: coinThree,
              lineThickness: 5,
              color: "#9BBB58",
            },
            {
              type: "stepLine",
              name: coinName[3],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: coinFour,
              lineThickness: 5,
              color: "#604A7B",
            },
            {
              type: "stepLine",
              name: coinName[4],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: coinFive,
              lineThickness: 5,
              color: "#F08000",
            },
          ],
        });

        chart.render();

        function toggleDataSeries(e) {
          if (
            typeof e.dataSeries.visible === "undefined" ||
            e.dataSeries.visible
          ) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
        }
      }
    }
  });

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
  const getJson = async path => {
    return $.ajax({
      url: path,
      dataType: "json",
    });
  };
});
