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

(function() {
  
  L.Control.CustomButton = L.Control.extend({
    options: {
      position: "topleft"       ,
      title   : ""              ,
      icon    : "fa fa-circle-o",
      callback: undefined
    },

    onAdd: function(map) {
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

      this.link       = L.DomUtil.create('a', 'leaflet-bar-part', container);
      this.link.href  = '#';
      this.link.title = this.options.title;
      
      L.DomUtil.create('i', this.options.icon, this.link);
      L.DomEvent.on(this.link, 'click', this._click, this);

      return container;
    },

    _click: function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault (e);

      if (this.options.callback)
        this.options.callback(e);
    }
  });

  L.control.custombutton = function(id, options) {
    return new L.Control.CustomButton(id, options);
  };

})();
