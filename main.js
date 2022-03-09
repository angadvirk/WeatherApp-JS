// DOM elements -- Searchbox:
let checkbox = document.getElementById("auto-location-checkbox");
let streetInput = document.getElementById("street");
let cityInput = document.getElementById("city");
let stateSelect = document.getElementById("state");
let defaultOption = document.getElementById("defaultOption");
let submitButton = document.getElementById("submitButton");

// Weather Card & Table 
let weatherCard = document.getElementById("weatherCard");
let weatherTable = document.getElementById("weatherTable");

// Daily Weather Details View
let dailyWeatherHeading = document.getElementById("dailyWeatherHeading");
let dailyWeatherBox = document.getElementById("dailyWeatherBox");
let weatherChartsHeading = document.getElementById("weatherChartsHeading");
let weatherChartsButton = document.getElementById("weatherChartsButton");

// Object to store tomorrow.io API call
let tomorrow_response = {};

// Array to store weather table entries
let tableEntry_array = [];

// Function declarations
function disableAndResetForm() {
    // Reset
    streetInput.value = "";
    cityInput.value = "";
    defaultOption.selected = true;
    // Disable
    streetInput.disabled = true;
    cityInput.disabled = true;
    stateSelect.disabled = true;
}

function performGeocoding() {
    // Trim trailing whitespace, remove commas, replace spaces with %20
    street = streetInput.value.trim().replace(/,/g, '').replace(/\s+/g, '%20');
    city = cityInput.value.trim().replace(/,/g, '').replace(/\s+/g, '%20');
    state = stateSelect.value;
    return "https://maps.googleapis.com/maps/api/geocode/json?address=" + street + city + state + "&key=ThisIsNotARealApiKey";
}

function showError() {
    // show errorMsg div
    let errorMsg = document.getElementById("errorMsg"); 
    errorMsg.innerHTML = "No records have been found."
    errorMsg.style.display = "block";
    // hide card, table, details card, headings, charts down-arrow button
    weatherCard.style.display = "none"; 
    weatherTable.style.display = "none";
    dailyWeatherHeading.style.display = "none";
    dailyWeatherBox.style.display = "none";
    weatherChartsHeading.style.display = "none";
    weatherChartsButton.style.display = "none";
    // hide charts
    let charts = document.getElementsByClassName("weatherChart");
    for (let i = 0; i < charts.length; i++) {
        charts[i].innerHTML = "";
        charts[i].style.display = "none";
    }
}

function displayDailyWeatherDetails() {
    // Hide card and table
    weatherCard.style.display = "none"; 
    weatherTable.style.display = "none";
    // Show daily weather details
    dailyWeatherHeading.style.display = "block";
    dailyWeatherBox.style.display = "block";
    weatherChartsHeading.style.display = "block";
    weatherChartsButton.style.display = "block";
    // Mapping precipitation type codes to labels
    const precipitationMap = {
        0: "N/A",
        1: "Rain",
        2: "Snow",
        3: "Freezing Rain",
        4: "Ice Pellets"
    }
    let c = this.children;
    document.getElementById("dailyWeatherDate").innerHTML = c[0].innerHTML;
    document.getElementById("dailyWeatherImage").src = c[1].children[0].src; // check this if img doesn't load
    document.getElementById("dailyWeatherStatus").innerHTML = c[1].children[1].innerHTML;
    document.getElementById("dailyWeatherTempHighLow").innerHTML = c[2].innerHTML + "°F/" + c[3].innerHTML + "°F";
    document.getElementById("dailyWindSpeedValue").innerHTML = c[4].innerHTML + " mph";
    
    let values = tomorrow_response.data.timelines[1].intervals[Number(this.id.split("row")[1])].values;
    document.getElementById("dailyPrecipitationValue").innerHTML = precipitationMap[values.precipitationType];
    document.getElementById("dailyPrecipitationChanceValue").innerHTML = values.precipitationProbability.toString() + "%"
    document.getElementById("dailyHumidityValue").innerHTML = values.humidity.toString() + "%";
    document.getElementById("dailyVisibilityValue").innerHTML = values.visibility.toString() + " mi";
    let sunriseTime = new Date(values.sunriseTime);
    sunriseTime = sunriseTime.toLocaleString('en-US', { hour: 'numeric', hour12: true}).replace(/\s+/g, '');
    let sunsetTime = new Date(values.sunsetTime);
    sunsetTime = sunsetTime.toLocaleString('en-US', { hour: 'numeric', hour12: true}).replace(/\s+/g, '');
    document.getElementById("dailySunriseSunsetValue").innerHTML = sunriseTime + "/" + sunsetTime;
}

