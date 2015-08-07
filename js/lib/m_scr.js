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
], function() {

  var _this     = {}

  // graphical objects (gobj) stack
  var _stack    = []

  // graphical operations queue
  var _queue    = []

  // cached jQuery object
  var _scrdiv   = null
  
  // levels
  _this.LEVEL_TOP = 0    // popups (= messagebox, inputbox, splashscreen)
  _this.LEVEL_3RD = 1    // detailscreen
  _this.LEVEL_2ND = 2    // listscreen
  _this.LEVEL_1ST = 3    // mainscreen
  
  var NLEVELS = (_this.LEVEL_1ST+1)

  var _debugon = false
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
        } else {
          console.log("_queue.shift() returns null!")
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

  function qhide(obj) {
    dump("H>>>", "hide ("+gobj(obj).attr("id")+")")
    gobj(obj).remove()
    set(level(obj), null)
    refresh()
    dump("H<<<")
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
