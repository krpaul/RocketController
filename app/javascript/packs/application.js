import { pluginService } from "chart.js"

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

// Global vars
let map;
let initialMapData = [];
let altitudePoints = [];
let latlngPairs = [];
let chart;
let timer;
let clockTimer;
let reCheckForData;
let mode;
let noDataAlertTimer; 
let noDataHidden = false;
let timestampLastUpdate = 0;
let pageType;

function newData(data)
{
    if (!data // if data does not exist
        || data == undefined // or is not of the form we want
        || data.timestamp <= timestampLastUpdate // or is not new
    )
    {
        return // Don't do anything
    }

    /* Otherwise ... */

    // Update latest time
    timestampLastUpdate = data.timestamp

    // Update numerical data
    var alt = parseFloat(data.alt)
    var lat = parseFloat(data.lat)
    var lng = parseFloat(data.lng)

    $("#altitude-value")[0].innerText  = alt.toFixed(1)
    $("#latitude-value")[0].innerText  = lat.toFixed(2)
    $("#longitude-value")[0].innerText = lng.toFixed(2)

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
    chart.options.data[0].dataPoints.push({ y: altitudePoints.last(), x: data.timestamp})
    chart.render()

    updateGeneralTelemetry(data)

    // reset timer
    resetTimeSinceLastUpdate()
}

function newOtherData(data)
{
    if (!data // if data does not exist
        || data == undefined // or is not of the form we want
        || data.timestamp <= timestampLastUpdate // or is not new
        )
    {
        return // Don't do anything
    }
    
    console.log(data.acceleration)
    /* Otherwise ... */

    // Update latest time
    timestampLastUpdate = data.timestamp;
    var stamp = data["tstamp-formatted"];


    // var acceleration = [
    //     {"name": "X", "data": [stamp, data.accelerationX], "color": "#f00"},
    //     {"name": "Y", "data": [stamp, data.accelerationY], "color": "#06f"},
    //     {"name": "Z", "data": [stamp, data.accelerationZ], "color": "#0f0"}
    // ]

    // var gyro = [
    //     {"name": "X", "data": [stamp, data.gyroX], "color": "#f00"},
    //     {"name": "Y", "data": [stamp, data.gyroX], "color": "#06f"},
    //     {"name": "Z", "data": [stamp, data.gyroX], "color": "#0f0"}
    // ]

    // var orientation = [
    //     {"name": "X", "data": [stamp, data.orientationX], "color": "#f00"},
    //     {"name": "Y", "data": [stamp, data.orientationX], "color": "#06f"},
    //     {"name": "Z", "data": [stamp, data.orientationX], "color": "#0f0"}
    // ]

    // console.log(acceleration)

    var rssi = (stamp, data.RSSI)

    Chartkick.charts["accel"].updateData({
        "X": [stamp, data.acceleration.x],
        "Y": [stamp, data.acceleration.y],
        "Z": [stamp, data.acceleration.z]
    });
    // Chartkick.charts["accel"].redraw();
}

function updateGeneralTelemetry(packet)
{
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
        initialMapData.push({y: alt, x: packet.timestamp})
        altitudePoints.push(alt)
        latlngPairs.push([lat, lng])
    })

    // fill in gen. telemetry with latest packet
    updateGeneralTelemetry(data.last())
}

function checkDataUpdate() {
    $.ajax({
        url: "/out",
        success: newData,
    })    
}

function checkOtherDataUpdate() {
    $.ajax({
        url: "/out",
        success: newOtherData,
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
            // Create altitude chart
            createAltChart()

            // Let the window check for an update every half second with new data
            window.setInterval(checkDataUpdate, 500);

            map.loadImage(
                'https://cdn1.iconfinder.com/data/icons/transports-5/66/56-512.png',
                function(error, image) {
                    if (error) throw error;
                    map.addImage('bln', image);
                }   
            );
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

    // Last time update (and remove mapbox credit)
    window.setInterval(function() {updateTimeSinceLastUpdate(); removeCredit();}, 1000)

    // time display
    startTime()
}

document.addEventListener("turbolinks:load", function() { 
    let pageType= $(".active")[0].id;
    switch (pageType) {

    case "telemetry":
        // Get all data
        $.ajax({
            url: "/all",
            success: (data) => {
                if (data.length != 0) {startup(data);}
                else { // if no data availible, check for data every 5s
                    reCheckForData = window.setInterval(
                        () => {
                            $.ajax({
                                url: "/all",
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
                window.setInterval(function() {updateTimeSinceLastUpdate()}, 1000)
            },
        }) 
    case "other":
        setup()
        window.setInterval(checkOtherDataUpdate, 500);
    case "config":
        $("#create-flight").click(() => {
            var flight = ""
            
            while (flight == "")
            flight = prompt("Enter the name for a new flight")
            
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
        })
    }   
})
        
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
    console.log(newLines)
    
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
            
function createAltChart() 
{
    chart = new CanvasJS.Chart("altGraph", { 
        axisX: {
            title: "Time",
            labelFormatter: formatUnixTime
        },
        axisY: {
            title: "Meters",
            suffix: "m"
        },
        toolTip: {
            contentFormatter: toolTipFormatter
        },
		data: [{
            type: "line",
            dataPoints: initialMapData
        }],
    });
    
    chart.render();
}

function formatUnixTime(args, mode=0) 
/*
mode=0 -> HH:MM
mode=1 -> MM:SS
*/
{
    if (!args) return
    
    // If given as part of an object, or as just the value
    var value = args.value || args
    
    var date = new Date(value * 1000)
    
    switch (mode)
    {
        default: 
        case 0: 
        return `${date.getHours()}h ${date.getMinutes()}m`
        case 1:
            return `${date.getMinutes()}m ${date.getSeconds()}s`
        }
}

function toolTipFormatter(e)
{
    var content = "";
    for (var i = 0; i < e.entries.length; i++) {
        
        // Create html for this tooltip entry
        var current = 
        `<strong>
        ${formatUnixTime(e.entries[i].dataPoint.x, mode=1)}
        </strong>, 
        ${e.entries[i].dataPoint.y}m`
        
        // Append to overarching string
        content += current + "<br />"
    }
    return content
}

function updateTimeSinceLastUpdate()
{
    timer.innerText = String(parseInt(timer.innerText) + 1)
}

function resetTimeSinceLastUpdate()
{ timer.innerText = "0" }

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

function clearNoData()
{
    $(".no-data").hide()
    clearInterval(noDataAlertTimer)
}
