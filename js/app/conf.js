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
  "app/app0"
], function(App) {

  var ViewConf = Backbone.View.extend({
    el        : $("#id-conf"),
    initialize: function(options) {
      // check if section is active on initialization.
      if ($("#section-conf").hasClass("active"))
        $.fn.fullpage.moveTo(SECTION_EMAP)

      // fullpage plugin event: section leave
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        if (dstidx == SECTION_CONF)
          if ($("#id-tab-btn-conf").hasClass("disabled")) {
            if (direction === "up")
              $.fn.fullpage.moveTo(SECTION_DATA)
            else
              $.fn.fullpage.moveTo(SECTION_HELP)
          }
      })
    },
    render: function() {
      return this
    }
  });

  // singleton
  var _instance;
  return function getViewConf() {
    return (_instance = (_instance || new ViewConf()))
  }
});
