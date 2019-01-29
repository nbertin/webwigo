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
            width      : 800,
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
