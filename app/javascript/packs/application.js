// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

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
let map
let initialMapData = []
let altitudePoints = []
let latlngPairs = []
let chart
let timer

let timestampLastUpdate = 0

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
    var alt = parseFloat(data.altitude)
    var lat = parseFloat(data.latitude)
    var lng = parseFloat(data.longitude)

    $("#altitude-value")[0].innerText  = alt.toFixed(2)
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
        center: [lat, lng]
    })
    
    chart.options.data[0].dataPoints.push({ y: altitudePoints.last(), x: data.timestamp})
    chart.render()

    resetTimeSinceLastUpdate()
}

function allData(data) // Fills in all data packets from /all request
{
    console.log()
    
    if (!data)
        return

    data.forEach(packet => {
        // Extract numerical data
        var alt = parseFloat(packet.altitude)
        var lat = parseFloat(packet.latitude)
        var lng = parseFloat(packet.longitude)
        
        
        // Insert into arrays
        initialMapData.push({y: alt, x: packet.timestamp})
        altitudePoints.push(alt)
        latlngPairs.push([lat, lng])
    })

    var last = data.last()

    map.jumpTo({
        center: [last.latitude, last.longitude]
    })
}

function checkDataUpdate() {
    $.ajax({
        url: "/out",
        success: newData,
    })    
}

$(document).ready(function() {
    // Get all data
    $.ajax({
        url: "/all",
        success: allData,
    }) 

    // Create map
    map = new mapboxgl.Map({
        container: 'map', // HTML container ID
        style: 'mapbox://styles/mapbox/streets-v9', // style URL
        center: [0,0], // [initialMapData.last().latitude, initialMapData.last().longitude], 
        zoom: 5
    })

    map.on('load', 
        function() {
            // Create altitude chart
            createAltChart()

            // Let the window check for an update every 5 seconds with new data
            window.setInterval(checkDataUpdate, 5000);

        }
    )

    // Set button events
    setElements()
    
    // Timer
    resetTimeSinceLastUpdate()

    // Last time update (and remove credit)
    window.setInterval(function() {updateTimeSinceLastUpdate(); removeCredit();}, 1000)
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
{
    timer.innerText = "0"
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
