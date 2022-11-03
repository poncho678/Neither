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
  minWordLength.getAttribute("min");
let currentMinWordLengthValue = parseInt(minWordLength.value);

// Max Values
const maxWordLength = document.getElementById("maxWordLength");
const maxWordLengthValue = document.getElementById("maxWordLengthValue");
document.getElementById("maxWordLengthValue").innerHTML =
  maxWordLength.getAttribute("max");
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
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "TH",
  "U",
  "V",
  "W",
  "X",
  "Y",
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
    const [lastWordInText] = textWrapper.innerText.split(" ").slice(-1);

    if (
      lastWordInText.length === currentMaxWordLengthValue &&
      lastWordInText.length >= currentMinWordLengthValue
    ) {
      textWrapper.innerHTML += " ";
    }

    const getLastLetter =
      textWrapper.innerHTML[textWrapper.innerHTML.length - 1];
    const getSecondToLastLetter =
      textWrapper.innerHTML[textWrapper.innerHTML.length - 2];

    if (
      getLastLetter !== undefined &&
      getLastLetter.toLowerCase() === label.toLowerCase() &&
      getSecondToLastLetter.toLowerCase() === label.toLowerCase()
    ) {
      return;
    }

    // Check if label is a possible Value, if its not a letter, run this function
    if (!listOfOptions.includes(label)) {
      noSoundCount++;

      // if no Sound has been recorded enter a space, but only if min word length is exceedded
      if (noSoundCount === 3) {
        if (
          getLastLetter !== " " &&
          getLastLetter !== undefined &&
          lastWordInText.length >= currentMinWordLengthValue
        ) {
          textWrapper.innerHTML += " ";
        }
      }
      return;
    }
    resetCount();

    // TODO: if previous letter was Uppercase. Add the new character as lowercase
    if (
      getLastLetter !== " " &&
      ((getLastLetter !== undefined &&
        getLastLetter === getLastLetter.toUpperCase()) ||
        (getLastLetter !== undefined &&
          getLastLetter === getLastLetter.toLowerCase()))
    ) {
      if (label === " ") {
        return;
      }
      textWrapper.innerHTML += label.toLowerCase();
      scrollToBottom();
    } else {
      if (label.length > 1) {
        textWrapper.innerHTML += `${label.charAt(0).toUpperCase()}${label
          .slice(1)
          .toLowerCase()}`;
      } else {
        textWrapper.innerHTML += label;
      }
      scrollToBottom();
    }
  }
}

// The model recognizing a sound will trigger this event
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  // The results are in an array ordered by confidence.
  label = !listOfOptions.includes(results[0].label) ? " " : results[0].label;
}
