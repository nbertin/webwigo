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
  "lib/m_gwx"
], function(mGWX) {

  var _wURL = window.webkitURL || window.mozURL || window.URL

  // object type
  var OBJTYP_LUA =  0
  var OBJTYP_BMP =  1
  var OBJTYP_PNG =  2
  var OBJTYP_JPG =  3
  var OBJTYP_GIF =  4
  var OBJTYP_WAV = 17
  var OBJTYP_MP3 = 18
  var OBJTYP_FDL = 19
  var OBJTYP_OGG = 21

  var _objtyp = []

  function _seek(hdlr, offt) {
    hdlr.offt = offt
    return hdlr
  }

  function _read(hdlr, type, size) {
    var data
    var offt = hdlr.offt
    var view = hdlr.view
    switch(type) {
    case "i8" : data = view.getInt8   (offt      ); hdlr.offt += 1; break
    case "u8" : data = view.getUint8  (offt      ); hdlr.offt += 1; break
    case "i16": data = view.getInt16  (offt, true); hdlr.offt += 2; break
    case "u16": data = view.getUint16 (offt, true); hdlr.offt += 2; break
    case "i32": data = view.getInt32  (offt, true); hdlr.offt += 4; break
    case "u32": data = view.getUint32 (offt, true); hdlr.offt += 4; break
    case "u64": data = _read(hdlr, "u32") << 32 | _read(hdlr, "u32"); break
    case "f32": data = view.getFloat32(offt, true); hdlr.offt += 4; break
    case "f64": data = view.getFloat64(offt, true); hdlr.offt += 8; break
    case "sz0":
      data  = ""
      var c = _read(hdlr, "u8")
      while(c > 0) {
        data = data + String.fromCharCode(c)
        c    = _read(hdlr, "u8")
      }
      break;
    case "buf":
      data = hdlr.data.subarray(offt, offt+size)
      hdlr.offt += size
      break
    default:
      throw "_read(): unkown type ="+type
    }
    return data
  }

  function _signature_check(hdlr) {
    var signature = [
    //             C   A   R   T
      0x02, 0x0a, 67, 65, 82, 84, 0x0
    ]
    for(i = 0, hdlr.offt = 0 ; i < signature.length ; i++) {
      if (_read(hdlr, "u8") !== signature[i])        return "ERR_BAD_SIGNATURE"
    }
    return ""
  }

  function _read_objlst(hdlr) {
    hdlr.p_objects = []
    hdlr.n_objects = _read(hdlr, "u16")
    if (hdlr.n_objects == 0)
      return "ERR_LUA_CHUNK_NOT_FOUND"
    for(var i = 0 ; (i < hdlr.n_objects) ; i++) {
      hdlr.p_objects.push({
        oid: _read(hdlr, "u16"),
        off: _read(hdlr, "u32"),
        typ: undefined         ,
        buf: undefined         ,
        siz: undefined
      })
    }
    return ""
  }

  function _read_header(hdlr) {
    hdlr.headerlen = _read(hdlr, "u32")
    hdlr.lat       = _read(hdlr, "f64")
    hdlr.lng       = _read(hdlr, "f64")
    hdlr.alt       = _read(hdlr, "f64")
    hdlr.date      = _read(hdlr, "u64")
    hdlr.oid_img   = _read(hdlr, "i16")
    hdlr.oid_ico   = _read(hdlr, "i16")
    hdlr.cart_type = _read(hdlr, "sz0")
    hdlr.user_name = _read(hdlr, "sz0")
    hdlr.playerid  = _read(hdlr, "u64")
    hdlr.cart_name = _read(hdlr, "sz0")
    hdlr.cart_uuid = _read(hdlr, "sz0")
    hdlr.cart_desc = _read(hdlr, "sz0")
    hdlr.startdesc = _read(hdlr, "sz0")
    hdlr.version   = _read(hdlr, "sz0")
    hdlr.author    = _read(hdlr, "sz0")
    hdlr.company   = _read(hdlr, "sz0")
    hdlr.targetdev = _read(hdlr, "sz0")
    hdlr.unlocklen = _read(hdlr, "u32")
    hdlr.unlockcod = _read(hdlr, "sz0")
    return ""
  }

  function _typ2ext(typ) {
    var v = _objtyp[typ]
    if (v == undefined)
      return "unk"+typ
    return v.ext
  }

  function _typ2mim(typ) {
    var v = _objtyp[typ]
    if (v == undefined)
      return "application/octet-stream"
    return v.mim
  }

  function _filename(obj) {
    return obj.oid+"."+_typ2ext(obj.typ)
  }

  function _read_objdat(hdlr, URL) {
    for(i = 0 ; i < hdlr.n_objects ; i++) {
      var obj = hdlr.p_objects[i]
      _seek(hdlr, obj.off)
      if (i == 0) {
        if (obj.oid != 0)
          return "ERR_LUA_CHUNK_NOT_FOUND"
        obj.typ = OBJTYP_LUA
        obj.siz = _read(_seek(hdlr, obj.off), "u32")
        obj.buf = _read(hdlr, "buf", obj.siz)
      } else {
        if (_read(hdlr, "u8")) {
          var blob
          obj.typ = _read(hdlr, "u32")
          obj.siz = _read(hdlr, "u32")
          var blb = new Blob(
            [_read(hdlr, "buf", obj.siz)], { type: _typ2mim(obj.typ) }
          ) 
          obj.buf = _wURL.createObjectURL(blb)
        }
      }
    }
    return ""
  }

  var mGWC = mGWX.extend({

    _hdlr: {
      data     : undefined,
      view     : undefined,
      offt     : 0        ,

      n_objects: undefined,
      p_objects: []       ,
      headerlen: undefined,
      lat      : undefined,
      lng      : undefined,
      alt      : undefined,
      date     : undefined,
      oid_img  : undefined,
      oid_ico  : undefined,
      cart_type: undefined,
      user_name: undefined,
      cart_name: undefined,
      cart_uuid: undefined,
      cart_desc: undefined,
      startdesc: undefined,
      version  : undefined,
      author   : undefined,
      company  : undefined,
      targetdev: undefined,
      unlocklen: undefined,
      unlockcod: undefined,
      playerid : undefined
    },

    init: function() {
      if (_objtyp.length == 0) {
        _objtyp[OBJTYP_LUA] = { ext: "lua", mim: "text/plain" }
        _objtyp[OBJTYP_BMP] = { ext: "bmp", mim: "image/bmp"  }
        _objtyp[OBJTYP_PNG] = { ext: "png", mim: "image/png"  }
        _objtyp[OBJTYP_JPG] = { ext: "jpg", mim: "image/jpeg" }
        _objtyp[OBJTYP_GIF] = { ext: "gif", mim: "image/gif"  }
        _objtyp[OBJTYP_WAV] = { ext: "wav", mim: "audio/wav"  }
        _objtyp[OBJTYP_MP3] = { ext: "mp3", mim: "audio/mpeg" }
        _objtyp[OBJTYP_FDL] = { ext: "fdl", mim: "application/octet-stream" }
        _objtyp[OBJTYP_OGG] = { ext: "ogg", mim: "audio/ogg"  }
      }
    },

    _read: function(blob, name, cb_onSuccess, cb_onError) {
      var that   = this
      var reader = new FileReader()

      reader.onload = function(evt) {
        that._hdlr.data = new Uint8Array(evt.target.result)
        that._hdlr.view = new DataView  (evt.target.result)
        that._hdlr.offt = 0

        var err = ""
        try {
          err = _signature_check(that._hdlr)
          if (err !== "") {
            cb_onError(err)
            return
          }
          err = _read_objlst(that._hdlr)
          if (err !== "") {
            cb_onError(err)
            return
          }
          err = _read_header(that._hdlr)
          err = _read_objdat(that._hdlr)
          if (err !== "") {
            cb_onError(err)
            return
          }
        } catch(e) {
          cb_onError("ERR_SHORT_FILE")
          return
        }
          
        that._code = that._hdlr.p_objects[0].buf
        that._name = name
        cb_onSuccess(that)
      }
      reader.onerror = function(evt) {
        cb_onError("ERR_UNKNOWN_ERROR("+evt.target.error.code+")")
      }
      reader.readAsArrayBuffer(blob)
    },

    canSeeCode: function() {
      return false
    },

    getMediaData: function(id, cb_onSuccess) {
      for(var i = 0 ; i < this._hdlr.n_objects ; i++) {
        var obj = this._hdlr.p_objects[i]
        if (typeof id == "string") {
          if (id === _filename(obj)) {
            cb_onSuccess(obj.buf)
            return
          }
        } else {
          if (id == obj.oid) {
            cb_onSuccess(obj.buf)
            return
          }
        }
      }
      cb_onSuccess("")
    },

    getMediasList: function() {
      var r = []
      for(var i = 0 ; i < this._hdlr.n_objects ; i++)
        r.push(_filename(this._hdlr.p_objects[i]))
      return r
    },

    canSeeMedias: function() {
      return false
    },

    canSeeHiddenZones: function() {
      return false
    },

    getCartMetaData: function() {
      function isPlayAnywhere(hdlr) {
        return ((hdlr.lat == 360) && (hdlr.lng == 360))
      }
      function getStartLocation(hdlr) {
        if (isPlayAnywhere(hdlr))
          return undefined
        return { lat: hdlr.lat, lng: hdlr.lng }
      }
      return {
        media    : this._hdlr.oid_img  ,
        name     : this._hdlr.cart_name,
        activity : this._hdlr.cart_type,
        version  : this._hdlr.version  ,
        author   : this._hdlr.author   ,
        player   : this._hdlr.user_name,
        company  : this._hdlr.company  ,
        desc     : this._hdlr.cart_desc,
        locdesc  : this._hdlr.startdesc,
        locless  : isPlayAnywhere  (this._hdlr),
        location : getStartLocation(this._hdlr)
      }
    },

    getCartType: function() {
      return this.TYPE_GWC
    },

    getPlayerName: function() {
      return this._hdlr.user_name
    }
  })

  return mGWC
});