const http = require("http");
const fs = require("fs").promises;
const HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher()

const host = "chat.anggamanggala.com";
const port = 3000;

const requestListener = (req, res) => {	

	try {
		dispatcher.dispatch(req, res);
	} catch (error) {
		console.log(error);
	}
}

const server = http.createServer(requestListener);

dispatcher.onGet("/", function(req, res) {
	
	fs.readFile(__dirname + "/index.html")
		.then((contents) => {
			res.setHeader("Content-Type", "text/html");
			res.writeHead(200);
			res.end(contents);
		})
});

dispatcher.onGet("/login", function(req, res) {
	fs.readFile(__dirname + "/login.html")
		.then((contents) => {
			res.setHeader("Content-Type", "text/html");
			res.writeHead(200);
			res.end(contents);
		})
});

dispatcher.onError(function(req, res) {
    res.writeHead(404);
    res.end("Error, the URL doesn't exist");
});

const io = require('socket.io')(server);
io.on('connection', client => {		

	fs.readFile(__dirname + '/db.json', 'utf8')
	.then((res) => {
		let datas = { chat: [] }
		if (res) datas = JSON.parse(res)
		io.emit('datas', datas.chat)
	})

	client.on('chat', (msg) => {
		io.emit('chat', msg);

		fs.readFile(__dirname + '/db.json', 'utf8')
		.then((res) => {

			let datas = res ? JSON.parse(res) : {}
			if (!datas.chat) datas.chat = []
			datas.chat.push(msg)
			
			fs.writeFile(__dirname + '/db.json', JSON.stringify(datas))

			io.emit('datas', datas.chat ? datas.chat : [])
			
		})
		
	})

  	client.on('disconnect', () => { 
  		console.log('User disconnect !')
	});
	  
});
server.listen(8080)