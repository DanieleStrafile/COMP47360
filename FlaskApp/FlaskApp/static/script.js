// This is needed to save the Line ID for the end of the form when the user requests a travel time estimation.
var lineid;
// To store the user's preference of searching by Stop ID or Addresses
var pref;
// Journey Pattern ID
var jpid;


$(document).ready(function() {
	
	// Populate Line ID Dropdown menu
	dropDown();
		
	// Hide all items not needed on startup
	$("#selectSourceDestDiv").hide();
	$("#selectDirectionDiv").hide();
	$("#googleMapDiv").hide();
	$("#sourceDestTimeGoDiv").hide();
	$("#timetableDiv").hide();
	$("#mapSearchPreferenceDiv").hide();
	
	// Return Home Button
    $("#returnHomeButton").click(function(){
        $("#selectSourceDestDiv").hide(700);
		$("#selectDirectionDiv").hide(700);
		$("#googleMapDiv").hide(700);
		$("#sourceDestTimeGoDiv").hide(700);
		$("#loader").removeClass("loader");
		$("#mapSearchPreferenceDiv").hide();
	    $("#timetableDiv").hide(700);
		$("#selectRouteAndSearchPreference").show(700);
		clearBusTimeaAndPrediction();
    });
	
    //         Timetable Button
    $("#showTimetables").click(function(){
       	$("#selectRouteAndSearchPreference").hide(700);
        $("#selectSourceDestDiv").hide(700);
		$("#selectDirectionDiv").hide(700);
		$("#googleMapDiv").hide(700);
		$("#sourceDestTimeGoDiv").hide(700);
		$("#timetableDiv").show(700, function(){dropDownTimetable();});
    });
	
	// Search By Map Button
    $("#selectMapSearch").click(function(){
        $("#selectSourceDestDiv").hide(700);
		$("#selectDirectionDiv").hide(700);
		$("#googleMapDiv").hide(700);
		$("#sourceDestTimeGoDiv").hide(700);
		$("#loader").removeClass("loader");
		$("#selectRouteAndSearchPreference").hide(700);
	    $("#timetableDiv").hide(700);
		// Show wanted div for search options
		$("#mapSearchPreferenceDiv").show(700);
    });
	
		$("#searchByFare").click(function(){
		$("#selectRouteAndSearchPreference").hide(700);
		$("#selectDirectionDiv").hide(700);
		$("#sourceDestTimeGoDiv").hide(700);
		$("#mapSearchPreferenceDiv").hide(700);
		searchPreference = "searchByFare"
		$("#googleMapDiv").show(700, function() {initialize();});
    });
	
	$("#searchByWalkingDistance").click(function(){
		$("#selectRouteAndSearchPreference").hide(700);
		$("#selectDirectionDiv").hide(700);
		$("#sourceDestTimeGoDiv").hide(700);
		$("#mapSearchPreferenceDiv").hide(700);
		searchPreference = "searchByWalkingDistance"
		$("#googleMapDiv").show(700, function() {initialize();});
    });
	
	$("#searchByArrivalTime").click(function(){
		$("#selectRouteAndSearchPreference").hide(700);
		$("#selectDirectionDiv").hide(700);
		$("#sourceDestTimeGoDiv").hide(700);
		$("#mapSearchPreferenceDiv").hide(700);
		searchPreference = "searchByArrivalTime"
		$("#googleMapDiv").show(700, function() {initialize();});
    });

	// Toggle the direction options after first form
    $("#firstForm").click(function() {

		//show the div and work on it
		$("#selectDirectionDiv").show(700);
		//get line id chosen by user
		lineid = $("#form-control :selected").text();
		//get choice between stopid or address chosen by user
		pref = $('input[name=inlineRadioOptions]:checked').val();
		getFirstandLastAddress();
		//hide other divs
		$("#selectRouteAndSearchPreference").hide(700);
    });

	// Toggle the Map Option after first form
    $("#selectMapSearch").click(function(){
		
		$("#searchByFare").show(700);
		$("#searchByWalkingDistance").show(700);
		$("#searchByArrivalTime").show(700);
    });

	// Toggle the Address/Stop ID drop down menu Options after picking direction 0
    $("#direction0").click(function() {

		$("#selectDirectionDiv").hide(700);
        $("#sourceDestTimeGoDiv").slideToggle(700, function() {$( "#datepicker" ).datetimepicker();});
        getSourceDestination($(this).val(),0,pref);
        //set jpid here
        jpid = $(this).val() + "";

    });

	// Toggle the Address/Stop ID drop down menu Options after picking direction 1
    $("#direction1").click(function(){

		$("#selectDirectionDiv").hide(700);
        $("#sourceDestTimeGoDiv").slideToggle(700, function() {$( "#datepicker" ).datetimepicker();});
        getSourceDestination($(this).val(),1,pref);
        //set jpid here
        jpid = $(this).val() + "";

    });
	
	// 'GET' request for Time Estimation
	$('#selectSourceDestFrom').ajaxForm(function() {
		// Reset
		$("#loader").removeClass("loader");
		document.getElementById("travelTimeDiv").innerHTML = "";
		document.getElementById("travelPriceDiv").innerHTML = "";
		$("#loader").addClass("loader");
		
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
		getTravelTime(source, destination, dateTime);

	});

	// 'GET' request for source and destination addresses after first form
	$('#stopIdOrAddress').ajaxForm(function() {
		// This is just to disable the form's usual function
	});
	
// 'GET' request for source and destination addresses after first form
	$('#PickRouteTimetable').ajaxForm(function() {

		// Transfrom data into array of objects
         var data = $("#PickRouteTimetable :input").serializeArray();

         var jqxhr = $.getJSON($SCRIPT_ROOT + "/_getSelectedTimetable/" + data[0].value, function(timetables) {

         console.log(timetables);
         //just for testing

         var option1 = "<table><tr><th>Monday to Friday</th></tr>";


         _.forEach(timetables, function(stop) {

            if (stop.Day_Cat == "Mon-Fr"){

            option1 += "<tr>" + "<td>" + stop.Time_no_date + "</td>" + "</tr>";

            }

		})

		var option2 = "<table><tr><th>Saturday</th></tr>";

		_.forEach(timetables, function(stop) {

            if (stop.Day_Cat == "Sat"){

            option2 += "<tr>" + "<td>" + stop.Time_no_date + "</td>" + "</tr>" ;

            }

		})


        var option3 = "<table><tr><th>Sunday</th></tr>";

		_.forEach(timetables, function(stop) {

            if (stop.Day_Cat == "Sun"){

            option3 += "<tr>" + "<td>" + stop.Time_no_date + "</td>" + "</tr>" ;

            }

		})

		//set html content of form
		$("#selectedTimetable1Div").html(option1 + '</table>');
		$("#selectedTimetable2Div").html(option2 + '</table>');
		$("#selectedTimetable3Div").html(option3 + '</table>');
    	});
	
	});

});
//------------------------------------------------------------------------------------------------------------- //
// POPULATE MENUS ON APPLICATION

