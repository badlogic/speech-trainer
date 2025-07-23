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
   const wordImage = document.getElementById("wordImage") as HTMLImageElement;
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
   async function initializeWords() {
      // Show loading state
      wordDisplay.textContent = "Loading...";
      wordEmoji.textContent = "⏳";
      prevButton.disabled = true;
      nextButton.disabled = true;

      try {
         currentWords = await getThemedWords(selectedSound, selectedTheme);
         currentIndex = 0;
         displayCurrentWord();
      } catch (error) {
         console.error("Failed to initialize words:", error);
         wordDisplay.textContent = "Error loading words";
         wordEmoji.textContent = "❌";
      }
   }

   // Display the current word
   function displayCurrentWord() {
      if (currentWords.length === 0) return;

      const wordData = currentWords[currentIndex];
      const isImageWord = (currentIndex + 1) % 3 === 0;

      // Update display
      wordDisplay.textContent = wordData.word;
      currentWordSpan.textContent = (currentIndex + 1).toString();

      // Clear previous image to prevent flicker
      if (wordImage.src) {
         wordImage.src = "";
      }

      // Handle image/emoji display
      if (isImageWord) {
         if (wordData.imageUrl) {
            // Image is ready - preload it first
            const img = new Image();
            img.onload = () => {
               wordImage.src = wordData.imageUrl ?? "";
               wordImage.classList.remove("hidden");
               wordEmoji.classList.add("hidden");
            };
            img.src = wordData.imageUrl;
         } else {
            // Image is still loading
            wordImage.classList.add("hidden");
            wordEmoji.textContent = "🔄";
            wordEmoji.classList.remove("hidden");
            wordEmoji.classList.add("animate-spin");
         }
      } else {
         // Regular emoji word
         wordImage.classList.add("hidden");
         wordEmoji.textContent = wordData.emoji;
         wordEmoji.classList.remove("hidden", "animate-spin");
      }

      // Update button states
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === currentWords.length - 1;

      // Add entrance animation to card
      wordCard.classList.remove("card-entrance");
      void wordCard.offsetWidth; // Force reflow
      wordCard.classList.add("card-entrance");

      // Add floating animation to emoji (only if not loading)
      if (!isImageWord || wordData.imageUrl) {
         wordEmoji.classList.add("emoji-float");
      }

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

   // Load image in the background and update the word data when ready
   async function loadImageInBackground(word: WordData) {
      try {
         const response = await fetch("/api/generate-image", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ word: word.word }),
         });

         if (response.ok) {
            const data = await response.json();
            word.imageUrl = data.imageUrl;

            // If this word is currently displayed, update the view
            if (currentWords[currentIndex] === word) {
               displayCurrentWord();
            }
         }
      } catch (error) {
         console.error(`Failed to generate image for ${word.word}:`, error);
      }
   }

   // Word data structure with themed words for each speech sound
   interface WordData {
      word: string;
      emoji: string;
      imageUrl?: string;
   }

   // Function to get words from API based on sound and theme
   async function getThemedWords(sound: string, theme: string): Promise<WordData[]> {
      try {
         const response = await fetch("/api/generate-words", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               sound,
               theme,
               count: 10,
            }),
         });

         if (!response.ok) {
            throw new Error("Failed to generate words");
         }

         const data = await response.json();
         const words: WordData[] = data.words;

         // Load images in the background for every 3rd word
         words.forEach((word, index) => {
            if ((index + 1) % 3 === 0) {
               loadImageInBackground(word);
            }
         });

         return words;
      } catch (error) {
         console.error("Error fetching words:", error);
         // Fallback to default words if API fails
         alert("Failed to fetch words, something's wrong with the server, Boo!");
         location.reload();
         return [];
      }
   }
});
