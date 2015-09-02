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
