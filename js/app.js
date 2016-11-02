var apikey = "AIzaSyBkrGN2L98raRnCcvFjW5JE4VLpjKu8A6c";
var mandrillAPI = "0bwIWB-y1FeIdqPEjqEbXQ";

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
	sendEmail();
	var el = document.getElementById('results');
	if (!response || response.error) {
	  	el.appendChild(document.createTextNode(
	    	'Error while trying to fetch polling place'));
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
	  	
	  	//your address
	  	var your_address = document.createElement('p');
	  	your_address.className = "map_subtext_top";
	  	var a = document.createElement('a');
	  	var linkText = document.createTextNode("(Change)");
		a.appendChild(linkText);
		a.href = "#";
		a.onclick = "redo();";
	  	your_address.appendChild(document.createTextNode('Your Address '));
	  	your_address.appendChild(a);
	  	map_info.appendChild(your_address);

	  	var your_address_actual1 = document.createElement('p');
	  	your_address_actual1.appendChild(document.createTextNode(response.normalizedInput.line1));
	  	var your_address_actual2 = document.createElement('p');
	  	your_address_actual2.appendChild(document.createTextNode(response.normalizedInput.city + ", " + response.normalizedInput.state + " " + response.normalizedInput.zip));
	  	map_info.appendChild(your_address_actual1);
	  	map_info.appendChild(your_address_actual2);

	  	//polling place
	  	var polling_address = document.createElement('p');
	  	polling_address.className = "map_subtext";
	  	polling_address.appendChild(document.createTextNode('Polling Place'));
	  	map_info.appendChild(polling_address);

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
	  	el.appendChild(document.createTextNode(
	    	'Could not find polling place for ' + normalizedAddress));
	}

	//contests
	contest_render(response.contests, response.normalizedInput);
}

function redo() {
	console.log("hello");
	var initial = document.getElementById('initial');
	var post = document.getElementById('post');
	post.style.display = 'none';
	initial.style.display = 'block';
}

function contest_render(rep_array, address) {
	var offices = document.getElementById('offices');
	var send_info = document.getElementById('send_info');
	var header = document.getElementById('header');
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
	a.href = "#";
	a.onclick = "redo();";
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
		  		//contest_card.appendChild(normEl2);
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
	$.ajax({
	  type: "POST",
	  url: "https://mandrillapp.com/api/1.0/messages/send.json",
	  data: {
	    ‘key’: mandrillAPI,
	    ‘message’: {
	      ‘from_email’: 'admin@onmyballot.co',
	      ‘to’: [
	          {
	            ‘email’: 'm.emmad.mazhari@gmail.com',
	            ‘name’: ,
	            ‘type’: "to"
	          },
	        ],
	      ‘autotext’: "true",
	      ‘subject’: "Here's your ballot from onmyballot!",
	      ‘html’: '<p>YOUR EMAIL CONTENT HERE! YOU CAN USE HTML!</p>'
	    }
	  }
	 }).done(function(response) {
	   console.log(response); // if you're into that sorta thing
	 });
}
