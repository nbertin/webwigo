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

var WEBWIGO_VERSION = "2.0.1"

//
// fullpage plugin sections
//
var SECTION_HOME = 1
var SECTION_CODE = 2
var SECTION_DATA = 3
var SECTION_CONF = 4
var SECTION_HELP = 5


define([
  "screenfull"
], function(screenfull) {

  var _this = {}

  //
  // boot 1st stage (before fullpage rendering)
  //
  _this.init0 = function() {
    // fullscreen management (screenfull)
    if (screenfull.enabled) {
      $("#id-menu1-separator").show()
      $("#id-fullscreen-ico" ).addClass("fa-expand")

      $("#id-fullscreen-btn" ).show()
      $("#id-fullscreen-btn" ).click(function() {
        screenfull.toggle()
      });

      document.addEventListener(screenfull.raw.fullscreenchange, function () {
        if (screenfull.isFullscreen)
          $("#id-fullscreen-ico").removeClass("fa-expand"  ).addClass("fa-compress")
        else
          $("#id-fullscreen-ico").removeClass("fa-compress").addClass("fa-expand")
      });
    }
  }

  //
  // propagate fullpage plugin events
  //
  _this.onSectionLeave = function(srcidx, dstidx, direction) {
    _this.trigger("evt-app-on-section-leave", srcidx, dstidx, direction)
  }

  _this.onSectionLoaded = function(anchor, index) {
    _this.trigger("evt-app-on-section-loaded", anchor, index)
  }

  _this.onWindowResize = function() {
    _this.trigger("evt-app-on-window-resize")
  }

  // extends module with Backbone Events
  _.extend(_this, Backbone.Events)
  return _this
});
