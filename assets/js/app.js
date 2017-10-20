// player objects
var player1 = null;
var player2 = null;
var player1Name = "";
var player2Name = "";

// player name in the active browser
var yourPlayerName = "";

var player1Choice = "";
var player2Choice = "";
var turns = 1;		// turn counter

var database = firebase.database();

database.ref("/players/").on("value", function(snapshot) {	// attach a listener to "players" in firebase
	if (snapshot.child("player1").exists()) {		// check if there's a "player1" already, if so, record the relevant data from that object
		player1 = snapshot.val().player1;
		player1Name = player1.name;
		$("#name1").text(player1Name);
		$("#stats1").html("Wins: " + player1.wins + ", Losses: " + player1.losses + ", Ties: " + player1.ties);
	} 

	else {
		player1 = null;
		player1Name = "";

		$("#name1").text("Waiting for Player 1...");
		$("#playerPanel1").removeClass("playerPanelTurn");
		$("#playerPanel2").removeClass("playerPanelTurn");
		database.ref("/outcome/").remove();
		$("#outcome, #notice").html("");
		$("#stats1").html("Wins: 0, Losses: 0, Ties: 0");
	}

	if (snapshot.child("player2").exists()) {
		player2 = snapshot.val().player2;
		player2Name = player2.name;
		$("#name2").text(player2Name);
		$("#stats2").html("Wins: " + player2.wins + ", Losses: " + player2.losses + ", Ties: " + player2.ties);
	} 

	else {
		player2 = null;
		player2Name = "";

		$("#name2").text("Waiting for Player 2...");
		$("#playerPanel1").removeClass("playerPanelTurn");
		$("#playerPanel2").removeClass("playerPanelTurn");
		database.ref("/outcome/").remove();
		$("#outcome, #notice").html("");
		$("#stats2").html("Wins: 0, Losses: 0, Ties: 0");
	}

	if (player1 && player2) {
		$("#playerPanel1").addClass("playerPanelTurn");
		$("#notice").html("Waiting for " + player1Name + " to choose...");
	}

	if (!player1 && !player2) {
		database.ref("/chat/").remove();
		database.ref("/turn/").remove();
		database.ref("/outcome/").remove();

		$("#chatDisplay").empty();
		$("#playerPanel1").removeClass("playerPanelTurn");
		$("#playerPanel2").removeClass("playerPanelTurn");
		$("#outcome, #notice").html("");
	}
});

database.ref("/players/").on("child_removed", function(snapshot) {		// Attach a listener to detect disconnections
	var msg = snapshot.val().name + " has disconnected...";
	var chatKey = database.ref().child("/chat/").push().key;		// Get a key for the disconnection chat entry
	database.ref("/chat/" + chatKey).set(msg);
});

database.ref("/chat/").on("child_added", function(snapshot) {		// Attach a listener to "chat"
	var chatMsg = snapshot.val();
	var chatEntry = $("<div>").html(chatMsg);

	if(chatMsg.includes("disconnected")) {
		chatEntry.addClass("chatColorDisconnected");
	} 

	else if(chatMsg.includes("joined")) {
		chatEntry.addClass("chatColorJoined");
	} 

	else if (chatMsg.startsWith(yourPlayerName)) {
		chatEntry.addClass("chatColor1");
	} 

	else {
		chatEntry.addClass("chatColor2");
	}

	$(".chat-area").append(chatEntry);
	$(".chat-area").scrollTop($(".chat-area")[0].scrollHeight);
});

database.ref("/turns/").on("value", function(snapshot) {		// Attach a listener to "turns"
	if (snapshot.val() === 1) {		// if player 1
		turns = 1;
		if (player1 && player2) {		// Update if both players are connected
			$("#playerPanel1").addClass("playerPanelTurn");
			$("#playerPanel2").removeClass("playerPanelTurn");
			$("#notice").html("Waiting for " + player1Name + " to choose...");
		}
	} 

	else if (snapshot.val() === 2) {	// if player 2
		turns = 2;
		if (player1 && player2) {		// Update if both players are connected
			$("#playerPanel1").removeClass("playerPanelTurn");
			$("#playerPanel2").addClass("playerPanelTurn");
			$("#notice").html("Waiting for " + player2Name + " to choose...");
		}
	}
});

database.ref("/outcome/").on("value", function(snapshot) {		// Attach a listener to the "outcome"
	$("#outcome").html(snapshot.val());
});

