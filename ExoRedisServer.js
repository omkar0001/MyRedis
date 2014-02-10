var net = require('net');
var cp = require("child_process");
var datastructure = require("./datastructure");
var zgetset = require("./zgetset");
var zadd = require("./zadd");
var PORT = "15000";
var HOST = "127.0.0.1";

process.stdin.resume();

process.argv.forEach(function (val, index, array) {
  if(index == 2) {
  	datastructure.rdbfile = val;
  }
});

//Forking the process. This process will handle the operations related to database file reads and file writes.
var childProcess = cp.fork('./childProcess.js');
childProcess.send({"message":"RDBFILE", "data":datastructure.rdbfile});


childProcess.on('message', function(m) {
  if(m=="close") {
  	process.exit();
  }
});
//Handles the SIGINT event.
process.on('SIGINT', function(){
  childProcess.send({'message': 'SIGINT'});
});

console.log("Loading the dbsnapshot... \n");
//Reads the rdb file when the server starts.
datastructure.fs.readFile(datastructure.rdbfile, function (err,data) {
    if (err) throw err;
    datastructure.rdbfiledata = data;    
    var split_data = data.toString().split("@@@");
    for(var i=0; i<split_data.length; i++) {
      if(split_data[i].toString().indexOf("M") == 0) {
        zgetset.convertLineRdbToJson(split_data[i]);
      } else if(split_data[i].toString().indexOf("ZADD") == 0) {
        zadd.convertLineRdbToJson(split_data[i]);
      }	
    }
    childProcess.send({"message":"READSNAPSHOT", "data":data.toString()});
    console.log("Loaded the dbsnapshot\n"); 
    console.log("Server started. Listening at port no 15000\n");   
    createRedisServer();
});


/*
* Opening the telnet connection over port no 15000.
*/
function createRedisServer() {

var server = net.createServer(function(socket) {
	
    socket.setEncoding('utf8');
    socket.on('data', function(data) {
        //Hnadles the commands from client side.
        var recieved_string = data.toString().substring(0, data.length-2);
        recieved_string_split = recieved_string.split(" ");
        var temp_bit;
        switch(recieved_string_split[0]) {
        	case "ZSET":
        	zgetset.zset(recieved_string_split[1], recieved_string_split[2]);
        	childProcess.send({"message":recieved_string, 'zgetsetjsondata': datastructure.jsondata['zgetset'], 'type' : 'string'});
        	break;
        	case "ZGET":
        	var value = zgetset.zget(recieved_string_split[1]);
        	socket.write(value + "\n");
        	break;
        	case "SETBIT":
        	temp_bit = zgetset.zsetbit(recieved_string_split[1], recieved_string_split[2], recieved_string_split[3]);
        	childProcess.send({"message":recieved_string, 'zgetsetjsondata': datastructure.jsondata['zgetset'], 'type' :'bits'});
            socket.write("" + temp_bit + "\n");
        	break;
        	case "GETBIT":
        	socket.write("" + zgetset.zgetbit(recieved_string_split[1], recieved_string_split[2]) + "\n");
        	break;
        	case "ZADD":
        	var arrays = Array();
        	var value = zadd.zadd(recieved_string_split[1], recieved_string_split[2], recieved_string_split[3]);
        	childProcess.send({"message":recieved_string, "zaddjsondata": datastructure.jsondata['zadd']});
        	break;
        	case "ZRANGE":
        	var temp_values = zadd.zrange(recieved_string_split[1], recieved_string_split[2], recieved_string_split[3]);
            for(var i = 0; i< temp_values.length; i++) {
              socket.write(temp_values[i] + "\n");	
            }
            break;
            case "ZCARD":
            socket.write(zadd.zcard(recieved_string_split[1]) + "\n");
            break;
            case "ZCOUNT":
            socket.write(zadd.zcount(recieved_string_split[1],recieved_string_split[2], recieved_string_split[3]) + "\n");

        }
    });
});

server.listen(PORT, HOST);
}


