/*
The MIT License (MIT)

Copyright (c) 2015 Nicolas BERTIN

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

define([], function() {

  var _this        = {}

  var gpstimer_tid = undefined
  var gpstimer_dly = 1000
  var accuracy_min = 2
  var accuracy_low = 32
  var accuracy_max = 2048
  var accuracy     = accuracy_max
  var currloc      = { lat: 360.0000, lng: 360.0000 }

  function gpsTimerUpdate() {
    if (accuracy == accuracy_min)
      accuracy = Math.floor((Math.random() * accuracy_low) + accuracy_min)
    accuracy = Math.floor((Math.random() * accuracy) + accuracy_min)

    _this.trigger("evt-gps-accuracy-change", accuracy)
  }

  function gpsEnable(enable) {
    accuracy = accuracy_max
    if (gpstimer_tid != undefined)
      clearInterval(gpstimer_tid)
    if (enable)
      gpstimer_tid = setInterval(gpsTimerUpdate, gpstimer_dly)
  }

  _this.setPlayerLocation = function(loc) {
    currloc.lat = loc.lat
    currloc.lng = loc.lng
    _this.trigger(
      "evt-gps-set-player-location", currloc, accuracy
    )
  }

  _this.getPlayerLocation = function() {
    return currloc
  }

  _this.Start = function(loc) {
    currloc.lat = loc.lat
    currloc.lng = loc.lng
    gpsEnable(true)
  }
  
  // FIXME: should be Stop
  _this.Reset = function() {
    gpsEnable(false)
  }

  // FIXME: should call Stop
  _this.Create = function() {
    _this.Reset()
  }

  // extends module with Backbone Events
  _.extend(_this, Backbone.Events)
  return _this
});
