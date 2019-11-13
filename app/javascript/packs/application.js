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

Date.prototype.addHours = function(h){
    this.setHours(this.getHours()+h);
    return this;
}

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

function createAltChart() 
{
    chart = new CanvasJS.Chart("altGraph", {
        axisX: {
            title: "Time"
        },
        axisY: {
            title: "Meters",
            suffix: "m"
        },
        data: [{
            type: "line",
            name: "Altitude",
            xValueType: "dateTime",
            xValueFormatString: "D/M hh:mm TT",
            yValueFormatString: "# ##0.##\"m\"",
            dataPoints: altitudePoints
        }]
    });
    chart.render();
}

function updateInfo(data, jqXHR, textStatus)
{
    if (data == undefined) return

    $("#lat")[0].innerText = data.latitude
    $("#lng")[0].innerText = data.longitude
    $("#alt")[0].innerText =  data.altitude
    $("#rssi")[0].innerText = data.last_rssi
    $("#snr")[0].innerText =  data.last_snr
    $("#heading")[0].innerText =  data.heading

    var llPair = [data.latitude, data.longitude]
    latlngPairs.push(llPair)

    map.jumpTo(
        {center: llPair, zoom: 5}
    )
    addMapLines()

    if (currMarker) currMarker.remove()
    currMarker = new mapboxgl.Marker()
    .setLngLat(llPair)
    .addTo(map);
    
    var t = new Date().getTime() / 1000;
    altitudePoints.push({x: new Date(data.db_time * 1000), y: parseInt(data.altitude)})
    
    createAltChart()
}

function checkDataUpdate() {
    $.ajax({
        type: "GET", 
        url: "/telemetry",
        success: updateInfo,
        error: function(jqXHR, textStatus, errorThrown) {}
    })
}

function addMapLines()
{
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
                        "coordinates": latlngPairs
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

function initPage(data, a, b)
{
    initialData = data
    if (data.length == 0) return

    // Only creating arrays to track things that are graphed over time
    for (const stream of initialData)
    {
        altitudePoints.push(
            {x: new Date(stream.db_time * 1000), y: parseInt(stream.altitude)}
        )
            
        latlngPairs.push([stream.latitude, stream.longitude])
    }
        
    
    map = new mapboxgl.Map({
        container: 'map', // HTML container ID
        style: 'mapbox://styles/mapbox/streets-v9', // style URL
        center: latlngPairs.last(), // starting position as [lng, lat]
        zoom: 4
    });

    map.on('load', 
        function() {
            // Add lines
            addMapLines()

            // Fill all data
            updateInfo(initialData.last())
            
            // Create altitude chart
            createAltChart()

            // Look for updates
            window.setInterval(checkDataUpdate, 2000);
        }
    )

}

$(document).ready(
    function()
    {
        while (initialData.length == 0)
            // Get all data points
            $.ajax({
                type: "GET", 
                url: "/telemetry/all",
                success: initPage,
                error: function(jqXHR, textStatus, errorThrown) {},
                async: false
            })
    }
);
