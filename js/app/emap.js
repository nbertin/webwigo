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
  "leafletbing",
  "awesomemarkers",
  "custombutton",
  "lib/m_map",
  "app/app0"
], function(leafletbing, AwesomeMarkers, custombutton, mMAP, App) {
  
  var map    = undefined
  var player = undefined
  var origin = undefined
  var zones  = []

  function _mapOnPlayerMoveEnd(event) {
    player.setLatLng(
      mMAP.setPlayerLocation(event.target.getLatLng())
    )
  }

  function _mapOnPlayerMove(event) {
    player.setLatLng(
      mMAP.setPlayerLocation(event.target.getLatLng())
    )
  }

  function _mapPanTo(location) {
    map.panTo(location)
  }

  function _mapCreate(div, loc) {
    map = L.map(div, {
      minZoom    : 3,
      maxZoom    : 18,
    })
    map.setView(loc, 16)
    map.setMaxBounds([[-85, -190], [+85, +190]])

    // layers setup
    var osmll = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://www.openstreetmap.org/">OpenStreetMap</a>'
    })

    var broad = new L.BingLayer("Ahu63wITytGR4Yr2oT0_Ow60Ulern6C8LWf_50dpDVE8Fk3E6VSWge1jSF_px2V1", {
      type: 'Road'
    });
    var bhybr = new L.BingLayer("Ahu63wITytGR4Yr2oT0_Ow60Ulern6C8LWf_50dpDVE8Fk3E6VSWge1jSF_px2V1", {
      type: 'AerialWithLabels'
    });
    var bsate = new L.BingLayer("Ahu63wITytGR4Yr2oT0_Ow60Ulern6C8LWf_50dpDVE8Fk3E6VSWge1jSF_px2V1", {
      type: 'Aerial'
    });

    layers = {
      "&nbsp;Bing Road"     : broad,
      "&nbsp;Bing Hybrid"   : bhybr,
      "&nbsp;Bing Satellite": bsate,
      "&nbsp;OSM Legacy"    : osmll
    }

    // select default layer
    map.addLayer(broad)

    // map controls
    L.control.layers(layers, {}, {
      position: "topleft"
    }).addTo(map)
    
    L.control.custombutton({
      title   : "Zoom and center map to player location",
      icon    : "fa fa-user fa-lg",
      callback: function() {
        map.setView(player.getLatLng(), 16)
      }
    }).addTo(map)

    L.control.custombutton({
      title   : "Zoom and center map to cartridge start location",
      icon    : "fa fa-circle-o fa-lg",
      callback: function() {
        map.setView(origin, 16)
      }
    }).addTo(map)

    L.control.custombutton({
      title   : "Move player to cartridge start location",
      icon    : "fa fa-dot-circle-o fa-lg",
      callback: function() {
        player.setLatLng(
          mMAP.setPlayerLocation(origin)
        )
        map.setView(origin, 16)
      }
    }).addTo(map)

    L.control.scale({
      position: "bottomleft",
      maxWidth: 200
    }).addTo(map)

    // player
    player = L.marker(loc, {
      title       : "Player",
      draggable   : true,
      zIndexOffset: 1000,
      icon        : L.AwesomeMarkers.icon({
        icon       : "user" ,
        prefix     : "fa"   ,
        markerColor: "green"
      })
    })
    player.on("dragend", _mapOnPlayerMoveEnd)
    player.on("drag"   , _.throttle(_mapOnPlayerMove, 500))
    player.addTo(map)
  }

  var ViewEMap = Backbone.View.extend({
    initialize: function() {
      // FIXME: use localstorage to retrieve default location
      // default location = Paris
      origin = {
        lat: 48.8567,
        lng:  2.3508
      }
    
      _mapCreate($("#id-emap")[0], origin)

      mMAP.Create()
      mMAP.Start (origin)

      // fullpage plugin event: redraw map when section1 (= map) is loaded
      this.listenTo(App, "evt-app-on-section-loaded", function(anchor, index) {
        if (index == 1)
          map.invalidateSize()
      })

      // fullpage plugin event: redraw map when window is resized
      this.listenTo(App, "evt-app-on-window-resize", function() {
        map.invalidateSize()
      })

      // mMAP.Setup(location) event 
      this.listenTo(mMAP, "evt-map-start", function(loc) {
        player.setLatLng(loc)
        _mapPanTo(loc)
        origin = loc
      })

      // mMAP.Reset() event
      this.listenTo(mMAP, "evt-map-reset", function() {
        for(var i = 0 ; i < zones.length ; i++) {
          var zone = zones[i]
          if (zone && map.hasLayer(zone))
            map.removeLayer(zone)
          zones[i] = null
        }
      })

      // mMAP.RefreshZone(zone) event (insert a zone)
      this.listenTo(mMAP, "evt-map-insert-zone", function(zone) {
        var id = zone.idx

        if (zones[id] == null)
          zones[id] = L.polygon([], { weight: 3 })

        if (zone.visible)
          zones[id].setStyle({ color: "green" })
        else
          zones[id].setStyle({ color: "red" })
    
        zones[id].setLatLngs(zone.points)
        zones[id].bindPopup (zone.name+" ("+(zone.visible ? "visible" : "not visible")+")")

        if (! map.hasLayer(zones[id]))
          zones[id].addTo(map)
        zones[id].redraw()
      })

      // mMAP.RefreshZone(zone) event (remove a zone)
      this.listenTo(mMAP, "evt-map-remove-zone", function(zone) {
        var id = zone.idx
        if (map.hasLayer(zones[id]))
          map.removeLayer(zones[id])
      })
    },
  })

  // singleton
  var _instance;
  return function getViewEMap() {
    return (_instance = (_instance || new ViewEMap()))
  }
});
