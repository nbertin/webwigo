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
  "string",
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
], function(string, splash, routxl, routxs, main_0, main_i, msgbox, inpbox, list_0, list_i, dtl__0, dtl__i) {

  var _this = {}

  // templates
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
      d = "Here"
      b = "visibility: hidden"
    } else {
      if (d < 1000) {
        d = string.sprintf("%4dm", Math.floor(d))
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
