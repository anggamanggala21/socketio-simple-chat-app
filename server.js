const http = require("http");
const fs = require("fs").promises;

const host = "192.168.137.220";
const port = 3000;

const requestListener = (req, res) => {
	fs.readFile(__dirname + "/index.html")
		.then((contents) => {
			res.setHeader("Content-Type", "text/html");
			res.writeHead(200);
			res.end(contents);
		})
}

const server = http.createServer(requestListener);
const io = require('socket.io')(server);
io.on('connection', client => {
	console.log("User connected");
	client.on('chat', (msg) => {
		io.emit('chat', msg);
	})
  	client.on('disconnect', () => { 
  		console.log('User disconnect !')
  	});
});
server.listen(port, host, () => {
	console.log("Server is running on http://" + host + ":" + port);
})