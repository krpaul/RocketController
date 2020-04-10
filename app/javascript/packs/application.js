require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")

require("chartkick").use(require("highcharts"))
require("chart.js")

// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)

Array.prototype.last = function() {
    return this.slice(-1)[0]
}

// Map
mapboxgl.accessToken = 'pk.eyJ1Ijoia3JwYXVsIiwiYSI6ImNrMnV4b2w5dTFhbnQzaG50YmppcHVhdWcifQ.rwTKRa2OQmqweeps8ZXELw';

let UPDATE_INTERVAL_MS = 1000;

// Global vars
let map;
let altitudePoints = [];
let latlngPairs = [];
let timer;
let clockTimer;
let reCheckForData;
let mode;
let noDataAlertTimer; 
let noDataHidden = false;
let timestampLastUpdate = 0;
let pageType;
let currentFlight;
let updateInterval;
let dataCheck;

document.addEventListener("turbolinks:load", function() { 
    currentFlight = getCookie("flight")

    if (currentFlight != undefined && currentFlight != "")
        $("#flight-name")[0].innerText = currentFlight
    else 
        currentFlight = "";

    pageType = $(".active")[0].id;
    switch (pageType) {

    case "telemetry":
        // Get all data
        $.ajax({
            url: "/all",
            data: { "flight": currentFlight },
            success: (data) => {
                if (data.length != 0) { startup(data); }
                else if (currentFlight == "") { // if no data availible, check for data every 5s (as long we're querying for the current flight)
                    reCheckForData = window.setInterval(
                        () => {
                            $.ajax({
                                url: "/all",
                                data: { "flight": currentFlight },
                                success: (data) => {
                                    if (data.length != 0) {
                                        startup(data); 
                                        clearInterval(reCheckForData);
                                        clearNoData();
                                    }
                                }
                            })
                        }, 
                        5000);
                        
                        // Set no data alerts
                        noDataAlert()
                 }

                // other setup
                setup()
            },
        }) 
        break;

    case "other":
        setup()
        if (currentFlight)
        {
            $.post(
                "/allFlightData",
                { "flight": currentFlight },
                (data) => {
                    var a = Chartkick.charts["accel"]
                    a.dataSource[0].data = data.acceleration[0];
                    a.dataSource[1].data = data.acceleration[1];
                    a.dataSource[2].data = data.acceleration[2];
        
                    var g = Chartkick.charts["gyro"]
                    g.dataSource[0].data = data.gyro[0];
                    g.dataSource[1].data = data.gyro[1];
                    g.dataSource[2].data = data.gyro[2];
        
                    var o = Chartkick.charts["orientation"]
                    o.dataSource[0].data = data.orientation[0];
                    o.dataSource[1].data = data.orientation[1];
                    o.dataSource[2].data = data.orientation[2];
        
                    var r = Chartkick.charts["rssi"]
                    r.dataSource = data.rssi;
        
                    Chartkick.eachChart(function(chart) {
                        chart.refreshData()
                        chart.redraw()
                    })
                }
            )
        }
        else
        {
            clearInterval(dataCheck)
            dataCheck = window.setInterval(() => {checkDataUpdate(newOtherData)}, UPDATE_INTERVAL_MS);
        }

        Chartkick.eachChart(function(chart) {
            console.log(chart)
            chart.chart.xAxis[0].visible = false;
        })
        break;

    case "config":
        $("#create-flight").click(() => {
            var flight = ""
            while (flight == "") 
                flight = prompt("Enter the name for a new flight")
            
            $.post(
                "/isFlight",
                { "name": flight },               
                (data) => {
                    if (data.exists)
                    { 
                        alert("A flight with that name already exists!"); 
                    }   
                    else
                    {
                        var desc = prompt("Enter a description for this flight")
                        var confirmed = confirm("Create a new flight?");
            
                        if (confirmed)
                        {
                            $.post(
                                "/newFlight",
                                {
                                    "name": flight,
                                    "desc": desc
                                }
                            )
                        }
                    }
                },
            )
        });

        $("#select-flight").click(() => {
            currentFlight = $(".flight-select")[0].value;
            setCookie("flight", currentFlight, 5)
            $("#flight-name")[0].innerText = currentFlight
        });

        $("#curr-flight").click(() => {
            currentFlight = ""
            setCookie("flight", currentFlight, 1)
            location.reload()
            return false
        });
        break;
    }  
})

