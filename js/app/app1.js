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
  "app/ctrl",
  "app/emap",
  "app/gpsr",
  "app/emul",
  "app/code",
  "app/data",
  "app/conf",
  "app/term"
  //"app/help"  ,
  //"app/about"
], function(ViewCtrl, ViewEMap, ViewGpsr, ViewEmul, ViewCode, ViewData, ViewConf, ViewTerm/*, ViewHelp, ViewAbout*/) {

  var _this = {}

  //
  // boot 2nd stage (after fullpage rendering)
  //
  // see index.html
  // called by fullpage plugin (= afterRender)
  //
  _this.init1 = function() {
    new ViewGpsr()
    new ViewEMap()
    new ViewEmul()
    new ViewCtrl()
    new ViewCode()
    new ViewData()
    new ViewConf()
    new ViewTerm()
    
    //new ViewHelp ()
    //new ViewAbout()
  }

  return _this
});
