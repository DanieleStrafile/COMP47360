// Global Variables

// This is needed to save the Line ID for the end of the form when the user requests a travel time estimation.
// If we can find a better solution to this issue later we will erase this global variable.
var lineId;

// To store the user's preferene of searching by Stop ID or Addresses
var pref;


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
    $("#firstForm").click(function(){
		$("#selectDirectionDiv").show(700);
		
		$("#selectRouteAndSearchPreference").hide(700);
		$("#searchMapDiv").hide(700);
    });
	
	// Toggle the Map Option after first form
    $("#selectMapSearch").click(function(){
		$("#selectRouteAndSearchPreference").hide(700);
		$("#searchMapDiv").hide(700);
		
		$("#googleMapDiv").show(1000, function() {initialize();});		
    });
	
	// Toggle the Address/Stop ID drop down menu Options after picking direction 0
    $("#direction0").click(function(){
		$("#selectDirectionDiv").hide(700);
        $("#sourceDestTimeGoDiv").slideToggle(700, function() {$( "#datepicker" ).datetimepicker();});
    });
	
	// Toggle the Address/Stop ID drop down menu Options after picking direction 1
    $("#direction1").click(function(){
		$("#selectDirectionDiv").hide(700);
        $("#sourceDestTimeGoDiv").slideToggle(700, function() {$( "#datepicker" ).datetimepicker();});
    });
	
	// 'GET' request for source and destination addresses after first form
	$('#stopIdOrAddress').ajaxForm(function() {

		// Transform form data into array of objects
		var data = $("#stopIdOrAddress :input").serializeArray();
		
		var route = String(data[0].value);
		var preference = String(data[1].value);

	    $.getJSON("http://localhost:5000/_preference/" + preference + "/" + route, function(info) {
			// Here we can get the list of Stop ID's or Addresses for the Route
			
	    });
	});
	
	// 'GET' request for Time Estimation
	$('#selectSourceDestFrom').ajaxForm(function() {

		// Transform form data into array of objects
		var data = $("#selectSourceDestFrom :input").serializeArray();
		
		var source = String(data[0].value);
		var time = String(data[1].value);
		var destination = String(data[2].value);

	    $.getJSON("http://localhost:5000/_getTravelTime/" + source + "/" + time + "/" + destination, function(info) {
			// Here we can get the list of Stop ID's or Addresses for the Route
			
	    });
	});
	
	dropDown();
	
});



//// GET list of routes for the initial drop down menu selection (launches at start up before HTML)
//$.getJSON("http://localhost:5000/_getRoutes", function(info) {
//	// Here we can get the list of JourneyPatternId's for the drop down menu
//	console.log(info);
//});



// For Google Map
function initialize() {

	var totalMarkers = 0;

	var myLatlng = new google.maps.LatLng(53.350140,-6.266155);
	var myOptions = {
		zoom: 12,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP, 
		}

	var source;
	var destination;

	map = new google.maps.Map(document.getElementById("googleMap"), myOptions);

	google.maps.event.addListener(map, 'click', function(event) {
		totalMarkers += 1;
		if (totalMarkers < 3) {
			if (totalMarkers == 1) {source = event.latLng};
			if (totalMarkers == 2) {destination = event.latLng};
			placeMarker(event.latLng, map);
		} else {alert("Source: " + source + "\nDestination: " + destination)};
	});
}

// So the user can place markers on the Map
function placeMarker(location, map) {
	var marker = new google.maps.Marker({
	position: location, 
	map: map
	});
}


function dropDown() {
	
	
	
	var jqxhr = $.getJSON($SCRIPT_ROOT + "/_getRoutes", function(data) {
		
		alert("into the function");
		console.log(data);
		
		lineids = data.lineids;
		var options = "";
		
		_.forEach(lineids, function(lineid) {
			
			options += "<option>"+ lineid.Line_ID +"</option>";
			
		})
		
		document.getElementById("form-control").innerHTML = options;
	})
	
}