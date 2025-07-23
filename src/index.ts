// Live reload for development
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
   const ws = new WebSocket(`ws://${window.location.host}/livereload`);
   ws.onmessage = () => location.reload();
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
   // Get DOM elements
   const speechSoundSelect = document.getElementById("speechSound") as HTMLSelectElement;
   const themeInput = document.getElementById("themeInput") as HTMLInputElement;
   const charCount = document.getElementById("charCount") as HTMLSpanElement;
   const startButton = document.getElementById("startButton") as HTMLButtonElement;
   const inputSection = document.getElementById("inputSection") as HTMLDivElement;
   const cardsSection = document.getElementById("cardsSection") as HTMLDivElement;

   // State variables
   let selectedSound = "";
   let selectedTheme = "";

   // Handle speech sound selection
   speechSoundSelect.addEventListener("change", (e) => {
      selectedSound = (e.target as HTMLSelectElement).value;
      updateStartButton();
   });

   // Handle theme input with character limit
   themeInput.addEventListener("input", (e) => {
      const input = e.target as HTMLInputElement;
      selectedTheme = input.value;

      // Update character count
      charCount.textContent = input.value.length.toString();

      // Add visual feedback when approaching limit
      if (input.value.length >= 40) {
         charCount.classList.add("text-orange-500", "font-semibold");
      } else {
         charCount.classList.remove("text-orange-500", "font-semibold");
      }

      updateStartButton();
   });

   // Enable/disable start button based on inputs
   function updateStartButton() {
      if (selectedSound && selectedTheme.trim().length > 0) {
         startButton.disabled = false;
         startButton.classList.add("hover:shadow-xl", "transform", "hover:scale-105");
      } else {
         startButton.disabled = true;
         startButton.classList.remove("hover:shadow-xl", "transform", "hover:scale-105");
      }
   }

   // Get card navigation elements
   const wordDisplay = document.getElementById("wordDisplay") as HTMLHeadingElement;
   const wordEmoji = document.getElementById("wordEmoji") as HTMLDivElement;
   const currentWordSpan = document.getElementById("currentWord") as HTMLSpanElement;
   const prevButton = document.getElementById("prevButton") as HTMLButtonElement;
   const nextButton = document.getElementById("nextButton") as HTMLButtonElement;
   const newWordsButton = document.getElementById("newWordsButton") as HTMLButtonElement;
   const wordCard = document.getElementById("wordCard") as HTMLDivElement;

   // Navigation state
   let currentWords: WordData[] = [];
   let currentIndex = 0;

   // Handle start button click
   startButton.addEventListener("click", () => {
      // Hide input section
      inputSection.classList.add("hidden");

      // Show cards section with animation
      cardsSection.classList.remove("hidden");
      cardsSection.classList.add("card-entrance");

      // Initialize word display
      initializeWords();
   });

   // Initialize words for the selected sound and theme
   function initializeWords() {
      currentWords = getThemedWords(selectedSound, selectedTheme);
      currentIndex = 0;
      displayCurrentWord();
   }

   // Display the current word
   function displayCurrentWord() {
      if (currentWords.length === 0) return;

      const wordData = currentWords[currentIndex];

      // Update display
      wordDisplay.textContent = wordData.word;
      wordEmoji.textContent = wordData.emoji;
      currentWordSpan.textContent = (currentIndex + 1).toString();

      // Update button states
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === currentWords.length - 1;

      // Add entrance animation to card
      wordCard.classList.remove("card-entrance");
      void wordCard.offsetWidth; // Force reflow
      wordCard.classList.add("card-entrance");

      // Add floating animation to emoji
      wordEmoji.classList.add("emoji-float");

      // Add special effects for certain words
      addSpecialEffects(wordData);
   }

   // Add special effects based on the word
   function addSpecialEffects(wordData: WordData) {
      // Remove any existing effects
      wordDisplay.classList.remove("rainbow-text", "text-6xl");

      // Add special effects for specific words
      if (wordData.word.toLowerCase() === "rainbow" || wordData.word.toLowerCase() === "color") {
         wordDisplay.classList.add("rainbow-text");
      }

      // Make certain words bigger for emphasis
      if (wordData.word.length <= 4) {
         wordDisplay.classList.add("text-6xl");
      }

      // Add button press effect to all buttons
      [prevButton, nextButton, newWordsButton].forEach((button) => {
         button.classList.add("button-press");
      });
   }

   // Navigate to previous word
   prevButton.addEventListener("click", () => {
      if (currentIndex > 0) {
         animateCardTransition(() => {
            currentIndex--;
            displayCurrentWord();
         });
      }
   });

   // Navigate to next word
   nextButton.addEventListener("click", () => {
      if (currentIndex < currentWords.length - 1) {
         animateCardTransition(() => {
            currentIndex++;
            displayCurrentWord();
         });
      }
   });

   // Animate card transition with fade effect
   function animateCardTransition(callback: () => void) {
      // Fade out
      wordCard.style.opacity = "0";
      wordCard.style.transform = "scale(0.9)";

      setTimeout(() => {
         callback();
         // Fade in with new content
         wordCard.style.opacity = "1";
         wordCard.style.transform = "scale(1)";
      }, 200);
   }

   // Go back to input section with new words
   newWordsButton.addEventListener("click", () => {
      // Reset form
      speechSoundSelect.value = "";
      themeInput.value = "";
      charCount.textContent = "0";
      selectedSound = "";
      selectedTheme = "";
      updateStartButton();

      // Show input section
      inputSection.classList.remove("hidden");
      inputSection.classList.add("card-entrance");

      // Hide cards section
      cardsSection.classList.add("hidden");
   });

   // Keyboard navigation support
   document.addEventListener("keydown", (e) => {
      // Only handle keyboard navigation when cards are visible
      if (cardsSection.classList.contains("hidden")) return;

      switch (e.key) {
         case "ArrowLeft":
            e.preventDefault();
            if (!prevButton.disabled) {
               prevButton.click();
               prevButton.focus();
            }
            break;

         case "ArrowRight":
            e.preventDefault();
            if (!nextButton.disabled) {
               nextButton.click();
               nextButton.focus();
            }
            break;

         case "Home":
            e.preventDefault();
            if (currentIndex > 0) {
               animateCardTransition(() => {
                  currentIndex = 0;
                  displayCurrentWord();
               });
            }
            break;

         case "End":
            e.preventDefault();
            if (currentIndex < currentWords.length - 1) {
               animateCardTransition(() => {
                  currentIndex = currentWords.length - 1;
                  displayCurrentWord();
               });
            }
            break;

         case "Escape":
            e.preventDefault();
            newWordsButton.click();
            speechSoundSelect.focus();
            break;
      }
   });

   // Add keyboard hints to buttons
   prevButton.setAttribute("aria-label", "Previous word (Left Arrow)");
   nextButton.setAttribute("aria-label", "Next word (Right Arrow)");
   newWordsButton.setAttribute("aria-label", "Choose new words (Escape)");

   // Ensure proper focus management
   startButton.addEventListener("click", () => {
      setTimeout(() => {
         if (!nextButton.disabled) {
            nextButton.focus();
         } else if (!prevButton.disabled) {
            prevButton.focus();
         }
      }, 500);
   });
});