function verifyPacket(data)
{
    // undef
    if (!data || data == undefined) {
        return false
    }
    // not new
    else if (data.timestamp <= timestampLastUpdate) { 
        return false 
    } 
    // not from this flight
    else if (currentFlight != "" && data.flight != currentFlight) { 
        return false 
    }
    
    return true
}

function newData(data) 
{
    if (!verifyPacket(data)) 
    { return }

    /* Otherwise ... */

    // Update latest time
    timestampLastUpdate = data.timestamp

    // Update numerical data
    var alt = parseFloat(data.alt)
    var lat = parseFloat(data.lat)
    var lng = parseFloat(data.lng)

    // Add pair to lines
    latlngPairs.push([lat, lng])

    // Add altitude
    altitudePoints.push(alt)

    // Add a line to the map
    addMapLines(latlngPairs)

    // Update Altitude Chart
    // chart.data[0].addTo("dataPoints", altitudePoints.last())
    // chart.options.data[0].dataPoints[length-1].y = altitudePoints.last()
    
    map.jumpTo({
        center: [lng, lat]
    })
    
    // update chart

    // general telem
    updateGeneralTelemetry(data)

    // reset timer
    resetTimeSinceLastUpdate()
    setTimeSinceLastUpdate()
}

function newOtherData(data)
{
    if (!verifyPacket(data)) 
        return
    else if (timestampLastUpdate == 0) {
        timestampLastUpdate = data.timestamp;
        return;
    } 

    /* Otherwise ... */

    // Update latest time
    timestampLastUpdate = data.timestamp;
    var stamp = data.timestamp;

    var a = Chartkick.charts["accel"]
    a.dataSource[0].data.push([stamp, data.acceleration.x])
    a.dataSource[1].data.push([stamp, data.acceleration.y])
    a.dataSource[2].data.push([stamp, data.acceleration.z])

    var g = Chartkick.charts["gyro"]
    g.dataSource[0].data.push([stamp, data.gyro.x])
    g.dataSource[1].data.push([stamp, data.gyro.y])
    g.dataSource[2].data.push([stamp, data.gyro.z])

    var o = Chartkick.charts["orientation"]
    o.dataSource[0].data.push([stamp, data.orientation.x])
    o.dataSource[1].data.push([stamp, data.orientation.y])
    o.dataSource[2].data.push([stamp, data.orientation.z])

    var r = Chartkick.charts["rssi"]
    r.dataSource.push([stamp, data.RSSI])

    Chartkick.eachChart(function(chart) {
        chart.refreshData()
        chart.redraw()
    })
}

function updateGeneralTelemetry(packet)
{
    var alt = parseFloat(packet.alt)
    var lat = parseFloat(packet.lat)
    var lng = parseFloat(packet.lng)

    $("#altitude-value")[0].innerText  = alt.toFixed(1)
    $("#latitude-value")[0].innerText  = lat.toFixed(2)
    $("#longitude-value")[0].innerText = lng.toFixed(2)

    // update acceleration vect
    $("#accel-x")[0].innerText = packet.acceleration.x
    $("#accel-y")[0].innerText = packet.acceleration.y
    $("#accel-z")[0].innerText = packet.acceleration.z
    
    // update orientation
    $("#orient-x")[0].innerText = packet.orientation.x
    $("#orient-y")[0].innerText = packet.orientation.y
    $("#orient-z")[0].innerText = packet.orientation.z
    
    // update gryo
    $("#gyro-x")[0].innerText = packet.gyro.x
    $("#gyro-y")[0].innerText = packet.gyro.y
    $("#gyro-z")[0].innerText = packet.gyro.z

    // update calib
    $("#calib-sys")[0].innerText = packet.calibration.sys
    $("#calib-mag")[0].innerText = packet.calibration.mag
    $("#calib-gyro")[0].innerText = packet.calibration.gyro
    $("#calib-accel")[0].innerText = packet.calibration.accel

    // transmission info
    $("#last-node")[0].innerText = packet.lastNodeName
    $("#last-rssi")[0].innerText = packet.RSSI
}

function allData(data) // Fills in all data packets from /all request
{
    if (!data)
        return

    data.forEach(packet => {
        // Extract numerical data
        var alt = parseFloat(packet.alt)
        var lat = parseFloat(packet.lat)
        var lng = parseFloat(packet.lng)
        
        // Insert into arrays
        altitudePoints.push(alt)
        latlngPairs.push([lat, lng])
    })

    // fill in gen. telemetry with latest packet
    updateGeneralTelemetry(data.last())
}

