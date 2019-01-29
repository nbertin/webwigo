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
  "text!app/tpl/data.html",
  "lib/m_rdr",
  "app/app0"
], function(T, mRDR, App) {

  var ViewData = Backbone.View.extend({
    el        : $("#id-data"),
    template  : _.template(T),
    initialize: function(options) {
      // check if section is active on initialization.
      if ($("#section-data").hasClass("active"))
        $.fn.fullpage.silentMoveTo(SECTION_HOME)

      // render section on cartridge loaded event
      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        this.render(gwx)
      })

      // fullpage plugin event: section leave
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        if (dstidx == SECTION_DATA)
          if ($("#id-tab-btn-data").hasClass("disabled")) {
            if (direction === "up")
              $.fn.fullpage.moveTo(dstidx-1)
            else
              $.fn.fullpage.moveTo(dstidx+1)
          }
      })
    },
    render: function(gwx) {
      this.$el.empty()
      if (gwx.canSeeMedias()) {
        var rows = 0
        var cols = 0
        var that = this

        $.each(gwx.getMediasList(), function(idx, filename) {
          if (cols == 0) {
            rows++
            that.$el.append(that.template({
              add: "row",
              id : "id-data-row-"+rows
            }))
          }
          if (gwx.isCode(filename)) {
            $("#id-data-row-"+rows).append(that.template({
              add     : "code",
              imagesrc: "img/code.png",
              filename: filename
            }))
          }
          else
          if (gwx.isImage(filename)) {
            gwx.getMediaData(filename, function(src) {
              $("#id-data-row-"+rows).append(that.template({
                add     : "image",
                imagesrc: src,
                filename: filename
              }))
            })
          }
          else
          if (gwx.isSound(filename)) {
            $("#id-data-row-"+rows).append(that.template({
              add     : "sound",
              imagesrc: "img/sound.png",
              filename: filename
            }))
          }
          cols++
          if (cols == 6)
            cols = 0
        })
        $("#id-tab-btn-data").toggleClass("disabled", false)
        _.delay(function() {
          // data will be displayed: force a rebuild to get the scrollbar
          $.fn.fullpage.reBuild()
        }, 250)
      } else {
        $("#id-tab-btn-data").toggleClass("disabled", true)
        if ($("#section-data").hasClass("active"))
          $.fn.fullpage.moveTo(SECTION_HOME)
      }
      return this
    }
  });

  // singleton
  var _instance;
  return function getViewData() {
    return (_instance = (_instance || new ViewData()))
  }
});
