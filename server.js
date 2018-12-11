const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(3000).sockets;


//Connect to mongo
mongo.connect("mongodb://127.0.0.1:27017"
    , { useNewUrlParser: true }, function (err, dbclient) {
    if(err){
        throw err;
    }

    var db = dbclient.db('sibpokerdb');

    console.log("mongodb connected");

    var playerCount = 0;
    var playerArr = new Set();



    client.on("connection", function (socket) {

        let gamers = new Array()
        console.log("user connected! "+socket.id)

        socket.on('disconnect', function() {
            console.log('user disconnected ');
            if(playerArr.has(socket.id)){
                playerArr.delete(socket.id);
                console.log('game end');
                sendStatusAll(["end game"]);
            }
            // playerCount--;
        });

        let users = db.collection("user");

        sendStatus = function (s) {
            socket.emit("status", s);
        }

        sendStatusAll = function (s) {
            client.emit("statusAll", s);
        }

        socket.on('adduser', function (name) {

            db.collection("user").findOne({name: name}, function(err, result) {
                if (err) throw err;
                if (result == undefined) {
                    console.log("user "+name+" not found");
                    users.insertOne({name: name, coin: 10000}, function (err, result) {
                        console.log(result.ops[0].name);
                        sendStatus(["add user", result.ops[0]._id, result.ops[0].coin])
                    });

                }else{

                sendStatus(["add user", result._id, result.coin]);
                }
                // db.close();
            });


        })

        socket.on('join', function (id) {
            //dev
            // playerCount++;
            // console.log(playerCount);
            // var k = 0;
            // if (playerCount == 2) {
            //     sendStatusAll(["new game"]);
            //
            //     timer(10, id);
            //
            //
            // }
            console.log(socket.id);

            // prod
            if (!playerArr.has(socket.id) && playerArr.size < 2) {
                playerArr.add(socket.id);
                console.log("add user for game " +playerArr.size)
                if(playerArr.size === 2){
                    sendStatusAll(["new game"]);
                    gamers = new Array();
                    playerArr.forEach(function (value) {
                        gamers.push(value);
                    })

                    console.log(gamers);

                    k = 0;
                    startTimer();
                }

            };
        });

        var k = 0;
        // let log = new Map();
        var timerId;
        // socket.on('action', function () {
        //     console.log("on action for k "+k)
        //     log.set(k, "action");
        //     k++;
        //     startTimer();
        //     // console.log("player turn completed")
        // });



        socket.on('action', function () {
            console.log("on action for timerId "+ timerId)
            clearTimeout(timerId)
            // log.set(k, "action");
            k++;
            sendStatusAll(["change size", socket.id]);
            // console.log("player turn completed")
        });

        socket.on('change size', function () {
            startTimer();
        });

        function startTimer() {

            // if(k == 0) {k = 1;}
            // else { k = 0;}
            console.log(k+" and dev "+ k%2);

            sendStatusAll(["start timer", socket.id]);


            timerId = setTimeout(function () {


                    // log.set(k, "timer off");
                    console.log("start paused timer");
                    k++;
                    startTimer();

            }, 10000);
            console.log("timerId "+timerId);
            // clearTimeout(timerId);

        }

        // function timer(k, id) {
        //     setTimeout(function () {
        //         if(k >= 0){
        //             sendStatusAll(["timer", k, id]);
        //             console.log(k);
        //             timer(--k, id);}
        //     }, 10000);
        // }

    });

});
