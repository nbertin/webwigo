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
  "lib/m_rdr",
  "lib/m_gps",
  "lib/m_map",
  "lib/m_lua"
], function(mRDR, mGPS, mMAP, mLUA) {
  
  var _this = {}

  /*
  function b64enc(str) {
    if (str)
      return window.btoa(unescape(encodeURIComponent(str)))
    return str
  }
  */

  function b64dec(str) {
    return decodeURIComponent(escape(window.atob(str)))
  }

  function parseJSON(str) {
    if (str)
      return $.parseJSON(b64dec(str))
    return str
  }

  /**
    * Creates the WIG interface. 
    * 
    * @public
    * @memberof module:mWIG#
    * @method   Create
    */
  _this.Create = function() {
    _this.listenTo(mGPS, "evt-gps-set-player-location", function(loc, accuracy) {
      mLUA.Call("JS2LUA_SetPlayerLocation", loc.lat , loc.lng, accuracy)
    })

    _this.listenTo(mGPS, "evt-gps-accuracy-change", function(accuracy) {
      mLUA.Call("JS2LUA_RefreshLocation", accuracy)
    })
  }
  
  /**
    * Resets the WIG interface. 
    * 
    * @public
    * @memberof module:mWIG#
    * @method   Reset
    */
  _this.Reset = function() {
    _medias = []
  }

  /**
    * Starts a JS timer for WIG engine. 
    * 
    * @public
    * @memberof module:mWIG#
    * @method   TimerStart
    * @param    {number} timerid  - timer identifier (from WIGInternal.lua)
    * @param    {object} duration - in milliseconds
    */
  _this.TimerStart = function(timerid, duration) {
    setTimeout(function() {
      mLUA.Call("JS2LUA_TimerTick", timerid)
    }, duration)
  }

  /**
    * @public
    * @memberof module:mWIG#
    * @method   RefreshZone
    * @param    {number} id - zone identifier (from WIGInternal.lua)
    * @param    {object} obj - zone definition
    */
  _this.RefreshZone = function(obj) {
    mMAP.RefreshZone(parseJSON(obj))
  }

  /**
    * @public
    * @memberof module:mWIG#
    * @method   RefreshMedia
    * @param    {number} id - media identifier (from WIGInternal.lua)
    * @param    {object} obj - media definition
    */
  _this.RefreshMedia = function(obj) {
    var m = parseJSON(obj)
    _medias[m.idx] = m
  }

  /**
    * Retrieves an image URL given its id, as found in WIGInternal.lua
    *
    * @public
    * @memberof module:mWIG#
    * @method   getImage
    * @param    {number} id - image identifier (from WIGInternal.lua)
    * @param    {function} onSuccess - callback
    */
  _this.getImage = function(id, cb_onSuccess) {
    var gwx = mRDR.getReader()
    switch(gwx.getCartType()) {
      case gwx.TYPE_GWZ:
        var item = _medias[id]
        if (item != null) {
          var files = item.resources
          for(var i = 0 ; i < files.length ; i++) {
            gwx.getMediaData(files[i].Filename, cb_onSuccess)
            return
          }
        }
        break
      case gwx.TYPE_GWC:
        gwx.getMediaData(id, cb_onSuccess)
        return
    }
    cb_onSuccess("")
  }

  _this.getMediaName = function(id) {
    if (_medias[id])
      return _medias[id].name
    return ""
  }

  /**
    * PlayerRefreshObjects event (fired by WIGInternal.lua)
    *
    * @public
    * @memberof module:mWIG#
    * @method   PlayerRefreshObjects
    * @param    {object} objects
    */
  _this.RefreshObjects = function(obj) {
    _this.trigger("evt-wig-refresh-objects", parseJSON(obj))
  }
  
  _this.CartridgeLoaded = function() {
    _this.trigger("evt-wig-cartridge-loaded")
  } 

  _this.CartridgeEvent = function(evt) {
    console.log("CartridgeEvent = ", evt)
    _this.trigger("evt-wig-cartridge-"+evt)
  } 
  
  _this.GetInput = function(obj) {
    var m = parseJSON(obj)
    _this.trigger("evt-wig-getinput", m.txt, m.media, m.type, m.choices)
  }
  
  _this.MessageBox = function(obj) {
    var m = parseJSON(obj)
    _this.trigger("evt-wig-messagebox", m.txt, m.media, m.btn1, m.btn2)
  }
  
  _this.ShowScreen = function(idxScreen, idxObject) {
    _this.trigger("evt-wig-showscreen", idxScreen, idxObject)
  }

  //
  // Adds the mWIG instance to the global object so that it can be called
  // from Lua
  //
  window.mWIG = _this

  // extends module with Backbone Events
  _.extend(_this, Backbone.Events)
  return _this
});
