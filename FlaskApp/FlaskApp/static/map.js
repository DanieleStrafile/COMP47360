// For the polygon lines drawing the bus routes on Google Map
var flightPath = [];
// For the user's map markers
var markersArray = [];
// For google markers representing bus stops
var busStops = [];
// For the array which must draw the bus polyline between stops
var waypts = [];

// -------------------------------------------------------------------------------------------------- //
// FOR GOOGLE MAP INNOVATIVE FEATURE

function initialize() {

	var myLatlng = new google.maps.LatLng(53.350140, -6.266155);
	var myOptions = {
		zoom: 12,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		}

	var source;
	var destination;

	var map = new google.maps.Map(document.getElementById("googleMap"), myOptions);

    // Listener for placing markers
	google.maps.event.addListener(map, 'click', function(event) {

		if (markersArray.length == 0) {
			source = event.latLng;
			placeMarker(source, map);
		}

		else if (markersArray.length == 1) {
			destination = event.latLng;
			placeMarker(destination, map);
			getJpidBestRoute(map, source.lat(), source.lng(), destination.lat(), destination.lng());
		} else {

			// Resetting markers array
			for (var i = 0; i < markersArray.length; i++) {
				markersArray[i].setMap(null);
			}

			// Resetting bus stops array
			for (var i = 0; i < waypts.length; i++) {
				for (var j = 0; j < waypts[i].length; j++) {
					busStops[i][j].setMap(null);
				}
			}

			markersArray = [];
			waypts = [];
			busStops = [];

			try {
				for (var i = 0; i < flightPath.length; i++) {
					flightPath[i].setMap(null);
				}
			}
			catch (TypeError) {
				document.getElementById("displayRouteInNavBarForMap").innerHTML = "<h1 class='customBusHeading'>No Route Found</h1>";
			}
		}
	})
}


// So the user can place markers on the Map
function placeMarker(location, map) {
	var marker = new google.maps.Circle({
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#3131ff',
            fillOpacity: 0.35,
            map: map,
            center: location,
            radius: 1000
          });

	markersArray.push(marker);
}

//find best possible route jpid, get coords of its stops and display them
function getJpidBestRoute(map, srcLat, srcLon, destLat, destLon) {

	var jqxhr = $.getJSON( $SCRIPT_ROOT + "/best_route/" + srcLat + "/" + srcLon + "/" + destLat + "/" + destLon, function(data) {

		// For displaying the route number, or displaying an error
		var result;

			_.forEach(data, function(journeys) {
				jpid = journeys.JPID_Source;
				sourceStop = journeys.STOP_ID_Source;
				destStop = journeys.Stop_ID_Destination;
				walkingDistance = journeys.Minimum_Total_Walking;
				drawMapRoute(map);
				console.log(jpid);

			});

	});
}


function drawMapRoute(map) {

	var jqxhr2 = $.getJSON($SCRIPT_ROOT + "/gps_coords/" + jpid, function(data) {

		var tempJourneyArray = [];

		_.forEach(data, function(stop) {
			tempJourneyArray.push({"lat": stop.Latitude, "lng": stop.Longitude});
		});

		waypts.push(tempJourneyArray);

	// Define the symbol, using one of the predefined paths ('CIRCLE')
	// supplied by the Google Maps JavaScript API.
	var lineSymbol = {
	  path: google.maps.SymbolPath.CIRCLE,
	  scale: 8,
	  strokeColor: '#393'
	};

		  var tempFlightPath = new google.maps.Polyline({
		  path: waypts[waypts.length - 1],
		  geodesic: true,
		  strokeColor: '#FF0000',
		  strokeOpacity: 1.0,
		  strokeWeight: 2,
		  icons: [{
		  icon: lineSymbol,
		  offset: '100%'
			}]
		});

		// Add new flightpath to Array
		flightPath.push(tempFlightPath);
		flightPath[flightPath.length - 1].setMap(map);
		drawBusStops(waypts[waypts.length - 1], map);
		animateCircle(flightPath[flightPath.length - 1]);

	});
}


// Use the DOM setInterval() function to change the offset of the symbol
// at fixed intervals.
function animateCircle(line) {
	var count = 0;
	window.setInterval(function() {
		count = (count + 1) % 200;

		var icons = line.get('icons');
		icons[0].offset = (count / 2) + '%';
		line.set('icons', icons);
	}, 20);
}


function drawBusStops(stops, map) {

	busStops.push([]);

    for (var i = 0; i < stops.length; i++) {

    var marker = new google.maps.Circle({
			strokeColor: '#000000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#edff11',
			fillOpacity: 0.35,
			map: map,
			center: stops[i],
			radius: 50
		  });

		busStops[busStops.length - 1].push(marker);
	  }
}
