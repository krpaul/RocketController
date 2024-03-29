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
let imgtimer;
let imgtimer_interval;
let clockTimer;
let reCheckForData;
let noDataAlertTimer; 
let noDataHidden = false;
let timestampLastUpdate = 0;
let timeLastImageUpdate;
let timeLastImageInterval;
let pageType;
let updateInterval;
let dataCheck;

let redir = (loc) => {window.location.href = loc};

document.addEventListener("turbolinks:load", function() { 
    pageType = $(".active")[0].id;

    // sometimes window.intervals stick, so just remove them to be safe
    clearInterval(noDataAlertTimer)
    clearInterval(timeLastImageInterval)
    clearInterval(imgtimer_interval)

    switch (pageType) {
    case "telemetry":
        latlngPairs = []; latlngPairs_tracker = []; // these like to duplicate themselves on new page loads from old ajax callbacks, so they have to be cleared.
        initialzeGeneralTelemetry()
        
        // init imaging updating if imaging is enabled
        // lastImageTimestamp ajax request will fail if no images are in the db
        imgtimer = $("#last-update-image")[0];
        imgtimer_interval = window.setInterval(updateLastImageTimer, 1000)
        if (imagingEnabled())
        {
            lastImageTimestamp((stamp) => { 
                timeLastImageUpdate = stamp;
                updateImageEvery(UPDATE_INTERVAL_MS);
                resetLastImageTimer()
            })
        }
        else
        { 
            timeLastImageUpdate = 0
            updateImageEvery(UPDATE_INTERVAL_MS); 
            resetLastImageTimer()
        }

    case "mapPage":
        latlngPairs = []; latlngPairs_tracker = []; // these like to duplicate themselves on new page loads from old ajax callbacks, so they have to be cleared.
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
                                },
                                () => {redir("/")}
                            )
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
    queryInitalData(
        (data) => {
            if (data.length != 0) { startup(data); }
            else { // if no data availible, check for data every 5s (as long we're querying for the current flight)
                reCheckForData = window.setInterval(
                    function() {
                        queryInitalData((data) => {
                            if (data.length != 0) {
                                startup(data); 
                                clearNoData();
                            }
                        })
                    }, 
                    5000
                );

                // Set no data alerts
                noDataAlert()
            }

            // other setup
            setup()
        },
    )
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

    // Add pair to lines making sure they're not 0
    if (lat != 0 && lng != 0) { 
        latlngPairs.push([lat, lng]) 
        setGPSLockStatus(true)
    }
    else {
        setGPSLockStatus(false)
    }

    // Add altitude making sure it's not 0
    if (alt != 0) 
    { altitudePoints.push(alt) }
    
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

function setGPSLockStatus(hasLock)
{
    if (hasLock)
    {
        $("#has-lock").text("yes")
    }
    else
    {
        $("#has-lock").text("no")
    }
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
        $("#mag-x")[0].innerText = packet.mag.x
        $("#mag-y")[0].innerText = packet.mag.y
        $("#mag-z")[0].innerText = packet.mag.z
        
        // update gryo
        $("#gyro-x")[0].innerText = packet.gyro.x
        $("#gyro-y")[0].innerText = packet.gyro.y
        $("#gyro-z")[0].innerText = packet.gyro.z
    
        // transmission info
        $("#last-node")[0].innerText = packet.lastNodeName
        $("#last-rssi")[0].innerText = packet.RSSI

        // env info
        $("#temp")[0].innerText = packet.temp
        $("#pressure")[0].innerText = packet.pressure
        $("#humidity")[0].innerText = packet.humidity
    }
}

function queryInitalData(fn)
{
    $.ajax({
        url: "/all",
        data: { "flight": getFlight() },
        success: fn
    })
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
}

function lastImageTimestamp(fn)
{
    $.ajax({
        url: "/" + getFlight() + "/getLastImage/time",
        success: (d) => fn(d.time)
    }) 
}

function updateImageEvery(ms)
{
    timeLastImageInterval = window.setInterval(
        () => {
            lastImageTimestamp(
                (time) => {
                    if (time > timeLastImageUpdate) // if image is new
                    {
                        // update it
                        $.ajax({                
                            url: "/" + getFlight() + "/getLastImage",
                            success: (data) => {
                                $("#video-stream")[0].setAttribute(
                                    'src', data.base64
                                );

                                timeLastImageUpdate = time;
                                resetLastImageTimer()
                            },
                        }) 
                    }
                }
            );
        },
        ms
    );
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
    var newLines = latlngPairs.filter(x => x[0] != 0 && x[1] != 0).map(x => [x[1], x[0]])  // flip lat/lng
    
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

function imagingEnabled()
{ return $("#no-image").length == 0 }

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
    $.ajax({
        url: "/lastUpdate/" + getFlight(),
        success: (lastupdate) => {
            timer.innerText = String(lastupdate)
        }
    })
}

function updateLastImageTimer()
{ imgtimer.innerText = String(parseInt(imgtimer.innerText) + 1) }

function resetLastImageTimer()
{ imgtimer.innerText = timeLastImageUpdate != 0 ? Math.trunc(Date.now() / 1000 - timeLastImageUpdate) : "0"}

function clearNoData()
{
    $(".no-data").hide()
    clearInterval(noDataAlertTimer)
    clearInterval(reCheckForData)
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

function _goToTracker()
{
    var pair = latlngPairs_tracker.last() || [0, 0];
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
    $("#reset-zoom").click(_resetZoom);
    $("#go-to-balloon").click(_goTo);
    $("#go-to-tracker").click(_goToTracker);
    
    timer = $("#last-update")[0];
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
