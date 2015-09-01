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
 
//
// Utility function to get (ajax) a file as binary (arraybuffer)
//
function __getbinary(uri, cb_onLoad) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', uri, true)
  xhr.responseType = 'arraybuffer'

  xhr.onload = function(e) {
    if (this.status == 200)
      // Conversion to normal array
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
      // var result = Array.apply([], new Uint8Array(xhr.response))
      // Unfortunately, the above method doesn't work in Safari...
      var uint8a = new Uint8Array(xhr.response)
      var result = []
      for(var i = 0 ; i < uint8a.length ; i++)
        result[i] = uint8a[i]
      cb_onLoad(result)
  }
  xhr.send()
}

//
// Emscripten configuration
//
var Module = {

  print: function(msg) {
    // global routine (see end of module definition)
    __mEMU_Print(msg)
  },
  
  preRun: function() {
    FS.init()

    __getbinary("lua/Wherigo.Engine.luac", function(data) {
      FS.createDataFile("/", "Wherigo.lua", data, true, false);
    })

    $.get("lua/WIGInternal.lua", function(data) {
      FS.createDataFile("/", "WIGInternal.lua", data, true, false);
    })

    $.get("lua/dkjson-v2.5.lua", function(data) {
      FS.createDataFile("/", "dkjson.lua", data, true, false);
    })

    $.get("lua/base64.lua", function(data) {
      FS.createDataFile("/", "base64.lua", data, true, false);
    })
  }
}

define([
  "lib/m_rdr",
  "lib/m_lua",
  "lib/m_wig",
  "lib/m_gps",
  "lib/m_gui",
  "lib/m_map"
], function(mRDR, mLUA, mWIG, mGPS, mGUI, mMAP) {

  var _this = {}
 
  //
  // Prints a message on browser console and notify listeners. This method is
  // called from Emscripten.
  //
  _this.Print = function(msg) {
    console.log(msg)
    _this.trigger("evt-emu-println", msg)
  }

  _this.Start = function() {
    _this.Reset()
    // not locationless: player location = cartridge location
    var gwx = mRDR.getReader()
    var dat = gwx.getCartMetaData()
    if (! dat.locless)
      mMAP.Start(dat.location)

    mGUI.ShowSplashScreen(gwx)

    _this.trigger("evt-emu-started")
  }

  _this.Stop = function() {
    _this.Reset()
    _this.trigger("evt-emu-stopped")
  }
  
  _this.Play = function() {
    $.get("lua/Loader.lua", function(loader) {
      var gwx = mRDR.getReader()
      gwx.getCode(function(code) {
        var opt
        mLUA.Start()
        if (gwx.getCartType() == gwx.TYPE_GWC)
          opt = { encoding: 'binary'}
        else
          opt = { encoding: 'utf8'  }
        FS.writeFile("/cartridge.lua", code, opt, "w+")
        mLUA.Exec(loader, true)
        mGUI.HideSplashScreen()
        _this.trigger("evt-emu-cartridge-playing")
      })
    })
  }

  _this.Reset = function() {
    mLUA.Stop ()
    mWIG.Reset()
    mGPS.Reset()
    mMAP.Reset()
    mGUI.Reset()
  }
  
  _this.Create = function(guidiv) {

    mWIG.Create()
    mGPS.Create()
    mMAP.Create()
    mGUI.Create(guidiv)

    //
    // evt-wig-cartridge-loaded
    //
    // This event is sent by the mWIG module when the cartridge has been
    // loaded (see lua/Loader.lua / mWIG)
    // 
    _this.listenTo(mWIG, "evt-wig-cartridge-loaded", function() { 
      var gwx = mRDR.getReader()
      var loc = mGPS.getPlayerLocation()

      if (gwx.getCartMetaData().locless) {
        mLUA.Call("JS2LUA_SetStartingLocation", loc.lat, loc.lng)
        mMAP.Start(loc)
      } else {
        mGPS.setPlayerLocation(loc)
      }
      mGPS.Start(loc)
      
      if (gwx.getCartType() == gwx.TYPE_GWC)
        mLUA.Call("JS2LUA_SetPlayerName", gwx.getPlayerName())

      mLUA.Call("JS2LUA_StartCartridge")
    })
    
    //
    // evt-gui-play
    //
    // This event is sent by the mGUI module when the player clicks on the
    // "Play" button 
    //
    _this.listenTo(mGUI, "evt-gui-play", function() {
      _this.Play()
    })
  }
  
  //
  // Adds the "Print" function to the global object so that it can be called
  // from Emscripten (see Emscripten configuration Module object)
  //
  window.__mEMU_Print = _this.Print

  // extends module with Backbone Events
  _.extend(_this, Backbone.Events)
  return _this
});
