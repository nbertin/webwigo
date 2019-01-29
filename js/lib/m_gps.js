/*
    Copyright (C) 2019 Nicolas Bertin

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

define([
  "lib/m_map"
], function(mMAP) {

  var _this        = {}

  // constants
  var gpstimer_dly = 1000
  var accuracy_min = 2
  var accuracy_low = 32
  var accuracy_max = 1024

  // variables
  var gpstimer_tid = undefined
  var isrunning    = false
  var accuracy     = accuracy_max
  var currloc      = {
    lat: 360.0000,
    lng: 360.0000
  }

  function gpsTimerUpdate() {
    if (accuracy == accuracy_min)
      accuracy = Math.floor((Math.random() * accuracy_low) + accuracy_min)
    accuracy = Math.floor((Math.random() * accuracy) + accuracy_min)

    _this.trigger("evt-gps-accuracy-change", accuracy)
  }

  _this.setPlayerLocation = function(loc) {
    currloc.lat = loc.lat
    currloc.lng = loc.lng
    if (isrunning)
      _this.trigger("evt-gps-set-player-location", currloc, accuracy)
  }

  _this.getPlayerLocation = function() {
    return currloc
  }

  _this.Start = function() {
    // notify listeners
    isrunning = true
    _this.trigger("evt-gps-on-off-status", isrunning)
    // start timer and update location/accuracy
    gpstimer_tid = setInterval(gpsTimerUpdate, gpstimer_dly)
    _this.setPlayerLocation(currloc)
  }

  _this.Stop = function() {
    // notify listeners
    isrunning = false
    _this.trigger("evt-gps-on-off-status", isrunning)
    // stop timer and update accuracy
    clearInterval(gpstimer_tid)
    accuracy  = accuracy_max
    _this.trigger("evt-gps-accuracy-change", accuracy)
  }

  _this.OnOff = function() {
    if (isrunning)
      _this.Stop()
    else
      _this.Start()
  }

  _this.Create = function() {
    _this.listenTo(mMAP, "evt-map-set-player-location", function(loc) {
      _this.setPlayerLocation(loc)
    })
    //_this.Stop()
  }

  // extends module with Backbone Events
  _.extend(_this, Backbone.Events)
  return _this
});
