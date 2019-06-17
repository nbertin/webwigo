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
  "app/ctrl",
  "app/emap",
  "app/gpsr",
  "app/emul",
  "app/code",
  "app/data",
  "app/conf",
  "app/term"/*,
  "app/help",
  "app/about"*/
], function(ViewCtrl, ViewEMap, ViewGpsr, ViewEmul, ViewCode, ViewData, ViewConf, ViewTerm/*, ViewHelp, ViewAbout*/) {

  var _this = {}

  //
  // boot 2nd stage (after fullpage rendering)
  //
  // see index.html
  // called by fullpage plugin (= afterRender)
  //
  _this.init1 = function() {
    new ViewGpsr()
    new ViewEMap()
    new ViewEmul()
    new ViewCtrl()
    new ViewCode()
    new ViewData()
    new ViewConf()
    new ViewTerm()
//    new ViewHelp()
//    new ViewAbout()
  }

  return _this
});
