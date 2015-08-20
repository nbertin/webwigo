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

var WEBWIGO_VERSION = "2.0"

//
// fullpage plugin sections
//
var SECTION_HOME = 1
//var SECTION_TERM = 1
var SECTION_CODE = 2
var SECTION_DATA = 3
var SECTION_CONF = 4
var SECTION_HELP = 5


define([
  "screenfull",
], function(screenfull) {

  var _this = {}

  //
  // boot 1st stage (before fullpage rendering)
  //
  _this.init0 = function() {
    // update footer with webwigo version
    $('#id-webwigo-version').html(WEBWIGO_VERSION)
    
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
