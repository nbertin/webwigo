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
  "text!app/tpl/info.html",
  "lib/m_rdr",
  "app/app0"
], function(T, mRDR, App) {

  var data = {
    filename: "",
    carttype: undefined,
    cartname: "",
    activity: "",
    version : "",
    locless : "",
    author  : "",
    player  : "",
    nfiles  : 0 ,
    nsource : 0 ,
    nimages : 0 ,
    nsounds : 0
  }
  
  var ViewInfo = Backbone.View.extend({
    el        : $("#id-tab-info-toaster"),
    template  : _.template(T),
    initialize: function() {      
      // fullpage plugin event: section leave
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        this.hide()
      })

      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        //if (isURI()) {
        //  var uri = mURL.parse(_handle)
        //  _cartname = uri.cart_name + " ("+uri.cart_type+") from ["+uri.cart_provider_name+"]"
        //} else {
          data.filename = gwx.getCartFilename()
          data.carttype = gwx.getCartType()
          if (gwx.getCartType() == gwx.TYPE_GWC) {
            var meta = gwx.getCartMetaData()
            data.cartname = meta.name     
            data.activity = meta.activity
            data.version  = meta.version
            data.locless  = meta.locless
            data.author   = meta.author
            data.player   = gwx.getPlayerName()
          }
          var files = gwx.getMediasList()
          data.nfiles  = files.length
          data.nsource = 0
          data.nimages = 0
          data.nsounds = 0
          data.nothers = 0
          for(var n = 0 ; n < files.length ; n++) {
            if (gwx.isCode(files[n])) {
              data.nsource++
              continue
            }
            if (gwx.isImage(files[n])) {
              data.nimages++
              continue
            }
            if (gwx.isSound(files[n])) {
              data.nsounds++
              continue
            }
            nothers++
          }
        //}
      })
    },
    render: function() {
      this.$el.html(this.template(data))
      return this
    },
    toggle: function() {
      if (this.$el.is(":visible"))
        this.hide()
      else
        this.show()
    },
    show: function() {
      this.render()
      this.$el.show("slide", { direction: "up" }, 500)
    },
    hide: function() {
      this.$el.hide("slide", { direction: "up" }, 500)
    },
  });
  
  // singleton
  var _instance;
  return function getViewInfo() {
    return (_instance = (_instance || new ViewInfo()))
  }
});