function checkDataUpdate(fun) {
    $.ajax({
        url: "/out",
        success: fun,
    })    
}

function startup(data)
/* Function for all the initialization stuff that requires good data */
{
    // Set all data
    allData(data)
    
    // Create map
    // Note mapbox coord are given at LNG / LAT, not lat/lng
    map = new mapboxgl.Map({
        container: 'map', // HTML container ID
        style: 'mapbox://styles/mapbox/streets-v9', // style URL
        center: [latlngPairs.last()[1], latlngPairs.last()[0]], 
        zoom: 5
    })
    
    map.on('load', 
    () => {
        // load first packet
        updateGeneralTelemetry(data.last())

        // Let the window check for an update every half second with new data
        clearInterval(dataCheck)
        dataCheck = window.setInterval(() => {checkDataUpdate(newData)}, UPDATE_INTERVAL_MS);
        
        map.loadImage(
            'https://cdn1.iconfinder.com/data/icons/transports-5/66/56-512.png',
            function(error, image) {
                if (error) throw error;
                map.addImage('bln', image);
        });

        addMapLines(latlngPairs)
        }
    )
}

function setup()
/* Stuff that doesn't require data */
{
    // Set button events
    setElements()

    // Timer
    resetTimeSinceLastUpdate()

    setTimeSinceLastUpdate()

    // time display
    startTime()

    // incase it is still running 
    clearInterval(reCheckForData)
}

        
/*******************
    Utility Methods 
*******************/

// `lines` is an array of [lat, lng] pairs
function addMapLines(lines)
{
    // Quick and dirty approach to this function:
    // deleting and recreating the layer each time, 
    // but works for now
    
    if (map.getLayer('route')) 
    {
        map.removeLayer('route')
        map.removeSource('route')
    }
    
    if (map.getLayer('balloon-point'))
    {
        map.removeLayer('balloon-point')
        map.removeSource('balloon')
    }

    var newLines = lines.map(x => [x[1], x[0]])  // flip lat/lng
    
    // point
    map.addSource('balloon', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': newLines.last()
                    }
                }
            ]
        }
    });

    map.addLayer({
        'id': 'balloon-point',
        'type': 'symbol',
        'source': 'balloon',
        'layout': {
            'icon-image': 'bln',
            'icon-size': 0.05,
        }
    });

    // lines
    map.addLayer(
        {
            "id": "route",
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": newLines
                    }
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#F00",
                "line-width": 2
            }
        }
    )  
}
            
function setTimeSinceLastUpdate()
{
    // Last time update (and remove mapbox credit)
    updateInterval = window.setInterval(function() {updateTimeSinceLastUpdate(); removeCredit();}, 1000)
}

function updateTimeSinceLastUpdate()
{
    timer.innerText = String(parseInt(timer.innerText) + 1)
}

function resetTimeSinceLastUpdate()
{ 
    clearInterval(updateInterval);
    timer.innerText = "0" 
}


function clearNoData()
{
    $(".no-data").hide()
    clearInterval(noDataAlertTimer)
}

// https://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/*******************
    Button Methods 
*******************/

function _resetZoom()
{
    map.jumpTo({
        zoom: 3,
    })
}

function _goTo()
{
    var pair = latlngPairs.last() || [0, 0];
    map.jumpTo({
        center:  [pair[1], pair[0]]
    })
}

// Remove canvasJS credit
function removeCredit()
{
    if ($(".canvasjs-chart-credit")[0])
    $(".canvasjs-chart-credit")[0].remove()
}

function setElements()
{
    $("#reset-zoom").click(_resetZoom)
    
    $("#go-to-balloon").click(function() {
        _goTo()
        _resetZoom()
    })
    
    timer = $("#last-update")[0]
}

function checkTime(i) 
{ return(i < 10) ? "0" + i : i; }

export function startTime() 
{
    var today = new Date(),
    h = checkTime(today.getHours()),
    m = checkTime(today.getMinutes()),
    s = checkTime(today.getSeconds());
    
    document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
    
    clockTimer = setTimeout(function () {
        startTime()
    }, 500);
}

function noDataAlert()
{
    noDataAlertTimer = window.setInterval(() => {
        if (noDataHidden) {
            $(".no-data").show()
            noDataHidden = !noDataHidden
        }
        else {
            $(".no-data").hide()
            noDataHidden = !noDataHidden
        }
    }, 1000)
}