$("#name-submit").on("click", function(event) {
	event.preventDefault();
	if(($("#name-entry").val().trim() !== "") && !(player1 && player2)){
		if (player1 === null) {		// if no players yet
			yourPlayerName = $("#name-entry").val().trim();
			player1 = {
				name: yourPlayerName,
				wins: 0,
				losses: 0,
				ties: 0,
				choice: ""
			};

			database.ref().child("/players/player1").set(player1);	// add player1 to firebase
			database.ref().child("/turns").set(1);	// set turns to 1
			database.ref("/players/player1").onDisconnect().remove();		// if disconnects, remove from firebase
		} 

		else if((player1 !== null) && (player2 === null)) { 	// if player1 already in firebase
			yourPlayerName = $("#name-entry").val().trim();
			player2 = {
				name: yourPlayerName,
				wins: 0,
				losses: 0,
				ties: 0,
				choice: ""
			};

			database.ref().child("/players/player2").set(player2);	// add player2 to firebase
			database.ref("/players/player2").onDisconnect().remove();		// if disconnects, remove from firebase
		}

		var msg = yourPlayerName + " has joined!";			// announce user has joined in chat
		var chatKey = database.ref().child("/chat/").push().key;		// Get a key for the join chat entry
		database.ref("/chat/" + chatKey).set(msg);		// Save the join chat entry
		$("#name-entry").val("");	
	}
});

$("#chat-submit").on("click", function(event) {		
	event.preventDefault();
	if((yourPlayerName !== "") && ($("#chat-entry").val().trim() !== "")){			// make sure that the player exists and the message box has something in it
		var msg = yourPlayerName + ": " + $("#chat-entry").val().trim();			// grab the message
		$("#chat-entry").val("");			// clear the field
		var chatKey = database.ref().child("/chat/").push().key;		// get key for the new entry
		database.ref("/chat/" + chatKey).set(msg);		// save it in the firebase
	}
});

$("#playerPanel1").on("click", ".panelOption", function(event) {
	event.preventDefault();
	if(player1 && player2 && (yourPlayerName === player1.name) && (turns === 1)){		// both players are connected
		database.ref("/outcome/").remove();
		var choice = $(this).text().trim();		// grab choice from what's selected in the playerpanel
		player1Choice = choice;			// save it to both player1Choice...
		database.ref().child("/players/player1/choice").set(choice);		// ...and to the firebase
		turns = 2;
		database.ref().child("/turns").set(2);
	}
});

$("#playerPanel2").on("click", ".panelOption", function(event) {
	event.preventDefault();
	if (player1 && player2 && (yourPlayerName === player2.name) && (turns === 2) ) {		// both players are connected
		database.ref("/outcome/").remove();
		var choice = $(this).text().trim();		// record the choice from player2 panel
		player2Choice = choice;
		database.ref().child("/players/player2/choice").set(choice);		// put it in firebase
		compare();	// run compare function --> game logic
	}
});

function compare() {
	if(player1.choice === "Rock"){
		if(player2.choice === "Rock"){
			database.ref().child("/outcome/").set("Tie game!");
			database.ref().child("/players/player1/ties").set(player1.ties + 1);
			database.ref().child("/players/player2/ties").set(player2.ties + 1);
		} 

		else if(player2.choice === "Paper"){
			database.ref().child("/outcome/").set(player2Name + " wins!");
			database.ref().child("/players/player1/losses").set(player1.losses + 1);
			database.ref().child("/players/player2/wins").set(player2.wins + 1);
		} 
		
		else{ 
			database.ref().child("/outcome/").set(player1Name + " wins!");
			database.ref().child("/players/player1/wins").set(player1.wins + 1);
			database.ref().child("/players/player2/losses").set(player2.losses + 1);
		}
	} 

	else if(player1.choice === "Paper"){
		if(player2.choice === "Rock"){
			database.ref().child("/outcome/").set(player1Name + " wins!");
			database.ref().child("/players/player1/wins").set(player1.wins + 1);
			database.ref().child("/players/player2/losses").set(player2.losses + 1);
		} 

		else if(player2.choice === "Paper"){
			database.ref().child("/outcome/").set("Tie game!");
			database.ref().child("/players/player1/ties").set(player1.ties + 1);
			database.ref().child("/players/player2/ties").set(player2.ties + 1);
		} 

		else { 
			database.ref().child("/outcome/").set(player2Name + " wins!");
			database.ref().child("/players/player1/losses").set(player1.losses + 1);
			database.ref().child("/players/player2/wins").set(player2.wins + 1);
		}
	} 

	else if(player1.choice === "Scissors"){
		if(player2.choice === "Rock"){
			database.ref().child("/outcome/").set(player2Name + "wins!");
			database.ref().child("/players/player1/losses").set(player1.losses + 1);
			database.ref().child("/players/player2/wins").set(player2.wins + 1);
		} 

		else if(player2.choice === "Paper"){
			database.ref().child("/outcome/").set(player1Name + " wins!");
			database.ref().child("/players/player1/wins").set(player1.wins + 1);
			database.ref().child("/players/player2/losses").set(player2.losses + 1);
		} 

		else{
			database.ref().child("/outcome/").set("Tie game!");
			database.ref().child("/players/player1/ties").set(player1.ties + 1);
			database.ref().child("/players/player2/ties").set(player2.ties + 1);
		}
	}

	// Set turns 1; it's now player1's turn
	turns = 1;
	database.ref().child("/turns").set(1);
}
