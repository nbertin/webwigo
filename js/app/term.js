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
  "tinyterm",
  "lib/m_rdr",
  "lib/m_emu",
  "lib/m_lua",
  "app/app0"
], function(TinyTerm, mRDR, mEMU, mLUA, App) {
  
  var _terminal = undefined
  var _dlgstate = undefined
  var _running  = false
  
  function _tslog(msg) {
    if (_terminal) {
      var ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
      _terminal.print(ts + ": " + msg)
    }
  }

  function _clear() {
    console.log("Lua console: clear")

  }

  var ViewTerm = Backbone.View.extend({
    initialize: function(options) {
      // check if section is active on initialization.
      if ($("#section-term").hasClass("active"))
        $.fn.fullpage.silentMoveTo(SECTION_HOME)

      // fullpage plugin event: section leave
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        if (_terminal) {
          if (srcidx == SECTION_HOME) {
            _dlgstate = $("#id-term").dialogExtend("state")
            $("#id-term").dialog("close")
          }
          if (dstidx == SECTION_HOME) {
            $("#id-term").dialog("open")
            if (_dlgstate === "minimized")
              $("#id-term").dialogExtend("minimize")
          }
        }
      })

      // when a cartridge file is loaded
      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        
        function _reset() {
          $("#id-term").empty()
          var term = new TinyTerm(document.querySelector("#id-term"))
          term.autocomplete = function(target) {
          }
          term.process = function(command) {
            if (command !== "") {
              if (_running)
                mLUA.Exec(command, false)
              else {
                _tslog("ERROR: Lua VM is not running (cartridge not started) !")
              }
            }
          }
          return term       
        }

        if (_terminal == undefined) {
          _terminal = _reset()
          $("#id-term").dialog({
            dialogClass: "vdlg-margin-top",
            position   : { at: "left bottom" },
            autoOpen   : true,
            width      : $("#section-emap").width(),
            title      : "Lua console"
          }).dialogExtend({
            titlebar   : "transparent",
            closable   : false,
            minimizable: true
          }).dialogExtend("minimize")
        } else {
          _terminal = _reset()
        }
        _tslog("cartridge loaded")
      })

      this.listenTo(mEMU, "evt-emu-println", function(msg) {
        _tslog(msg)
      })

      this.listenTo(mEMU, "evt-emu-cartridge-playing", function() {
        _running = true
      })

      this.listenTo(mEMU, "evt-emu-stopped", function() {
        _running = false
      })
    }
  })

  // singleton
  var _instance;
  return function getViewTerm() {
    return (_instance = (_instance || new ViewTerm()))
  }  
});
