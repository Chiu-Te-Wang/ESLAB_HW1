var httpserver = require('./httpserver.js');
var fs = require("fs");
var messageRecordFilename = "data.db";
var userDataFilename = "userData.db";
var secretCodeArr = [];//for auth user request index.html
var userDataArr = [];

var configs = function (set_port, set_hostname, set_handler) {
  set_port(2015);
  set_hostname('127.0.0.1');
  set_handler('GET /', do_output_login_html);
  set_handler('GET /main.css', do_output_css);
  set_handler('GET /main.js', do_output_js);
  set_handler('GET /login.js', do_output_login_js);
  set_handler('GET /favicon.ico', do_output_favicon);
  set_handler('POST /echo', do_echo);
  set_handler('POST /submit', do_submit);
  set_handler('POST /read_all', do_read_all);
  set_handler('POST /read_nickname', do_read_nickname);
  set_handler('POST /thumbup', do_thumb_up);
  set_handler('POST /login', do_login);
  set_handler('POST /signup', do_signup);
  set_handler('POST /index', do_output_html);
};

var do_output_login_html = function (send_response) {
  require('fs').readFile('static_files/login.html', function (err, data) {
    if (err) throw err;
    send_response(data, {'Content-Type': 'text/html; charset=utf-8'});
  });
};

var do_output_css = function (send_response) {
  require('fs').readFile('static_files/main.css', function (err, data) {
    if (err) throw err;
    send_response(data, {'Content-Type': 'text/css; charset=utf-8'});
  });
};

var do_output_js = function (send_response) {
  require('fs').readFile('static_files/main.js', function (err, data) {
    if (err) throw err;
    send_response(data, {'Content-Type': 'text/javascript; charset=utf-8'});
  });
};

var do_output_login_js = function (send_response) {
  require('fs').readFile('static_files/login.js', function (err, data) {
    if (err) throw err;
    send_response(data, {'Content-Type': 'text/javascript; charset=utf-8'});
  });
};

var do_output_favicon = function (send_response) {
  require('fs').readFile('static_files/favicon.ico', function (err, data) {
    if (err) throw err;
    send_response(data, {'Content-Type': 'image/x-icon'});
  });
};

// Echo back every bytes received from the client
var do_echo = function (send_response, request_body, request_headers) {
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};



var do_submit = function (send_response, request_body, request_headers) {
  var request_json = JSON.parse(request_body);
  var response_body = new Buffer(JSON.stringify(check_submit(request_json)));

  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(response_body, {'Content-Type': content_type});
};

var do_thumb_up = function(send_response, request_body, request_headers){
  var request_json = JSON.parse(request_body);
  var response_body = new Buffer(JSON.stringify(check_thumb(request_json)));
  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(request_body, {'Content-Type': content_type});
};
var do_login = function(send_response, request_body, request_headers){
  var request_json = JSON.parse(request_body);
  var check_login_json = login_signup_help_function(request_json,"login");
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(new Buffer(JSON.stringify(check_login_json)), {'Content-Type': content_type});
}

var do_signup = function(send_response, request_body, request_headers){
  var request_json = JSON.parse(request_body);
  var check_signup_json = login_signup_help_function(request_json,"signup");
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(new Buffer(JSON.stringify(check_signup_json)), {'Content-Type': content_type});
};

var login_signup_help_function = function(json_object, indentifier){
  var check_login_signup_json = check_login_signup(json_object,indentifier);
  if(check_login_signup_json['ok'] === true){
    var str = "";
    var counter = 0;
    while(counter <= 20){
      str += ""+Math.floor((Math.random()*10))
      counter += 1;
    }
    secretCodeArr.push(str);
    check_login_signup_json["secretCode"] = str;
  }
  return check_login_signup_json;
}

var do_output_html = function (send_response, request_body, request_headers) {
  var request_json = JSON.parse(request_body);
  var index = secretCodeArr.indexOf(request_json["secretCode"]);
  //auth is right
  if( index !== -1 ){
    secretCodeArr.splice(index,1);//remove secretCode from the array
    require('fs').readFile('static_files/index.html', function (err, data) {
      if (err) throw err;
      send_response(data, {'Content-Type': 'text/html; charset=utf-8'});
    });
  }
  else{
    do_output_login_html(send_response);
  }
};

