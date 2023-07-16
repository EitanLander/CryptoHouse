$(() => {
    // Get the necessary elements
    const carouselInner = $("#cryptoNews .carousel-inner");
    const coinsNewsContainer = $("#coinsNewsContainer");

    
    // Update the crypto news list with data from the CoinGecko API
    $.ajax({
        url: "https://api.coingecko.com/api/v3/news",
        method: "GET",
        dataType: "json",
        success: function(data) {
            // Check if the response contains the "data" property and it is an array
            if (Array.isArray(data.data)) {
                // Iterate over the news articles and create carousel slides
                const slides = data.data.slice(0, 5).map(function(article, index) {
                    const activeClass = index === 0 ? "active" : "";
                    return `
                        <div class="carousel-item ${activeClass}">
                            <img class="d-block" src="${article.thumb_2x}" alt="${article.title}">
                            <div class="carousel-caption">
                                <h6>${article.title}</h6>
                            </div>
                        </div>
                    `;
                });
                

                // Update the carousel inner container with the slides
                carouselInner.html(slides.join(""));
            } else {
                console.log("Invalid response from the CoinGecko API.");
            }
            const newsItems = data.data.slice(0, 5).map(function(article) {
                return `<li id="cryptoNewsBanner"><img class="icon" src="${article.thumb_2x}">${article.title}<img class="icon" src="${article.thumb_2x}"></li>`;
            });
            coinsNewsContainer.html(newsItems.join(""));


        },
        
        error: function(error) {
            console.log("Error fetching crypto news:", error);
        }
    });
});