$(() => {
    // Function to generate random number between min and max (inclusive)
    function getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    // Function to trigger the crypto rain animation
    function cryptoRain() {
      const container = $(".container");
      const numCoins = getRandomNumber(5, 10); // Random number of coins between 5 and 10
      const coinImages = [
        "assets/images/cryptologo.png",
        "assets/images/ethereum.png",
        "assets/images/bitcoin.png",
        "assets/images/usdt.png",
      ]; // Array of image file names
  
      for (let i = 0; i < numCoins; i++) {
        const coin = $("<img>");
        const randomImageIndex = getRandomNumber(0, coinImages.length - 1); // Randomly select an image
        coin.attr("src", coinImages[randomImageIndex]);
        coin.attr("alt", "Coin");
        coin.addClass("bitcoin-coin");
        coin.css("left", getRandomNumber(0, window.innerWidth - 100) + "px"); // Random horizontal position
  
        const size = getRandomNumber(50, 70); // Random size between 50 and 70 pixels
        coin.css("width", size + "px");
        coin.css("height", size + "px");
  
        coin.css("animation-duration", getRandomNumber(5, 10) + "s"); // Random animation duration
        coin.css("animation-delay", getRandomNumber(0, 5) + "s"); // Random animation delay
  
        const rotation = getRandomNumber(-180, 180); // Random rotation angle between -180 and 180 degrees
        coin.css("transform", "rotate(" + rotation + "deg)");
  
        const opacity = getRandomNumber(3, 5) / 10; // Random opacity between 0.3 and 0.8
        coin.css("opacity", opacity);
  
        container.append(coin);
      }
    }
  
    // Bind the cryptoRain() function to the click event of the #cryptoRain button
    $("#cryptoRain").click(cryptoRain);
  });