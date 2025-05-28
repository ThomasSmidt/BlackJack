let cardValues = ["A", 2, 3, 4, 5, 6, 7, 8, 9, "J", "Q", "K"];
let cardSuits = ["hearts", "spades", "clubs", "diamonds"];
let deck = new Array();
let hiddenCard;
let dealerTotal = 0;
let playerTotal = 0;
let isDealer = true;
let dealerAceCount = 0;
let playerAceCount = 0;
let playerLives = 3;
let canHit = true;
let canStay = true;
let message;
let lost = false;
let points = 0;
let dealerTotalMinusHidden = 0;
let playerChips = 1000;
let playerHand = new Array();
let currentBet = 0;
let canBet = true;
let hasBet = false;
let hiddenCardImage = document.getElementById("hidden-card");

window.onload = function() {
    startGame()
}

function startGame() { 
    toggleHit();
    toggleStay()
    document.getElementById("dealer-total").innerHTML = "Dealer: " + dealerTotal;
    document.getElementById("player-total").innerHTML = "You: " + playerTotal;
    canBet = true;
    betSlider.setAttribute('max', playerChips);
    betSlider.setAttribute('value', playerChips / 2);
    document.getElementById("chips").innerHTML = "Chips: " + playerChips; 
    document.getElementById("currentBet").innerHTML = "Current Bet: " + 0;
    betAmount.innerHTML = betSlider.value;
    betSlider.disabled = false;
    betBtn.disabled = false;
    betBtn.style.backgroundImage = ('linear-gradient(#ff5656, #b30000)');
    let hiddenCardImage = document.getElementById("hidden-card");
    hiddenCardImage.src = "";   
    makeDeck();
    shuffleDeck(deck);
}