function constructDate(dateInfo) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let yrMnthDay = dateInfo.split('T')[0].split('-');
    let date = new Date(yrMnthDay[0], yrMnthDay[1] - 1, yrMnthDay[2]);
    let dayOfWeek_index = date.getDay();
    let dayOfWeek = daysOfWeek[dayOfWeek_index];
    let month_index = date.getMonth();
    let month = months[month_index];
    return dayOfWeek + ", " + yrMnthDay[2].toString() + ' ' + month + ", " + yrMnthDay[0].toString();
}

function constructStatus(weatherCode){
    const weatherCodes = {
        0: "Unknown",
        3000: "Light Wind",
        3001: "Wind",
        3002: "Strong Wind",
        4201: "Heavy Rain",
        4001: "Rain",
        4200: "Light Rain",
        6201: "Heavy Freezing Rain",
        6001: "Freezing Rain",
        6200: "Light Freezing Rain",
        6000: "Freezing Drizzle",
        4000: "Drizzle",
        7101: "Heavy Ice Pellets",
        7000: "Ice Pellets",
        7102: "Light Ice Pellets",
        5101: "Heavy Snow",
        5000: "Snow",
        5100: "Light Snow",
        5001: "Flurries",
        8000: "Thunderstorm",
        2100: "Light Fog",
        2000: "Fog",
        1001: "Cloudy",
        1102: "Mostly Cloudy",
        1101: "Partly Cloudy",
        1100: "Mostly Clear",
        1000: "Clear"
    };
    return weatherCodes[weatherCode];
}

function createTableEntry(entryData, tableContainer) {
    let date_string = constructDate(entryData.startTime);
    let status_img_string = constructStatus(entryData.values.weatherCode).toLowerCase().replace(/ /g, '_') + ".svg";
    let status_string = constructStatus(entryData.values.weatherCode);
    let tempHigh_string = entryData.values.temperatureMax.toString();
    let tempLow_string = entryData.values.temperatureMin.toString();
    let windSpeed_string = entryData.values.windSpeed.toString();

    const tableEntry = document.createElement("div");
    tableEntry.className = "tableRow";
    const date_p = document.createElement("p");
    const status_div = document.createElement("div");
    const status_img = document.createElement("img");
    const status_p = document.createElement("p");
    const status_br = document.createElement("br");
    const tempHigh_p = document.createElement("p");
    const tempLow_p = document.createElement("p");
    const windSpeed_p = document.createElement("p");
    date_p.innerHTML = date_string;
    if (status_string === "Unknown") {
        status_img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        status_img.alt = "";
    }
    else {
        status_img.src = "static/images/" + status_img_string
        status_img.alt = status_string;
    }
    // status_img.src = "static/images/" + status_img_string
    // status_img.alt = status_string;
    status_p.innerHTML = status_string;
    status_br.style.clear = "both";
    status_div.appendChild(status_img);
    status_div.appendChild(status_p);
    status_div.appendChild(status_br);
    tempHigh_p.innerHTML = tempHigh_string;
    tempLow_p.innerHTML = tempLow_string;
    windSpeed_p.innerHTML = windSpeed_string;

    tableEntry.style.textAlign = "center";
    status_div.style.display = "flex";
    status_div.style.justifyContent = "center";
    
    date_p.style.width = window.getComputedStyle(document.getElementById("tableHeadingDate")).width;
    status_div.style.width = window.getComputedStyle(document.getElementById("tableHeadingStatus")).width;
    tempHigh_p.style.width = window.getComputedStyle(document.getElementById("tableHeadingTempHigh")).width;
    tempLow_p.style.width = window.getComputedStyle(document.getElementById("tableHeadingTempLow")).width;
    windSpeed_p.style.width = window.getComputedStyle(document.getElementById("tableHeadingWindSpeed")).width;
    
    tableEntry.appendChild(date_p);
    tableEntry.appendChild(status_div);
    tableEntry.appendChild(tempHigh_p);
    tableEntry.appendChild(tempLow_p);
    tableEntry.appendChild(windSpeed_p);

    tableContainer.appendChild(tableEntry);
}

