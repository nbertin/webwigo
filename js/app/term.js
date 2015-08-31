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
  
  var _termvdlg = undefined
  var _terminal = undefined
  var _running  = false
  
  function _tslog(msg) {
    if (_terminal) {
      var ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
      _terminal.print(ts + ": " + msg)
    }
  }

  var ViewTerm = Backbone.View.extend({
    el        : $("#menu-left"),
    events    : {
      "click #id-tab-btn-term": function() {
        if (_termvdlg) {
          if ($("#id-term").dialog("isOpen")) {
            $("#id-term").dialog("close")
          }
          else {
            $("#id-term").dialog("open")
          }
        }
      }
    },
    initialize: function(options) {
      // check if section is active on initialization.
      if ($("#section-term").hasClass("active"))
        $.fn.fullpage.silentMoveTo(SECTION_HOME)

      // fullpage plugin event: section leave
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        if (_termvdlg) {
          if (srcidx == SECTION_HOME) 
            _termvdlg.hide()
          if (dstidx == SECTION_HOME)
            _termvdlg.show()
        }
      })

      // when a cartridge file is loaded
      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        if (_terminal == undefined) {
          _terminal = new TinyTerm(document.querySelector("#id-term"))
          _terminal.autocomplete = function(target) {
          }
          _terminal.process = function(command) {
            if (command !== "") {
              if (_running)
                mLUA.Exec(command, false)
              else {
                _tslog("ERROR: Lua VM is not running (cartridge not started) !")
              }
            }
          }

          _termvdlg = $("#id-term").dialog({
            dialogClass: "vdlg-margin-top",
            position   : { at: "left bottom" },
            autoOpen   : false,
            width      : 800,
            title      : "Lua console"
          }).dialogExtend({
            titlebar   : "transparent",
            closable   : false,
            minimizable: true
          }).dialog("widget")

          $("#id-tab-btn-term").toggleClass("disabled", false)
          //new TinyTerm(document.querySelector("#id-help"))
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
