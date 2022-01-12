// This is your new function. To start, set the name and path on the left.
const got = require('got');
let openFile = Runtime.getAssets()['/words.txt'].open; 
const randomWord = (words) => {
    return words[words.length * Math.random() | 0];
}

const maxGuesses = 5;
const wordLength = 5;

let gameState = {}; //player
//set on in-memory obj -> if in firebase/Sync
const setupPlayer = (playerId) => { //maybe async so openfile() can finish
  let randWord = randomWord(openFile().toString().split("\n"));
  //let wordAsArr = randWord.split(''); //wordAsArr, dupLetters calculated from randWord -> could maybe remove
  gameState[playerId] = {
    randWord: randWord,
    // wordAsArr: wordAsArr,
    guessesAttempted: 0, //init
    numCorrectLetters: 0, //init
    dupLetters: [...randWord], //comma separated letters
    incorrectLettersArr: []
  }
  return gameState[playerId]; //reference
}

const handleGuess = async (player, guess) => {
  let newScoreCard = [];
  try {
    const response = await got(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`).json();
    if (response.statusCode !== 404) {
      console.log(`guess ${guess} + randword ${player.randWord} in got req `);
      player.guessesAttempted+=1;
      console.log(`guessesAttempted: ${player.guessesAttempted}`);
      //let guessAsArr = guess.split('');
      for (let i = 0; i < guess.length; i++) {
        if (guess.charAt(i) == player.randWord.charAt(i)) {
          if (player.dupLetters[i] != null) {
            player.numCorrectLetters+=1;
          }
          player.dupLetters[i] = null;
          newScoreCard.push('🟩');
        } else if (guess.charAt(i) != player.randWord.charAt(i) && player.randWord.includes(guess.charAt(i))) {
          newScoreCard.push('🟨');
        } else {
          if (!player.incorrectLettersArr.includes(guess.charAt(i))); {
            player.incorrectLettersArr.push(guess.charAt(i));
          }
          newScoreCard.push('⬛');
        }
      }
      console.log(`newScoreCard ${newScoreCard}`);
      return newScoreCard;
      
    } 
    else { //404 word not in dict
      newScoreCard = "word not found in dictionary! try again!";
      console.log('Word not found!');
      return newScoreCard;
    }
  }
  catch (err) {
    newScoreCard = "word not found in dictionary! try again!";
    console.log('Word not found!');
    return newScoreCard;
    
  }  
}

const endFunc = (player, scoreCard) => {
  if (player.guessesAttempted >= maxGuesses) { 
    console.log(`guessesAttempted >= maxGuesses`);
    return true;
  }
  else if (player.numCorrectLetters == wordLength) {
    console.log("in numCorrect");
    return true;
  }
  else if(scoreCard == `🟩,🟩,🟩,🟩,🟩`) {
    console.log(`scorecard = 🟩,🟩,🟩,🟩,🟩`);
    return true;
  }
  else {
    console.log(`game still going `);
    return false;
  }
}
  
exports.handler = async function(context, event, callback) {
	let twiml = new Twilio.twiml.MessagingResponse();
  let guess = event.Body.toLowerCase().trim();
  let player = gameState[event.From];
  if (!player) { //new player
    player = setupPlayer(event.From);
  }
  if (guess.length == wordLength) { //5 letters
    let scoreCard = await handleGuess(player, guess); //guessesAttempted increments
    console.log(`scoreCard ${scoreCard}`);
    if(endFunc(player, scoreCard)) { //over, win
      if(guess == player.randWord) {
        twiml.message(`Nice🔥! You guessed the right word in ${player.guessesAttempted}/${maxGuesses} guesses. You can play again by sending a 5-letter word to guess a new random word👀`);
        delete gameState[event.From];
      }
      else if (guess != player.randWord) { //over, lose
        twiml.message(`Game over🙈\nThe correct word was ${player.randWord}. Send a 5-letter guess to play again!`); 
        delete gameState[event.From];
      }
    }
    else { //keep guessing, not over
      twiml.message(`${scoreCard.toString()} \n${player.guessesAttempted}/${maxGuesses} guesses`);
      console.log(`randWord in not over ${player.randWord}`);
    }
  }
  else { //not 5 letters
    twiml.message(`"${guess}" is not valid. Please send a word in the dictionary that is 5 letters please to get started!`);
    console.log(`randWord ${player.randWord} in invalid `)
  }
  return callback(null, twiml);
};
