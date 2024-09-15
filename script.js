// Select the grid and buttons
const grid = document.getElementById("grid");
const imageInput = document.getElementById("imageInput");
const revealButton = document.getElementById("revealButton");
const revealAllButton = document.getElementById("revealAllButton");
const resetButton = document.getElementById("resetButton");
const clickCounter = document.getElementById("clickCounter");

// Create the 20x20 grid of cells
const rows = 20;
const cols = 20;
const totalCells = rows * cols;
let coveredCells = [];
let revealedCells = [];
let clickCount = 0;

// Load saved state from local storage
function loadState() {
  const savedImage = localStorage.getItem("savedImage");
  const savedRevealedCells = JSON.parse(localStorage.getItem("revealedCells"));
  const savedClickCount = localStorage.getItem("clickCount");

  if (savedImage) {
    initializeGrid(savedImage);
  } else {
    initializeGrid("image.png"); // Default image
  }

  if (savedRevealedCells) {
    revealedCells = savedRevealedCells;
    revealedCells.forEach((cellIndex) => {
      grid.children[cellIndex].style.backgroundColor = "transparent";
    });
  }

  if (savedClickCount) {
    clickCount = parseInt(savedClickCount);
    clickCounter.textContent = `Clicks: ${clickCount}`;
  }
}

// Initialize grid and set image
function initializeGrid(imageSrc) {
  grid.innerHTML = "";
  coveredCells = [];
  revealedCells = JSON.parse(localStorage.getItem("revealedCells")) || [];

  grid.style.backgroundImage = `url(${imageSrc})`;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    grid.appendChild(cell);

    // Only add unrevealed cells to coveredCells
    if (!revealedCells.includes(i)) {
      coveredCells.push(i); // Add index of the cell to the array of covered cells
    } else {
      cell.style.backgroundColor = "transparent"; // Restore revealed cell
    }
  }
}

// Function to reveal a random cell
function revealRandomCell() {
  if (coveredCells.length === 0) {
    alert("All cells have been revealed!");
    return;
  }

  // Increase click counter
  clickCount++;
  clickCounter.textContent = `Clicks: ${clickCount}`;
  localStorage.setItem("clickCount", clickCount);

  // Select a random index from the coveredCells array
  const randomIndex = Math.floor(Math.random() * coveredCells.length);
  const cellIndex = coveredCells[randomIndex];

  // Reveal the cell
  const cell = grid.children[cellIndex];
  cell.style.backgroundColor = "transparent"; // Reveal the image

  // Remove the revealed cell from the coveredCells array and add to revealedCells
  coveredCells.splice(randomIndex, 1);
  revealedCells.push(cellIndex);

  // Save the updated revealedCells state
  localStorage.setItem("revealedCells", JSON.stringify(revealedCells));
}

// Function to reveal all cells
function revealAllCells() {
  if (confirm("Are you sure you want to reveal all cells?")) {
    for (let i = 0; i < totalCells; i++) {
      grid.children[i].style.backgroundColor = "transparent";
    }
    coveredCells = [];
    revealedCells = [...Array(totalCells).keys()];

    // Update local storage to reflect that all cells are revealed
    localStorage.setItem("revealedCells", JSON.stringify(revealedCells));
  }
}

// Function to resize the image to store in local storage (max storage size is 5MB)
function resizeImage(imageSrc, callback) {
  const img = new Image();
  img.src = imageSrc;
  img.onload = function () {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Resize the image (for example, to a max width of 600px)
    const MAX_WIDTH = 600;
    const MAX_HEIGHT = 600;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    callback(canvas.toDataURL("image/png")); // Convert canvas to data URL
  };
}

// Add event listener to the image input to load a new image
imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      resizeImage(event.target.result, function (resizedImage) {
        // Clear previously saved revealed cells from local storage
        localStorage.removeItem("revealedCells");

        // Initialize the grid with the resized image
        initializeGrid(resizedImage);

        // Save the resized image in local storage
        localStorage.setItem("savedImage", resizedImage);
        console.log("Saved image URL:", localStorage.getItem("savedImage")); // Debug log

        // Reset the counter
        clickCount = 0;
        clickCounter.textContent = `Clicks: ${clickCount}`;
        localStorage.setItem("clickCount", clickCount);
      });
    };
    reader.readAsDataURL(file);
  }
});

// Add event listener to the reset button to reset the grid
resetButton.addEventListener("click", function () {
  if (confirm("Are you sure you want to reset the grid?")) {
    localStorage.clear(); // Clear local storage when resetting
    initializeGrid("image.png");
    clickCount = 0;
    clickCounter.textContent = `Clicks: ${clickCount}`;
  }
});

// Add event listener to the reveal button to reveal random cells
revealButton.addEventListener("click", revealRandomCell);

// Add event listener to the reveal all button
revealAllButton.addEventListener("click", revealAllCells);

// Initialize the grid with a default image or load from local storage
loadState();
