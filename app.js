var httpserver = require('./httpserver.js');
var fs = require("fs");
var myFilename = "data.db";

var configs = function (set_port, set_hostname, set_handler) {
  set_port(2015);
  set_hostname('127.0.0.1');
  set_handler('GET /', do_output_html);
  set_handler('GET /index.html', do_output_html);
  set_handler('GET /main.css', do_output_css);
  set_handler('GET /main.js', do_output_js);
  set_handler('GET /favicon.ico', do_output_favicon);
  set_handler('POST /echo', do_echo);
  set_handler('POST /submit', do_submit);
  set_handler('POST /read_all', do_read_all);
  set_handler('POST /read_nickname', do_read_nickname);
};

var do_output_html = function (send_response) {
  require('fs').readFile('static_files/index.html', function (err, data) {
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
    write_to_file(myFilename,recordTuple);

    return {"ok": resultBool};
  }else{
    return {"ok": resultBool,"reason" :resultMessage};
  }
}

var check_nickname = function(nickname_string){
  if(nickname_string.length == 0){return false;}
  var nicknameRegExp = new RegExp("[a-z]|[0-9]");

  for(var i=0; i<nickname_string.length; i++){
    if(nickname_string[i].match(nicknameRegExp) === null){return false;}
  }

  return true;
}

var write_to_file = function(filename,messageWrite){
  fs.appendFile(filename, JSON.stringify(messageWrite)+"\n",function(err){
    if(err){
      return console.error(err);
    }
  });
  console.log("Save message to file "+filename+" success.");
}

var do_read_all = function(send_response, request_body, request_headers) {
  var response_body = new Buffer(JSON.stringify(read_from_file(myFilename,"")));

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
  var response_body = new Buffer(JSON.stringify(read_from_file(myFilename,request_json.nickname)));

  var content_type_default = 'application/octet-stream';
  var content_type = request_headers['content-type'] || content_type_default;
  send_response(response_body, {'Content-Type': content_type});
};

httpserver.run(configs);
