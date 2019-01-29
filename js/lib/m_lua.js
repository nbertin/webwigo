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
  "luavm"
], function(luavm) {

  var _this    = {}
  var _running = false

  /**
    * Starts Lua VM
    *
    * @public
    * @memberof module:mLUA#
    * @method   Start
    */
  _this.Start = function() {
    Lua.init()
    _running = true
  }

  /**
    * Stops Lua VM
    *
    * @public
    * @memberof module:mLUA#
    * @method   Stop
    */
  _this.Stop = function() {
    if (_running) {
      Lua.stop()
      _running = false
    }
  }

  /**
    * Exits the Lua VM (os.exit(n))
    *
    * @public
    * @memberof module:mLUA#
    * @method   Exit
    */
  _this.Exit = function() {
    _.defer(function() {
      mLUA.Stop()
      _this.trigger("evt-luavm-info", "os.exit() called. Cartridge has been stopped.")
    })
  }

  /**
    * Executes the specified Lua content (file).
    *
    * @public
    * @memberof module:mLUA#
    * @method   Exec
    * @param    {function} luafile - Lua payload to execute
    * @param    bool - true if stop on error is required (= false for console)
    */
  _this.Exec = function(luafile, stopOnError) {
    if (_running) {
      var errmsg = Pointer_stringify(Lua.exec(luafile))
      if (errmsg != 0) {
        if (stopOnError) {
          mLUA.Stop()
          _this.trigger("evt-luavm-error", errmsg)
        }
      }
    }
  }

  /**
    * Executes the specified Lua method. Any number of argument can be passed.
    * Arguments of type string are surrounded with '""'
    *
    * @public
    * @memberof module:mLUA#
    * @method   Call
    * @param    {function} luafunc - Lua method to call
    * @param    {...*} args        - parameters
    */
  _this.Call = function(luafunc) {
    if (_running) {
      var args = Array.prototype.slice.call(arguments, 1)
      for(var i = 0 ; i < args.length ; i++)
        if (typeof args[i] === "string")
          args[i] = '"' + args[i] + '"'
      _this.Exec(luafunc+"("+args.join(",")+")", true)
    }
  }

  //
  // Adds the mLUA instance to the global object so that it can be called
  // from LuaVM
  //
  window.mLUA = _this

  // extends module with Backbone Events
  _.extend(_this, Backbone.Events)
  return _this
});
