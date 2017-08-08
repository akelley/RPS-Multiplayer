var config = {
apiKey: "AIzaSyD5jPWxuqf1JRgTrTW8oG6waZBnoh8UxZs",
authDomain: "rps-multiplayer-872b5.firebaseapp.com",
databaseURL: "https://rps-multiplayer-872b5.firebaseio.com",
projectId: "rps-multiplayer-872b5",
storageBucket: "",
messagingSenderId: "592639934356"
};

firebase.initializeApp(config);

var database = firebase.database();
var data = database.ref('data');
var turn = data.child('turn');
var playersRef = data.child('players');
var player1 = playersRef.child('1');
var player2 = playersRef.child('2');

var player1Exists = false;
var player2Exists = false;
var changeDOM;
var name;
var playerObject = {
	name: "",
	choice: "",
	wins: 0,
	losses: 0,
};


firebase.database().ref().on("value", function(snapshot){
	player1Exists = snapshot.child("players").child("1").exists();
	player2Exists = snapshot.child("players").child("2").exists();
});

$(document).ready(function(){
	// for(var i = 1; i < 3; i++){
	// 	setPlayer(i, "test", 0, 0, 0);
	// }
	// setTurn(1);


});

function setPlayer(number, name, wins, losses, choice){
	firebase.database().ref("players").child(number).set({
    name: name,
    wins: wins,
    losses: losses,
    choice: choice
  });
};

function setTurn(turn){
	firebase.database().ref().update({
		turn: turn
	})
};

function checkPlayer1(){
  firebase.database().ref("players").child("1").on("value", function(snapshot){
		var temp = snapshot.val().name;
		if(temp !="test"){
			player1Exists = true;
		}
	});
 	return player1Exists;
};

function checkPlayer2(){
  firebase.database().ref("players").child("2").on("value", function(snapshot){
		if(snapshot.val().name.localeCompare("test") != 0){
			player2Exists = true;
		}
	});
 	return player2Exists;
};

$("#name-submit").on("click", function(e){
	e.preventDefault();
	var name = "";

	if($("#name-entry").val() !== ""){
		name = $("#name-entry").val();

		if(player1Exists == false && player2Exists == false){
			setPlayer("1", name, 0, 0, "");
			printGreeting(name, "1");
			populatePlayerArea(name, "1");
			player1Exists = true;
			firebase.database().ref("players").child("1").onDisconnect().remove();
		}

		else if(player1Exists == true && player2Exists == false){
			populationOpponentArea("1");
			setPlayer("2", name, 0, 0, "");
			printGreeting(name, "2");
			populatePlayerArea(name, "2");
			player2Exists = true;
			setTurn(1);
			firebase.database().ref("players").child("2").onDisconnect().remove();
		}

		else if(player1Exists == false && player2Exists == true){
			populationOpponentArea("2");
			setPlayer("1", name, 0, 0, "");
			printGreeting(name, "1");
			populatePlayerArea(name, "1");
			player1Exists = true;
			setTurn(1);
			firebase.database().ref("players").child("2").onDisconnect().remove();
		}
		console.log(player2Exists + " " + player1Exists);
	}	
});

// function updatePlayerPage(number){
//   firebase.database().ref("players").child(number).once("value", function(snapshot){
//   	$(".player" + number + "-area #score").append("<p id='score'>Wins: " + snapshot.val().wins + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
// 		"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Losses: " + snapshot.val().losses + "</p>");
//   });
// };

function printGreeting(name, number){
	$(".name-div").empty();
	$(".name-div").append("<p id='title'>Hello " + name + ". You are Player #" + number + ".</p>");
};

function populatePlayerArea(name, number){
	$(".player" + number + "-area p").html("<h3>" + name + "</h3>");
	// $(".player" + number + "-area p").append("<h4>ROCK</h4>");
	// $(".player" + number + "-area p").append("<h4>PAPER</h4>");
	// $(".player" + number + "-area p").append("<h4>SCISSORS</h4>");
	$(".player" + number + "-area p").append("<p id='score'>Wins: 0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
		"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Losses: 0</p>");
}

function populationOpponentArea(number){
	var name = "";
	firebase.database().ref("players").child(number).once("value", function(snapshot){
		name = snapshot.val().name;
	});
	$(".player" + number + "-area p").html("<h3>" + name + "</h3>");
	$(".player" + number + "-area p").append("<p id='score'>Wins: 0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
		"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Losses: 0</p>");
}

$("#chat-submit").on("click", function(){
  sendChat($("#chat-entry").val());
  $("#chat-entry").val("");
});


function sendChat(chat){
  if(player1Exists && player2Exists){
    //if(gameObject.userId == '1'){
      firebase.database().ref("data").child('chat').push({
      	chat: chat
      });
    //} 

    // else if(gameObject.userId == '2'){
    //   data.child('chat').push({message: gameObject.name2 + ': ' + chat});
    // }

    $("#chat-area").animate({scrollTop: $("#chat-area").prop('scrollHeight')}, 1000);
  } 
}

firebase.database().ref("data").child("chat").on("child_added", function(snapshot){
  //$('#chat-window').empty();
  
  // for(var key in snapshot.child("data")){}
  // snapshot.forEach(function(childSnap) {
    // if(gameObject.userId == '1' || gameObject.userId == '2'){
    //   var p = $('<p>')
    //   p.text(childSnap.val().message);
      $("#chat-area").append($("<p>" + snapshot.child("data").val() + "</p>"));
    //}
  //});
});