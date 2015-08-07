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
  "klass"
], function(Class) {

  function state2str(state) {
    switch(state) {
      case 0 : str = "UNSENT"           ; break
      case 1 : str = "OPENED"           ; break
      case 2 : str = "HEADERS_RECEIVED" ; break
      case 3 : str = "LOADING"          ; break
      case 4 : str = "DONE"             ; break
      default: str = "UNKNOWN"          ; break
    }
    return str
  }

  var _this = Class.extend({

    _code   : undefined,
    _name   : undefined, // filename or URI

    // public constants
    TYPE_GWC: 0,
    TYPE_GWZ: 1,
    TYPE_SRC: 2,

    _read: function(blob, name, cb_onSuccess, cb_onError) {
      throw "VIRTUAL: _read()"
    },

    /**
      * Main read function: reader (blob or http) is selected depending on
      * file argument type (if file = string then it's an URI -> http else
      * blob
      *
      * @public
      * @memberof module:mGWX#
      * @method   read
      * @param    {string|blob} file    -  
      * @param    {function} cb_onError - error callback
      */
    read: function(file, cb_onSuccess, cb_onProgress, cb_onStatus, cb_onError) {
      if (typeof file == "string") {
        var uri  = file
        var xhr  = new XMLHttpRequest()
        var that = this
        var load = 0

        cb_onStatus(state2str(xhr.readyState)) // = UNSENT
        xhr.open('GET', uri, true)

        xhr.responseType = 'arraybuffer'
        xhr.onreadystatechange = function(e) {
          if (xhr.readyState == 3) {
            load++
            if (load > 1)
              return
          }
          cb_onStatus(state2str(xhr.readyState))
        }
        xhr.onload = function(e) {
          switch(this.status) {
            case 200:
              var blob = new Blob(
                [xhr.response], { type: "application/octet-binary"}
              )
              // handle cartridge data (gwc, gwz or lua)
              that._read(blob, uri, cb_onSuccess, cb_onError)
              break
            case 404:
              cb_onError("ERR_FILE_NOT_FOUND("+this.status+")")
              break
            default :
              cb_onError("ERR_READ_ERROR("+this.status+")")
              break
          }
        }
        xhr.onerror = function(e) {
          cb_onError("ERR_UNEXPECTED_ERROR("+e+")")
        }
        xhr.timeout = 30000
        xhr.ontimeout = function(e) {
          cb_onError("ERR_READ_TIMEOUT("+(xhr.timeout/1000)+"s)")
        }
        xhr.onprogress = function(e) {
          cb_onProgress(e.loaded, e.total)
        }
        cb_onStatus(state2str(xhr.readyState)) // = OPENED
        xhr.send()
      } else {
        this._read(file, file.name, cb_onSuccess, cb_onError)
      }
    },

    /**
      * Returns the Lua code (source or compiled chunk).
      *
      * @public
      * @memberof module:mGWX#
      * @method   getCode
      * @param    {function} cb_onSuccess - callback
      */
    getCode: function(cb_onSuccess) {
      if (cb_onSuccess)
        cb_onSuccess(this._code)
      return this._code
    },

    canSeeCode: function() {
      throw "VIRTUAL: canSeeCode()"
    },

    /**
      * Returns the URL of the specified image
      *
      * @public
      * @memberof module:mGWX#
      * @method   getMediaData
      * @param    {string} filename       - image filename
      * @param    {function} cb_onSuccess - success callback
      */
    getMediaData: function(filename, cb_onSuccess) {
      throw "VIRTUAL: getMediaData()"
    },

    /**
      * Returns the list of entries (filenames)
      *
      * @public
      * @memberof module:mGWX#
      * @method   getMediasList
      * @returns  Array
      */
    getMediasList: function() {
      throw "VIRTUAL: getMediasList()"
    },

    canSeeMedias: function() {
      throw "VIRTUAL: canSeeMedias()"
    },

    canSeeHiddenZones: function() {
      throw "VIRTUAL: canSeeHiddenZones()"
    },

    /**
      * Gets the cartridge filename
      *
      * @public
      * @memberof module:mGWX#
      * @method   getCartFilename
      * @returns  {string}
      */
    getCartFilename: function() {
      return this._name
    },

    /**
      * Gets the cartridge meta data
      *
      * @public
      * @memberof module:mGWX#
      * @method   getCartMetaData
      * @returns  {object}
      */
    getCartMetaData: function() {
      throw "VIRTUAL: getCartMetaData()"
    },

    /**
      * Gets the cartridge type
      *
      * @public
      * @memberof module:mGWX#
      * @method   getCartType
      * @returns  {string} GWZ or GWC or ...
      */
    getCartType: function() {
      throw "VIRTUAL: getCartType()"
    },

    /**
      * Gets Player Name
      *
      * @public
      * @memberof module:mGWX#
      * @method   getPlayerName
      * @returns  {string}
      */
    getPlayerName: function() {
      throw "VIRTUAL: getPlayerName()"
    },

    /**
      * Returns true if the specified filename is a Lua source file.
      *
      * @public
      * @memberof module:mGWX#
      * @method   isCode
      * @param    {string} filename
      * @returns  {boolean} true if filename is a Lua source file
      */
    isCode: function(filename) {
      return (filename.search(/\.lua$/i) != -1)
    },

    /**
      * Returns true if the specified media is an image.
      *
      * @public
      * @memberof module:mGWX#
      * @method   isImage
      * @param    {string} filename
      * @returns  {boolean} true if media is an image (jpg/jpeg, png, gif or bmp)
      */
    isImage: function(filename) {
      return (filename.search(/\.jpg$|\.jpeg$|\.png$|\.gif$|\.bmp$/i) != -1)
    },

    /**
      * Returns true if the specified media is a sound.
      *
      * @public
      * @memberof module:mGWX#
      * @method   isSound
      * @param    {string} filename
      * @returns  {boolean} true if media is a sound (wav, mp3, fdl or ogg)
      */
    isSound: function(filename) {
      return (filename.search(/\.wav$|\.mp3$|\.fdl$|\.ogg$/i) != -1)
    }
  })

  return _this
});