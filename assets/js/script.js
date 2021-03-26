//setting global variables using let so they aren't reused
let cityList =$("#city-list");
let cities = [];
let key = "c22fc6ee490d7a01dec04dcb517029fa";
let currentDay = moment();
let storedCities = JSON.parse(localStorage.getItem("cities"));


//Calling function init();
init();

//Function init();
function init(){
    // If cities were retrieved from localStorage, update the cities array to it
    if (storedCities !== null) {
        cities = storedCities;
      }
    // Render cities to the DOM
    renderCities();
    // console.log(cities);
}

//Function StoreCities()
function storeCities(){
   // Stringify and set "cities" key in localStorage to cities array
  localStorage.setItem("cities", JSON.stringify(cities));
  console.log(localStorage);
}

//Function renderCities()
function renderCities() {
    // Clear cityList element
    // cityList.text = "";
    // cityList.HTML = "";
    cityList.empty();
    
    // Render a new li for each city
    for (let i = 0; i < cities.length; i++) {
      let cityS = cities[i];
      let li = $("<li>").text(cityS);
      li.attr("id","listC");
      li.attr("data-city", cityS);
      li.attr("class", "list-group-item custom-h-li");
      console.log(li);
      cityList.prepend(li);

        //Get Response weather for the first city only
        if (!cityS){
            return
        } 
        else{
            getResponseWeather(cityS)
        };
    };
};

//When form is submitted...
$("#add-city").on("click", function(event){
    event.preventDefault();
    // This line will grab the city from the input box
    let city = $("#city-input").val().trim();
    // Return from function early if submitted city is blank
    if (city === "") {
		alert("Don't forget to put a city!")
        return;
    }
    //Adding city-input to the city array
    cities.push(city);
   //
   if (cities.length == 0) {
    $("#searchCard").removeClass( "col-xl-1 col-md-3 col-sm-8" ).addClass( "col-xl-2 col-md-6 col-sm-8" );
    $("#weatherCard").removeClass("col-9 col-xl-6 custom-r mt-3")
    } else {
    $("#searchCard").removeClass( "col-xl-2 col-md-6 col-sm-8" ).addClass( "col-xl-1 col-md-3 col-sm-8" );
    $("#weatherCard").addClass("col-9 col-xl-6 custom-r mt-3")
    };



    //Store updated cities in localStorage, re-render the list
    return storeCities(), renderCities();
});

