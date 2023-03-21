let matches = document.querySelectorAll(".match")
let finalScore = document.querySelectorAll(".final-score")
let predictBtns = document.querySelectorAll(".predict-btn")
let predictionInputs = document.querySelectorAll(".prediction")
let submitPredictions = document.querySelectorAll(".submit-prediction")
let homeScore = document.querySelectorAll(".home-score")
let awayScore = document.querySelectorAll(".away-score")
let result = document.querySelectorAll(".predicted-result")
let hyphon = document.querySelectorAll(".hyphon")


predictionInputs.forEach( (element) => {
    element.style.display = "none";
})
submitPredictions.forEach( (element) => {
    element.style.display = "none";
})

for (let i = 0; i < matches.length; i++) {
if( isNaN(parseFloat(finalScore[i].innerText))){
    predictBtns[i].style.display = "block"
}else if( !isNaN(parseFloat(finalScore[i].innerText))){
    predictBtns[i].style.display = "none"
}

if (result[i].textContent.trim() !== ""){
    predictBtns[i].style.display = "none"
}

    predictBtns[i].addEventListener("click", () => {
        predictBtns[i].style.display = "none"
        predictionInputs[i].style.display = "block"
        submitPredictions[i].style.display = "block"
    })

    submitPredictions[i].addEventListener("click", (e) => {
    e.preventDefault()
    if(homeScore[i].value && awayScore[i].value){        
    let matchId = submitPredictions[i].getAttribute("data-matchId");
    let homeTeamScore = homeScore[i].value;
    let awayTeamScore = awayScore[i].value;
    submitPredictions[i].style.display = "none";
    homeScore[i].style.display = "none";
    awayScore[i].style.display = "none";
    hyphon[i].innerText = " ";
    result[i].innerHTML = ` Your prediction: ${homeScore[i].value} - ${awayScore[i].value}`


    //I copied the below code from chatGPT and I understand some parts of it 
    const xhr = new XMLHttpRequest();
    const url = '/home';
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // console.log(xhr.responseText);
      }
    };
    const data = JSON.stringify({
      matchId: matchId,
      homeTeamScore: homeTeamScore,
      awayTeamScore: awayTeamScore
    });
    xhr.send(data);
  

        }  
    })


    
}

