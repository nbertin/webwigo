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