function displayCard(weatherData, loc_string) {
    weatherCard.style.display = "block";
    document.getElementById("cardLocation").innerHTML = loc_string;
    let currentHour = new Date().getHours();
    let i = 0;
    let currentInterval = {};
    while (i < 109) {
        if (currentHour === new Date(weatherData.data.timelines[0].intervals[i].startTime).getHours()) {
            currentInterval = weatherData.data.timelines[0].intervals[i].values;
            break;
        }
        i++;
    }
    let status_string = constructStatus(currentInterval.weatherCode);
    document.getElementById("cardImgLabel").innerHTML = status_string;
    // if (status_string === "Clear" || status_string === "Mostly Clear" || status_string === "Partly Cloudy") {
    //     if (Number(currentHour) < 5 || Number(currentHour) > 17) { // show night images between 6 PM and 5 AM
    //         console.log("Entered");
    //         status_string += " Night";
    //     }
    // }
    // if (status_string === "Unknown") { // in case of unknown
    //     document.getElementById("cardMainImg").src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    //     document.getElementById("cardMainImg").alt = "";
    // }
    // else {
    //     document.getElementById("cardMainImg").src = "static/images/" + status_string.toLowerCase().replace(/ /g, '_') + ".svg";
    // }
    document.getElementById("cardMainImg").src = "static/images/" + status_string.toLowerCase().replace(/ /g, '_') + ".svg";
    document.getElementById("cardMainImg").alt = status_string;
    document.getElementById("cardMainTemp").innerHTML = currentInterval.temperature.toFixed(1) + "°";
    document.getElementById("cardHumidityValue").innerHTML = currentInterval.humidity.toString() + "%";
    document.getElementById("cardPressureValue").innerHTML = currentInterval.pressureSeaLevel.toString() + " inHg";
    document.getElementById("cardWindSpeedValue").innerHTML = currentInterval.windSpeed.toString() + " mph";
    document.getElementById("cardVisibilityValue").innerHTML = currentInterval.visibility.toString() + " mi";
    document.getElementById("cardCloudCoverValue").innerHTML = currentInterval.cloudCover.toString() + "%";
    document.getElementById("cardUvLevelValue").innerHTML = currentInterval.uvIndex.toString();
}

function displayTable(weatherData) {
    weatherTable.style.display = "block";
    let tableContainer = document.getElementById("tableContainerColumn");
    // Clear table before adding new entries, if a prev search was done
    while (tableContainer.children.length > 1) {
        tableContainer.removeChild(tableContainer.children[1]);
    }
    let i = 0;
    while (i < 15) {
        let entryData = weatherData.data.timelines[1].intervals[i];
        createTableEntry(entryData, tableContainer);
        i++;
    }
    let tableEntries = document.getElementsByClassName("tableRow");
    for (i = 0; i < tableEntries.length; i++) {
        if (tableEntries[i].id !== "tableHeading") {
            tableEntries[i].id = "row" + (i - 1).toString();
            tableEntries[i].addEventListener("click", displayDailyWeatherDetails);
        }
    }
}

function displayWeatherData(weatherData, loc_string) {
    // remove display of daily weather heading, box, chart heading & button
    dailyWeatherHeading.style.display = "none";
    dailyWeatherBox.style.display = "none";
    weatherChartsHeading.style.display = "none";
    weatherChartsButton.style.display = "none";
    // remove display of charts
    let charts = document.getElementsByClassName("weatherChart");
    for (let i = 0; i < charts.length; i++) {
        charts[i].innerHTML = "";
        charts[i].style.display = "none";
    }
    // If clear wasn't clicked, make sure charts button is pointing down
    weatherChartsButton.src = weatherChartsButton.src.replace("up", "down");

    displayCard(weatherData, loc_string);
    displayTable(weatherData);
}

