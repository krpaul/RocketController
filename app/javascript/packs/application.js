require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")
require("chartkick")
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

let UPDATE_INTERVAL_MS = 5 * 1000;

// Global vars
let map;
let altitudePoints = [];
let latlngPairs = [];
let latlngPairs_tracker = [];
let timer;
let clockTimer;
let reCheckForData;
let noDataAlertTimer; 
let noDataHidden = false;
let timestampLastUpdate = 0;
let pageType;
let currentFlight;
let updateInterval;
let dataCheck;

let redir = (loc) => {window.location.href = loc};

document.addEventListener("turbolinks:load", function() { 
    pageType = $(".active")[0].id;
    switch (pageType) {

    case "telemetry":
    case "mapPage": 
        initialzeGeneralTelemetry()
        break;
    case "other":
        setup()
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

                            redir("/")
                        }
                    }
                },
            )
        });

        $("#select-flight").click(() => {
            redir(`/${$(".flight-select").val()}/telemetry`)
        });

        $("#curr-flight").click(() => {
            redir("/")
        });

        break;
    }  
})

function initialzeGeneralTelemetry()
{
    // Get all data
    $.ajax({
        url: "/all",
        data: { "flight": getFlight() },
        success: (data) => {
            if (data.length != 0) { startup(data); }
            else if (currentFlight == "") { // if no data availible, check for data every 5s (as long we're querying for the current flight)
                reCheckForData = window.setInterval(
                    () => {
                        $.ajax({
                            url: "/all",
                            data: { "flight": getFlight() },
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
}

function _verifyPacket(data)
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
    if (!_verifyPacket(data)) 
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
    
    // general telem
    updateGeneralTelemetry(data)
    
    if (pageType == "mapPage")
    {
        var lat1 = parseFloat(data.receiver.lat)
        var lng1 = parseFloat(data.receiver.lng)
        
        latlngPairs_tracker.push([lat1, lng1])
    }
    else
    {
        // reset timer
        resetTimeSinceLastUpdate()
        setTimeSinceLastUpdate()
    }

    // Add a line to the map
    addMapLines()

    // Jump if we're not on the big map
    if (pageType != "mapPage")
        map.jumpTo({
            center: [lng, lat]
        })
}

function updateGeneralTelemetry(packet)
{
    var lat = parseFloat(packet.lat)
    var lng = parseFloat(packet.lng)
    
    $("#latitude-value")[0].innerText  = lat.toFixed(2)
    $("#longitude-value")[0].innerText = lng.toFixed(2)
    
    if (pageType == 'mapPage') {
        $("#latitude-value_tracking")[0].innerHTML = packet.receiver.lat
        $("#longitude-value_tracking")[0].innerHTML = packet.receiver.lng
    } else  {
        var alt = parseFloat(packet.alt)
        $("#altitude-value")[0].innerText  = alt.toFixed(1)
    
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

        if (pageType == "mapPage")
        {
            var lat1 = parseFloat(packet.receiver.lat)
            var lng1 = parseFloat(packet.receiver.lng)
            
            latlngPairs_tracker.push([lat1, lng1])
        }
    })

    // fill in gen. telemetry with latest packet
    updateGeneralTelemetry(data.last())
}

function checkDataUpdate(fn) {
    $.ajax({
        url: "/out",
        success: (data) => {
            // Make sure data is relevant
            if (data && data.flight_id == getFlight())
                fn(data)
        },
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
        container: pageType == "mapPage" ? 'bigmap' : "map", // HTML container ID
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
        
        // add balloon icon
        map.loadImage(
            'https://cdn1.iconfinder.com/data/icons/transports-5/66/56-512.png',
            function(error, image) {
                if (error) throw error;
                map.addImage('bln', image);
        });

        // add tracker icon
        map.loadImage(
            'https://cdn3.iconfinder.com/data/icons/geek-3/24/Star-Trek_logo_geek_movie-512.png',
            function(error, image) {
                if (error) throw error;
                map.addImage('tkr', image);
        });

        addMapLines()
    })
}

function setup()
/* Stuff that doesn't require data */
{
    // clear old stuff
    clearInterval(updateInterval)

    // Set button events
    setElements()

    if (pageType != "mapPage")
    {
        // Timer
        resetTimeSinceLastUpdate()
        setTimeSinceLastUpdate()
    }

    // time display
    startTime()

    // incase it is still running 
    clearInterval(reCheckForData)
}

        
/*******************
    Utility Methods 
*******************/

// `lines` is an array of [lat, lng] pairs
function addMapLines()
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
    

    if (map.getLayer('tracker-route')) 
    {
        map.removeLayer('tracker-route')
        map.removeSource('tracker-route')
    }

    if (map.getLayer('tracker-point'))
    {
        map.removeLayer('tracker-point')
        map.removeSource('tracker')
    }
    
    /* add balloon info */
    var newLines = latlngPairs.map(x => [x[1], x[0]])  // flip lat/lng
    
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

    // add balloon icon
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
    map.addLayer({
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
    })  

    if (pageType == "mapPage")
    {
        /* add tracker info */
        var newLines_t = latlngPairs_tracker.map(x => [x[1], x[0]])  // flip lat/lng
        map.addSource('tracker', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': newLines_t.last()
                        }
                    }
                ]
            }
        });
    
        // add tracker icon
        map.addLayer({
            'id': 'tracker-point',
            'type': 'symbol',
            'source': 'tracker',
            'layout': {
                'icon-image': 'tkr',
                'icon-size': 0.05,
            }
        });
    
        // lines
        map.addLayer({
            "id": "tracker-route",
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": newLines_t
                    }
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#1a53ff",
                "line-width": 2
            }
        })
    }
}
            
function getFlight()
{ return $("#flight-id")[0].innerText }

function setTimeSinceLastUpdate()
{
    // Last time update (and remove mapbox credit)
    updateInterval = window.setInterval(function() {updateTimeSinceLastUpdate(); removeCredit();}, 1000)
}

function updateTimeSinceLastUpdate()
{ timer.innerText = String(parseInt(timer.innerText) + 1) }

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
    $("#go-to-balloon").click(_goTo)
    
    timer = $("#last-update")[0] 
}

function checkTime(i) 
{ return(i < 10) ? "0" + i : i; }

function startTime() 
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
