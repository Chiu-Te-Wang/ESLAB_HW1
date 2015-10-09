console.log('Hello JavaScript!');
var emojiArr = ["&#128513","&#128514","&#128515","&#128520","&#128519"];

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
      callback(JSON.parse(server_response_object));
    })
    .catch(function (err) {
      console.log("Error : "+err);
      callback(null, err);
    });
};


var input_nickname_elm = document.getElementById('nickname-input-text');
var input_emoji_elm = document.getElementById('emoji-input-radio');
var input_message_elm = document.getElementById('message-input-text');
var log_textarea_elm = document.getElementById('log-area');
var button_submit_elm = document.getElementById('user-submit-send-btn');
var button_readall_elm = document.getElementById('user-readall-send-btn');
var button_read_nickname_elm = document.getElementById('read-nickname-message-send-btn');
var input_read_nickname_elm = document.getElementById('read-nickname-message-text');

button_read_nickname_elm.addEventListener('click', function () {
  var nickname_input = input_read_nickname_elm.value;
  send_to_server("/read_nickname",{"nickname":nickname_input});
});

button_readall_elm.addEventListener('click', function () {
  send_to_server("/read_all");
});

button_submit_elm.addEventListener('click', function () {
  var nickname_input = input_nickname_elm.value;
  var message_input = input_message_elm.value;
  var emoji_input = get_emoji_value(input_emoji_elm);
  input_message_elm.value = '';
  input_message_elm.focus();
  send_to_server("/submit",{
    "nickname":nickname_input,
    "emoji":emoji_input,
    "message":message_input
  });
});

var get_emoji_value = function(target_element){
  for(var i=0; i<target_element.children.length; i++) {
    if(target_element.children[i].children[0].checked){
      return parseInt(target_element.children[i].children[0].value);
    }
  }
};

var send_to_server = function (where,object_to_send=null) {
  if (typeof where !== 'string') throw TypeError();
  if (typeof object_to_send !== 'object') throw TypeError();

  if(where === "/read_all" || where === "/read_nickname"){
    http_post(where, object_to_send, result_from_server_callback_read_all);
  }
  else if(where === "/submit"){
    http_post(where, object_to_send, result_from_server_callback_submit);
  }
  else if(where === "/thumbup"){
	http_post(where, object_to_send, result_from_server_callback_thumbup);
  }
};

var result_from_server_callback_submit = function (result) {
  if(result === null){console.error("Error: Null response.");}
    console.log(result);
};

var result_from_server_callback_read_all = function (result) {
  if(result === null){console.error("Error: Null response.");}
  else{
    log_textarea_elm.innerHTML = "";

    for(var i=0; i<result.length;i++){
      if(result[i] === ""){continue;}
      print_to_log_textarea(result[i],i);
	  addbtn(i);
	  
    }
  }
};

var result_from_server_callback_thumbup = function(result){
	console.log(result);
};

var print_to_log_textarea = function(resultJson, index){
  log_textarea_elm.innerHTML += "<div id=\"messsage"+index+"\"></div>";
  var div_elm = document.getElementById("messsage"+index);
  div_elm.textContent += resultJson.nickname+" ";
  div_elm.innerHTML += emojiArr[resultJson.emoji]+" : ";
  div_elm.textContent += resultJson.message;
  div_elm.innerHTML += " ("+timestampConverter(resultJson.timestamp)+")<br>";
  
  div_elm.innerHTML += "<div id=\"thumb"+index+"\"></div>"
  if(resultJson.thumb === undefined){
	  return;
  }
  var thumb = document.getElementById("thumb"+index);
  var le = resultJson.thumb.length;
  thumb.textContent += le+" persons like this!  ( "
  for(var i = 0; i<le;i++){
	thumb.textContent += resultJson.thumb[i] + ", ";
  }
  thumb.textContent += ")";
  thumb.style.color = "blue";
};

function addbtn(index){
	var div_elm = document.getElementById("messsage"+index);
	div_elm.innerHTML +=  "<button id=\"btn"+index+"\" onclick=\"thumbup(this.id)\">Thumb up</button>" ;

};
function thumbup(id){
	var nickname = input_nickname_elm.value;
	var index = parseInt(id.substring(3));
	send_to_server('/thumbup',{'nickname':nickname, "index":index});
	console.log(index);
};

var timestampConverter = function (UNIX_timestamp) {
  var ensure_two_digits = function (num) {
    return (num < 10) ? '0' + num : '' + num; };
  var date   = new Date(UNIX_timestamp*1000);
  var year   = date.getFullYear();
  var month  = ensure_two_digits(date.getMonth() + 1);
  var day    = ensure_two_digits(date.getDate());
  var hour   = ensure_two_digits(date.getHours());
  var minute = ensure_two_digits(date.getMinutes());
  var second = ensure_two_digits(date.getSeconds());
  return year +'/'+ month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
};