async function submitHandler(event) {
    document.getElementById("errorMsg").style.display = "none"; // make sure error message is not visible
    event.preventDefault();
    let coords = []; // array -- 0: lat, 1: lng
    // Set url
    if (checkbox.checked) {
        let ipinfo_url = "https://ipinfo.io/json?token=1d7082a2c0d29f";
        latlng_url = ipinfo_url;
    }
    else {
        let geocoding_url = performGeocoding();
        latlng_url = geocoding_url;
    }
    // Perform fetch for lat/lng
    const response = await fetch(latlng_url);
    const response_json = await response.json();
    let loc_string = "";

    if (checkbox.checked) { // if used ipinfo
        coords = response_json.loc.split(",");
        loc_string = response_json.city + ", " + response_json.region + ", " + response_json.country; 
    }
    else { // if used geocoding
        if (response_json.status === "OK") {
            coords[0] = String(response_json.results[0].geometry.location.lat);
            coords[1] = String(response_json.results[0].geometry.location.lng);
            loc_string = response_json.results[0].formatted_address;
        }
        else if (response_json.status === "ZERO_RESULTS") {
            showError();
            return;
        }
        else if (response_json.status === "OVER_DAILY_LIMIT") {
            document.getElementById("errorMsg").innerHTML = "Geocoding API Error: Over daily limit. See <a href=https://developers.google.com/maps/documentation/geocoding/overview#StatusCodes target=\"_blank\" rel=\"noopener noreferrer\">Geocoding API Status Codes</a> for more info."
            document.getElementById("errorMsg").style.display = "block";
            return;
        }
        else if (response_json.status === "REQUEST_DENIED") {
            document.getElementById("errorMsg").innerHTML = "Geocoding API Error: Request denied. See <a href=https://developers.google.com/maps/documentation/geocoding/overview#StatusCodes target=\"_blank\" rel=\"noopener noreferrer\">Geocoding API Status Codes</a> for more info."
            document.getElementById("errorMsg").style.display = "block";
            return;
        }
        else if (response_json.status === "INVALID_REQUEST") {
            document.getElementById("errorMsg").innerHTML = "Geocoding API Error: Invalid request. See <a href=https://developers.google.com/maps/documentation/geocoding/overview#StatusCodes target=\"_blank\" rel=\"noopener noreferrer\">Geocoding API Status Codes</a> for more info."
            document.getElementById("errorMsg").style.display = "block";
            return;
        }
        else if (response_json.status === "UNKNOWN_ERROR") {
            document.getElementById("errorMsg").innerHTML = "Geocoding API Error: Unknown error. Please try again, or see <a href=https://developers.google.com/maps/documentation/geocoding/overview#StatusCodes target=\"_blank\" rel=\"noopener noreferrer\">Geocoding API Status Codes</a> for more info."
            document.getElementById("errorMsg").style.display = "block";
            return;
        }
    }
    queryString = "?" + "lat=" + coords[0] + '&' + "lng=" + coords[1];
    weather_url = location.href + "weather" + queryString;
    // Perform fetch for flask backend (which calls tomorrow.io)
    const weather_response = await fetch(weather_url);
    const weather_response_json = await weather_response.json();
    console.log(weather_response_json);
    if (weather_response_json.hasOwnProperty("code")) { // is an error
        showError();
        return;
    }
    tomorrow_response = weather_response_json;
    displayWeatherData(weather_response_json, loc_string);
    
    // testing:
    // displayWeatherData(testResponse, loc_string);
}

const clearHandler = () => (location.href = location.href.split('weather')[0]);

// Event listeners
checkbox.addEventListener("click", () => {
    if (checkbox.checked) {
        disableAndResetForm();
    }
    else {
        // Re-enable Street, City and State Inputs
        streetInput.disabled = false;
        cityInput.disabled = false;
        stateSelect.disabled = false;    
    }
});

