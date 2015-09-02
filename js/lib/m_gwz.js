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
  "JSZip",
  "lib/m_src"
], function(JSZip, mSRC) {

  var _wURL = window.webkitURL || window.mozURL || window.URL

  var mGWZ = mSRC.extend({

    _zip : null,

    init: function() {
      // empty
    },

    _read: function(blob, name, cb_onSuccess, cb_onError) {
      var that   = this
      var reader = new FileReader()

      reader.onload = function(evt) {
        var code = null
        try {
          that._zip = new JSZip(new Uint8Array(evt.target.result))
        } catch(e) {
          cb_onError("ERR_CARTRIDGE_UNZIP")
          return
        }
        $.each(that._zip.files, function(index, entry) {
          if (that.isCode(entry.name))
            code = entry.asBinary()
        })
        if (code != null) {
          var cart = that._codeCartVariableName(code)
          if (cart != null) {
            that._code = that._codeCleanup(code)
            that._name = name
            cb_onSuccess(that)
          } else {
            cb_onError("ERR_CARTRIDGE_NAME_NOT_FOUND")
          }
        } else {
          cb_onError("ERR_LUA_SOURCE_NOT_FOUND")
        }
      }
      reader.onerror = function(evt) {
        cb_onError("ERR_UNKNOWN_ERROR("+evt.target.error.code+")")
      }
      reader.readAsArrayBuffer(blob)
    },

    canSeeCode: function() {
      return true
    },

    getMediaData: function(filename, cb_onSuccess) {
      var that = this
      var zobj = that._zip.file(filename)
      if (zobj) {
        var tarr = zobj.asArrayBuffer()
        var blob = new Blob([tarr], { type: "image/png" })
        cb_onSuccess(_wURL.createObjectURL(blob))
      }
    },

    getMediasList: function() {
      var that = this
      var list = []
      $.each(that._zip.files, function(index, entry) {
        if (that.isCode(entry.name) || that.isImage(entry.name) || that.isSound(entry.name))
          list.push(entry.name)
      })
      return list
    },

    canSeeMedias: function() {
      return true
    },

    canSeeHiddenZones: function() {
      return true
    },

    getCartType: function() {
      return this.TYPE_GWZ
    }
  })

  return mGWZ
});