var check_login_signup = function(json_object, indentifier){
  var username = json_object["username"]
  var password = json_object["password"]
  var resultBool = true;
  var resultMessage = "";
  //check username valid or not 
  if(username.length < 3 || username.length > 10 || !(check_nickname(username)) ){
    resultBool = false;
    resultMessage = "you must provide a valid username";
    return {"ok": resultBool,"reason" :resultMessage};
  }

  //check password valid or not
  if(password.length < 3 || password.length > 10 || !(check_nickname(password)) ){
    resultBool = false;
    resultMessage = "you must provide a valid password";
    return {"ok": resultBool,"reason" :resultMessage};
  }

  //load userData from db
  if(userDataArr.length === 0){
    var messageResultArr = [];
    var userTempArr = [];

    var data = fs.readFileSync(userDataFilename);
    messageArr = data.toString().split("\n");
    for(var i=0; i<messageArr.length;i++){
      if(messageArr[i] === ""){continue;}
      userDataArr.push(JSON.parse(messageArr[i]));
    }
  }

  if(indentifier === "login"){
    //check whether userdata is in db
    var userCheckPass = false;
    for(var i=0; i<userDataArr.length;i++){
      if(userDataArr[i]["username"] === username && userDataArr[i]["password"] === password){
        userCheckPass = true;
        break;
      }
    }
    if(userCheckPass === false){
      resultBool = false;
      resultMessage = "username or password is not right!";
      return {"ok": resultBool,"reason" :resultMessage};
    }
  }
  else{
    //check whether username has exist
    var usernameExist = false;
    for(var i=0; i<userDataArr.length;i++){
      if(userDataArr[i]["username"] === username){
        usernameExist = true;
        break;
      }
    }
    if(usernameExist === true){
      resultBool = false;
      resultMessage = "username has existed!";
      return {"ok": resultBool,"reason" :resultMessage};
    }
    else{
      userDataArr.push(json_object);
      write_to_file(userDataFilename,json_object);
    }
  }

  if(resultBool){
    return {"ok": resultBool};
  }
}

var check_submit = function(json_object){
  var nickname = json_object["nickname"]
  var emoji = json_object["emoji"]
  var message = json_object["message"]
  var resultBool = true;
  var resultMessage = "";
  //check nickname valid or not 
  if(nickname.length < 3 || nickname.length > 10 || !(check_nickname(nickname)) ){
    resultBool = false;
    resultMessage = "you must provide a valid nickname";
  }

  //check emoji valid or not 
  if(emoji<0 || emoji>4){
    resultBool = false;
    resultMessage = "emoji value out of range";
  }

  //check emoji click or not
  if(emoji === undefined){
    resultBool = false;
    resultMessage = "emoji not check";
  }

  //check message valid or not
  if(message.length <= 0){
    resultBool = false;
    resultMessage = "message can't be empty";
  }

  if(resultBool){
    //save the  4-tuple (nickname, emoji, message, timestamp)  in file
    var recordTuple = {
      "nickname" : nickname,
      "emoji"    : emoji,
      "message"  : message,
      "timestamp": Math.round((new Date()).getTime() / 1000)
    };
    write_to_file(messageRecordFilename,recordTuple);

    return {"ok": resultBool};
  }else{
    return {"ok": resultBool,"reason" :resultMessage};
  }
}
var check_thumb = function(json){
	var nickname = json['nickname'];
	var index = json['index'];
	var array = read_from_file(messageRecordFilename,'');
	if(array[index]['thumb'] === undefined){
		array[index]['thumb'] = [];
		array[index]['thumb'].push(nickname);
		clear_file();
		rewrite_data(array);
		console.log(array[index]['thumb']);
	}
	else{
		var num = array[index]['thumb'].length;
		console.log(num);
		var exist = false;
		for(var i = 0; i<num;i++){
			if(array[index]['thumb'][i] === nickname)
				exist = true;
			console.log(array[index]['thumb'][i]);
		}
		if(exist){console.log("already thumbup");}
		else{
			array[index]['thumb'].push(nickname);
			clear_file();
			rewrite_data(array);
		}
	}
	return {"ok":true};
};

var rewrite_data= function(D_to_Wr){
	for(var i=0; i<D_to_Wr.length;i++){
      if(D_to_Wr[i] === ""){
		console.log("Empty msg");
		continue;
	  }
      write_to_file(messageRecordFilename,D_to_Wr[i]);
	  
    }
};

var check_nickname = function(nickname_string){
  if(nickname_string.length == 0){return false;}
  var nicknameRegExp = new RegExp("[a-z]|[0-9]");

  for(var i=0; i<nickname_string.length; i++){
    if(nickname_string[i].match(nicknameRegExp) === null){return false;}
  }

  return true;
}

function clear_file(){
	fs.writeFile(messageRecordFilename, '', function(){console.log('clear data.db')})
};

var write_to_file = function(filename,messageWrite){
  fs.appendFile(filename, JSON.stringify(messageWrite)+"\n",function(err){
    if(err){
      return console.error(err);
    }
  });
  console.log("Save message to file "+filename+" success.");
}

var do_read_all = function(send_response, request_body, request_headers) {
  var response_body = new Buffer(JSON.stringify(read_from_file(messageRecordFilename,"")));

  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(response_body, {'Content-Type': content_type});
};

var read_from_file = function(filename,filter){
  var messageResultArr = [];
  var messageArr = [];

  var data = fs.readFileSync(filename);
  messageArr = data.toString().split("\n");
  for(var i=0; i<messageArr.length;i++){
    if(messageArr[i] === ""){continue;}

    if(filter === ""){
      messageResultArr.push(JSON.parse(messageArr[i]));
    }
    else{
      var tempJsonObj = JSON.parse(messageArr[i]);
      if(tempJsonObj.nickname === filter){
        messageResultArr.push(JSON.parse(messageArr[i]));
      }
    }
  }

  return messageResultArr;
};

var do_read_nickname = function(send_response, request_body, request_headers) {
  var request_json = JSON.parse(request_body);
  console.log("request_json.nickname: "+request_json.nickname );
  var response_body = new Buffer(JSON.stringify(read_from_file(messageRecordFilename,request_json.nickname)));

  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(response_body, {'Content-Type': content_type});
};

httpserver.run(configs);
