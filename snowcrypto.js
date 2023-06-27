function cryptoRain() {
  const container = document.querySelector(".container");
  const numCoins = getRandomNumber(5, 10); // Random number of coins between 5 and 10
  const coinImages = [
    "assets/images/cryptologo.png",
    "assets/images/ethereum.png",
    "assets/images/bitcoin.png",
    "assets/images/usdt.png",
  ]; // Array of image file names

  for (let i = 0; i < numCoins; i++) {
    const coin = document.createElement("img");
    const randomImageIndex = getRandomNumber(0, coinImages.length - 1); // Randomly select an image
    coin.src = coinImages[randomImageIndex];
    coin.alt = "Coin";
    coin.classList.add("bitcoin-coin");
    coin.style.left = getRandomNumber(0, window.innerWidth - 100) + "px"; // Random horizontal position

    const size = getRandomNumber(50, 70); // Random size between 50 and 150 pixels
    coin.style.width = size + "px";
    coin.style.height = size + "px";

    coin.style.animationDuration = getRandomNumber(5, 10) + "s"; // Random animation duration
    coin.style.animationDelay = getRandomNumber(0, 5) + "s"; // Random animation delay

    const rotation = getRandomNumber(-180, 180); // Random rotation angle between -180 and 180 degrees
    coin.style.transform = `rotate(${rotation}deg)`;

    const opacity = getRandomNumber(3, 5) / 10; // Random opacity between 0.3 and 0.8
    coin.style.opacity = opacity;

    container.appendChild(coin);
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
