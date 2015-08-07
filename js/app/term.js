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
  "terminal"  ,
  "mousewheel",
  "text!app/tpl/term.html",
  "lib/m_rdr" ,
  "lib/m_emu" ,
  "lib/m_lua"
], function(terminal, mousewheel, T, mRDR, mEMU, mLUA) {
  
  var _terminal = undefined
  var _running  = false
  
  function _tslog(msg) {
    var ts = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    //_terminal.echo(ts+": "+msg)
  }

  var ViewTerm = Backbone.View.extend({
    el        : $("#id-term"),
    template  : _.template(T),
    events: {
      "click #id-btn-clear" : function() {
        //_terminal.clear()
      }
    },
    initialize: function(options) {
      // check if section is active on initialization.
      //if ($("#section-term").hasClass("active"))
      //  $.fn.fullpage.moveTo(SECTION_EMAP)
      
      //this.$el.append(this.template())
      
      /*
      _terminal = $("#id-term-content").terminal(function(command, term) {
        if (command !== "") {
          if (_running)
            mLUA.Exec(command, false)
          else
            _tslog("ERROR: Lua VM is not running (cartridge not started) !")
          }
        },
        {
          greetings : false    ,
          name      : "console",
          clear     : true     ,
          exit      : false    ,
          prompt    : "$ "
        }
      )
      */

      //$("#id-term").css("padding", "20px")
      //$("#id-term-content").height($("#id-term").height()-60)

      // when a cartridge file is loaded
      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        $("#id-tab-btn-term").toggleClass("disabled", false)
        //_terminal.clear()
        _tslog("cartridge loaded")
      })

      this.listenTo(mEMU, "evt-emu-println", function(msg) {
        _tslog(msg)
      })

      this.listenTo(mEMU, "evt-emu-started", function() {
        //_termvdlg.show()
        _running = true
      })

      this.listenTo(mEMU, "evt-emu-stopped", function() {
        //_termvdlg.hide()
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
