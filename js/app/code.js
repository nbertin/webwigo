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
        $.fn.fullpage.moveTo(SECTION_HOME)

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
        Prism.highlightAll()
        $("#id-tab-btn-code").toggleClass("disabled", false)
        $.fn.fullpage.reBuild();
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
