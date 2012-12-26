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

var id;
var map;
var socket;
var skipMove;

function createMap(lat, lng, zoom) {
  var myOptions = {
    zoom : zoom,
    center : new google.maps.LatLng(lat, lng),
    mapTypeId : google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    panControl: false,
    streetViewControl: false,
    zoomControl: false
  };
 
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  google.maps.event.addListener(map, 'idle', function() {
    if (!skipMove) {
      socket.emit('sync', getInfo());
    }
  });
}

function move(data) {
  var startId = data.startid;
  var mapinfo = data.mapinfo;
  var relation = data.relation;

  var lat = mapinfo.lat;
  var lng = mapinfo.lng;
  var dlat0 = mapinfo.latrange;
  var dlng0 = mapinfo.lngrange;
  
  map.setZoom(mapinfo.zoom);
  map.setCenter(new google.maps.LatLng(lat, lng));
  var info = getInfo();
  var dlat = info.latrange;
  var dlng = info.lngrange;
  
  if (relation == 'tll') { lat += (dlat0 - dlat)/2; lng -= (dlng0 + dlng)/2; }
  if (relation == 'tlt') { lat += (dlat0 + dlat)/2; lng -= (dlng0 - dlng)/2; }
  if (relation == 'trr') { lat += (dlat0 - dlat)/2; lng += (dlng0 + dlng)/2; }
  if (relation == 'trt') { lat += (dlat0 + dlat)/2; lng += (dlng0 - dlng)/2; }
  if (relation == 'bll') { lat -= (dlat0 - dlat)/2; lng -= (dlng0 + dlng)/2; }
  if (relation == 'blb') { lat -= (dlat0 + dlat)/2; lng -= (dlng0 - dlng)/2; }
  if (relation == 'brr') { lat -= (dlat0 - dlat)/2; lng += (dlng0 + dlng)/2; }
  if (relation == 'brb') { lat -= (dlat0 + dlat)/2; lng += (dlng0 - dlng)/2; }
  
  skipMove = true;
  map.panTo(new google.maps.LatLng(lat, lng));
  setTimeout(function() {skipMove = false;}, 500);

  socket.emit('moveneighbours', {
    startid: startId, mapinfo: getInfo()
  });
}

function getInfo() {
  var center = map.getCenter();
  var bounds = map.getBounds();
  var latRange = bounds.getNorthEast().lat() - bounds.getSouthWest().lat();
  var lngRange = bounds.getNorthEast().lng() - bounds.getSouthWest().lng();
  return {
    lat: center.lat(),
    lng: center.lng(), 
    zoom: map.getZoom(), 
    latrange: latRange, 
    lngrange: lngRange
  };
}

$(document).ready(function() {
  createMap(35.684176, 139.774514, 11);

  socket = io.connect();

  $('#buttons div').hide().click(function() {
    $(this).hide();
    socket.emit('stick', {
      relation: $(this).attr('id'),
      mapinfo: getInfo()
    });
  });
  
  socket.on('connect', function() {
    id = socket.socket.sessionid;
  });

  socket.on('showbtn', function(_id) {
    if (id != _id) {
      $('#buttons div').fadeTo(1000, 0.6);
    }
  });

  socket.on('hidebtn', function() {
    $('#buttons div').hide();
  });
  
  socket.on('move', function(data) {
    move(data);
  });
});