drawBlocksForWindArrows = function (chart) {
    var xAxis = chart.xAxis[0],
        x,
        pos,
        max,
        isLong,
        isLast,
        i;

    for (pos = xAxis.min, max = xAxis.max, i = 0; pos <= max + 36e5; pos += 36e5, i += 1) {

        // Get the X position
        isLast = pos === max + 36e5;
        x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

        // Draw the vertical dividers and ticks
        if (this.resolution > 36e5) {
            isLong = pos % this.resolution === 0;
        } else {
            isLong = i % 2 === 0;
        }
        chart.renderer.path(['M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
            'L', x, chart.plotTop + chart.plotHeight + 32, 'Z'])
            .attr({
                stroke: chart.options.chart.plotBorderColor,
                'stroke-width': 1
            })
            .add();
    }
    // Center items in block
    chart.get('windbarbs').markerGroup.attr({
        translateX: chart.get('windbarbs').markerGroup.translateX + 3
    });
};

// Display charts... 
weatherChartsButton.addEventListener('click', function () {
    let charts = document.getElementsByClassName("weatherChart");
    let tempRangesData = [];
    for (let i = 0; i < tomorrow_response.data.timelines[1].intervals.length; i++) {
        tempRangesData.push([new Date(tomorrow_response.data.timelines[1].intervals[i].startTime).getTime(),
        tomorrow_response.data.timelines[1].intervals[i].values.temperatureMin,
        tomorrow_response.data.timelines[1].intervals[i].values.temperatureMax]);
    }
    let currentDate = new Date(tomorrow_response.data.timelines[1].intervals[0].startTime)
    let hourlyHourData = [];
    let hourlyTempData = [];
    let hourlyHumidityData = [];
    let hourlyPressureData = [];
    let hourlyWindData = [];
    for (let i = 0; i < tomorrow_response.data.timelines[0].intervals.length; i++) {
        hourlyHourData.push(new Date(tomorrow_response.data.timelines[0].intervals[i].startTime).getTime());
        hourlyTempData.push([hourlyHourData[i], tomorrow_response.data.timelines[0].intervals[i].values.temperature]);
        hourlyHumidityData.push([hourlyHourData[i], tomorrow_response.data.timelines[0].intervals[i].values.humidity]);
        hourlyPressureData.push([hourlyHourData[i], tomorrow_response.data.timelines[0].intervals[i].values.pressureSeaLevel]);
        if (i % 2 === 0) { // get wind data for every even-numbered hour
            hourlyWindData.push([hourlyHourData[i], tomorrow_response.data.timelines[0].intervals[i].values.windSpeed,
                                                    tomorrow_response.data.timelines[0].intervals[i].values.windDirection]);
        }
    }
    // 1633564800000 17:00 today
    console.log(new Date(1633564800000));
    // let counter = 0;
    // while (counter < hourlyHourData.length) {
    //     console.log((hourlyHourData[counter]));
    //     counter++;
    // }
    console.log(tempRangesData);
    let chartData = [hourlyHourData, hourlyTempData, hourlyHumidityData, hourlyPressureData, hourlyWindData];

    for (i = 0; i < charts.length; i++) {
        if (!charts[i].innerHTML) {
            charts[i].style.display = "block";
            // TODO: Add export menu at top-right
            if (i === 0) {
                const chart = Highcharts.chart('tempRanges', {
                    chart: {
                        type: 'arearange'
                    },
                    exporting: {
                        chartOptions: { // specific options for the exported image
                            plotOptions: {
                                series: {
                                    dataLabels: {
                                        enabled: true
                                    }
                                }
                            }
                        },
                        fallbackToExportServer: false
                    },
                    title: {
                        text: 'Temperature Ranges (Min, Max)'
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            day: '%e %b' // eg: 1 Jan
                        },
                        tickInterval: (24 * 3600 * 1000)
                    },
                    yAxis: {
                        tickInterval: 5,
                        title: {
                            text: null
                        }
                    },

                    tooltip: {
                        crosshairs: true,
                        shared: true,
                        valueSuffix: '°F',
                        xDateFormat: '%A, %b %e'
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        series: {
                            lineColor: "rgba(250, 149, 18, 1)"
                            // lineColor: 
                        }
                    },
                    series: [{
                        name: 'Temperatures',
                        data: tempRangesData,
                        fillColor: {
                            linearGradient: { 
                                x1: 0,
                                x2: 0,
                                y1: 0,
                                y2: 1
                            },
                            stops: [[0, "rgba(252, 180, 22, 1)"], [1, "rgba(106, 164, 231, 0.4)"]]
                        }
                    }]
                });
            }
            else {
                window.meteogram = new Meteogram('hourlyWeather', chartData); // pass data arrays here instead of making them global... 
            }
            weatherChartsButton.src = weatherChartsButton.src.replace("down", "up");
            weatherChartsButton.scrollIntoView();
        }
        else {
            charts[i].innerHTML = "";
            charts[i].style.display = "none";
            weatherChartsButton.src = weatherChartsButton.src.replace("up", "down");
        }
    }
});

