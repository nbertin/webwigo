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
], function() {

  var _this     = {}

  // graphical objects (gobj) stack
  var _stack    = []

  // graphical operations queue
  var _queue    = []

  // cached jQuery object
  var _scrdiv   = null

  // levels
  _this.LEVEL_ERR = 0 // error screen
  _this.LEVEL_INI = 1 // splashscreen
  _this.LEVEL_TOP = 2 // popups (= messagebox, inputbox)
  _this.LEVEL_3RD = 3 // detailscreen
  _this.LEVEL_2ND = 4 // listscreen
  _this.LEVEL_1ST = 5 // mainscreen

  var NLEVELS = (_this.LEVEL_1ST+1)

  var _debugon = true
  function dump(op, msg) {
    if (_debugon) {
      var s = op + ":"
      for(var i = 0 ; i < NLEVELS ; i++) {
        var obj = get(i)
        s = s + " " + ((obj == null) ? "null" : gobj(obj).attr("id")+"("+gobj(obj).css("display")+")")
      }
      console.debug(s)
      if (msg)
        console.debug(msg)
    }
  }

  function get(i) {
    return _stack[i]
  }

  function set(i, gobj) {
    _stack[i] = gobj
  }

  function hide(obj) {
    gobj(obj).css("display", "none")
  }

  function show(obj) {
    gobj(obj).css("display", "block")
  }

  function gobj(obj) {
    return obj.object
  }

  function level(obj) {
    return obj.level
  }

  var _qexec_running = false
  function qexec() {
    if (_queue.length > 0) {
      _qexec_running = true
      _.delay(function() {
        var op = _queue.shift()
        if (op) {
          op.f(op.p)
          qexec()
        }
      }, 0)
    } else {
      _qexec_running = false
    }
  }

  function queue(job) {
    _queue.push(job)
    if (! _qexec_running)
      qexec()
  }

  function refresh() {
    var fl_show = false
    for(var i = 0 ; i < NLEVELS ; i++) {
      var obj = get(i)
      if (obj != null) {
        // 0:popup -> 1:detailscreen -> 2:list screen -> 3:mainscreen (always if fl_show=false)
        if (! fl_show || (! fl_show && i == _this.LEVEL_1ST)) {
          fl_show = true
          if (obj.update != null)
            obj.update()
          show(obj)
        } else {
          hide(obj)
        }
      }
    }
  }

  function qshow(obj) {
    if (typeof obj == "number")
      obj = get(obj)
    if (obj) {
      dump("S>>>", "show ("+gobj(obj).attr("id")+")")
      var lvl = level(obj)
      var old = get(lvl)
      if (old != null)
        gobj(old).remove()
      set(lvl, obj)
      hide(obj)
      $(_scrdiv).append(gobj(obj))
      if (obj.onshow != null)
        obj.onshow()
      refresh()
      dump("S<<<")
    }
  }

  function qhide(obj) {
    if (typeof obj == "number")
      obj = get(obj)
    if (obj) {
      dump("H>>>", "hide ("+gobj(obj).attr("id")+")")
      gobj(obj).remove()
      set(level(obj), null)
      refresh()
      dump("H<<<")
    }
  }

  _this.Create = function(scrdiv) {
    _scrdiv = scrdiv
  }

  _this.Show = function(obj) {
    queue({ f: qshow, p: obj })
  }

  _this.Hide = function(obj) {
    queue({ f: qhide, p: obj })
  }

  _this.Update = function() {
    for(var i = 0 ; i < NLEVELS ; i++) {
      var obj = get(i)
      if (obj != null && obj.update != null)
        obj.update()
    }
  }

  _this.Clear = function(level) {
    function clear(level) {
      var obj = get(level)
      if (obj != null) {
        gobj(obj).remove()
        set(level, null)
        return true
      }
      return false
    }
    var r = false
    if (level) {
      r = clear(level)
    } else {
      for(var i = 0 ; i < NLEVELS ; i++)
        r = r | clear(i)
    }
    if (r)
      refresh()
  }

  return _this
});
