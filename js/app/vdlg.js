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
  "text!app/tpl/vdlg.html"
], function(T) {

  function _$id(that, s) {
    return $("#id-" + that.id + "-" + s)
  }

  var ViewVdlg = Backbone.View.extend({
    container: undefined,
    template : _.template(T),
    
    initialize: function(options) {
      this.container = $(options.container)

      this.$el.html(this.template({
        id   : options.id,
        title: options.title,
      }))

      this.$el.addClass("vdlg")

      var that = this
      _$id(this, "collapse").on("click", function() {
        that.collapse()
      })

      _$id(this, "restore").on("click", function() {
        that.restore()
      })
      that.show()
    },

    show: function() {
      this.$el.show()
    },

    hide: function() {
      this.$el.hide()
    },

    collapse: function() {
      _$id(this, "body"    ).height(0).hide()
      _$id(this, "collapse").hide()
      _$id(this, "restore" ).show()
    },

    restore: function() {
      _$id(this, "body"    ).height("auto").show()
      _$id(this, "collapse").show()
      _$id(this, "restore" ).hide()
    }
  });

  return ViewVdlg; 
});
