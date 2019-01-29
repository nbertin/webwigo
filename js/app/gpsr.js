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
  "string",
  "text!app/tpl/gpsr.html",
  "lib/m_gps",
  "lib/m_map",
  "lib/m_rdr",
  "lib/m_emu",
  "app/app0",
], function(string, T, mGPS, mMAP, mRDR, mEMU, App) {

  var _gpsdata = {
    run: false,
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
    if (acc && (acc < 1000))
      return acc + "m"
    return "..."
  }

  var ViewGpsr = Backbone.View.extend({
    el        : $("#id-tab-gpsr-toaster"),
    events    : {
      "click #id-gpsr-toggle-onoff": function() {
        mGPS.OnOff()
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
        if (srcidx == SECTION_HOME)
          this.hide()
        if (dstidx == SECTION_HOME)
          this.show()
      })

      this.listenTo(mMAP, "evt-map-set-player-location", function(loc) {
        _gpsdata.lat = loc.lat
        _gpsdata.lng = loc.lng
        this.render()
      })

      this.listenTo(mGPS, "evt-gps-on-off-status", function(status) {
        _gpsdata.run = status
        this.render()
      })

      this.listenTo(mGPS, "evt-gps-accuracy-change", function(acc) {
        _gpsdata.acc = acc
        $("#id-accuracy").html(_acc(_gpsdata.acc))
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
        accuracy : _acc(_gpsdata.acc)
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