function makeDeck() {
    deck = new Array();
    for (let i = 0; i < cardValues.length; i++)
    {
        for (let j = 0; j < cardSuits.length; j++)
        {
            let weight = parseInt(cardValues[i]);
            if (cardValues[i] == "J" || cardValues[i] == "Q" || cardValues[i] == "K")
            {
                weight = 10;
            } else if (cardValues[i] == "A")
            {
                weight = 11;
            }
            let card = {cardValue: cardValues[i], cardSuit: cardSuits[j], cardWeight: weight}
            deck.push(card)
        }
    }
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function runGame() {   
    let hiddenCardImage = document.getElementById("hidden-card");
    hiddenCardImage.src = "/BlackJack/assets/img/cardBack_newRed.png";   
    hiddenCard = deck.pop();
    console.log(hiddenCard)
    dealerTotal += hiddenCard.cardWeight;
    createCard("dealer-cards", isDealer)  
    for (let i = 0; i < 2; i++) {
        createCard("player-cards", isDealer = false)
    }
    
    dealerTotalMinusHidden = dealerTotal - hiddenCard.cardWeight;
    document.getElementById("dealer-total").innerHTML = "Dealer: " + dealerTotalMinusHidden;
    document.getElementById("player-total").innerHTML = "You: " + playerTotal;
}


async function createCard(playerOrDealerCards = "", isDealer) {
    let cardImg = document.createElement("img");
    let card = deck.pop(); 
    if (isDealer) {
        dealerTotal += card.cardWeight; 
        dealerAceCount += checkAce(card.cardValue);
        changeAce();    
    } else if (isDealer == false) {
        playerTotal += card.cardWeight;
        playerAceCount += checkAce(card.cardValue);
        changeAce();
    }
    cardImg.src = "/BlackJack/assets/img/" + card.cardValue + "_" + card.cardSuit + ".png";
    cardImg.className='card-image';    
    document.getElementById(playerOrDealerCards).append(cardImg);
    if (playerTotal == 21) {
        toggleHit();
    }
}

function hit() {
    if (!hasBet) {
        return;
    }
    disableBet();
    if (playerTotal == 21) {
        toggleHit();
    }
    if (canHit) {
        createCard("player-cards", isDealer = false)  
        console.log("Player: " + playerTotal)
        console.log("AI: " + dealerTotal)
        document.getElementById("player-total").innerHTML = "You:   " + playerTotal;
        if (playerTotal > 21) {
            checkRound();
        }  
    }
    return;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function stay() {
    if (!hasBet) {
      return;
    }
    toggleStay();
    canHit = false;
    console.log("dealer: " + dealerTotal + "player: " + playerTotal)
    while(dealerTotal < 17){
      isDealer = true;
      let cardImg = document.createElement("img");
      let card = deck.pop();
      dealerTotal += card.cardWeight; 
      dealerAceCount += checkAce(card.cardValue);
      console.log("ace count: " + dealerAceCount)
      console.log("card weight 1:" + card.cardWeight)
      changeAce();
      console.log("card weight 2:" + card.cardWeight)
      cardImg.src = "/BlackJack/assets/img/" + card.cardValue + "_" + card.cardSuit + ".png";
      cardImg.className='card-image';
      document.getElementById("dealer-cards").append(cardImg);
      await sleep(500);
    }
    document.getElementById("hidden-card").src = "/BlackJack/assets/img/" + hiddenCard.cardValue + "_" + hiddenCard.cardSuit + ".png";
    document.getElementById("dealer-total").innerHTML = "Dealer: " + dealerTotal;
    document.getElementById("player-total").innerHTML = "You:   " + playerTotal;
    toggleStay();
    checkRound();
}

function checkRound() {
    if (playerTotal <= 21 && playerTotal == dealerTotal) {
        message = "Tie!";
        lost = false;
        playerChips += currentBet * 1;
        console.log(message);
        document.getElementById("next-round").style.visibility = "visible";
        document.getElementById("next-round").style.opacity = "100%";
        document.getElementById("round-msg").innerHTML = message;
    } else if (playerTotal <= 21 && playerTotal > dealerTotal || playerTotal <= 21 && dealerTotal > 21) {
        message = "You Won the Round!"
        lost = false;
        points += 1;
        playerChips += currentBet * 2;
        console.log(message);
        document.getElementById("next-round").style.visibility = "visible";
        document.getElementById("next-round").style.opacity = "100%";
        document.getElementById("round-msg").innerHTML = message;
    } else if (playerTotal <= 21 && playerTotal < dealerTotal || playerTotal > 21) {
        message = "You Lost the Round!"
        betSlider.setAttribute('max', playerChips);
        betSlider.setAttribute('value', playerChips);
        console.log(message);
        lost = true;
        playerLives -= 1;
        checkGameOver()        
    }   
}

function playAgain() {
    document.getElementById("hidden-card").src = "/BlackJack/assets/img/cardBack_newRed.png";
    playerTotal = 0;
    dealerTotal = 0; 
    playerAceCount = 0;
    dealerAceCount = 0;
    isDealer = true;
    canHit = true;
    playerLives = 3;
    lost = false;
    points = 0;
    playerChips = 1000;
    let cardImg = document.querySelectorAll(".card-image");
    cardImg.forEach(card => card.remove());
    document.getElementById("game-over").style.visibility = "hidden";
    document.getElementById("game-over").style.opacity = "0%";
    startGame();
}

function nextRound() {
    document.getElementById("hidden-card").src = "/BlackJack/assets/img/cardBack_newRed.png";
    playerTotal = 0;
    dealerTotal = 0; 
    playerAceCount = 0;
    dealerAceCount = 0;
    isDealer = true;
    canHit = true;
    lost = false;
    let cardImg = document.querySelectorAll(".card-image");
    cardImg.forEach(card => card.remove());
    document.getElementById("next-round").style.visibility = "hidden";
    document.getElementById("next-round").style.opacity = "0%";
    startGame();
}

function checkGameOver() {
    if (playerChips <= 0) {
        console.log("Game Over");
        document.getElementById("game-over").style.visibility = "visible";
        document.getElementById("game-over").style.opacity = "100%";
    } else {
        document.getElementById("next-round").style.visibility = "visible";
        document.getElementById("next-round").style.opacity = "100%";
        document.getElementById("round-msg").innerHTML = "You Lost the Round!";
    }
/*   
if (lost == true) {
        console.log("checkGameOver")  
        document.getElementById("lives").innerHTML = "Lives: " + playerLives;
        console.log("lives: " + playerLives)        
        if (playerLives <= 0) {
            console.log("Game Over");
            document.getElementById("game-over").style.visibility = "visible";
            document.getElementById("game-over").style.opacity = "100%";
        } else if (playerLives > 0){
            document.getElementById("next-round").style.visibility = "visible";
            document.getElementById("next-round").style.opacity = "100%";
            document.getElementById("round-msg").innerHTML = "You Lost the Round!";
        }    
    } else {
        console.log("move")
        return;
    }
*/
}

function checkAce(card) {
    if (card == "A")
    {
        return 1;
    }
    return 0;
}

function changeAce() {
    if (isDealer) {
        while (dealerTotal > 21 && dealerAceCount > 0) {
            dealerTotal -= 10;
            dealerAceCount -= 1;
            return dealerTotal;          
        }         
    }else if (!isDealer) {
        while (playerTotal > 21 && playerAceCount > 0) {
            playerTotal -= 10;
            playerAceCount -= 1;
            return playerTotal;  
        } 
    }
}

function bet() {
    if (canBet) {
        currentBet = document.getElementById("betAmount").value; 
        disableBet();
        playerChips -= currentBet;
        document.getElementById("chips").innerHTML = "Chips: " + playerChips; 
        document.getElementById("currentBet").innerHTML = "Current Bet: " + currentBet;  
        hasBet = true;
        toggleHit()
        toggleStay()
        runGame();
    }
    return;
}

function disableBet(){
    betBtn.disabled = true;
    betBtn.style.backgroundImage = ('linear-gradient(#999, #444)');
    canBet = false; 
    betSlider.disabled = true;
    return;
}

function toggleHit(){
    if (canHit) {
    hitBtn.disabled = true;
    hitBtn.style.backgroundImage = ('linear-gradient(#999, #444)');
    canHit = false; 
    return;
    }
    hitBtn.disabled = false;;
    hitBtn.style.backgroundImage = ('linear-gradient(#ff5656, #b30000)');
    canHit = true; 
    return
}

function toggleStay() {
    if (canStay) {
    stayBtn.disabled = true;
    stayBtn.style.backgroundImage = ('linear-gradient(#999, #444)');
    canStay = false; 
    return;
    }
    stayBtn.disabled = false;;
    stayBtn.style.backgroundImage = ('linear-gradient(#ff5656, #b30000)');
    canStay = true; 
    return
}