require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")

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

let timestampLastUpdate = 0;

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


document.addEventListener("turbolinks:load", function() { 
    // Get all data
    $.ajax({
        url: "/all",
        success: (data) => {

            // Get all data
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
                function() {
                    // Create altitude chart
                    createAltChart()
        
                    // Let the window check for an update every hald second with new data
                    window.setInterval(checkDataUpdate, 500);
                }
            )
        
            // Set button events
            setElements()
            
            // Timer
            resetTimeSinceLastUpdate()
        
            // Last time update (and remove mapbox credit)
            window.setInterval(function() {updateTimeSinceLastUpdate(); removeCredit();}, 1000)
            
            // time display
            startTime()
        },
    }) 

    $("#create-flight").click(() => {
        let newFlight = prompt("Enter the name for a new flight")
        let confirmed = confirm("Are you sure you'd like to create a new flight");

        if (confirmed)
        {
            $.post(
                "/newFlight",
                {
                    "name": newFlight,
                }
            )
        }
    })
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
                        "coordinates": lines
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
    map.jumpTo({
        center: latlngPairs.last() || [0, 0]
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
