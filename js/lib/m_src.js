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
  "lib/m_gwx"
], function(mGWX) {

  var mSRC = mGWX.extend({

    init: function() {
    },

    _codeCleanup: function(txt) {
      var t
      //
      // detect BOM and remove it if necessary
      // http://en.wikipedia.org/wiki/Byte_order_mark
      //
      if ((txt.charCodeAt(0) == 0xef) && (txt.charCodeAt(1) == 0xbb) && (txt.charCodeAt(2) == 0xbf)) {
        t = txt.substring(3)
      } else {
        t = txt
      }

      var m = t.match(/=[\s]*\[\[[\s\S]*?\]\]/mg)
      if (m != null) {
        for(var i = 0 ; i < m.length; i++) {
          if (m[i].search(/"/) != -1)
            t = t.replace(m[i], m[i].replace(/"/g, "'"))
        }
      }
      return t
    },

    _codeCartVariableName: function(txt) {
      var r = null
      // better cartridge name matching (thanks Dennis!)
      var m = txt.match(/[_A-Za-z0-9]+[\s]*=[\s]*?Wherigo\.ZCartridge/)
      if (m != null && m.length == 1) {
        r = $.trim(m[0].substring(0, m[0].lastIndexOf("=")))
      }
      return r
    },
    
    _read: function(blob, name, cb_onSuccess, cb_onError) {
      var that   = this
      var reader = new FileReader()

      reader.onload = function(evt) {
        var text = evt.target.result
        var cart = that._codeCartVariableName(text)
        if (cart != null) {
          that._code = that._codeCleanup(text)
          that._name = name
          cb_onSuccess(that)
        } else {
          cb_onError("ERR_CARTRIDGE_VARIABLE_NAME_NOT_FOUND")
        }
      }
      reader.onerror = function(evt) {
        cb_onError("ERR_UNKNOWN_ERROR("+evt.target.error.code+")")
      }
      reader.readAsBinaryString(blob)
    },

    canSeeCode: function() {
      return true
    },

    getMediaData: function(filename, cb_onSuccess) {
      cb_onSuccess("")
    },

    getMediasList: function() {
      var list = []
      list.push(this._name)
      return list
    },

    canSeeMedias: function() {
      return false
    },

    canSeeHiddenZones: function() {
      return true
    },

    getCartMetaData: function() {
      function getSStr(cart, code, name) {
        var r = new RegExp(cart+"\\."+name+"[\\s]*=[\\s]*\".*\"")
        var m = code.match(r)
        if (m != null) {
          m = m[0].match(/\".*\"/)
          return m[0].substring(1, m[0].lastIndexOf("\""))
        }
        return undefined
      }
      function getLStr(cart, code, name) {
        var r = new RegExp(cart+"\\."+name+"[\\s]*=[\\s]*\[\[[\\s\\S]*")
        var m = code.match(r)
        if (m != null) {
          m = m[0].match(/\[\[[\s\S]*/)
          r = m[0].indexOf("]]")
          if (r != -1)
            return m[0].substring(2, r)
        }
        return undefined
      }
      function getPValue(cart, code, name) {
        var sstr = getSStr(cart, code, name)
        if (sstr != undefined)
          return sstr
        return getLStr(cart, code, name)
      }
      function isPlayAnywhere(cart, code) {
        var r = new RegExp(cart+"\\.StartingLocation[\\s]*=[\\s]*Wherigo\\.INVALID_ZONEPOINT")
        return (code.match(r) != null)
      }
      function getStartLocation(cart, code) {
        var r = new RegExp(cart+"\\.StartingLocation[\\s]*=[\\s]*?ZonePoint\\(.+?\\)")
        var m = code.match(r)
        if (m != null) {
          m = m[0].match(/\(.+?\)/)
          m = m[0].substr(1, m[0].length-1)
          m = m.split(",")
          return { lat: parseFloat(m[0]), lng: parseFloat(m[1]) }
        }
        return undefined
      }
      var code = this._code
      var cart = this._codeCartVariableName(code)
      return {
        name     : getPValue       (cart, code, "Name"                       ),
        activity : getPValue       (cart, code, "Activity"                   ),
        version  : getPValue       (cart, code, "Version"                    ),
        author   : getPValue       (cart, code, "Author"                     ),
        company  : getPValue       (cart, code, "Company"                    ),
        desc     : getPValue       (cart, code, "Description"                ),
        locdesc  : getPValue       (cart, code, "StartingLocationDescription"),
        locless  : isPlayAnywhere  (cart, code                               ),
        location : getStartLocation(cart, code                               )
      }
    },

    getCartType: function() {
      return this.TYPE_SRC
    }
  })

  return mSRC
});