// Things to do when page is loaded:
weatherCard.style.display = "none"; 
weatherTable.style.display = "none";
dailyWeatherHeading.style.display = "none";
dailyWeatherBox.style.display = "none";
weatherChartsHeading.style.display = "none";
weatherChartsButton.style.display = "none";

if (checkbox.checked) { // if checkbox checked when page is reloaded, uncheck it
    checkbox.checked = false;
    streetInput.value = "";
    cityInput.value = "";
    defaultOption.selected = true;
    streetInput.disabled = false;
    cityInput.disabled = false;
    stateSelect.disabled = false;
    // disableAndResetForm();
}

// HIGHCHARTS V2.0
function Meteogram(container, chartData) {
    // Populating arrays with the chart data
    this.hourlyHourData = chartData[0];
    this.hourlyTempData = chartData[1];
    this.hourlyHumidityData = chartData[2];
    this.hourlyPressureData = chartData[3];
    this.hourlyWindData = chartData[4];
    console.log(this.hourlyHourData);
    console.log(this.hourlyTempData);
    console.log(this.hourlyHumidityData);
    console.log(this.hourlyPressureData);
    console.log(this.hourlyWindData);

    this.container = container;

    // Run
    this.parseYrData();
}

/**
 * Function to smooth the temperature line. The original data provides only whole degrees,
 * which makes the line graph look jagged. So we apply a running mean on it, but preserve
 * the unaltered value in the tooltip.
 */
Meteogram.prototype.smoothLine = function (data) {
    var i = data.length,
        sum,
        value;

    while (i--) {
        data[i].value = value = data[i].y; // preserve value for tooltip

        // Set the smoothed value to the average of the closest points, but don't allow
        // it to differ more than 0.5 degrees from the given value
        sum = (data[i - 1] || data[i]).y + value + (data[i + 1] || data[i]).y;
        data[i].y = Math.max(value - 0.5, Math.min(sum / 3, value + 0.5));
    }
};

Meteogram.prototype.drawBlocksForWindArrows = function (chart) {
    var xAxis = chart.xAxis[0],
        x,
        pos,
        max,
        isLong,
        isLast,
        i;

    for (pos = xAxis.min, max = xAxis.max, i = 0; pos <= max + 36e5; pos += 36e5, i += 1) {
        // Get the X position
        isLast = pos === max + 36e5;
        x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

        // Draw the vertical dividers and ticks
        if (this.resolution > 36e5) {
            isLong = pos % this.resolution === 0;
        } else {
            isLong = i % 2 === 0;
        }
        chart.renderer.path(['M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
            'L', x, chart.plotTop + chart.plotHeight + 32, 'Z'])
            .attr({
                stroke: chart.options.chart.plotBorderColor,
                'stroke-width': 1
            })
            .add();
    }
    // Center items in block
    chart.get('windbarbs').markerGroup.attr({
        translateX: chart.get('windbarbs').markerGroup.translateX + 3
    });
};
/**
 * Build and return the Highcharts options structure
 */
