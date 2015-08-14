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

define([
  "string",
  "text!app/tpl/gpsr.html",
  "lib/m_gps",
  "lib/m_rdr",
  "lib/m_emu",
  "app/app0",
], function(string, T, mGPS, mRDR, mEMU, App) {
  
  var _gpsdata = {
    run: true,
    lat: undefined,
    lng: undefined,
    acc: undefined
  }

  function _lat(ddd) {
    if (ddd) {
      var abs = Math.abs(ddd)
      var sgn = ((ddd > 0) ? +1 : -1)
      var deg = abs | 0
      var min = 60 * (abs % 1)
      return string.sprintf("%s%02d'%2.3f", ((sgn > 0) ? "N" : "S"), Math.abs(deg), min)
    }
    return "..."
  }

  function _lng(ddd) {
    if (ddd) {
      var abs = Math.abs(ddd)
      var sgn = ((ddd > 0) ? +1 : -1)
      var deg = abs | 0
      var min = 60 * (abs % 1)
      return string.sprintf("%s%03d'%2.3f", ((sgn > 0) ? "E" : "W"), Math.abs(deg), min)
    }
    return "..."
  }

  function _acc(acc) {
    if (acc && (acc < 1024))
      return acc + "m"
    return "..."
  }

  function _bar(acc) {
    return "#444"
  }

  var ViewGpsr = Backbone.View.extend({
    el        : $("#id-tab-gpsr-toaster"),
    events    : {
      "click #id-gpsr-onoff": function() {
        _gpsdata.run = !_gpsdata.run
        // FIXME
        //if (_gpsdata.run)
        //  mGPS.Stop()
        //else
        //  mGPS.Start()
        this.render()
      }
    },
    template  : _.template(T),
    initialize: function() {
      this.render()

      // show the view on initialization if the active section is the map
      if ($("#section-emap").hasClass("active"))
        this.show()

      // fullpage plugin event: section leave
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        if (srcidx == SECTION_EMAP)
          this.hide()
        if (dstidx == SECTION_EMAP)
          this.show()
      })
      
      this.listenTo(mGPS, "evt-gps-set-player-location", function(loc, acc) {
        _gpsdata.lat = loc.lat
        _gpsdata.lng = loc.lng
        _gpsdata.acc = acc
        this.render()
      })
      
      this.listenTo(mGPS, "evt-gps-accuracy-change", function(acc) {
        $("#id-accuracy").html(_acc(acc)).css("color", _bar(acc))
      })
      
      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        _gpsdata.acc = undefined
        this.render()
      })

      this.listenTo(mEMU, "evt-emu-stopped", function() {
        _gpsdata.acc = undefined
        this.render()
      })
    },

    render: function() {
      this.$el.html(this.template({
        running  :      _gpsdata.run ,
        latitude : _lat(_gpsdata.lat),
        longitude: _lng(_gpsdata.lng),
        accuracy : _acc(_gpsdata.acc),
        strength : _bar(_gpsdata.acc)
      }))
      return this
    },

    show: function() {
        this.$el.show("slide", { direction: "up" }, 500)
    },

    hide: function() {
        this.$el.hide("slide", { direction: "up" }, 500)
    }
  });
  
  // singleton
  var _instance;
  return function getViewGpsr() {
    return (_instance = (_instance || new ViewGpsr()))
  }
});
