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

  var _this = {}

  function _getURLparams(uri) {
    var vars = []
    var hash

    var hashes = uri.slice(uri.indexOf('?') + 1).split('&')
    for(var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=')
      vars.push(hash[0])
      vars[hash[0]] = hash[1]
    }
    return vars
  }

  function _getURLparam(uri, name) {
    return _getURLparams(uri)[name]
  }

  function _trimslash(s) {
    if (s) {
      if (s.match(/\/$/))
        return s.slice(0, -1)
    }
    return s
  }

  _this.parse = function(uri) {
    var cart_provider_name = _trimslash(_getURLparam(uri, "cart_provider_name"))
    var cart_provider_url  = _trimslash(_getURLparam(uri, "cart_provider_url" ))
    var cart_url           = _trimslash(_getURLparam(uri, "cart_url"          ))
    var cart_name          = _trimslash(_getURLparam(uri, "cart_name"         ))
    var cart_type          = _trimslash(_getURLparam(uri, "cart_type"         ))

    if (cart_url == undefined) {
      return {
        error: "ERR_CART_URL_NOT_FOUND"
      }
    }
    cart_url = decodeURIComponent(cart_url)

    if (cart_type == undefined) {
      return {
        error: "ERR_CART_TYPE_NOT_FOUND"
      }
    }

    cart_type = cart_type.toUpperCase()
    if (cart_type !== "GWZ" && cart_type !== "GWC" && cart_type !== "LUA") {
      return {
        error: "ERR_GWZ_OR_GWC_OR_LUA_FILE_EXPECTED"
      }
    }
    if (cart_type === "LUA")
      cart_type = "SRC"

    if (cart_provider_name != undefined)
      cart_provider_name = decodeURIComponent(cart_provider_name)

    if (cart_name != undefined)
      cart_name = decodeURIComponent(cart_name)

    if (cart_provider_url != undefined)
      cart_provider_url = decodeURIComponent(cart_provider_url)

    return {
      error             : false             ,
      cart_provider_name: cart_provider_name,
      cart_provider_url : cart_provider_url ,
      cart_url          : cart_url          ,
      cart_name         : cart_name         ,
      cart_type         : cart_type
    }
  }

  return _this
});
