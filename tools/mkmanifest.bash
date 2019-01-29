#!/bin/bash

#
#    Copyright (C) 2019 Nicolas Bertin
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

echo "CACHE MANIFEST"
echo ""
echo "# date: `date +'%Y-%m-%d %H:%M:%S'`"
echo ""
echo "CACHE:"
find import.css
find css -type f -print
find js  -type f -print
find lib -type f -print
find lua -type f -print
find img -type f -print
echo ""
echo "NETWORK:"
echo "*"
echo ""
echo "FALLBACK:"
