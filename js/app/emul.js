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
  "lib/m_emu",
  "lib/m_rdr",
  "app/app0"
], function(mEMU, mRDR, App) {

  // emulator state (running = true / stopped = false)
  var _is_running = false

  // emulator window (dialog)
  var _emulvdlg   = undefined

  // toggle play/stop button
  function _toggle_playstop(fl) {
    $("#id-tab-btn-playstop").toggleClass("disabled", false)
    $("#id-tab-btn-playstop i")
      .toggleClass("fa-stop" , ! fl)
      .toggleClass("fa-play" ,   fl)
  }

  var ViewEmul = Backbone.View.extend({
    el        : $("#menu-left"),
    events    : {
      "click #id-tab-btn-playstop": function() {
        $.fn.fullpage.moveTo(SECTION_HOME)
        if (_is_running) {
          mEMU.Stop()
        } else {
          mEMU.Play()
        }
      },
    },
    initialize: function() {
      // fullpage plugin event: section leaved = hide/show emulator dialog
      this.listenTo(App, "evt-app-on-section-leave", function(srcidx, dstidx, direction) {
        if (_emulvdlg) {
          if (srcidx == SECTION_HOME)
            _emulvdlg.hide()
          if (dstidx == SECTION_HOME)
            _emulvdlg.show()
        }
      })

      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        if (_emulvdlg == undefined) {
          $("#id-emul").dialog({
            dialogClass: "vdlg-margin-top",
            position   : { at: "right top" },
            minWidth   : 400,
            title      : "Emulator"
          }).dialogExtend({
            titlebar   : "transparent",
            closable   : false,
            minimizable: true
          })
          _emulvdlg = $("#id-emul").dialog("widget")

          mEMU.Create("#id-emul")
        }
        mEMU.Start()
        $.fn.fullpage.moveTo(SECTION_HOME)
      })

      this.listenTo(mEMU, "evt-emu-cartridge-playing", function() {
        _is_running = true
        _toggle_playstop(false)
      })

      this.listenTo(mEMU, "evt-emu-started", function() {
        _is_running = false
        _toggle_playstop(true)
      })

      this.listenTo(mEMU, "evt-emu-stopped", function() {
        mEMU.Start()
      })
    }
  });

  // singleton
  var _instance;
  return function getViewEmul() {
    return (_instance = (_instance || new ViewEmul()))
  }
});
