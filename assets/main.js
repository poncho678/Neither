// TODO: localStorage
// TODO: If Th is final character in a word, it might exceed word length. FIX

function addSpaceAfterInput() {
  const textWrapper = document.getElementById("text-wrapper");
  const lastLetter = textWrapper.innerHTML[textWrapper.innerHTML.length - 1];

  if (lastLetter !== " ") {
    textWrapper.innerHTML += " ";
  }
}

// Min Values
// Min Values
const minWordLength = document.getElementById("minWordLength");
const minWordLengthValue = document.getElementById("minWordLengthValue");
document.getElementById("minWordLengthValue").innerHTML =
  minWordLength.getAttribute("value");
let currentMinWordLengthValue = parseInt(minWordLength.value);

// Max Values
const maxWordLength = document.getElementById("maxWordLength");
const maxWordLengthValue = document.getElementById("maxWordLengthValue");
document.getElementById("maxWordLengthValue").innerHTML =
  maxWordLength.getAttribute("value");
let currentMaxWordLengthValue = parseInt(maxWordLength.value);

minWordLength.oninput = (e) => {
  const { value } = e.target;
  currentMinWordLengthValue = parseInt(value);
  minWordLengthValue.innerHTML = value;
  maxWordLength.setAttribute("min", value);
  addSpaceAfterInput();
};

maxWordLength.oninput = (e) => {
  const { value } = e.target;
  currentMaxWordLengthValue = parseInt(value);
  maxWordLengthValue.innerHTML = value;
  minWordLength.setAttribute("max", value);
  addSpaceAfterInput();
};

// Global variable to store the classifier
let classifier;

// Label
let label = "";
let text = "";
const listOfOptions = [
  "A",
  "B",
  "BO",
  "BE",
  "C",
  "CHA",
  "CHO",
  "CHU",
  "D",
  "DA",
  "DE",
  "DO",
  "E",
  "EA",
  "EY",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "NE",
  "NI",
  "NO",
  "O",
  "OU",
  "P",
  "Q",
  "R",
  "RA",
  "RE",
  "RU",
  "S",
  "SE",
  "SO",
  "SH",
  "SHA",
  "SHO",
  "SHU",
  "T",
  "TA",
  "TE",
  "TH",
  "THE",
  "TO",
  "U",
  "V",
  "W",
  "WE",
  "WO",
  "X",
  "Y",
  "YE",
  "Z",
];

// Teachable Machine model URL:
let soundModel = "https://teachablemachine.withgoogle.com/models/9k5qv7zbs/";

let lettersArray = [];

function preload() {
  // Load the model
  classifier = ml5.soundClassifier(soundModel + "model.json");
}

function setup() {
  // The sound model will continuously listen to the microphone
  classifier.classify(gotResult);
}

let noSoundCount = 0;
const resetCount = () => {
  noSoundCount = 0;
};

const scrollToBottom = () => {
  const currentScrollPosition = window.pageYOffset;
  const pageBottom = document.body.scrollHeight;
  const windowHeight = document.documentElement.clientHeight;

  if (
    currentScrollPosition >= pageBottom - windowHeight - 100 &&
    currentScrollPosition <= pageBottom - windowHeight - 5
  ) {
    window.scrollTo({
      top: pageBottom,
      left: 0,
      behavior: "smooth",
    });
  }
};

function draw() {
  if (frameCount % 30 === 0) {
    let textWrapper = document.getElementById("text-wrapper");

    // If length of last word exceeds specific length insert a space.
    let [lastWordInText] = textWrapper.innerText.split(" ").slice(-1);
    const getLastLetter =
      textWrapper.innerHTML[textWrapper.innerHTML.length - 1];

    // Check if label is a possible Value
    if (!listOfOptions.includes(label)) {
      noSoundCount++;
      // if no Sound has been recorded enter a space, but only if min word length is exceedded
      if (noSoundCount === 3) {
        if (
          getLastLetter !== " " &&
          getLastLetter !== undefined &&
          lastWordInText.length >= currentMinWordLengthValue
        ) {
          console.log(
            "insert space, no sound was recognized and the last word has already exceeded the min word length. Inserting Space"
          );
          textWrapper.innerHTML += " ";
        }
      }
      return;
    }
    resetCount();

    label.split("").map((character) => {
      [lastWordInText] = textWrapper.innerText.split(" ").slice(-1);
      if (lastWordInText.length === 0) {
        console.log("first character ->", character);
        textWrapper.innerHTML += character;
        return;
      }
      if (
        lastWordInText.length > 1 &&
        lastWordInText
          .slice(-2)
          .split("")
          .every((item) => {
            return item.toLowerCase() === character.toLowerCase();
          })
      ) {
        console.log(`this would’ve been the third ${character} in a row`);
        return;
      }
      if (
        lastWordInText.length + character.length >
        currentMaxWordLengthValue
      ) {
        console.log(
          "space inserted, word.length + character.length exceeded character limit. Insert Space and Character ->" +
            character
        );
        if (Math.random() < 0.3) {
          textWrapper.innerHTML += ` ${character}`;
        } else {
          textWrapper.innerHTML += ` ${character.toLowerCase()}`;
        }
        scrollToBottom();
        return;
      }

      if (lastWordInText.length > 0 && getLastLetter !== " ") {
        console.log(
          "Last letter is not a space, and there is a previous word. Return lowercase letter ->",
          lastWordInText
        );
        textWrapper.innerHTML += character.toLowerCase();
        scrollToBottom();
        return;
      }

      console.log(
        "Nothing special. Return uppercase or character ->",
        character
      );
      textWrapper.innerHTML += character.toUpperCase();
      scrollToBottom();
      return;
    });
  }
}

// The model recognizing a sound will trigger this event
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  if (
    !listOfOptions.includes(results[0].label) &&
    results[1].confidence >= 0.25
  ) {
    label = results[1].label;
    return;
  }

  // The results are in an array ordered by confidence.
  label = !listOfOptions.includes(results[0].label) ? " " : results[0].label;
}
