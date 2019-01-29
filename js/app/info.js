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
  "text!app/tpl/info.html",
  "lib/m_rdr",
  "lib/m_url",
  "app/app0"
], function(T, mRDR, mURL, App) {

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
        data.remote = mRDR.isRemote()
        if (data.remote) {
          var params = mURL.parse(mRDR.getHandle())
          data.provider     = params.cart_provider_name || "not specified"
          data.provider_url = params.cart_provider_url
        } else {
          data.filename = gwx.getCartFilename()
        }
        data.carttype = gwx.getCartType()
        if (gwx.getCartType() == gwx.TYPE_GWC) {
          var meta = gwx.getCartMetaData()
          data.cartname = meta.name
          data.activity = meta.activity
          data.version  = meta.version
          data.locless  = meta.locless ? "yes" : "no"
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
