#!/bin/bash

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