//Function get Response Weather 
function getResponseWeather(cityName){
    //API for first fetch
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + key;
    fetch(queryURL)
    .then(function(response) {
        //throws an error if response was not a city
		if (!response.ok) {
            throw Error(response.statusText);
		//otherwise clears cards for new input and jsons api
		} else {
            $("#weather-tab").empty();
            return response.json();
		};
	}) //this is to catch the error that was thrown
    .catch(function(err) {
        alert("Sorry but that City does not match our database :(")
        return 
    }) //next then statement to make cards
    .then(function (data) {
        //statement for if the data is not actually data end this function
        if (!data) {
            return
        } else { 
        //creating new card to display data
		let weatherCard = $("<div>").attr("class","card weather-card bg-dark");
		$("#weather-tab").append(weatherCard);
        let weatherHeader = $("<div>").attr("class", "card-header weather-card-header bg-dark text-white row-fluid");
        $(".weather-card").append(weatherHeader);
        let cityTitle = $(`<h3 class="weather-title">`).text(data.name);
        $(".weather-card-header").append(cityTitle);
        let titleDate = $(`<h3 class="yellow-date">`).text(currentDay.format("LL"));
        $(".weather-card-header").append(titleDate);
        let weatherBody = $("<div>").attr("class","card-body today-weather text-white")
	    $(".weather-card").append(weatherBody);
        let TempetureToNum = parseInt((data.main.temp)* 9/5 - 459);
        let cityTemperature = $("<p>").text("Tempeture: "+ TempetureToNum + " °F");
        $(".today-weather").append(cityTemperature);
        let cityHumidity = $("<p>").text("Humidity: "+ data.main.humidity + " %");
        $(".today-weather").append(cityHumidity);
        let cityWindSpeed = $("<p>").text("Wind Speed: "+ data.wind.speed + " MPH");
        $(".today-weather").append(cityWindSpeed);
        let uvBox = $("<div>").attr("class", "uvBox")
        $(".today-weather").append(uvBox)

        //setting cords for UV index
        let CoordLon = data.coord.lon;
        let CoordLat = data.coord.lat;
        //Api to get UV index 
        let queryURL2 = "https://api.openweathermap.org/data/2.5/uvi?appid="+ key+ "&lat=" + CoordLat +"&lon=" + CoordLon;
        fetch(queryURL2).then(function(response) {
            if (response.ok) {
                //reset boxes for ever new call
                $(".uvBox").empty();
                return response.json();
            } else {
                return
            };
        })
        .then(function(responseuv) {
            //creating new span to display UV on card
            let cityUV = $("<span>").text(responseuv.value);
            let cityUVp = $("<p>").text("UV Index: ");
            cityUVp.append(cityUV);
            $(".uvBox").append(cityUVp);
            //conditional statement to change background color depending on UV  
            if(responseuv.value > 0 && responseuv.value <=2){
                cityUV.attr("class","green")
            }
            else if (responseuv.value > 2 && responseuv.value <= 5){
                cityUV.attr("class","yellow")
            }
            else if (responseuv.value >5 && responseuv.value <= 7){
                cityUV.attr("class","orange")
            }
            else if (responseuv.value >7 && responseuv.value <= 10){
                cityUV.attr("class","red")
            }
            else{
                cityUV.attr("class","purple")
            }
        });

        //Api to get 5-day forecast  
        let queryURL3 = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + key;
        fetch(queryURL3).then(function(response) {
            if (response.ok) {
                //reset boxes for ever new call
                $("#forecast-tab").empty();
                return response.json();
            } else {
                return
            }
        })
        .then(function(response5day) { 
            //console log to make sure data is correct
            //console.log(response5day);
            //creating new var with 1 day subtracted from moment
            let currentDate5 = moment().subtract(1, 'days')
            //creating new section to display 5 day forecast
            let forecastCard = $("<div>").attr("class","card forecast-card bg-dark")
		    $("#forecast-tab").append(forecastCard)
            let forecastHeader = $("<div>").attr("class","card-header forecast-card-header bg-dark")
            $(".forecast-card").append(forecastHeader)
            let forecastTitle = $("<h3>5-day Forecast</h3>").attr("class"," text-white fontBebas forecastTitle") 
            $(".forecast-card-header").append(forecastTitle)
            let br = $("<br>")
            let boxes = $("<div>").attr("id","boxes")
            boxes.attr("class","row justify-content-center card-deck col-12 m-auto")
            $(".forecast-card").append(br)
            $(".forecast-card").append(boxes)
            //for loop to create 6 new boxes
            for(let i=0, j=0; j<=5; i=i+6){
                let read_date = response5day.list[i].dt;
                if(response5day.list[i].dt != response5day.list[i+1].dt){
                    //crating new boxes for every 4 loop
                    let FivedayDiv = $("<div>");
                    FivedayDiv.attr("class","m-2 bg-info text-center card")
                    //increment the days for each card
                    currentDate5 = moment(currentDate5).add(1, 'days').format("YYYY-MM-DD")
                    let Fivedayh4 = $("<h6>").text(currentDate5);
                    let forecastIcon = $("<img>");
                    //choose icon for weather in a link format
                    forecastIcon.attr("src","https://openweathermap.org/img/w/" + response5day.list[i].weather[0].icon + ".png");
                    let pTemperatureK = response5day.list[i].main.temp;
                    //console.log(skyconditions);
                    let TempetureToNum = parseInt((pTemperatureK)* 9/5 - 459);
                    let pTemperature = $(`<p class="customTemp5">`).text(TempetureToNum + " °F");
                    let pHumidity = $("<p>").text("Humidity: "+ response5day.list[i].main.humidity + " %");
                    FivedayDiv.append(Fivedayh4);
                    FivedayDiv.append(forecastIcon);
                    FivedayDiv.append(pTemperature);
                    FivedayDiv.append(pHumidity);
                    $("#boxes").append(FivedayDiv);
                    console.log(response5day);
                    j++;
                }; 
            };
        });
    };});
};
    
//Click function to each Li 
$(document).on("click", "#listC", function() {
    let thisCity = $(this).attr("data-city");
	getResponseWeather(thisCity);
});

//function for clear button
$("#clearBtn").on("click", function(){
    localStorage.clear();
    location.reload();
})

//
if (cities.length == 0) {
    $("#searchCard").removeClass( "col-xl-1 col-md-3 col-sm-8" ).addClass( "col-xl-2 col-md-6 col-sm-8" );
    $("#weatherCard").removeClass("col-9 col-xl-6 custom-r mt-3")
} else {
    $("#searchCard").removeClass( "col-xl-2 col-md-6 col-sm-8" ).addClass( "col-xl-1 col-md-3 col-sm-8" );
    $("#weatherCard").addClass("col-9 col-xl-6 custom-r mt-3")
}  

if ("$window.location.reload()") {
    $("#weather-tab").empty();
}
