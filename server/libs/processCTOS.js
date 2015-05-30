/*jslint node: true, plusplus: true, unparam: false, nomen: true*/

/* This is the YGOCore routing and proxy system. The System checks
a number of CTOS commands and from them works out if to just route
the connection to an existing connection or start a new YGOCore.
If a new YGOCore is needed it works out what config file is needed
for that instance of dueling based on the `roompass` in the
connection string of the `CTOS_JOIN` command */


var portmin = 30000 + process.env.PORTRANGE * 100, //Port Ranges
    portmax = (30000 + process.env.PORTRANGE * 100) + 100,
    handleCoreMessage, // Send messages BACK to the MASTER PROCESS
    startDirectory = __dirname,
    fs = require('fs'),
    childProcess = require('child_process'),
    net = require('net'),
    cluster = require('cluster'),
    parsePackets = require('./parsepackets.js'), //Get data sets out of the YGOPro Network API.
    recieveCTOS = require('./recieveCTOS'), // Translate data sets into messages of the API

    gamelist = {},
    //geoip = require('geoip-lite');
    winston = require('winston'),
    path = require('path');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.DailyRotateFile)({ filename: ".\\http\\logs\\chat.log"})
    ]
});


/* Listen to the MASTER  process for messages to the SLAVE 
processes. That message will be an update to the internal
gamelist of each SLAVE process */

if (cluster.isWorker) {
    process.on('message', function (message) {
        'use strict';
        if (message.gamelist) {
            gamelist = message.gamelist;
        }
    });
}



function processTask(task, socket) {
    'use strict';
    var i = 0,
        l = 0,
        output = [];
    for (i; task.length > i; i++) {
        output.push(recieveCTOS(task[i], socket.username, socket.hostString));
    }

    for (l; output.length > l; l++) {
        if (output[l].CTOS_JOIN_GAME) {
            socket.active = true;
            socket.hostString = output[l].CTOS_JOIN_GAME;
        }
        if (output[l].CTOS_PLAYER_INFO) {
            socket.username = output[l].CTOS_PLAYER_INFO;
        }
    }
}


/* After determining the routing location, then connect the CLIENT to
the proper YGOCore and monitor the connection */

function connectToCore(port, data, socket) {
    'use strict';

    socket.active_ygocore = net.connect(port, '127.0.0.1', function () {
        
        /* Unlimit the speed of the connection
        by not doing processing on the data
        to incease up network optimization */
        socket.active_ygocore.setNoDelay(true);
        
        /*proxy the data*/
        socket.active_ygocore.write(data);
        
        socket.active = false;
        socket.active_ygocore.on('data', function (core_data) {
            socket.write(core_data);
        });

        socket.on('close', function () {
            if (socket.active_ygocore) {
                socket.active_ygocore.end();
            }
        });
        socket.on('error', function (error) {
            socket.active_ygocore.end();
        });
    });
    socket.active_ygocore.on('error', function (error) {
        console.log('::CORE', error);
        if (socket.alpha) {
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data);
        }
        socket.end();
    });
    socket.active_ygocore.on('close', function () {
        if (socket.alpha) {
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data);
        }
        socket.end();
    });

}

/* Each YGOCore needs to operate on its own port,
each SLAVE is given a range to loop through. This
is actually a very poor way of doing this and
frequently fails; rewrite is needed*/

function portfinder(min, max, callback) {
    'use strict';
    //console.log(gamelist);
    var rooms,
        activerooms = [],
        i = min;
    for (rooms in gamelist) {
        if (gamelist.hasOwnProperty(rooms)) {
            activerooms.push(gamelist[rooms].port);
        }
    }
    for (i; max > i; i++) {
        if (activerooms.indexOf(i) === -1) {
            callback(null, i);
            return;
        }
    }
}

/* The routing is done based on the
game string or rather `roompass` in
connection request */

function pickCoreConfig(socket) {
    'use strict';
    var output = 'ini/';
    if (socket.hostString.indexOf(",21,") > -1) {
        return "ini/goat.ini";
    }
    if (socket.hostString[0] > '2') {
        return output + socket.hostString[0] + '-config.ini';
    } else {
        /*load default configuration */
        return output + 'config.ini';
    }
}

/* send the YGOCore API commands back to the main process, some cleanup
is needed before sending the message. Basic logging for finding idiots
later after they have misbehaved or providing administrative ablities
to kill or act on games */

function handleCoreMessage(core_message_raw, port, socket, data, pid) {
    'use strict';
    if (core_message_raw.toString().indexOf("::::") < 0) {
        return;
    }
    var core_message = core_message_raw.toString().split('|'),
        gamelistmessage = {
            messagetype: 'coreMessage',
            coreMessage: {
                core_message_raw: core_message_raw.toString(),
                port: port,
                pid: pid
            }
        };
    if (core_message[0].trim() === '::::network-ready') {
        connectToCore(port, data, socket);
    }
    if (core_message[0].trim() === '::::end-duel') {
        socket.core.kill();
    }
    if (core_message[0].trim() === '::::chat') {
        console.log(socket.remoteAddress, core_message.toString().trim());
    }
    process.send(gamelistmessage);
}




function startCore(port, socket, data, callback) {
    //console.log(socket.hostString);
    'use strict';
    fs.exists(startDirectory + '../../ygocore/YGOServer.exe', function (exist) {
        if (!exist) {
            console.log('core not found at ' + __dirname + '/../ygocore/YGOServer.exe');
            return;
        }

        var configfile = pickCoreConfig(socket),
            params = port + ' ' + configfile;
        //custom_error(console.log(' initiating core for ' + socket.username + ' on port:' + port + ' with: ' + configfile));
        if (socket.hostString.length !== 24) {
            return;
        }
        socket.core = childProcess.spawn(startDirectory + '/../ygocore/YGOServer.exe', [port, configfile], {
            cwd: startDirectory + '/../ygocore'
        }, function (error, stdout, stderr) {
            console.log(error, stdout, stderr);
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data, socket.core.pid);
        });
        socket.core.stdout.on('error', function (error) {
            console.log(error);
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data, socket.core.pid);
            socket.core.kill();
        });
        socket.core.stdout.on('data', function (core_message_raw) {
            handleCoreMessage(core_message_raw, port, socket, data, socket.core.pid);
        });

    });
}



function processIncomingTrasmission(data, socket, task) {
    'use strict';
    processTask(task, socket);
    if (!socket.active_ygocore && socket.hostString) {
        if (gamelist[socket.hostString]) {
            socket.alpha = false;
            connectToCore(gamelist[socket.hostString].port, data, socket);
            console.log(socket.username + ' connecting to ' + gamelist[socket.hostString].players[0]);
        } else {
            console.log(socket.username + ' connecting to new core');

            portfinder(++portmin, portmax, function (error, port) {
                socket.alpha = true;
                startCore(port, socket, data);
            });
        }
        //console.log('process complete', gamelist);
        if (portmin === portmax) {
            portmin = 30000 + process.env.PORTRANGE * 100;
        }
        return;
    }
    return data;
}

module.exports = processIncomingTrasmission;
