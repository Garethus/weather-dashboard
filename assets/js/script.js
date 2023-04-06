var userFormEL = $("#user-form");
var cityNameEl = $("#city-name");
var recentSearchesEl = $("#recent-searches");
var displayCityEl = $("#display-city");
var displayDateEl = $("#display-date");
var displayIconEl = $("#display-icon")
var displayTempEl = $("#display-temp");
var displayWindEl = $("#display-wind");
var displayHumidityEl = $("#display-humidity");
var forecastEl = $("#forecast");
var weatherInfo = $("#weather-info");

// API call to Open Weather
function getWeather(city) {
    const appid = "4bf5def7369e5ae4027b540079ac1269";
    var requestUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + appid + "&units=metric";

    fetch(requestUrl)
        .then(function (response) {
            if (response.ok) { }
            return response.json();
        })
        .then(function (data) {
            weatherInfo.css("display", "block");

            //Grouping the list by date
            const groupedData = data.list.reduce((days, row) => {
                const date = row.dt_txt.split(" ")[0];
                days[date] = [...(days[date] ? days[date] : []), row];
                return days;
            }, {});

            //Initializing the local storage
            var savedSearch = JSON.parse(window.localStorage.getItem('savedSearch')) || [];

            //Making new array for the new search
            var newSearch = {
                city: data.city.name
            }

            // Checking if city already exist
            if (savedSearch.some((savedSearch) => savedSearch.city === newSearch.city)) {
                // Get the index number of the object if city already exists
                var arrayIndex = savedSearch.findIndex(
                    (savedSearch) => savedSearch.city === newSearch.city
                );
                // Remove the old object
                savedSearch.splice(arrayIndex, 1);
                // Push updated object with updated value
                savetoLocal();
            } else {
                var addtlSearch = $("<button>")
                addtlSearch.text(data.city.name);
                addtlSearch.addClass("searched-city");
                recentSearchesEl.append(addtlSearch);
                savetoLocal();
            }

            //Function to save to local storage
            function savetoLocal() {
                savedSearch.push(newSearch);
                localStorage.setItem("savedSearch", JSON.stringify(savedSearch));
            }

            //Displaying API response to HTML
            displayCityEl.text(data.city.name);
            var dateToday = Object.keys(groupedData)[0];
            displayDateEl.text(" (" + dateToday + ")");
            var URL = "https://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + "@2x.png";
            displayIconEl.attr("src", URL);
            displayIconEl.attr("alt", data.list[0].weather[0].description);
            displayTempEl.text(data.list[0].main.temp + " °C");
            displayWindEl.text(data.list[0].wind.speed + " m/s");
            displayHumidityEl.text(data.list[0].main.humidity + " %");

            //Iterating for 5-day forecast
            for (var i = 1; i < Object.keys(groupedData).length; i++) {
                var forecastDate = Object.keys(groupedData)[i];
                var forecastTemp = groupedData[Object.keys(groupedData)[i]][0].main.temp;
                var forecastWind = groupedData[Object.keys(groupedData)[i]][0].wind.speed;
                var forecastHumidity = groupedData[Object.keys(groupedData)[i]][0].main.humidity;

                var newCard = $("<div>");
                newCard.addClass("card");
                var date = $("<h4>");
                date.text(forecastDate);
                var weatherIcon = "https://openweathermap.org/img/wn/" + groupedData[Object.keys(groupedData)[i]][0].weather[0].icon + "@2x.png";
                var icon = $("<img>")
                icon.attr("src", weatherIcon);
                icon.attr("alt", groupedData[Object.keys(groupedData)[i]][0].weather[0].description);
                var temp = $("<p>");
                temp.text("Temp: " + forecastTemp + " °C");
                var wind = $("<p>");
                wind.text("Wind: " + forecastWind + " m/s");
                var humidity = $("<p>");
                humidity.text("Humidity: " + forecastHumidity + " %");

                newCard.append(date);
                newCard.append(icon);
                newCard.append(temp);
                newCard.append(wind);
                newCard.append(humidity);
                forecastEl.append(newCard);
            }
        })
        .catch(function (error) {
            weatherInfo.css("display", "none");
            alert('City not found!');
        });
}

// Persist saved searches during page refresh
window.onload = displayLocalStorage;

function displayLocalStorage() {
    weatherInfo.css("display", "none");
    var cityList = JSON.parse(window.localStorage.getItem('savedSearch'));
    if (cityList !== null) {
        for (var i = 0; i < cityList.length; i++) {
            var cityName = $("<button>")
            cityName.addClass("searched-city");
            cityName.text(cityList[i].city);
            recentSearchesEl.append(cityName);
        }
    }
}

//Eventlistener for submission of city name
userFormEL.on("submit", function (event) {
    event.preventDefault();
    var cityName = cityNameEl.val().trim();
    $(':input').val('');
    if (cityName) {
        getWeather(cityName);
        forecastEl.text('');
    }
});

//Eventlistener for click of saved searches
recentSearchesEl.on("click", '.searched-city', function (event) {
    event.preventDefault();
    var cityName = $(event.target).text();
    getWeather(cityName);
    forecastEl.text('');
});