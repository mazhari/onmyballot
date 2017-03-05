var apikey = "AIzaSyBkrGN2L98raRnCcvFjW5JE4VLpjKu8A6c";

/**
* Build and execute request to look up voter info for provided address.
* @param {string} address Address for which to fetch voter info.
* @param {function(Object)} callback Function which takes the
*     response object as a parameter.
*/
function lookup(address, callback) {
	var electionId = 5000;

	var req = gapi.client.request({
	    'path' : '/civicinfo/v2/voterinfo',
	    'params' : {'electionId' : electionId, 'address' : address}
	});
	req.execute(callback);
}

/**
* Render results in the DOM.
* @param {Object} response Response object returned by the API.
* @param {Object} rawResponse Raw response from the API.
*/
function renderResults(response, rawResponse) {
	//sendEmail();
	var el = document.getElementById('results');
	$('#results').empty();
	if (!response || response.error) {
	  	el.appendChild(document.createTextNode(
	    	"The election's over so we can't get that data 😞"));
		return;
	}
	console.log(response);
	var initial_block = document.getElementById("initial");
	initial_block.style.display = 'none';      
	//polling place
	var normalizedAddress = response.normalizedInput.line1 + ' ' +
	    response.normalizedInput.city + ', ' +
	    response.normalizedInput.state + ' ' +
	    response.normalizedInput.zip;

	if (response.pollingLocations) {
	  	var pollingLocation = response.pollingLocations[0].address;
	  	var pollingAddress = pollingLocation.locationName + ', ' +
	    	pollingLocation.line1 + ' ' +
	      	pollingLocation.city + ', ' +
	    	  pollingLocation.state + ' ' +
	    	  pollingLocation.zip;
		initMap(pollingAddress);
		var map_card = document.getElementById("map_card");
		map_card.style.display = 'block';   
		var map_info = document.getElementById('map_info');

	  	//polling place
	  	var polling_address = document.createElement('h3');
	  	polling_address.className = "ballot_title";

	  	var polling_address_actual1 = document.createElement('p');
	  	polling_address_actual1.appendChild(document.createTextNode(pollingLocation.locationName));
	  	var polling_address_actual2 = document.createElement('p');
	  	polling_address_actual2.appendChild(document.createTextNode(pollingLocation.line1));
	  	var polling_address_actual3 = document.createElement('p');
	  	polling_address_actual3.appendChild(document.createTextNode(pollingLocation.city + ', ' +
	    	  pollingLocation.state + " " + pollingLocation.zip));
	  	var polling_address_actual4 = document.createElement('p');
	  	polling_address_actual4.appendChild(document.createTextNode(response.pollingLocations[0].pollingHours));
	  	if (pollingLocation.locationName) {
	  		map_info.appendChild(polling_address_actual1);
	  	}
		map_info.appendChild(polling_address_actual2);
		map_info.appendChild(polling_address_actual3);
	  	map_info.appendChild(polling_address_actual4);

	} else {
		var error = document.getElementById('error');
		var error_message = document.createElement('div');
		error_message.className = "error_message";
	  	error_message.appendChild(document.createTextNode(
	  		"We couldn't find your polling place. Sorry 😖"));
	  	error.appendChild(error_message);
	}

	//contests
	contest_render(response.contests, response.normalizedInput);
}

function redo() {
	/*var initial = document.getElementById('initial');
	var post = document.getElementById('post');
	var autocomplete = document.getElementById("autocomplete");
	autocomplete.value = '';
	post.style.display = 'none';
	initial.style.display = 'block';)*/
	location.reload();
}

