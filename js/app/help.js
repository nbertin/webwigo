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
  "text!app/tpl/help.html"
], function(T) {

  var ViewHelp = Backbone.View.extend({
    el        : $("#id-help"),
    template  : _.template(T),
    initialize: function() {
      this.render()
    },
    render    : function() {
      this.$el.html(this.template())
      return this
    }
  });

  // singleton
  var _instance;
  return function getViewHelp() {
    return (_instance = (_instance || new ViewHelp()))
  }
});
