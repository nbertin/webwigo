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
  "lib/m_gwz" ,
  "lib/m_gwc" ,
  "lib/m_src" ,
  "lib/m_url"
], function(mGWZ, mGWC, mSRC, mURL) {

  var _this = {}
  var _hdle = undefined
  var _vobj = undefined
  var _ogwz = new mGWZ()
  var _ogwc = new mGWC()
  var _osrc = new mSRC()

  _this.read = function(hdle, cb_onProgress, cb_onStatus, cb_onError) {
    var file = undefined
    var type = undefined

    function _cb_onSuccess(gwx) {
      _this.trigger("evt-gwx-loaded", gwx)
    }

    // check if handle is an URI or not (= File object)
    if (typeof hdle == "string") {
      var uri = mURL.parse(hdle)
      if (! uri.error) {
        file = uri.cart_url
        type = uri.cart_type
      } else {
        cb_onError(uri.error)
        return
      }
    } else {
      function _type(filename) {
        if (filename.search(/\.gwz$/i) != -1)
          return "GWZ"
        if (filename.search(/\.gwc$/i) != -1)
          return "GWC"
        if (filename.search(/\.lua$/i) != -1)
          return "SRC"
        return null
      }
      file = hdle
      type = _type(file.name)
    }
    switch(type) {
      case "GWZ":
        _vobj = _ogwz
        break
      case "GWC":
        _vobj = _ogwc
        break
      case "SRC":
        _vobj = _osrc
        break
      default:
        cb_onError("ERR_GWZ_OR_GWC_OR_LUA_FILE_EXPECTED")
        return
    }
    _hdle = hdle
    _vobj.read(file, _cb_onSuccess, cb_onProgress, cb_onStatus, cb_onError)
  }

  _this.getReader = function() {
    return _vobj
  }

  _this.getHandle = function() {
    return _hdle
  }

  _this.isRemote = function() {
    if (_hdle == undefined)
      throw "routine must be called after cartridge loaded event"
    return (typeof _hdle == "string")
  }

  _this.isLocal = function() {
    if (_hdle == undefined)
      throw "routine must be called after cartridge loaded event"
    return (! _this.isRemote())
  }

  // extends module with Backbone Events
  _.extend(_this, Backbone.Events)
  return _this
});
