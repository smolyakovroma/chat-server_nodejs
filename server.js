const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(3000).sockets;

//Connect to mongo
mongo.connect("mongodb://127.0.0.1:27017"
    , { useNewUrlParser: true }, function (err, dbclient) {
    if(err){
        throw err;
    }

    var db = dbclient.db('mongochat');

    console.log("mongodb connected");

    client.on("connection", function (socket) {

        console.log("user connected!")

        let chat = db.collection("chats");

        sendStatus = function (s) {
            socket.emit("status", s);
        }
        
        chat.find().limit(100).sort({_id: 1}).toArray(function (err, res) {
            if(err) { throw err;}
            socket.emit("output", res);
        })

        socket.on("input", function (data) {
            let name = data.name;
            let message = data.message;

            if(name === '' || message === ''){
                sendStatus("please enter name and message!");
            } else {
                chat.insert({name: name, message: message}, function f() {
                    client.emit("output", [data]);

                    sendStatus({
                        message: "Message sent",
                        clear: true
                    });
                });
            }

        });
        
        socket.on("clear", function (data) {
            chat.remove({}, function () {
               socket.emit("cleared");
            });
        })
    });

});