// Word data structure with themed words for each speech sound
interface WordData {
   word: string;
   emoji: string;
}

interface ThemeWords {
   [theme: string]: WordData[];
}

interface SoundWords {
   [sound: string]: ThemeWords;
}

const wordDatabase: SoundWords = {
   S: {
      animals: [
         { word: "snake", emoji: "🐍" },
         { word: "seal", emoji: "🦭" },
         { word: "swan", emoji: "🦢" },
         { word: "snail", emoji: "🐌" },
         { word: "squirrel", emoji: "🐿️" },
         { word: "seahorse", emoji: "🐴" },
         { word: "starfish", emoji: "⭐" },
         { word: "salamander", emoji: "🦎" },
         { word: "sparrow", emoji: "🐦" },
         { word: "stingray", emoji: "🐋" },
      ],
      space: [
         { word: "star", emoji: "⭐" },
         { word: "sun", emoji: "☀️" },
         { word: "saturn", emoji: "🪐" },
         { word: "satellite", emoji: "🛰️" },
         { word: "spaceship", emoji: "🚀" },
         { word: "astronaut", emoji: "👨‍🚀" },
         { word: "cosmos", emoji: "✨" },
         { word: "solar", emoji: "☀️" },
         { word: "space", emoji: "🌌" },
         { word: "shooting star", emoji: "💫" },
      ],
      ocean: [
         { word: "sea", emoji: "🌊" },
         { word: "sand", emoji: "🏖️" },
         { word: "seashell", emoji: "🐚" },
         { word: "surf", emoji: "🏄" },
         { word: "sailboat", emoji: "⛵" },
         { word: "sunshine", emoji: "☀️" },
         { word: "seaweed", emoji: "🌿" },
         { word: "sandcastle", emoji: "🏰" },
         { word: "seaside", emoji: "🏖️" },
         { word: "sunset", emoji: "🌅" },
      ],
      default: [
         { word: "smile", emoji: "😊" },
         { word: "song", emoji: "🎵" },
         { word: "sweet", emoji: "🍬" },
         { word: "super", emoji: "⭐" },
         { word: "sock", emoji: "🧦" },
         { word: "seven", emoji: "7️⃣" },
         { word: "six", emoji: "6️⃣" },
         { word: "silly", emoji: "🤪" },
         { word: "special", emoji: "✨" },
         { word: "surprise", emoji: "🎁" },
      ],
   },
   T: {
      animals: [
         { word: "tiger", emoji: "🐅" },
         { word: "turtle", emoji: "🐢" },
         { word: "turkey", emoji: "🦃" },
         { word: "toad", emoji: "🐸" },
         { word: "toucan", emoji: "🦜" },
         { word: "trout", emoji: "🐟" },
         { word: "tarantula", emoji: "🕷️" },
         { word: "termite", emoji: "🐜" },
         { word: "tadpole", emoji: "🐸" },
         { word: "tuna", emoji: "🐟" },
      ],
      space: [
         { word: "telescope", emoji: "🔭" },
         { word: "twinkle", emoji: "✨" },
         { word: "trajectory", emoji: "🚀" },
         { word: "titan", emoji: "🌙" },
         { word: "twilight", emoji: "🌆" },
         { word: "terrestrial", emoji: "🌍" },
         { word: "thrust", emoji: "🚀" },
         { word: "time", emoji: "⏰" },
         { word: "travel", emoji: "✈️" },
         { word: "technology", emoji: "💻" },
      ],
      ocean: [
         { word: "tide", emoji: "🌊" },
         { word: "treasure", emoji: "💎" },
         { word: "tropical", emoji: "🏝️" },
         { word: "tuna", emoji: "🐟" },
         { word: "tentacle", emoji: "🐙" },
         { word: "tsunami", emoji: "🌊" },
         { word: "temperature", emoji: "🌡️" },
         { word: "turquoise", emoji: "💙" },
         { word: "trawler", emoji: "🚢" },
         { word: "triton", emoji: "🔱" },
      ],
      default: [
         { word: "toy", emoji: "🧸" },
         { word: "tree", emoji: "🌳" },
         { word: "train", emoji: "🚂" },
         { word: "treat", emoji: "🍭" },
         { word: "two", emoji: "2️⃣" },
         { word: "ten", emoji: "🔟" },
         { word: "tall", emoji: "📏" },
         { word: "tiny", emoji: "🐜" },
         { word: "tasty", emoji: "😋" },
         { word: "tickle", emoji: "🤭" },
      ],
   },
   P: {
      animals: [
         { word: "panda", emoji: "🐼" },
         { word: "penguin", emoji: "🐧" },
         { word: "pig", emoji: "🐷" },
         { word: "parrot", emoji: "🦜" },
         { word: "puppy", emoji: "🐶" },
         { word: "peacock", emoji: "🦚" },
         { word: "pony", emoji: "🐴" },
         { word: "polar bear", emoji: "🐻‍❄️" },
         { word: "pelican", emoji: "🦢" },
         { word: "porcupine", emoji: "🦔" },
      ],
      space: [
         { word: "planet", emoji: "🪐" },
         { word: "pluto", emoji: "❄️" },
         { word: "probe", emoji: "🛸" },
         { word: "pulsar", emoji: "⭐" },
         { word: "phase", emoji: "🌙" },
         { word: "payload", emoji: "📦" },
         { word: "pilot", emoji: "👨‍✈️" },
         { word: "propulsion", emoji: "🚀" },
         { word: "particle", emoji: "✨" },
         { word: "portal", emoji: "🌀" },
      ],
      ocean: [
         { word: "pearl", emoji: "🦪" },
         { word: "port", emoji: "⚓" },
         { word: "plankton", emoji: "🦠" },
         { word: "pier", emoji: "🌉" },
         { word: "paddle", emoji: "🚣" },
         { word: "pool", emoji: "🏊" },
         { word: "pacific", emoji: "🌊" },
         { word: "pebble", emoji: "🪨" },
         { word: "pelican", emoji: "🦢" },
         { word: "paradise", emoji: "🏝️" },
      ],
      default: [
         { word: "play", emoji: "🎮" },
         { word: "party", emoji: "🎉" },
         { word: "pizza", emoji: "🍕" },
         { word: "purple", emoji: "💜" },
         { word: "pink", emoji: "💗" },
         { word: "present", emoji: "🎁" },
         { word: "piano", emoji: "🎹" },
         { word: "park", emoji: "🏞️" },
         { word: "pencil", emoji: "✏️" },
         { word: "popcorn", emoji: "🍿" },
      ],
   },
   K: {
      animals: [
         { word: "kangaroo", emoji: "🦘" },
         { word: "koala", emoji: "🐨" },
         { word: "kitten", emoji: "🐱" },
         { word: "kingfisher", emoji: "🐦" },
         { word: "kookaburra", emoji: "🦅" },
         { word: "krill", emoji: "🦐" },
         { word: "komodo", emoji: "🦎" },
         { word: "kudu", emoji: "🦌" },
         { word: "kiwi", emoji: "🥝" },
         { word: "catfish", emoji: "🐟" },
      ],
      space: [
         { word: "comet", emoji: "☄️" },
         { word: "cosmos", emoji: "🌌" },
         { word: "crater", emoji: "🌑" },
         { word: "capsule", emoji: "🛸" },
         { word: "cosmic", emoji: "✨" },
         { word: "coordinate", emoji: "📍" },
         { word: "kepler", emoji: "🔭" },
         { word: "kinetic", emoji: "⚡" },
         { word: "kilometer", emoji: "📏" },
         { word: "craft", emoji: "🚀" },
      ],
      ocean: [
         { word: "coral", emoji: "🪸" },
         { word: "kelp", emoji: "🌿" },
         { word: "kayak", emoji: "🛶" },
         { word: "creek", emoji: "🏞️" },
         { word: "coast", emoji: "🏖️" },
         { word: "current", emoji: "🌊" },
         { word: "clam", emoji: "🦪" },
         { word: "crab", emoji: "🦀" },
         { word: "kite", emoji: "🪁" },
         { word: "catch", emoji: "🎣" },
      ],
      default: [
         { word: "key", emoji: "🔑" },
         { word: "kite", emoji: "🪁" },
         { word: "king", emoji: "👑" },
         { word: "kind", emoji: "💝" },
         { word: "kitchen", emoji: "🍳" },
         { word: "kid", emoji: "👦" },
         { word: "kick", emoji: "⚽" },
         { word: "cookie", emoji: "🍪" },
         { word: "cake", emoji: "🎂" },
         { word: "color", emoji: "🎨" },
      ],
   },
   W: {
      animals: [
         { word: "whale", emoji: "🐋" },
         { word: "wolf", emoji: "🐺" },
         { word: "walrus", emoji: "🦭" },
         { word: "worm", emoji: "🪱" },
         { word: "woodpecker", emoji: "🦅" },
         { word: "wasp", emoji: "🐝" },
         { word: "wombat", emoji: "🐨" },
         { word: "wildebeest", emoji: "🦬" },
         { word: "wallaby", emoji: "🦘" },
         { word: "weasel", emoji: "🦫" },
      ],
      space: [
         { word: "wormhole", emoji: "🌀" },
         { word: "warp", emoji: "💫" },
         { word: "wavelength", emoji: "〰️" },
         { word: "weightless", emoji: "🪶" },
         { word: "window", emoji: "🪟" },
         { word: "world", emoji: "🌍" },
         { word: "wing", emoji: "🪽" },
         { word: "wander", emoji: "🚶" },
         { word: "wonder", emoji: "✨" },
         { word: "watch", emoji: "⌚" },
      ],
      ocean: [
         { word: "wave", emoji: "🌊" },
         { word: "water", emoji: "💧" },
         { word: "whirlpool", emoji: "🌀" },
         { word: "wet", emoji: "💦" },
         { word: "wind", emoji: "💨" },
         { word: "waterfall", emoji: "💧" },
         { word: "warm", emoji: "🌡️" },
         { word: "wildlife", emoji: "🐠" },
         { word: "wade", emoji: "🚶" },
         { word: "wash", emoji: "🌊" },
      ],
      default: [
         { word: "wish", emoji: "⭐" },
         { word: "win", emoji: "🏆" },
         { word: "wonder", emoji: "💫" },
         { word: "walk", emoji: "🚶" },
         { word: "wait", emoji: "⏰" },
         { word: "want", emoji: "🤲" },
         { word: "wow", emoji: "😮" },
         { word: "warm", emoji: "🌡️" },
         { word: "wave", emoji: "👋" },
         { word: "welcome", emoji: "🤗" },
      ],
   },
};

// Function to get words based on sound and theme
function getThemedWords(sound: string, theme: string): WordData[] {
   const soundWords = wordDatabase[sound];
   if (!soundWords) return [];

   // Try to find exact theme match (case-insensitive)
   const themeLower = theme.toLowerCase();
   for (const [key, words] of Object.entries(soundWords)) {
      if (key.toLowerCase() === themeLower || themeLower.includes(key)) {
         return words;
      }
   }

   // If no match, return default words
   return soundWords.default || [];
}
