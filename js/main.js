/// <reference path="jquery-3.7.0.js" />

"use strict";

$(() => {
  // Scroll to top when the "Scroll Up" link is clicked
  $("#scrollTop").click(() => {
    $("html, body").animate({ scrollTop: 0 }, "slow");
  });

  // Toggle the "Scroll Up" link visibility based on scroll position
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $("#scrollTop").fadeIn();
    } else {
      $("#scrollTop").fadeOut();
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

  async function handleHome() {
    const coins = await getJson("coins.json"); // https://api.coingecko.com/api/v3/coins/list
    displayCoins(coins);

    // Clear the selectedCoinIds from local storage
    localStorage.removeItem("selectedCoinIds");
    $("#coinsSelected").html("");
  }
  $("#searchInput").on("input", function () {
    const coinList = $("#coinsContainer");
    const cards = coinList.find(".card");
    const searchInput = $(this);
    const filter = searchInput.val().toLowerCase();
    const cardsLength = cards.length;

    for (let i = 0; i < cardsLength; i++) {
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
    coins = coins.filter((c) => c.name.length <= 8);
    let html = "";

    for (let i = 10; i < 110; i++) {
      html += createCoinCard(coins[i]);
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

    function createCoinCard(coin) {
      return `
          <div id="card" class="card">
            <div id="cardBody" class="card-body">
              <label class="switch">
                <input id="slider_${coin.id}" type="checkbox">
                <span id="sliderButton" class="slider round"></span>
              </label>
              <h5 class="card-title">${coin.symbol}</h5>
              <p class="card-text">${coin.name}</p>
              <button id="button_${coin.id}" class="button-92 btn btn-primary more-info coin-button" data-bs-toggle="collapse" role="button" data-bs-target="#collapse_${coin.id}">
              Coin Info
              </button>
              <div id="coinMoreInfo">
                <div class="collapse-vertical" id="collapse_${coin.id}">
                <div class="coinInfoBackground"></div>
                </div>
              </div>
            </div>
          </div>
        `;
    }

    // Creating The Selected Coins By An Array:
    let selectedCoins = [];
    const maxCoins = 5;

    // Pop up a modal when user reaches max coins (5 coins).
    if (selectedCoins.length === maxCoins) {
      $("#maxCoinsModal").modal("show");
      return;
    }

    for (let i = 0; i < coins.length; i++) {
      const checkbox = $(`#slider_${coins[i].id}`);

      checkbox.on("change", () => {
        const isChecked = checkbox.prop("checked");
        const coinId = checkbox.attr("id").substring(7);

        // Remove the duplicated code block from here

        if (isChecked) {
          if (selectedCoins.length < maxCoins) {
            // Add the coin to selectedCoins directly
            const coin = coins.find((c) => c.id === coinId);
            if (!selectedCoins.some((c) => c.id === coinId)) {
              selectedCoins.push(coin);

              // Display a success toast message
              Toastify({
                text: "✔ Coin added to your watchlist ",
                className: "success",
                style: {
                  background: "linear-gradient(to right, #0084FF, #1DB3FF)",
                },
              }).showToast();
            }
          } else {
            const modalHeader = $("#sixthCoin");
            const sixthCoin = coinId;
            const addSixthCoinToArray = `
<p>To add the "<b>${sixthCoin}</b>" coin, you must unselect another coin:</p>`;
            modalHeader.html(addSixthCoinToArray);
            checkbox.prop("checked", false);
            $("#maxCoinsModal").modal("show");

            // Add the coin to selectedCoins directly
            const coin = coins.find((c) => c.id === coinId);
            if (!selectedCoins.some((c) => c.id === coinId)) {
              selectedCoins.push(coin);
            }
          }
        } else {
          selectedCoins = selectedCoins.filter((c) => c.id !== coinId);
        } updateSelectedCoinsModal();
      });
    }

    async function updateSelectedCoinsModal() {
      const modalBody = $("#maxCoinsModal .modal-body");
      modalBody.empty();
      const displayedCoins = selectedCoins.slice(0, 5);

      for (let i = 0; i < displayedCoins.length; i++) {
        const coin = displayedCoins[i];
        const coinCheckbox = $(`#slider_${coin.id}`);
        coinCheckbox.prop("checked", true);

        try {
            const coinInfo = await $.getJSON("https://api.coingecko.com/api/v3/coins/" + coin.id);
            const imageSource = coinInfo.image.small;
            
            const coinBoxModal = $("<div>")
              .attr("id", "coinBoxModal")
              .append(
                $("<div>")
                  .attr("id", "coinName")
                  .append(
                    $("<img>").attr("src", imageSource).attr("alt", `${coin.name} logo`),
                    $("<p>")
                      .attr("id", "modalCoin")
                      .addClass("card-title")
                      .text(`${coin.name} (${coin.symbol})`)
                  ),
                $("<div>")
                  .attr("id", "slider")
                  .append(
                    $("<label>")
                      .attr("id", "modalSwitch")
                      .addClass("switch")
                      .append(
                        $("<input>")
                          .addClass("unselect-slider")
                          .attr({
                            type: "checkbox",
                            id: `inlineCheckbox_${i}`,
                            "data-coin-id": coin.id,
                          })
                          .prop("checked", true),
                        $("<span>").addClass("slider round")
                      )
                  )
              );
            
            modalBody.append(coinBoxModal);
            
            const unselectSlider = modalBody.find(`.unselect-slider[data-coin-id="${coin.id}"]`);
            unselectSlider.on("change", function () {
              const isChecked = $(this).prop("checked");
              const coinId = $(this).data("coin-id");
            
              if (!isChecked) {
                selectedCoins = selectedCoins.filter((coin) => coin.id !== coinId);
                $(`#slider_${coinId}`).prop("checked", false);
                updateSelectedCoinsModal();
                $("#maxCoinsModal").modal("hide");
            
                // Display the toast message
                Toastify({
                  text: "✔ Watchlist has been updated",
                  className: "success",
                  style: {
                    background: "linear-gradient(to right, #265b00, #48a803)",
                  },
                }).showToast();
              }
            });
        } catch (error) {
          // Display an error toast message
          const errorMessage =
            "Choose a coin already , go see the live reports 😉";
          Toastify({
            text: errorMessage,
            className: "error",
            style: {
              background: "linear-gradient(to right, #ff0000, #f56c6c)",
            },
          }).showToast();
        }
      }

      $("#coinsSelected").html("");

      // Add only the symbols of selected coins to coinsSelected
      for (const coin of selectedCoins) {
        const coinSymbol = coin.symbol;
        const coinSymbolElement = $("<span>")
          .addClass("selectedCoins")
          .text(coinSymbol + " | ");
        $("#coinsSelected").append(coinSymbolElement);
      }

      // Create an array of selected coin IDs
      const selectedCoinIds = $.map(selectedCoins, function (coin) {
        return coin.symbol;
      });

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

  let dataIntervalId;
  let chart;

  // Function to clear the graph
  function clearGraph() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  }

  $("#reportsLink").on("click", async function () {
    clearInterval(dataIntervalId);
    clearGraph();
    $("#chartContainer").empty();

    const selectedCoinIds = JSON.parse(localStorage.getItem("selectedCoinIds"));

    if (!selectedCoinIds) {
      $("#chartMessage").html(
        `<div class="noData"> <h2>Please select coins to display on the graph!</h2> </div>`
      );
    } else {
      $("#chartMessage").html("");
      $(".loading").css("display", "block");
      //   $("#chartMessage").html(
      //     `<div class="noData">
      //        <h2>Loading...</h2>
      //          </div>`
      //   );
      let coinOne = [];
      let coinTwo = [];
      let coinThree = [];
      let coinFour = [];
      let coinFive = [];
      let coinName = [];

      function getData(event) {
        $(".loading").css("display", "none");
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
              $("#chartMessage").html(` <div id="chartContainer""></div>`);

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
            text: "Live $US Dollar Rates for Handpicked Cryptocurrencies",
          },
          axisX: {
            valueFormatString: "HH:mm:ss",
          },
          axisY: {
            title: "Coin Value",
            suffix: "$",
            titleFontColor: "#5F81BC",
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

  function getJson(path) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: path,
        dataType: "json",
        success: resolve,
        error: reject,
      });
    });
  }

  async function handleMoreInfo(coinId) {
    const localStorageKey = "coin_" + coinId;
    const storedData = localStorage.getItem(localStorageKey);

    // Check if there is stored data already and if it's not expired
    if (storedData) {
      const data = JSON.parse(storedData);
      const currentTime = new Date().getTime();
      if (currentTime - data.timestamp < 120000 /* 2 minutes */) {
        console.log(
          "The Data Already Existed in LocalStorage - No Api Call Needed"
        );
        const { imageSource, usd, eur, ils } = data;
        const moreInfo = `
          <img src="${imageSource}"><br>
          USD: $${usd} <br>
          EUR: €${eur} <br>
          ILS: ₪${ils} <br>
        `;
        $(`#collapse_${coinId}`).html(moreInfo);
        return;
      }
    }
    // Show the loading animation
    $(".loading").css("display", "block");
    // API call for the coin info
    try {
      const coin = await getJson(
        "https://api.coingecko.com/api/v3/coins/" + coinId
      );
      console.log("New Api Request - This Is New Data");
      const imageSource = coin.image.small;
      const usd = coin.market_data.current_price.usd;
      const eur = coin.market_data.current_price.eur;
      const ils = coin.market_data.current_price.ils;
      const moreInfo = `
        <img src="${imageSource}"><br>
        USD: $${usd} <br>
        EUR: €${eur} <br>
        ILS: ₪${ils} <br>
      `;
      $(`#collapse_${coinId}`).html(moreInfo);

      // Store the updated data in local storage
      const newData = {
        imageSource,
        usd,
        eur,
        ils,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem(localStorageKey, JSON.stringify(newData));
    } catch (error) {
      // Display an error toast message
      const errorMessage =
        "Please wait a moment before making another request. Avoid spamming the data.";
      Toastify({
        text: errorMessage,
        className: "error",
        style: {
          background: "linear-gradient(to right, #ff0000, #f56c6c)",
        },
      }).showToast();
    } finally {
      // Hide the loading animation
      $(".loading").css("display", "none");
    }
  }
});