function contest_render(rep_array, address) {
	var offices = document.getElementById('offices');
	var send_info = document.getElementById('send_info');
	var header = document.getElementById('header');
	var twitter = document.getElementById('twitter');
	twitter.style.display = 'inline-block';  
	offices.style.display = 'block';    
	send_info.style.display = 'block';
	//your address
  	var your_address = document.createElement('p');
  	var address_block = document.createElement('div');
  	address_block.className = "right_address";
  	your_address.className = "map_subtext_top";
  	var a = document.createElement('a');
  	var linkText = document.createTextNode("(Change)");
	a.appendChild(linkText);
	a.onclick = redo;
  	your_address.appendChild(document.createTextNode('Your Address '));
  	your_address.appendChild(a);
  	address_block.appendChild(your_address);
  	var your_address_actual1 = document.createElement('p');
  	your_address_actual1.appendChild(document.createTextNode(address.line1));
  	var your_address_actual2 = document.createElement('p');
  	your_address_actual2.appendChild(document.createTextNode(address.city + ", " + address.state + " " + address.zip));
  	address_block.appendChild(your_address_actual1);
  	address_block.appendChild(your_address_actual2);
  	header.appendChild(address_block);
	
	var subtitle_ballot = document.createElement('p');
	subtitle_ballot.className = "subtitle_ballot";
	subtitle_ballot.appendChild(document.createTextNode("We found " + rep_array.length + " candidates on your ballot! " +
		"Read up more about them and make some choices! If you want, you can even email or text yourself your choices to keep handy on Election Day!"));
	
	offices.appendChild(subtitle_ballot);

	for (var i = 0; i < rep_array.length; i++) {
		var election = document.createElement('div');
		election.className = "election";

		if (rep_array[i].type == "Referendum") {
			//title
			var title = rep_array[i].referendumTitle;
			var normEl = document.createElement('div');
			normEl.className = "position";
		  	normEl.appendChild(document.createTextNode(title));
		  	election.appendChild(normEl);
	  		
	  		//subtitle
	  		var subtitle = rep_array[i].referendumSubtitle;
	  		var normEl2 = document.createElement('div');
		  	normEl2.className = "running";
		  	normEl2.appendChild(document.createTextNode(subtitle));
		  	election.appendChild(normEl2);

		  	var checkbox1 = document.createElement('input');
	        checkbox1.type = "radio";
	        checkbox1.name = rep_array[i].referendumText;
	        checkbox1.value = "Yes";
	        checkbox1.id = "id"+rep_array[i].referendumTitle+"yes";
	        checkbox1.text = rep_array[i].referendumText;

	        var checkbox2 = document.createElement('input');
	        checkbox2.type = "radio";
	        checkbox2.name = rep_array[i].referendumText;
	        checkbox2.value = "No";
	        checkbox2.id = "id"+rep_array[i].referendumTitle+"no";
	        checkbox2.text = rep_array[i].referendumText;
	        
	        var label1 = document.createElement("label");
	        label1.innerText = "Yes";
    		label1.htmlFor = "id"+rep_array[i].referendumTitle+"yes";
    		
    		var label2 = document.createElement("label");
	        label2.innerText = "No";
    		label2.htmlFor = "id"+rep_array[i].referendumTitle+"no";
	        
	        var contest_card1 = document.createElement('div');
		  	contest_card1.className = "contest_card";
		  	var contest_card2 = document.createElement('div');
		  	contest_card2.className = "contest_card";
	        
	        contest_card1.appendChild(checkbox1);
	        contest_card1.appendChild(label1);

	        contest_card2.appendChild(checkbox2);
	        contest_card2.appendChild(label2);

	        election.appendChild(contest_card1);
	        election.appendChild(contest_card2);
	  	}
	  	else {
	  		//print title
			var office = rep_array[i].office;
			var numVoting = rep_array[i].numberVotingFor;
			var normEl = document.createElement('div');
			normEl.className = "position";
			if (numVoting > 1) {
				normEl.appendChild(document.createTextNode(office + " (You can vote for " + numVoting + ")"));
			}
			else {
				normEl.appendChild(document.createTextNode(office));
			}
		  	election.appendChild(normEl);

		  	for (var j = 0; j < rep_array[i].candidates.length; j++) {
		  		var contest_card = document.createElement('div');
		  		contest_card.className = "contest_card";
		  		var name = rep_array[i].candidates[j].name.split('/')
		  		var party = rep_array[i].candidates[j].party;
		  		//var normEl2 = document.createElement('div');
		  		//normEl2.className = "running";

		  		//break up and fix name
		  		if (name.length > 1) {
		  			name = name[0] + " & " + name[1];
		  		}

				//checkbox
				var checkbox = document.createElement('input');
		        if (numVoting > 1) {
		        	checkbox.type = "checkbox";
		        }
		        else {
		        	checkbox.type = "radio";
		        }
		        checkbox.name = office;
		        checkbox.value = name;
		        checkbox.id = "id"+j+office;
		        checkbox.text = name;
		        var label = document.createElement("label");
		        label.innerText = name;
        		label.htmlFor = "id"+j+office;
		        contest_card.appendChild(checkbox);
		        contest_card.appendChild(label);

		        var right_info = document.createElement('div');
		        right_info.className = "right_info";
		        
		        //add Party Link
		        var party_div = document.createElement('p');
		        if (party == "Democratic Party") {
		        	party_div.className = "dem";
		        }
		        else if (party == "Republican Party") {
		        	party_div.className = "repub";
		        }
		        else if (party == "Green Party") {
		        	party_div.className = "green";
		        }
		        else if (party == "Libertarian Party") {
		        	party_div.className = "lib";
		        }
		        else {
		        	party_div.className = "default";
		        }
		        party_div.appendChild(document.createTextNode(party));
		        right_info.appendChild(party_div);

		        //more info
		        var more_info = document.createElement('a');
		        more_info.className = 'more_info';
		        more_info.target = "_blank";
	  			var linkText = document.createTextNode("More Info >");
				more_info.appendChild(linkText);
				
				//google link
				var link = name + " " + office;
				var link = link.split('&').join('');
				var link = link.split(' ').join('+');
				more_info.href = 'http://www.google.com/search?q=' + link;
		        right_info.appendChild(more_info);
		        
		        contest_card.appendChild(right_info);
		        election.appendChild(contest_card);
		  	}
		}
		offices.appendChild(election);
	}
}

