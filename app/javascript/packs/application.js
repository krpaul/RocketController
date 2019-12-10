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
let initialData = []
let altitudePoints = []
let latlngPairs = []
let chart
let currMarker

let timestampLastUpdate = Infinity


function newData(data)
{
    
    if (!data // if data does not exist
        || data == undefined // or is not of the form we want
        || data.timestamp <= timestampLastUpdate // or is not new
    )
    {
        console.log('a')
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

    console.log(data.timestamp, parseFloat(data.timestamp))

    // Add pair to lines
    latlngPairs.push([lat, lng])

    // Add altitude
    altitudePoints.push(alt)

    // Update map
    map.jumpTo({
        center: latlngPairs.last(),
        zoom: 3,
    })

    // Add a line to the map
    addMapLines(latlngPairs)

    // Update Altitude Chart
    // chart.data[0].addTo("dataPoints", altitudePoints.last())
    // chart.options.data[0].dataPoints[length-1].y = altitudePoints.last()
    
    chart.options.data[0].dataPoints.push({ y: altitudePoints.last(), x: data.timestamp})
    chart.render()

    // createAltChart()
}

function checkDataUpdate() {
    $.ajax(
        {
            url: "/out",
            success: newData,
        }
    )    
}


$(document).ready(function() {
    // Create map
    map = new mapboxgl.Map({
        container: 'map', // HTML container ID
        style: 'mapbox://styles/mapbox/streets-v9', // style URL
        center: [0, 0], 
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
    // chart = new CanvasJS.Chart("altGraph", {
    //     axisX: {
    //         title: "Time"
    //     },
    //     axisY: {
    //         title: "Meters",
    //         suffix: "m"
    //     },
    //     data: [{
    //         type: "line",
    //         name: "Altitude",
    //         xValueType: "dateTime",
    //         xValueFormatString: "D/M hh:mm TT",
    //         yValueFormatString: "# ##0.##\"m\"",
    //         dataPoints: altitudePoints
    //     }]
    // });

    chart = new CanvasJS.Chart("altGraph", { 
		title: {
			text: "Altitude Over This Flight"
        },
        axisX: {
            title: "Time"
        },
        axisY: {
            title: "Meters",
            suffix: "m"
        },
		data: [
            {
                type: "line",
                // xValueType: "dateTime",
                // xValueFormatString: "D/M hh:mm TT",
                dataPoints: [
                    // { y: 10, x: 1001},
                    // { y:  4, x: 1002},
                    // { y: 18, x: 1003},
                    // { y:  8, x: 1005}	
                ]
            }
		]
	});
    chart.render();
}