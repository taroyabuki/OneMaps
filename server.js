/*
 *  OneMaps : One Map with multiple web browserS
 *  Copyright 2012 Taro YABUKI
 *
 *  This file is part of OneMaps.
 *
 *  OneMaps is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  OneMaps is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with OneMaps.  If not, see <http://www.gnu.org/licenses/>.
 */

var sockets = {};
var neighbours = {};
var movedNodes = {};
var newClientId;

var express = require('express')
  , http = require('http');

var app = express();

app.use(express.static(__dirname + '/public'));
//port: Heroku || AppFog || 3000
var port = process.env.PORT || process.env.VMC_APP_PORT || 3000;
var server = http.createServer(app).listen(port, function() {
  console.log('Express server listening on port ' + port);
});

var io = require('socket.io').listen(server);

function inverse(relation) {
  if (relation == 'tll') { return 'trr'; }
  else if (relation == 'tlt') { return 'blb'; }
  else if (relation == 'trr') { return 'tll'; }
  else if (relation == 'trt') { return 'brb'; }
  else if (relation == 'bll') { return 'brr'; }
  else if (relation == 'blb') { return 'tlt'; }
  else if (relation == 'brr') { return 'bll'; }
  else if (relation == 'brb') { return 'trt'; }
  return null;
}

function moveNeighbours(startId, id, mapinfo) {
  for (var i in neighbours[id]) {
    if (movedNodes[startId][i] == null) {
      movedNodes[startId][i] = true;
      sockets[i].emit('move', {
        startid: startId,
        relation: neighbours[id][i],
        mapinfo: mapinfo
      });
    }
  }
}

function sync(startId, mapinfo) {
  movedNodes[startId] = {};
  movedNodes[startId][startId] = true;
  moveNeighbours(startId, startId, mapinfo);
}

function numOfClients() {
  var num = 0;
  for (var i in sockets) {
    num++;
  }
  return num;
}

io.sockets.on('connection', function(socket) {
  newClientId = socket.id;
  sockets[newClientId] = socket;
  neighbours[newClientId] = {};

  io.sockets.emit('showbtn', newClientId);

  socket.on('stick', function(data) {
    io.sockets.emit('hidebtn');
    neighbours[socket.id][newClientId] = data.relation;
    neighbours[newClientId][socket.id] = inverse(data.relation);
    sync(socket.id, data.mapinfo);
  });
  
  socket.on('sync', function(mapinfo) {
    sync(socket.id, mapinfo);
  });
  
  socket.on('moveneighbours', function(data) {
    moveNeighbours(data.startid, socket.id, data.mapinfo);
  });
  
  socket.on('disconnect', function() {
    delete sockets[socket.id];
    delete neighbours[socket.id];
    for (var i in neighbours) {
      delete neighbours[i][socket.id];
    }
    delete movedNodes[socket.id];
  });
});