//load data
function load() {
	var address = document.getElementById('autocomplete').value;
	gapi.client.setApiKey(apikey);
	lookup(address, renderResults);
}

//Call Map And autocomplete
function initAutocomplete() {
	var autocomplete;
	// Create the autocomplete object, restricting the search to geographical
	// location types.
	autocomplete = new google.maps.places.Autocomplete(
	    /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
	    {types: ['geocode']});
}

function initMap(address) {
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address' : address }, function( results, status ) {
    if( status == google.maps.GeocoderStatus.OK ) {
    	var map = new google.maps.Map(document.getElementById('map'), {
		  zoom: 15,
		  center: results[0].geometry.location
		});
        //In this case it creates a marker, but you can get the lat and lng from the location.LatLng
        map.setCenter( results[0].geometry.location );
        var marker = new google.maps.Marker( {
            map     : map,
            position: results[0].geometry.location
        } );
    } else {
        alert( 'Geocode was not successful for the following reason: ' + status );
    }
    } );
}

function sendEmail(){
	var email = document.getElementById('email_input').value;
	/*if (!email) {
		var email = document.getElementById('email_error_space');
		$('#email_error_space').empty();
		var email_error = document.createElement('div');
		email_error.className = "email_error";
		email_error.appendChild(document.createTextNode(
	    	"Looks like you forgot to enter an email 😬"));
		email.appendChild(email_error);
		return;
	}
	console.log($("input:checked"));
	var innerHTML = "<p>Thanks so much for taking to the time to read up on your candidates! Here are your choices</p><br><br><p>";
	$("input:checked").each(function(){
		innerHTML += this.name + " - " + "<strong>" + this.defaultValue + "</strong>" + "<br><br>";
	});
	innerHTML += "</p><br><br>";
	innerHTML += "We'd really appreciate it if you could also spread the word! You can <a target=\"_blank\" href=\"https://twitter.com/home?status=Get%20your%202016%20U.S.%20Election%20ballot%20on%20http%3A//onmyballot.co/!\">tweet</a> about this project or just tell your friends!<br><br>"
	innerHTML += "Thanks again for being part of the democratic process!</p>";

	$.ajax({
	  type: "POST",
	  url: "https://mandrillapp.com/api/1.0/messages/send.json",
	  data: {
	    'key': "0bwIWB-y1FeIdqPEjqEbXQ",
	    'message': {
	      'from_email': 'yourballot@onmyballot.co',
	      'to': [
	          {
	            'email': email,
	            'name': 'Conerned Citizen',
	            'type': "to"
	          },
	        ],
	      'autotext': "true",
	      'subject': "Here's your Ballot from onmyballot.co!",
	      'html': innerHTML
	    }
	  }
	 }).done(function(response) {
	   console.log(response); // if you're into that sorta thing
	 });*/
	var email = document.getElementById('email_error_space');
	$('#email_error_space').empty();
	var email_success = document.createElement('div');
	email_success.className = "email_success";
	email_success.appendChild(document.createTextNode(
    	"The 2016 election is over, but thanks for trying!"));
	email.appendChild(email_success);
}