Meteogram.prototype.getChartOptions = function () {
    var meteogram = this;

    return {
        chart: {
            renderTo: this.container,
            marginBottom: 70,
            marginRight: 40,
            marginTop: 50,
            plotBorderWidth: 1,
            height: 300,
            alignTicks: false,
            scrollablePlotArea: {
                minWidth: 720
            }
        },

        exporting: {
            chartOptions: { // specific options for the exported image
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                }
            },
            fallbackToExportServer: false
        },

        title: {
            text: "Hourly Weather (Fot Next 5 Days)",
        },

        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat:
                '<small>{point.x:%A, %b %e, %H:%M}</small><br>' +
                '<b>{point.point.symbolName}</b><br>'

        },

        xAxis: [{ // Bottom X axis
            type: 'datetime',
            tickInterval: 4 * 36e5, // two hours
            minorTickInterval: 36e5, // one hour
            tickLength: 0,
            gridLineWidth: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            startOnTick: false,
            endOnTick: false,
            minPadding: 0,
            maxPadding: 0,
            offset: 30,
            showLastLabel: true,
            labels: {
                format: '{value:%H}'
            },
            crosshair: true
        }, { // Top X axis
            linkedTo: 0,
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
                format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                align: 'left',
                x: 3,
                y: -5
            },
            opposite: true,
            tickLength: 20,
            gridLineWidth: 1
        }],

        yAxis: [{ // temperature axis
            title: {
                text: null
            },
            labels: {
                format: '{value}°',
                style: {
                    fontSize: '10px'
                },
                x: -3
            },
            plotLines: [{ // zero plane
                value: 0,
                color: '#BBBBBB',
                width: 1,
                zIndex: 2
            }],
            maxPadding: 0.3,
            minRange: 8,
            tickInterval: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)'

        }, { // humidity axis
            title: {
                text: null
            },
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            tickLength: 0,
            minRange: 10,
            min: 0

        }, { // Air pressure
            allowDecimals: false,
            title: { // Title on top of axis
                text: 'inHg',
                offset: 0,
                align: 'high',
                rotation: 0,
                style: {
                    fontSize: '10px',
                    color: "rgba(250, 149, 18, 1)"
                },
                textAlign: 'left',
                x: 3
            },
            // tickInterval: 1,
            labels: {
                style: {
                    fontSize: '8px',
                    color: "rgba(250, 149, 18, 1)"
                },
                y: 2,
                x: 3
            },
            tickPositions: [0, 29, 60],
            gridLineWidth: 0,
            opposite: true,
            showLastLabel: false
        }],

        legend: {
            enabled: false
        },

        plotOptions: {
            series: {
                // pointStart: this.hourlyHourData[0], // start at the appropriate hour
                pointPlacement: 'between'
            }
        },


        series: [{
            name: 'Temperature',
            data: this.hourlyTempData,
            type: 'spline',
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            tooltip: {
                valueSuffix: "°F"
            },
            zIndex: 1,
            // tickInterval: 6,
            color: '#FF3333',
            negativeColor: '#48AFE8'
        }, {
            name: 'Humidity',
            data: this.hourlyHumidityData,
            // data: this.precipitations,
            type: 'column',
            color: '#76C2FE',
            yAxis: 1,
            groupPadding: 0,
            pointPadding: 0,
            grouping: false,
            dataLabels: {
                enabled: !meteogram.hasPrecipitationError,
                formatter: function () {
                    if (this.y > 0) {
                        return Math.round(this.y); // no decimals
                    }
                },
                style: {
                    fontSize: '8px',
                    color: 'gray'
                }
            },
            tooltip: {
                valueSuffix: ' %'
            }
        }, {
            name: 'Air pressure',
            color: "rgba(250, 149, 18, 1)",
            data: this.hourlyPressureData,
            // data: this.pressures,
            marker: {
                enabled: false
            },
            shadow: false,
            tooltip: {
                valueSuffix: ' inHg'
            },
            dashStyle: 'shortdot',
            yAxis: 2
        }, {
            name: 'Wind',
            type: 'windbarb',
            id: 'windbarbs',
            color: Highcharts.getOptions().colors[1],
            lineWidth: 1.5,
            // data: this.winds,
            data: this.hourlyWindData,
            vectorLength: 9,
            yOffset: -15,
            tooltip: {
                valueSuffix: ' mph'
            }
        }]
    };
};
/**
 * Post-process the chart using the callback function, the second argument to Highcharts.Chart.
 */
 Meteogram.prototype.onChartLoad = function (chart) {
    this.drawBlocksForWindArrows(chart);
};

Meteogram.prototype.createChart = function () {
    var meteogram = this;
    this.chart = new Highcharts.Chart(this.getChartOptions(), function (chart) {
        meteogram.onChartLoad(chart);
    });
};

Meteogram.prototype.parseYrData = function () {
    // Smooth the line
    this.smoothLine(this.hourlyTempData);
    // Create the chart when the data is loaded
    this.createChart();
};