// Function to populate the line id dropdown menu on front page
function dropDown() {

	var jqxhr = $.getJSON($SCRIPT_ROOT + "/_getRoutes", function(data) {

		lineids = data.lineids;
		var options = "";

		_.forEach(lineids, function(data) {

			options += "<option>"+ data.Line_ID +"</option>";
		})
		$("#form-control").html(options);
	})
}

// Function to popilate the line id dropdown menu on the timetable page
function dropDownTimetable() {

// 'GET' request for timetable routes
    var jqxhr = $.getJSON($SCRIPT_ROOT + "/_getRoutes", function(data) {
    lineids = data.lineids;
    var options = "";

    _.forEach(lineids, function(lineid) {

        options += "<option>"+ lineid.Line_ID +"</option>";

    })
    $("#form-controltimetable").html(options);
	})
	;
}


// Populate the start and destination in second page with some addresses, i.e. from A to B and from B to A
function getFirstandLastAddress() {

	var jqxhr = $.getJSON($SCRIPT_ROOT + "/_getStartEndAddresses/" + lineid, function(data) {

		var direction0 = $('#direction0');
		var direction1 = $('#direction1');
		
		console.log("data length is " + data.length);
		
		//in case there is only one direction 
		if (data.length == 1) {
			
			//hide div direction1
			direction1.hide();
			
			direction0.html("<span class='glyphicon glyphicon-circle-arrow-right'></span>" + ' From ' + data[0].Short_Address_Source + ' To ' + data[0].Short_Address_Destination);
			direction0.val(data[0].Journey_Pattern_ID + "");	
		}
		
		else {
			
			//show div direction1
			direction1.show();
			
			//populating directions
			direction0.html("<span class='glyphicon glyphicon-circle-arrow-right'></span>" + ' From ' + data[0].Short_Address_Source + ' To ' + data[0].Short_Address_Destination);
			direction1.html("<span class='glyphicon glyphicon-circle-arrow-left'></span>" + ' From ' + data[1].Short_Address_Source + ' To ' + data[1].Short_Address_Destination);
			
			//setting direction's value for later query in function getSourceDestination
			direction0.val(data[0].Journey_Pattern_ID + "");
			direction1.val(data[1].Journey_Pattern_ID + "");
			
		}

	})
}

