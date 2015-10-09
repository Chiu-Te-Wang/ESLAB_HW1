

/* For Login */
var button_login_elm = document.getElementById('login-send-btn');
var button_signup_elm = document.getElementById('signup-send-btn');
var input_username_elm = document.getElementById('username-input-text');
var input_password_elm = document.getElementById('password-input-text');
var username = "";
var http_post = function (where, object_to_send, callback) {
  if (typeof where !== 'string') throw TypeError();
  if (typeof object_to_send !== 'object') throw TypeError();
  if (typeof callback !== 'function') throw TypeError();

  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'text/json');

  fetch(where, {method: 'POST', 
                json: true, 
                headers: {"content-type": "application/json"},
                body: JSON.stringify(object_to_send)
              })
    .then(function (response) {
      return response.text();
    })
    .then(function (server_response_object) {
    	if(where === "/index"){ callback(server_response_object); }
    	else{ callback(JSON.parse(server_response_object)); }
    })
    .catch(function (err) {
      console.log("Error : "+err);
      callback(null, err);
    });
};

button_signup_elm.addEventListener('click', function () {
  var username_input = input_username_elm.value;
  var password_input = input_password_elm.value;
  username = username_input;
  http_post("/signup",{
    "username":username_input,
    "password":password_input
  },result_from_server_callback_login_signup);
});

button_login_elm.addEventListener('click', function () {
  var username_input = input_username_elm.value;
  var password_input = input_password_elm.value;
  username = username_input;
  http_post("/login",{
    "username":username_input,
    "password":password_input
  },result_from_server_callback_login_signup);
});

var result_from_server_callback_login_signup = function (result) {
  if(result === null){console.error("Error: Null response.");}
  console.log(result);
  if(result["ok"] === true){
  	http_post("/index",{
	    "secretCode":result["secretCode"]
	  },result_from_server_callback_login_signup_sucess);
  }
};

var result_from_server_callback_login_signup_sucess = function (result) {
	console.log("login sucess");
	document.getElementsByTagName('html')[0].innerHTML = result;

	var headID = document.getElementsByTagName("head")[0];         
	var newScript = document.createElement('script');
	newScript.type = 'text/javascript';
	newScript.src = './main.js';
	headID.appendChild(newScript);
	var input_nickname_elm = document.getElementById('nickname-input-text');
	input_nickname_elm.value = username;
	input_nickname_elm.setAttribute("readonly","readonly");
};