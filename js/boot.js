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

require.config({

  paths: {

    screenfull    : "../lib/screenfull.min",
    string        : "../lib/underscore.string.min",

    mousewheel    : "../lib/jquery.mousewheel-min",

    tinyterm      : "../lib/tinyterm.min",

    prism         : "../lib/prism",

    leaflet       : "../lib/leaflet",
    leafletbing   : "../lib/Bing",
    awesomemarkers: "../lib/leaflet.awesome-markers.min",
    custombutton  : "app/L.CustomButton",

    text          : "../lib/text",

    JSZip         : "../lib/jszip.min",
    klass         : "../lib/Class",
    luavm         : "lib/lua.vm"
  },

  shim: {
    leafletbing   : ["leaflet"],
    awesomemarkers: ["leaflet"],
    custombutton  : ["leaflet"],

    prism: {
      exports: "Prism"
    },

    screenfull: {
      exports: "screenfull"
    },

    klass: {
      exports: "Class"
    }
  }
});

require(["app/app0"], function(app) {
  app.init0()
});
