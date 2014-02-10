var net = require('net');
console.log("helllo");
var socket = net.createConnection("99999", "127.0.0.1");
console.log('Socket created.');
socket.on('data', function(data) {
  // Log the response from the HTTP server.
  console.log('RESPONSE: ' + data);
}).on('connect', function() {
  // Manually write an HTTP request.
  socket.write("GET / HTTP/1.0\r\n\r\n");
}).on('end', function() {
  console.log('DONE');
}).on("error", function(error) {
	
});