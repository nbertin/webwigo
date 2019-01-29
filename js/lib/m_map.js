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
  "lib/m_rdr"
], function(mRDR) {

  var _this = {}

  _this.setPlayerLocation = function(loc) {
    var bounds  = {
      lat:  84,
      lng: 180
    }
    // fix location according to bounds
    if (Math.abs(loc.lat) > bounds.lat)
      loc.lat = ((loc.lat > 0) ? +1 : -1) * bounds.lat
    if (Math.abs(loc.lng) > bounds.lng)
      loc.lng = ((loc.lng > 0) ? +1 : -1) * bounds.lng

    _this.trigger("evt-map-set-player-location", loc)
    return loc
  }

  //
  // Called when a zone is updated
  //
  // FIXME: should be Update()
  // FIXME: evt-map-zone-inserted
  // FIXME: evt-map-zone-removed
  _this.RefreshZone = function(zone) {
    if (zone.active) {
      if (zone.visible || mRDR.getReader().canSeeHiddenZones()) {
        _this.trigger("evt-map-insert-zone", zone)
      }
    } else {
      _this.trigger("evt-map-remove-zone", zone)
    }
  }

  _this.Reset = function() {
    _this.trigger("evt-map-reset")
  }

  _this.Start = function(loc) {
    _this.trigger("evt-map-start", _this.setPlayerLocation(loc))
  }

  _this.Create = function() {
   _this.trigger("evt-map-create")
  }

  // extends module with Backbone Events
  _.extend(_this, Backbone.Events)
  return _this
});
