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
