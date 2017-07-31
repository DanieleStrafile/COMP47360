// Global Variables

// This is needed to save the Line ID for the end of the form when the user requests a travel time estimation.
// If we can find a better solution to this issue later we will erase this global variable.
var lineid;
// For the user's map markers
var markersArray = [];

// For google markers representing bus stops
var busStops = [];
// For the array which must draw the bus polyline between stops
var waypts = [];

// To store the user's preference of searching by Stop ID or Addresses
var pref;
var jpid;
// For the polygon lines drawing the bus routes on Google Map
var flightPath;

$(document).ready(function() {
	
	initialize();
	
	$("#selectSourceDestDiv").hide();
	$("#selectDirectionDiv").hide();
	$("#googleMapDiv").hide();
	$("#sourceDestTimeGoDiv").hide();
	
	// Return Home Button
    $("#returnHomeButton").click(function(){
        $("#selectSourceDestDiv").hide(700);
		$("#selectDirectionDiv").hide(700);
		$("#googleMapDiv").hide(700);
		$("#sourceDestTimeGoDiv").hide(700);
		document.getElementById("displayRouteInNavBarForMap").innerHTML = "";
		
		$("#selectRouteAndSearchPreference").show(700);
		$("#searchMapDiv").show(700);
    });
	
	// Return Home Button2
    $("#returnHomeButton2").click(function(){
        $("#selectSourceDestDiv").hide(700);
		$("#selectDirectionDiv").hide(700);
		$("#googleMapDiv").hide(700);
		$("#sourceDestTimeGoDiv").hide(700);		
		
		$("#selectRouteAndSearchPreference").show(700);
		$("#searchMapDiv").show(700);
    });
	
	// Toggle the direction options after first form
    $("#firstForm").click(function() {
    	
    	//show the div and work on it
		$("#selectDirectionDiv").show(700);
		
		//get line id chosen by user
		lineid = $("#form-control :selected").text();
		
		//get choice between stopid or address chosen by user
		pref = $('input[name=inlineRadioOptions]:checked').val();
		
		getFirstandLastAddress(lineid);
		
		//hide other divs
		$("#selectRouteAndSearchPreference").hide(700);
		$("#searchMapDiv").hide(700);
    });
	
	// Toggle the Map Option after first form
    $("#selectMapSearch").click(function(){
		$("#selectRouteAndSearchPreference").hide(700);
		$("#selectDirectionDiv").hide(700);
		$("#sourceDestTimeGoDiv").hide(700);
		$("#googleMapDiv").show(1000, function() {initialize();});		
    });
	
	// Toggle the Address/Stop ID drop down menu Options after picking direction 0
    $("#direction0").click(function() {
    	
		$("#selectDirectionDiv").hide(700);
        $("#sourceDestTimeGoDiv").slideToggle(700, function() {$( "#datepicker" ).datetimepicker();});
        
        getSourceDestination($(this).val(),0,pref);
        
        //set jpid here
        jpid = $(this).val() + "";
        
        console.log("jpid is " + jpid);
        
    });
	
	// Toggle the Address/Stop ID drop down menu Options after picking direction 1
    $("#direction1").click(function(){
    	
		$("#selectDirectionDiv").hide(700);
        $("#sourceDestTimeGoDiv").slideToggle(700, function() {$( "#datepicker" ).datetimepicker();});
        
        getSourceDestination($(this).val(),1,pref);
        
        //set jpid here
        jpid = $(this).val() + "";
        
        console.log("jpid is " + jpid);
        
    });
	
    
    
	// 'GET' request for source and destination addresses after first form
	$('#stopIdOrAddress').ajaxForm(function() {
		// Do nothing
	});
	
	// 'GET' request for Time Estimation
	$('#selectSourceDestFrom').ajaxForm(function() {

		var source;
		var destination;
		
		if (pref == "address") {
		
			source = $('#form-control2 :selected').val();
			destination = $('#form-control3 :selected').val();
			
		}
		
		else {
			
			source = $('#form-control2 :selected').text();
			destination = $('#form-control3 :selected').text();
			
		}
		
		var dateTime = $('#datepicker').datepicker('getDate');
		
		getTravelTime(lineid, jpid,source,destination,dateTime);
		
	});
	
	dropDown();
});


//------------------------------------------------------------------------------------------------------------- //
// POPULATE MENUS ON APPLICATION

// Function to populate the line id dropdown menu on front page
function dropDown() {
	
	var jqxhr = $.getJSON($SCRIPT_ROOT + "/_getRoutes", function(data) {
		
		lineids = data.lineids;
		var options = "";
		
		_.forEach(lineids, function(lineid) {
			
			options += "<option>"+ lineid.Line_ID +"</option>";
			
		})
		
		$("#form-control").html(options);
	})	
}


