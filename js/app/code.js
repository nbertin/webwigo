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
  "prism",
  "text!app/tpl/code.html",
  "lib/m_rdr",
  "app/app0"
], function(Prism, T, mRDR, App) {

  var ViewCode = Backbone.View.extend({
    el        : $("#id-code"),
    template  : _.template(T),
    initialize: function(options) {
      // check if section is active on initialization.
      if ($("#section-code").hasClass("active"))
        $.fn.fullpage.silentMoveTo(SECTION_HOME)

      // render section on cartridge loaded event
      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        this.render(gwx)
      })

      // fullpage plugin event: section leave
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        if (dstidx == SECTION_CODE)
          if ($("#id-tab-btn-code").hasClass("disabled")) {
            if (direction === "up")
              $.fn.fullpage.moveTo(dstidx-1)
            else
              $.fn.fullpage.moveTo(dstidx+1)
          }
      })
    },
    render: function(gwx) {
      this.$el.empty()
      if (gwx.canSeeCode()) {
        this.$el.html(this.template({
          code: gwx.getCode()
        }))
        _.defer(function() {
          Prism.highlightAll()
        })
        // force a rebuild to get the scrollbar
        $.fn.fullpage.reBuild();
        $("#id-tab-btn-code").toggleClass("disabled", false)
      } else {
        $("#id-tab-btn-code").toggleClass("disabled", true)
        if ($("#section-code").hasClass("active"))
          $.fn.fullpage.moveTo(SECTION_HOME)
      }
      return this
    }
  });

  // singleton
  var _instance;
  return function getViewCode() {
    return (_instance = (_instance || new ViewCode()))
  }
});
