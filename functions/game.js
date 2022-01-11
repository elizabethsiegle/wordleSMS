// This is your new function. To start, set the name and path on the left.
const got = require('got');
let openFile = Runtime.getAssets()['/words.txt'].open; 
function randomWord(words) {
    return words[words.length * Math.random() | 0];
}
let randWord = randomWord(openFile().toString().split("\n"));
console.log(`randWord ${randWord}`);
let wordAsArr = randWord.split('');
let guessesAttempted = 0;
let numCorrectLetters = 0;
const maxGuesses = 5;
const wordLength = 5;
let dupLetters = [...wordAsArr]; //comma separated letters
let incorrectLettersArr = [];
let scoreCard = [];
for (let i = 1; i < wordLength; i++) {
    scoreCard.push('⬛');
}
let handleGuess = async (guess) => {
  try {
    await got(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`).then((response) => {
      if (response.statusCode !== 404) {
        console.log(`guess ${guess}`);
        guessesAttempted+=1;
        console.log(`guessesAttempted ${guessesAttempted}`);
        let guessAsArray = guess.split('');
        let newScoreCard = [];
        for (let i = 0; i < guessAsArray.length; i++) {
          if (guessAsArray[i] == wordAsArr[i]) {
            if (dupLetters[i] != null) {
              numCorrectLetters+=1;
            }
            dupLetters[i] = null;
            newScoreCard.push('🟩');
          } else if (guessAsArray[i] != wordAsArr[i] && wordAsArr.includes(guessAsArray[i])) {
            newScoreCard.push('🟨');
            //numCorrectLetters+=1; //idk man
          } else {
            if (!incorrectLettersArr.includes(guess[i])) {
              incorrectLettersArr.push(guess[i])
            }
            newScoreCard.push('⬛')
          }
        }
        console.log(`newScoreCard ${newScoreCard}`);
        scoreCard = newScoreCard;
        endFunc();
      } 
      else { //404 word not in dict
        newScoreCard = "word not found in dictionary! try again!";
        scoreCard = newScoreCard;
        console.log('Word not found!');
      }
    });
  }
  catch (err) {
    newScoreCard = "word not found in dictionary! try again!";
    scoreCard = newScoreCard;
    console.log('Word not found!')
  }  
}

const endFunc = () => {
  if (guessesAttempted >= maxGuesses) { 
    console.log(`guessesAttempted >= maxGuesses`);
    return true;
  }
  else if (numCorrectLetters == wordLength) {
    console.log("in numCorrect");
    return true;
  }
  else if(scoreCard == `🟩,🟩,🟩,🟩,🟩`) {
    console.log(`scorecard = 🟩,🟩,🟩,🟩,🟩`);
    return true;
  }
  else {
    return false;
  }
}
  
exports.handler = async function(context, event, callback) {
  // Here's an example of setting up some TWiML to respond to with this function
	let twiml = new Twilio.twiml.MessagingResponse();
  let guess = event.Body.toLowerCase().trim();
    if (guess.length == wordLength) { //5 letters
      await handleGuess(guess); //guessesAttempted increments
      if(endFunc()) { //over, win
        if(guess == randWord) {
        twiml.message(`Nice🔥! You guessed the right word in ${guessesAttempted}/${maxGuesses} guesses. You can play again by sending a 5-letter word to guess a new random word👀`);
        randWord = randomWord(openFile().toString().split("\n"));
        console.log(`randWord ${randWord}`);
        wordAsArr = randWord.split('');
        guessesAttempted = 0;
        numCorrectLetters = 0;
        scoreCard = `⬛,⬛,⬛,⬛,⬛`;
        }
        else if (guess != randWord) { //over, lose
          twiml.message(`Game over🙈\nThe correct word was ${randWord}. Send a 5-letter guess to play again!`); 
          randWord = randomWord(openFile().toString().split("\n"));
          console.log(`randWord ${randWord}`);
          wordAsArr = randWord.split('');
          guessesAttempted = 0;
          numCorrectLetters = 0;
          scoreCard = `⬛,⬛,⬛,⬛,⬛`;
        }
      }
      else { //keep guessing, not over
        twiml.message(`${scoreCard.toString()} \n${guessesAttempted}/${maxGuesses} guesses`);
      }
    }
    else { //not 5 letters
      twiml.message(`"${guess}" is not valid. Please send a word in the dictionary that is 5 letters please to get started!`);
    }
  return callback(null, twiml);
};
