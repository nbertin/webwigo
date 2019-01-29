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
  "app/app0"
], function(App) {

  var ViewConf = Backbone.View.extend({
    el        : $("#id-conf"),
    initialize: function(options) {
      // check if section is active on initialization.
      if ($("#section-conf").hasClass("active"))
        $.fn.fullpage.moveTo(SECTION_HOME)

      // fullpage plugin event: section leave
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        if (dstidx == SECTION_CONF)
          if ($("#id-tab-btn-conf").hasClass("disabled")) {
            if (direction === "up")
              $.fn.fullpage.moveTo(dstidx-1)
            else
              $.fn.fullpage.moveTo(dstidx+1)
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