// Get the first and last addresses for the direction menu
function getSourceDestination(jpid,direction,pref) {

	var jqxhr2 = $.getJSON($SCRIPT_ROOT + "/_preference/" + pref + "/" + jpid, function(data) {

		var options = "";

		_.forEach(data, function(stop) {

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
function getTravelTime(source, destination, dateTime) {

	$.ajax({
	  dataType: "json",
	  url: $SCRIPT_ROOT + "/_getTravelTime/" + jpid + "/" + source + "/" + destination + "/" + dateTime,
	  async: true, 
	  success: function(info) {

		  //seconds it takes for bus to travel from terminus to source chosen by user
			var timeFromTerminusToSource = info[1];

			//seconds it takes for bus to travel from source to destination chosen by user
			var timeFromSourceToDest = info[0] - info[1];

			if (isNumeric(info[0]) && isNumeric(info[1])) {

				//make jpid in the following form "0013000%" so that we can use the LIKE operator in mysql
				var jpidTruncated = String(jpid);
				jpidTruncated = (jpidTruncated.slice(0,-1)) + "%";
				//we dont need 25 in %25 but apache decodes %25 as % and % gives a 400 error so we have to go for this solution
				jpidTruncated = (jpidTruncated.slice(0,-1)) + "%25";

				//get label "Mon-Fr" or "Sat" or "Sun" from datetime
				var timeCat = convertDateTimetoTimeCat(dateTime);

				//display travel time
				getTravelTimeWithTimetable(jpidTruncated, source, destination, dateTime.getHours(), dateTime.getMinutes(),
						dateTime.getSeconds(), timeFromTerminusToSource, timeCat, timeFromSourceToDest);

				//display pricing
				//jpid.charAt(4) is the direction already encoded within jpid

				getPricing(jpid, source, destination, jpid.charAt(4));

			} else {

				$("#travelTimeDiv").html("Bus does not run on this day");

			}
	  }
	});
}


// Give the time it will take for the bus to arrive at the user's location
function getTravelTimeWithTimetable(jpidTruncated, srcStop, destStop, hour, minute, sec, sourceTime, timeCat, timeFromSourceToDest) {
	
	$.ajax({
	  dataType: "json",
	  url: $SCRIPT_ROOT + "/get_bus_time/"  + jpidTruncated + "/" + srcStop + "/" + destStop + "/" + hour + "/" + minute + "/"
			+ sec + "/" + sourceTime + "/" + timeCat,
	  async: true, 
	  success: function(data) {
		
		var currentTime = new Date().toLocaleTimeString('en-GB', { hour: "numeric", minute: "numeric"});
		var timeBusArrives = data[0].Time_bus_arrives;

		var timeToArriveInMins = getTimeToArrive(timeBusArrives, currentTime);
		var timeFromSourceToDestInMins = parseInt(timeFromSourceToDest/60);

		$("#travelTimeDiv").html("The <b>" + lineid +  "</b>  will arrive at <b>" + timeBusArrives + "</b>.<BR>" +
				"<BR>Your Travel time will be <b>" + timeFromSourceToDestInMins + "Mins</b> <BR><BR>").promise().done(function(){
			$("#loader").removeClass("loader");
		});
		
	}
	});
}

function getPricing(jpid, stop1, stop2, direction) {

	info = ["Adult Cash", "Adult Leap", "Child Cash (Under 16)", "Child Leap (Under 19)", "School Hours Cash", "School Hours Leap"]
		
	$.ajax({
	  dataType: "json",
	  url: $SCRIPT_ROOT + "/getPricing/" + jpid + "/" + stop1 + "/" + stop2 + "/" + direction,
	  async: true, 
	  success: function(data) {

		options = "<b>Prices</b> : <BR>";

		_.each(data, function(value, key) {
			
			options += key + " : " + value + "<BR>";
		});

		$("#travelPriceDiv").html(options);
	}
		
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

//clear bus time and prediction
function clearBusTimeaAndPrediction() {

	$("#travelTimeDiv").html("");
	$("#travelPriceDiv").html("");
	$("#loader").removeClass("loader");
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
    return Number(parseFloat(val)) == val;
}
