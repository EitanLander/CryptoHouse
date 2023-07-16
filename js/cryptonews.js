$(() => {
    // Get the necessary elements
    const coinsNewsContainer = $("#coinsNewsContainer");
  
    // Update the crypto news list with data from the CoinGecko API
    $.ajax({
      url: "https://api.coingecko.com/api/v3/news",
      method: "GET",
      dataType: "json",
      success: function(data) {
        // Check if the response contains the "data" property and it is an array
        if (Array.isArray(data.data)) {
          // Iterate over the news articles and create list items
          const newsItems = data.data.slice(0, 5).map(function(article) {
            return `<li><img class="icon" src="${article.thumb_2x}" alt="${article.title}">${article.title}</li>`;
          });
  
          // Update the crypto news container with the news items
          coinsNewsContainer.html(newsItems.join(""));
        } else {
          console.log("Invalid response from the CoinGecko API.");
        }
      },
      error: function(error) {
        console.log("Error fetching crypto news:", error);
      }
    });
  });