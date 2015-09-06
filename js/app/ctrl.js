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
  "app/load" ,
  "app/info" ,
], function(mEMU, mRDR,  ViewLoad, ViewInfo) {

  var viewLoad = new ViewLoad()
  var viewInfo = new ViewInfo()

  var ViewCtrl = Backbone.View.extend({
    el        : $("#menu-left"),
    events    : {
      "click #id-tab-btn-load": function() {
        viewLoad.toggle()
        viewInfo.hide  ()
      },
      "click #id-tab-btn-reload": function() {
        viewLoad.reload()
      },
      "click #id-tab-btn-info": function() {
        viewLoad.hide  ()
        viewInfo.toggle()
      }
    },
    initialize: function() {
      this.listenTo(mRDR, "evt-gwx-loaded", function(gwx) {
        // enable info button
        $("#id-tab-btn-info").toggleClass("disabled", false)

        // enable reload button depending on cartridge source (local/remote)
        $("#id-tab-btn-reload").toggleClass("disabled", mRDR.isRemote())
      })

      if (window.location.search !== "")
        viewLoad.load(window.location.search)
    },
  });

  // singleton  
  var _instance;
  return function getViewCtrl() {
    return (_instance = (_instance || new ViewCtrl()))
  }
});
