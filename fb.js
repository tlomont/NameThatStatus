var answer;
var status;
var name;
var names = new Array();
var statuses = new Array();
var answers = new Array();
var firstTimeLoaded = true;
var correct = 0;
var guesses = 0;
var percent;

// Initialize the Facebook JavaScript SDK
FB.init({
    appId: '1397744790494548',
    xfbml: true,
    status: true,
    cookie: true
});

// Check if the current user is logged in and has authorized the app
FB.getLoginStatus(checkLoginStatus);
// Login in the current user via Facebook and ask for permissions
function authUser() {
    FB.login(checkLoginStatus, {scope:'user_friends,read_stream'});
}

// Check the result of the user status and display login button if necessary
function checkLoginStatus(response) {
    if(response && response.status == 'connected') {
        // Display items for game
        document.getElementById('share').style.display = 'block';
        document.getElementById('percent').style.display = 'block';
        document.getElementById('status').style.display = 'inherit';

        // Hide items for login
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('description').style.display = 'none';

        // Display choices
        document.getElementById('names').style.display = 'table';
        document.getElementById('next').style.display = 'initial';
        var elements = document.getElementsByClassName('logout');
        for(var i = 0; i < elements.length; i++){
            elements[i].style.display='initial';
        }


        // Load choices in queue
        setInterval(function() {
            if(names.length < 10){
                getStatus();
            }
        }, 200);
    } else {

        // Display the login button
        document.getElementById('loginButton').style.display = "initial";
        // Hide choices
        document.getElementById('names').style.display = 'none';
        document.getElementById('next').style.display = 'none';
    }
}


function getStatus() {
    var name_list = new Array();
    var id_list =  new Array();
    FB.api(
        '/me/friends', {fields: 'name'},
        function (response) {
            if (response && !response.error) {

                // Get random 4 friends
                for(var i = 0; i < 4; i++){
                    var rand = Math.floor(Math.random() * response['data'].length);
                    id_list.push(response['data'][rand]['id']);
                    var name = response['data'][rand]['name'];
                    name_list.push(name);
                    response['data'].splice(rand,1);
                }

                // Choose one friend
                rand = Math.floor(Math.random() * 4);
                var choice = id_list[rand];

                // Get random status from chosen friend
                FB.api(
                    '/'+choice+'/statuses',
                    function (response) {
                        if(response['data'] !== undefined && response['data'][rand] !== undefined) {

                            var status = response['data'][rand]['message'];
                            if (status == 'undefined' || status == undefined) {
                                getStatus();
                                return;
                            }

                        } else {
                            getStatus();
                            return;
                        }

                        // Add to lists
                        names.push(name_list);
                        answers.push(rand);
                        statuses.push(status);

                        // Display choices if first time loading
                        if (firstTimeLoaded) {
                            firstTimeLoaded = false;
                            displayChoices();
                        }
                    })

            }
        }
    );
}

function displayChoices() {
    document.getElementById('share').style.visibility="hidden";
    document.getElementById('status').innerHTML = "";
    document.getElementById('status').innerHTML = "\""+statuses[0]+"\"";
    for(var i = 0; i < 4; i++){
        document.getElementById('name'+i).innerHTML = names[0][i];
        document.getElementById('name'+i).style.backgroundColor = "initial";
        document.getElementById('name'+i).style.color = "initial";
    }
    answer = answers[0];
    name = (names.shift())[answer];
    status = statuses.shift();
    answers.shift();
}

function check(ans) {

    var element = document.getElementById("name"+ans);

    // If first time pressing that button
    if (element.style.backgroundColor == 'initial'){
        guesses++;
        element.style.color = "white";

        // Check answer, display red or green
        if (ans == answer) {
            element.style.backgroundColor = "#4CA481";
            document.getElementById('share').style.visibility="visible";
            correct++;

        } else {
            element.style.backgroundColor = "#F05A5A";
        }

        // Display percent correct
        percent = Math.round((correct / guesses) * 100);
        document.getElementById('percent').innerHTML = percent + "% Correct";
    }
}

function user_logout() {
    FB.logout(function(response) {
        location.reload();
    });
}


function share() {
    var post = "\"" + status + "\" - " + name;
    FB.ui(
        {
            method: 'feed',
            name: post,
            link: 'http://namethatstatus.com',
            picture: 'http://namethatstatus.com/img/fb_share.jpg',
            caption: 'NameThatStatus!',
            description: 'I guessed this status on NameThatStatus! How well do you know YOUR friends?'
        },
        function(response) {

        }
    );
}