// Global Variables

// This is needed to save the Line ID for the end of the form when the user requests a travel time estimation.
// If we can find a better solution to this issue later we will erase this global variable.
var lineid;
var markersArray = [];

// To store the user's preference of searching by Stop ID or Addresses
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
		$("#searchMapDiv").hide(700);
		
		$("#googleMapDiv").show(1000, function() {initialize();});		
    });
	
	// Toggle the Address/Stop ID drop down menu Options after picking direction 0
    $("#direction0").click(function() {
    	
        getSourceDestination(lineid,0,pref);
    	
		$("#selectDirectionDiv").hide(700);
        $("#sourceDestTimeGoDiv").slideToggle(700, function() {$( "#datepicker" ).datetimepicker();});
        
        
        
    });
	
	// Toggle the Address/Stop ID drop down menu Options after picking direction 1
    $("#direction1").click(function(){
    	
        getSourceDestination(lineid,1,pref);
    	
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
		
		if (markersArray.length == 0) {
			
			source = event.latLng;
			placeMarker(source, map);
		}
		
		else if (markersArray.length == 1) {
			
			destination = event.latLng;
			placeMarker(destination, map);
			getJpidBestRoute(map, source.lat(), source.lng(), destination.lat(), destination.lng());
			
			alert("Source: " + source + "\nDestination: " + destination);
		}
			
		else {
			
			//resetting markers array
			var arrayLength = markersArray.length;
			
			for (var i = 0; i < arrayLength; i++) {
			    
				markersArray[i].setMap(null);
				
			}

			markersArray = [];
			
		}
	})
}

// So the user can place markers on the Map
function placeMarker(location, map) {
	var marker = new google.maps.Marker({
	position: location, 
	map: map
	});
	
	//put marker into markers array
	markersArray.push(marker);
}


//function to populate the line id dropdown menu on front page
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


//populate the start and destination in second page with some addresses, i.e. from A to B and from B to A
function getFirstandLastAddress(lineid) {
	
	var jqxhr = $.getJSON($SCRIPT_ROOT + "/_getStartEndAddresses/" + lineid, function(data) {
		
		$('#direction0').html('From ' + data[0].Source_Stop_ID + ' To ' + data[0].Destination_Stop_ID);
		$('#direction1').html('From ' + data[1].Source_Stop_ID + ' To ' + data[1].Destination_Stop_ID);
	})
}


function getSourceDestination(lineid,direction,pref) {
	
	var jqxhr = $.getJSON($SCRIPT_ROOT + "/_getStartEndAddresses/" + lineid, function(data) {
		
		var jpid = data[direction].Journey_Pattern_ID;
		
		var jqxhr2 = $.getJSON($SCRIPT_ROOT + "/_preference/" + pref + "/" + jpid, function(data2) {
			
			var options = "";
			
			_.forEach(data2, function(stop) {
				
				options += "<option>"+ stop.Stop_info +"</option>";
				
			})
			
			$("#form-control2").html(options);
			$("#form-control3").html(options);
			
		})
		
	})
	
}

//find best possible route jpid, get coords of its stops and display them
function getJpidBestRoute(map, srcLat,srcLon,destLat,destLon) {

	var jqxhr = $.getJSON($SCRIPT_ROOT + "/best_route/" + srcLat + "/" + srcLon + "/" + destLat + "/" + destLon, function(data) {
		
		var jpid = data[0].JPID_Source;
		
		var jqxhr2 = $.getJSON($SCRIPT_ROOT + "/gps_coords/" + jpid, function(data2) {
			
			_.forEach(data2, function(stop) {
				
				placeMarker({lat: stop.Latitude, lng: stop.Longitude},map);
				
			})
			
			alert("Journey Pattern ID " + jpid);
			
		})
		
	})
	
}





