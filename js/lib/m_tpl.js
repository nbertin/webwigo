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
  "string",
  "text!lib/tpl/luamsg.html",
  "text!lib/tpl/splash.html",
  "text!lib/tpl/routxl.html",
  "text!lib/tpl/routxs.html",
  "text!lib/tpl/main_0.html",
  "text!lib/tpl/main_i.html",
  "text!lib/tpl/msgbox.html",
  "text!lib/tpl/inpbox.html",
  "text!lib/tpl/list_0.html",
  "text!lib/tpl/list_i.html",
  "text!lib/tpl/dtl__0.html",
  "text!lib/tpl/dtl__i.html"
], function(string, luamsg, splash, routxl, routxs, main_0, main_i, msgbox, inpbox, list_0, list_i, dtl__0, dtl__i) {

  var _this = {}

  // templates
  _this.luamsg = luamsg
  _this.splash = splash
  _this.routxl = routxl
  _this.routxs = routxs
  _this.main_0 = main_0
  _this.main_i = main_i
  _this.msgbox = msgbox
  _this.inpbox = inpbox
  _this.list_0 = list_0
  _this.list_i = list_i
  _this.dtl__0 = dtl__0
  _this.dtl__i = dtl__i

  function __setmedia(id, media) {
    var alt = mWIG.getMediaName(media)
    $(id).attr("alt"  , alt)
    $(id).attr("title", alt)
    console.log("__setmedia: "+id+" "+media)
    mWIG.getImage(media, function(src) {
      $(id).attr("src", src)
    })
  }

  _this.setimage = function(data) {
    if (data.media)
      __setmedia("#"+data.id+"-img", data.media)
  }

  _this.seticon = function(data) {
    if (data.icon)
      __setmedia("#"+data.id+"-ico", data.icon)
  }

  _this.setrouting = function(data, T) {
    var d = data.distance
    var b = data.bearing

    if (Math.floor(d) == 0) {
      d = "0m"
      b = "visibility: hidden"
    } else {
      if (d < 1000) {
        d = string.sprintf("%dm", Math.floor(d))
      } else {
        if (d < 100000) {
          d = string.sprintf("%3.1fkm", Math.floor(d)/1000)
        } else {
          d = string.sprintf("%4dkm", Math.floor(d)/1000)
        }
      }
      b = [
        "transform        : rotate("+b+"deg)",
        "-moz-transform   : rotate("+b+"deg)",
        "-webkit-transform: rotate("+b+"deg)"
      ]
      b = b.join(";")
    }
    $("#"+data.id+"-routing").html(_.template(T)({ distance: d, bearing: b }))
  }

  return _this
});
