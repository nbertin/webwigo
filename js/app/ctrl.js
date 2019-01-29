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
