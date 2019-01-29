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