// Populate the start and destination in second page with some addresses, i.e. from A to B and from B to A
function getFirstandLastAddress(lineid) {
	
	var jqxhr = $.getJSON($SCRIPT_ROOT + "/_getStartEndAddresses/" + lineid, function(data) {
		
		var direction0 = $('#direction0');
		var direction1 = $('#direction1');
		
		
		//populating directions
		direction0.html("<span class='glyphicon glyphicon-circle-arrow-right'></span>" + ' From ' + data[0].Short_Address_Source + ' To ' + data[0].Short_Address_Destination);
		direction1.html("<span class='glyphicon glyphicon-circle-arrow-left'></span>" + ' From ' + data[1].Short_Address_Source + ' To ' + data[1].Short_Address_Destination);
		
		//setting direction's value for later query in function getSourceDestination
		direction0.val(data[0].Journey_Pattern_ID + "");
		direction1.val(data[1].Journey_Pattern_ID + "");
	})
}

// Get the first and last addresses for the direction menu
function getSourceDestination(jpid,direction,pref) {
		
	var jqxhr2 = $.getJSON($SCRIPT_ROOT + "/_preference/" + pref + "/" + jpid, function(data2) {
			
		var options = "";
			
		_.forEach(data2, function(stop) {
				
			options += '<option value = "' + stop.Stop_ID + '">' +  stop.Stop_info + "</option>";	
		})
		//set html content of form
		$("#form-control2").html(options);
		$("#form-control3").html(options);	
	})
}


// --------------------------------------------------------------------------------------------------------------- //
// FOR DISPLAYING THE MODEL'S PREDICTIONS

// Display in a small box when the bus will arrive (timetable) and how long it will take to arrive to destination from source
function getTravelTime(lineid, jpid, source, destination, dateTime) {
	
    $.getJSON( $SCRIPT_ROOT + "/_getTravelTime/" + jpid + "/" + source + "/" + destination + "/" + dateTime, function(info) {
    	
		//seconds it takes for bus to travel from terminus to source chosen by user
		var timeFromTerminusToSource = info[1];
    	
    	//seconds it takes for bus to travel from source to destination chosen by user
		var timeFromSourceToDest = info[0] - info[1];

		if (isNumeric(info[0]) && isNumeric(info[1])) {
		
			//make jpid in the following form "0013000%" so that we can use the LIKE operator in mysql
			var jpidTruncated = String(jpid);
			jpidTruncated = (jpidTruncated.slice(0,-1)) + "%";
			
			//get label "Mon-Fr" or "Sat" or "Sun" from datetime
			var timeCat = convertDateTimetoTimeCat(dateTime);
			
			//display travel time
			getTravelTimewithTimetable(lineid, jpidTruncated, source, destination, dateTime.getHours(), dateTime.getMinutes(),
					dateTime.getSeconds(), timeFromTerminusToSource, timeCat, timeFromSourceToDest );
			
			//display pricing
			//jpid.charAt(4) is the direction already encoded within jpid
			
			console.log(jpid); 
			console.log(source); 
			console.log(destination); 
			console.log(jpid.charAt(4)); 
			
			getPricing(jpid, source, destination, jpid.charAt(4));
			
		} else {
			
			$("#travelTimeDiv").html("Bus does not run on this day");
		}
	});
}


// Give the time it will take for the bus to arrive at the user's location
function getTravelTimewithTimetable(lineid, jpidTruncated, srcStop, destStop, hour, minute, sec, sourceTime, timeCat, timeFromSourceToDest ) {
	
	$.getJSON( $SCRIPT_ROOT + "/get_bus_time/"  + jpidTruncated + "/" + srcStop + "/" + destStop + "/" + hour + "/" + minute + "/" 
			+ sec + "/" + sourceTime + "/" + timeCat, function(data) {
		
		var currentTime = new Date().toLocaleTimeString('en-GB', { hour: "numeric", minute: "numeric"});
		var timeBusArrives = data[0].Time_bus_arrives;
		
		var timeToArriveInMins = getTimeToArrive(timeBusArrives, currentTime);
		var timeFromSourceToDestInMins = parseInt(timeFromSourceToDest/60);
		
		$("#travelTimeDiv").html("The " + lineid +  "  will arrive at " + timeBusArrives + ".<BR>" + 
				"<BR>Your Travel time will be " + timeFromSourceToDestInMins + "Mins <BR><BR>");
	});
}

function getPricing(jpid, stop1, stop2, direction) {
	
	info = ["Adult Cash", "Adult Leap", "Child Cash (Under 16)", "Child Leap (Under 19)", "School Hours Cash", "School Hours Leap"]
	
	$.getJSON( $SCRIPT_ROOT + "/getPricing/" + jpid + "/" + stop1 + "/" + stop2 + "/" + direction, function(data) {
		
		console.log(data);
		
		options = "Prices : <BR>";
		
		_.each(data, function(value, key) {
			
			options += value + " : " + key + "<BR>";
			
		});
		
		$("#travelPriceDiv").html(options);
	});
}
	
	
function getTimeToArrive(arrival, current) {
	// This won't work if a bus goes past midnight --> Something to fix
	
	arrival = arrival.slice(0,5);
	var arrivalHour = parseInt(arrival.slice(0,2));
	var arrivalMin = parseInt(arrival.slice(3, 5));
	var currentHour = parseInt(current.slice(0,2));
	var currentMin = parseInt(current.slice(3,5));
	
	var hour = arrivalHour - currentHour;
	var min = arrivalMin - currentMin;
	
	return (hour + min).toString();
	
}


