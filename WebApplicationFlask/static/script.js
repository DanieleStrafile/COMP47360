$(document).ready(function() {

	// Here is how to show an error message next to a form field
	var errorField = $('.form-input-name-row');

	// Adding the form-invalid-data class will show
	// the error message and the red x for that field
	errorField.addClass('form-invalid-data');
	errorField.find('.form-invalid-data-info').text('Please enter the route number');

	// Here is how to mark a field with a green check mark
	var successField = $('.form-input-email-row');
	successField.addClass('form-valid-data');

	// For processing the dynamic ajax 'GET' request to retrieve the model's prediction
	$('#getTime').ajaxForm(function() {

		// Transform form data into array of objects
		var data = $("#getTime :input").serializeArray();

		// For ease of reading later...
		var routeId = String(data[0].value); var source = String(data[1].value);
		var dest = String(data[2].value); var now = String(data[3].value);
		var date = String(data[4].value); var time = String(data[5].value);

		// Make API get request to flask
	    $.getJSON("http://localhost:5000/_sign_up/" + routeId + "/" + source + "/" + dest + "/" + now + "/" + date + "/" + time, function(info) {
			// For temporary debugging...
			// Info is the information returned from the flask server
	        console.log("info returned in get request: " + info)
            alert("Get Request Worked!");
	    });
	});
});