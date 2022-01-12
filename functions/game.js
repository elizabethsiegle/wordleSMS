// This is your new function. To start, set the name and path on the left.
const got = require('got');
let words = Runtime.getAssets()['/words.txt'].open().toString().split("\n");
const randomWord = () => {
    return words[words.length * Math.random() | 0];
}

const maxGuesses = 5;
const wordLength = 5;

const handleGuess = async (player, guess) => {
  let newScoreCard = [];
  try {
    const response = await got(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`).json();
    if (response.statusCode !== 404) {
      console.log(`guess ${guess} + randword ${player.randWord} in got req `);
      player.guessesAttempted+=1;
      console.log(`guessesAttempted: ${player.guessesAttempted}`);
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
    console.log(`game still going`);
    return false;
  }
}
  
exports.handler = async function(context, event, callback) {
	let twiml = new Twilio.twiml.MessagingResponse();
  let responseText = '';
  let guess = event.Body.toLowerCase().trim();
  let response = new Twilio.Response();
  let player;
  if (guess == "?") {
    twiml.message(`Guess a 5-letter word. The tiles will tell you how close your guess was to the goal word. 🟩 means a letter was in the correct spot, 🟨 means the letter is correct but in a different spot, and ⬛️ means the letter is not in the goal word.`)
    return callback(null, twiml); //no need for cookies
  }
  
  if (!event.request.cookies.player) { //any guesses attempted? -> new player
    let randWord = randomWord(); //new random word
    player = { //init new player
      randWord: randWord, 
      guessesAttempted: 0,
      numCorrectLetters: 0,
      dupLetters: [...randWord],
      incorrectLettersArr: []
    }
  } else { //else pull data off cookie to get player state
    player = JSON.parse(event.request.cookies.player);
  }
  
  if (guess.length == wordLength) { //5 letters
    let scoreCard = await handleGuess(player, guess); //guessesAttempted increments
    console.log(`scoreCard ${scoreCard}`);
    if(endFunc(player, scoreCard)) { //over, win
      if(guess == player.randWord) {
        responseText += `Nice🔥! You guessed the right word in ${player.guessesAttempted}/${maxGuesses} guesses. You can play again by sending a 5-letter word to guess a new random word 👀`
        // twiml.message(`Nice🔥! You guessed the right word in ${player.guessesAttempted}/${maxGuesses} guesses. You can play again by sending a 5-letter word to guess a new random word 👀`);
        response.removeCookie("player");
      }
      else if (guess != player.randWord) { //over, lose
        responseText += `Game over 🙈\nThe correct word was ${player.randWord}. Send a 5-letter guess to play again!`;
        // twiml.message(`Game over 🙈\nThe correct word was ${player.randWord}. Send a 5-letter guess to play again!`); 
        response.removeCookie("player");
      }
    }
    else { //keep guessing, not over
      responseText += `${scoreCard.toString()} \n${player.guessesAttempted}/${maxGuesses} guesses`;
      // twiml.message(`${scoreCard.toString()} \n${player.guessesAttempted}/${maxGuesses} guesses`);
      console.log(`randWord in not over ${player.randWord}`);
      response.setCookie("player", JSON.stringify(player), [
        'Max-Age=14400' //4 hour timelimit
      ]);
    }
  }
  else { //not 5 letters
    responseText += `"${guess}" is not valid. Please send a word in the dictionary that is 5 letters to get started!`;
    // twiml.message(`"${guess}" is not valid. Please send a word in the dictionary that is 5 letters to get started!`);
    console.log(`randWord ${player.randWord} in invalid `);
  }
  response.appendHeader('Content-Type', 'text/xml');
  // see if player.guessesAttempted == 1
  if (player.guessesAttempted == 1) {
    responseText += `\nText "?" for help on how to play`
  }
    // Add something to responseText that says: "Text 'HELP' for help" or whatever
  twiml.message(responseText);
  response.setBody(twiml.toString());
  return callback(null, response);
};
