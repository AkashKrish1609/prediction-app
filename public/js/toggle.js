
// Get the left and right toggle buttons
const leftToggle = document.querySelectorAll(".left-toggle");
const rightToggle = document.querySelectorAll(".right-toggle");

// Get all the matchday columns
const matchdayColumns = document.querySelectorAll(".matchday-column");


// Set the initial current matchday index
let matchdayNumber = document.querySelector(".right-side").getAttribute("data-currentMatchday")
let currentMatchday = parseFloat(matchdayNumber);

// Show the current matchday and hide the other matchdays
function showCurrentMatchday() {
    matchdayColumns.forEach((matchdayColumn, index) => {
      if (index === currentMatchday) {
        matchdayColumn.style.opacity = 1;
        matchdayColumn.style.display = "block";
      } else {
        matchdayColumn.style.opacity = 0;
        matchdayColumn.style.display = "none";
      }
    });
  }
  
  // Call the function to show the current matchday initially
  showCurrentMatchday();
  
  // Add event listeners to the left and right toggle buttons
  leftToggle.forEach( (element) => {
      element.addEventListener("click", () => {
          if (currentMatchday > 0) {
            currentMatchday -= 1;
            showCurrentMatchday();
          }
        });
        
  })
  
  rightToggle.forEach((element) => {
      element.addEventListener("click", () => {
          if (currentMatchday < matchdayColumns.length - 1) {
            currentMatchday += 1;
            showCurrentMatchday();
          }
        });
  })
