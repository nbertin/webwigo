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
          }
          cols++
          if (cols == 5)
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
