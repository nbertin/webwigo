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
  "text!app/tpl/load.html",
  "lib/m_rdr",
  "lib/m_url",
  "app/app0"
], function(T, mRDR, mURL, App) {

  var _handle = undefined
  var _params = undefined

  function isURI() {
    return (typeof _handle == "string")
  }
  
  var ViewLoad = Backbone.View.extend({
    el        : $("#id-tab-load-toaster"),
    template  : _.template(T),
    initialize: function() {
      this.render()
      var that = this
      $("#id-load-loc-inp").on("change", function() {
        that._load()
      })

      // fullpage plugin event: section leave
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        this.hide()
      })

      // cartridge reader event: loaded
      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        var that = this
        _.delay(function() {
          that.hide()
        }, (isURI() ? 3000 : 0))
      })
    },
    render: function() {
      this.$el.html(this.template())
      return this
    },
    load: function(uri) {
      if (uri) {
        _params = mURL.parse(uri)
        this.show(true)
        if (_params.error) {
          $("#id-load-err-msg").html(_params.error)
          $("#id-load-err"    ).show()
        } else {
          _handle = uri
          var that = this
          _.delay(function() {
            that._read()
          }, 1000)
        }
      }
    },
    reload: function() {
      this._read()
    },
    toggle: function() {
      if (this.$el.is(":visible"))
        this.hide()
      else
        this.show(false)
    },
    show: function(remote) {
      $("#id-load-err").hide()
      if (remote) {
        $("#id-load-msg").html("Loading cartridge from online provider")
        $("#id-load-rem").show()
        $("#id-load-loc").hide()

        if (_params.cart_provider_name == undefined)
          _params.cart_provider_name = "server"

        if (_params.cart_name == undefined)
          _params.cart_name = "cartridge"

        $("#id-load-rem-src").html(_params.cart_provider_name)
        $("#id-load-rem-nam").html(_params.cart_name)
        $("#id-load-rem-typ").html(_params.cart_type)
      } else {
        $("#id-load-msg").html("Load cartridge from your computer")
        $("#id-load-rem").hide()
        $("#id-load-loc").show()
      }
      this.$el.show("slide", { direction: "up" }, 500)
    },
    hide: function() {
      this.$el.hide("slide", { direction: "up" }, 500)
    },
    _read: function() {
      if (_handle != undefined) {
        var that = this
        mRDR.read(
          _handle,
          // onProgress
          function(val, max) {
            $("#id-load-inf-rcv").html(val)
            //if (max >= val) {
            //  $("#id-load-rem").show()
            //  $("#id-load-rem-bar").css("width", ((val * 100)/max)+"%")
            //}
          },
          // onStatus
          function(msg) {
            var $id = $("#id-load-inf-msg")
            var sep = ""
            if ($id.html())
              sep = ", "
            $id.append(sep+msg)
            $("#id-load-inf").show()
          },
          // onError
          function(msg) {
            if (isURI()) {
              $("#id-load-rem").hide()
              $("#id-load-inf").hide()
            //  $("#id-load-loc-nam").html(_handle)
            //  $("#id-load-loc"    ).show()
            }
            _handle = undefined
            $("#id-load-err-msg").html(msg)
            $("#id-load-err"    ).show()
          }
        )
      }
    },   
    _load: function() {
      $("#id-load-err").hide()
      var inputfile = $("#id-load-loc-inp")
      _handle = inputfile[0].files[0]
      inputfile.replaceWith(inputfile = inputfile.clone(true))
      this._read()
    }
  });
  
  // singleton
  var _instance;
  return function getViewLoad() {
    return (_instance = (_instance || new ViewLoad()))
  }
});