// Convert the JavaScript day into our model's options
function convertDateTimetoTimeCat(dateTime) {
	
	var day = dateTime.getDay();
	
	if (day == 0)
		return "Sun";
	else if (day >= 1 && day <= 5)
		return "Mon-Fr";
	else
		return "Sat";
}

//function that return true if n is a number (float or integer), false otherwise
function isNumeric(val) {
    return Number(parseFloat(val))==val;
}


// -------------------------------------------------------------------------------------------------- //
// FOR GOOGLE MAP INNOVATIVE FEATURE

function initialize() {

    // Only needed for road directions functionality (maybe add back later if we can figure out a way to use it)
	//  var directionsService = new google.maps.DirectionsService;
	//	var directionsDisplay = new google.maps.DirectionsRenderer;
	
	var myLatlng = new google.maps.LatLng(53.350140,-6.266155);
	var myOptions = {
		zoom: 12,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP, 
		}

	var source;
	var destination;

	var map = new google.maps.Map(document.getElementById("googleMap"), myOptions);

//  This is needed for the road mapping if we use it later
//	directionsDisplay.setMap(map);

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
						
			//resetting markers array			
			for (var i = 0; i < markersArray.length; i++) {
				markersArray[i].setMap(null);
			}
						
			//resetting bus stops array			
			for (var i = 0; i < waypts.length; i++) {
				busStops[i].setMap(null);
			}
			
			markersArray = [];
			waypts = [];
			busStops = [];
			flightPath.setMap(null);
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
		
		try {
			jpid = data[0].JPID_Source;
			result = jpid;
			drawMapRoute(map);
		}
		catch(TypeError){
			result = "No Route Found";
		}
		finally {
			document.getElementById("displayRouteInNavBarForMap").innerHTML = "<h1 class='customBusHeading'>" + result + "</h1>";
		}
	});
}


function drawMapRoute(map) {
	
	var jqxhr2 = $.getJSON($SCRIPT_ROOT + "/gps_coords/" + jpid, function(data2) {

		_.forEach(data2, function(stop) {
			waypts.push({"lat": stop.Latitude, "lng": stop.Longitude});
		});

		// Define the symbol, using one of the predefined paths ('CIRCLE')
	// supplied by the Google Maps JavaScript API.
	var lineSymbol = {
	  path: google.maps.SymbolPath.CIRCLE,
	  scale: 8,
	  strokeColor: '#393'
	};

		  flightPath = new google.maps.Polyline({
		  path: waypts,
		  geodesic: true,
		  strokeColor: '#FF0000',
		  strokeOpacity: 1.0,
		  strokeWeight: 2,
		  icons: [{
		  icon: lineSymbol,
		  offset: '100%'
			}]
		});

		flightPath.setMap(map);
		drawBusStops(waypts, map);
		animateCircle(flightPath);

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


function drawBusStops(waypts, map) {

    for (var i = 0; i < waypts.length; i++) {

    var marker = new google.maps.Circle({
			strokeColor: '#000000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#edff11',
			fillOpacity: 0.35,
			map: map,
			center: waypts[i],
			radius: 50
		  });
		
		busStops.push(marker);
	  }
}


// -------------------------------------------------------------------------------------------------------------- //
// PRESERVE IN CASE WE WANT TO TRY ROAD MAPPINGS AGAIN

////find best possible route jpid, get coords of its stops and display them
//function getJpidBestRoute(map, srcLat, srcLon, destLat, destLon, directionsService, directionsDisplay) {
//
//	var jqxhr = $.getJSON( $SCRIPT_ROOT + "/best_route/" + srcLat + "/" + srcLon + "/" + destLat + "/" + destLon, function(data) {
//
//		jpid = data[0].JPID_Source;
//
//		var jqxhr2 = $.getJSON($SCRIPT_ROOT + "/gps_coords/" + jpid, function(data2) {
//
//            var waypts = [];
//
//			_.forEach(data2, function(stop) {
//
//                var wayPoint = new google.maps.LatLng(stop.Latitude, stop.Longitude);
//
//                waypts.push({
//                    location: wayPoint,
//                    stopover: true
//                });
//            });
//
//            	var srcb = new google.maps.LatLng(data2[0].Latitude, data2[0].Longitude);
//                var dest = new google.maps.LatLng(data2[waypts.length - 1].Latitude, data2[waypts.length - 1].Longitude);
//
//                directionsService.route({
//                origin: srcb,
//                destination: dest,
//                waypoints: waypts,
//                provideRouteAlternatives :false,
//                travelMode: 'DRIVING'
//              }, function(response, status) {
//                if (status === 'OK') {
//                  directionsDisplay.setDirections(response);
//                }
//              });
//			alert("Journey Pattern ID " + jpid);
//		});
//	});
//}
