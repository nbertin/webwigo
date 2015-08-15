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
  "lib/m_lua",
  "lib/m_wig",
  "lib/m_gps",
  "lib/m_scr",
  "lib/m_tpl",
], function(mLUA, mWIG, mGPS, mSCR, mTPL) {

  var _this = {}
    
  //
  // utility routine to replace <br> by spaces in a string (for ellipsis)
  //
  function nobr(s) {
    return s.toString().replace(/<br>/gi, " ")
  }

  function ShowLuaVMError(errmsg) {
    var data = {
      errmsg: errmsg
    }
    var gobj = {
      object: $(_.template(mTPL.luaerr)(data)),
      level : mSCR.LEVEL_ERR,
      update: null,
      onshow: null
    }
    mSCR.Show(gobj)
  }

  _this.ShowSplashScreen = function(gwx) {
    var meta = gwx.getCartMetaData()
    var data = {
      id       : "id-splashscreen",
      media    : meta.media       ,
      name     : meta.name        ,
      activity : meta.activity    ,
      version  : meta.version     ,
      author   : meta.author      ,
      company  : meta.company     ,
      desc     : meta.desc        ,
      locdesc  : meta.locdesc     ,
      locless  : meta.locless     ,
      location : meta.location
    }
    var gobj = {
      object: $(_.template(mTPL.splash)(data)),
      level : mSCR.LEVEL_INI,
      update: null,
      onshow: function() {

        mTPL.setimage(data)

        MainScreen()

        $("#id-splashscreen-play").click(function(event) {
          _this.trigger("evt-gui-play")
        })
      }
    }
    mSCR.Show(gobj)
  }

  _this.HideSplashScreen = function() {
    mSCR.Hide(mSCR.LEVEL_INI)
  }
 
  /**
    * Displays an InputBox.
    *
    * @public
    * @memberof module:mGUI#
    * @method   GetInput
    * @param    {string} txt     - message to display
    * @param    {number} media   - media identifier to display
    * @param    {string} type    - InputBox type (MultipleChoice or Text)
    * @param    {array } choices - list of choices   
    */
  function GetInput(txt, media, type, choices) {
    var data = {
      id      : "id-getinput",
      media   : media        ,
      txt     : txt          ,
      type    : type         ,
      choices : choices
    }
    var gobj = {
      object: $(_.template(mTPL.inpbox)(data)),
      level : mSCR.LEVEL_TOP,
      update: null,
      onshow: function() {
        mTPL.setimage(data)

        if (type == "MultipleChoice") {
          for(var i = 0 ; i < choices.length ; i++) {
            $("#id-getinput-choice-"+(i+1)).click(function(event) {
              mSCR.Hide(gobj)
              mLUA.Call("JS2LUA_GetInput", $(this).html())
            })
          }
        } else {
          $("#id-getinput-submit").click(function(event) {
            var val = $("#id-getinput-value").val()
            mSCR.Hide(gobj)
            mLUA.Call("JS2LUA_GetInput", val)
          })
        }
    
        $("#id-getinput-back").click(function(event) {
          mSCR.Hide(gobj)
          mLUA.Call("JS2LUA_GetInput", "<cancelled>")
        })
      }
    }

    mSCR.Show(gobj)
  }
  
  /**
    * Displays a MessageBox.
    *
    * @public
    * @memberof module:mGUI#
    * @method   MessageBox
    * @param    {string} txt   - message to display
    * @param    {number} media - media identifier to display
    * @param    {string} btn1  - button1 text
    * @param    {string} btn2  - button2 text   
    */
  function MessageBox(text, media, btn1, btn2) {
    var data = {
      id    : "id-messagebox",
      media : media          ,
      text  : text           ,
      btn1  : btn1           ,
      btn2  : btn2
    }
    var gobj = {
      object: $(_.template(mTPL.msgbox)(data)),
      level : mSCR.LEVEL_TOP,
      update: null,
      onshow: function() {
        mTPL.setimage(data)

        var buttons = [ btn1, btn2 ]
        for(var i = 0 ; i < buttons.length ; i++) {
          if (buttons[i]) {
            var button = i+1
            $("#id-messagebox-button-"+button).on("click", { id: button }, function(event) {
              mSCR.Hide(gobj);
              mLUA.Call("JS2LUA_MessageBox", "Button"+event.data.id)
            })
          }
        }
      }
    }
    mSCR.Show(gobj)
  }

  /**
    * Displays the specified screen. The list of screens is the following:
    *   MAINSCREEN      = 0
    *   LOCATIONSCREEN  = 1
    *   ITEMSCREEN      = 2
    *   INVENTORYSCREEN = 3
    *   TASKSCREEN      = 4
    *   DETAILSCREEN    = 5
    * 
    * @public
    * @memberof module:mGUI#
    * @method   ShowScreen
    * @param    {number} idxScreen  - screen identifier (0..5)
    * @param    {number=} idxObject - object identifier (for DETAILSCREEN)
    */
  function ShowScreen(idxScreen, idxObject) {
    switch(idxScreen) {
      case MAINSCREEN     :
        mSCR.Clear(mSCR.LEVEL_3RD)
        mSCR.Clear(mSCR.LEVEL_2ND)
        break
      case LOCATIONSCREEN :
      case ITEMSCREEN     :
      case INVENTORYSCREEN:
      case TASKSCREEN     :
        mSCR.Clear(mSCR.LEVEL_3RD)
        ListScreen(idxScreen)
        break
      case DETAILSCREEN   :
        var foundidx = undefined
        var items = _screens[INVENTORYSCREEN].items
        for(var i = 0 ; (i < items.length) ; i++) {
          if (items[i].idx == idxObject) {
            foundidx = i
            break
          }
        }
        if (foundidx != undefined) {
          DetailScreen(INVENTORYSCREEN, i, false, false)
        } else {
          console.debug("ERROR: ShowScreen", idxScreen, idxObject, "= item not found!")
        }
        break
      default:
        console.debug("ERROR: ShowScreen", idxScreen, "UNKNOWN")
    }
  }
  
  var MAINSCREEN      = 0
  var LOCATIONSCREEN  = 1
  var ITEMSCREEN      = 2
  var INVENTORYSCREEN = 3
  var TASKSCREEN      = 4
  var DETAILSCREEN    = 5

  var _screens = [
    { name: undefined  , if0name: undefined              , items: undefined },
    { name: "Locations", if0name: "(Nowhere to go)"      , items: []        },
    { name: "You see"  , if0name: "(Nothing of interest)", items: []        },
    { name: "Inventory", if0name: "(No items)"           , items: []        }, 
    { name: "Tasks"    , if0name: "(No new tasks)"       , items: []        },
    { name: undefined  , if0name: undefined              , items: undefined }
  ]

  function MainScreen() {
    var gobj = {
      object: $(_.template(mTPL.main_0)({ id : "id-mainscreen"})),
      level : mSCR.LEVEL_1ST,
      update: function() {
        $("#id-mainscreen-items").empty()
        for(var i = LOCATIONSCREEN ; i <= TASKSCREEN ; i++) {
          var lst = function(v) {
            var r = []
            for(var i = 0 ; (i < v.items.length) ; i++) {
              if (! v.items[i].complete)
                r.push(v.items[i].name)
            }
            return r
          }
          var scr  = _screens[i]
          var data = {
            id      : "id-mainscreen-items-"+i,
            name    : scr.name                ,
            if0name : scr.if0name             ,
            items   : lst(scr)
          }
          $("#id-mainscreen-items").append(_.template(mTPL.main_i)(data))
          
          $("#"+data.id).on("click", { screenidx: i }, function(event) {
            if (_screens[event.data.screenidx].items.length > 0)
              ListScreen(event.data.screenidx)
          })
        }
      },
    }

    mSCR.Show(gobj)
  }
  
  function needrouting(screenidx) {
    return (screenidx == LOCATIONSCREEN || screenidx == ITEMSCREEN)
  }
  

  // FIXME:
  //function __cmp_items(a, b) {
  //  if (a.idx < b.idx)
  //    return -1
  //  if (a.idx > b.idx)
  //    return 1
  //  return 0
  //}

  //
  // @private
  // Generic function used to display the locations, you see, inventory or
  // tasks screens
  // @param   screenidx
  //
  function ListScreen(screenidx) {
    var gobj = {
      object: $(_.template(mTPL.list_0)({ id : "id-listscreen"})),
      level : mSCR.LEVEL_2ND,
      update: function() {
        var items = _screens[screenidx].items
        if (items.length > 0) {
          // remove all items
          $("#id-listscreen-items").empty()
          for(var i = 0 ; i < items.length ; i++) {
            var item = items[i]
            var data = {
              id          : "id-listscreen-items-"+i,
              name        : item.name               ,
              icon        : item.icon               ,
              desc        : nobr(item.description)  ,
              complete    : item.complete           ,
              needrouting : needrouting(screenidx)  ,
              distance    : item.distance           ,
              bearing     : item.bearing
            }
            $("#id-listscreen-items").append(_.template(mTPL.list_i)(data))
            mTPL.seticon(data)
            mTPL.setrouting(data, mTPL.routxs)
            $("#"+data.id).on("click", { objidx: item.idx }, function(event) {
              DetailScreen(screenidx, event.data.objidx, false, false)
            })
          }
        } else {
          mSCR.Hide(gobj)
        }
      },
      onshow: function() {
        $("#id-listscreen-back").click(function(event) {
          mSCR.Hide(gobj)
        })
      }
    }
    
    mSCR.Show(gobj)
  }

  function __itembyobjidx(items, objidx) {
    for(var i = 0 ; i < items.length ; i++) {
      if (items[i].idx === objidx)
        return items[i]
    }
    return undefined
  }

  //
  // @private  
  // @desc Displays the details of an object
  // @param   screenidx locations, you see, inventory or tasks
  // @param   itemidx   item clicked
  // @param   cmdwith   indicates which screen to display:
  //    false: commands
  //    >0   : targets associated to the "use with" command
  // @param   cmdidx    command idx
  //
  function DetailScreen(screenidx, objidx, cmdwith, cmdidx) {
    function _back(gobj, screenidx, cmdwith) {
      mSCR.Hide(gobj)
      if (! cmdwith) {
        var scr = _screens[screenidx]
        if (scr.items.length > 0)
          ListScreen(screenidx)
      }
    }
    var item = __itembyobjidx(_screens[screenidx].items, objidx)
    var data = {
      id          : "id-detailscreen"     ,
      media       : undefined             ,
      name        : undefined             ,
      desc        : undefined             ,
      needrouting : needrouting(screenidx),
      distance    : undefined             ,
      bearing     : undefined
    }
    if (item != undefined)
      data.media = item.media

    var gobj = {
      object: $(_.template(mTPL.dtl__0)(data)),
      level : mSCR.LEVEL_3RD,
      update: function() {
        var item = __itembyobjidx(_screens[screenidx].items, objidx)
        if (item != undefined) {
          data.media    = item.media
          data.name     = item.name
          data.desc     = item.description
          data.distance = item.distance
          data.bearing  = item.bearing

          mTPL.setimage(data)
          $("#"+data.id+"-name").html(data.name)
          $("#"+data.id+"-desc").html(data.desc)          
          mTPL.setrouting(data, mTPL.routxl)

          if (cmdwith) {
            DetailScreen_updateWithCmds(screenidx, objidx, cmdidx, gobj)
          } else {
            DetailScreen_updateCommands(screenidx, objidx, gobj)
          }
        } else {
          console.log("DetailScreen.update = item is undefined -> back")
          _back(gobj, screenidx, cmdwith)
        }
      },
      onshow: function() {
        mTPL.setimage(data)
        
        $("#id-detailscreen-ok").click(function(event) {
          _back(gobj, screenidx, cmdwith)
        })        
      }
    }

    mSCR.Show(gobj)
  }

  function targetsAreVisible() {
    return (_screens[ITEMSCREEN].items.length > 0)
  }

  function targetIsVisible(idx) {
    var items
    items = _screens[ITEMSCREEN].items
    for(var i = 0 ; i < items.length ; i++) {
      if (items[i].idx == idx)
        return true
    }
    items = _screens[INVENTORYSCREEN].items
    for(var i = 0 ; i < items.length ; i++) {
      if (items[i].idx == idx)
        return true
    }
    return false
  }

  function DetailScreen_updateCommands(screenidx, objidx, obj) {
    $("#id-detailscreen-items").empty()
    var item = __itembyobjidx(_screens[screenidx].items, objidx)
    for(var i = 0 ; i < item.commands.length ; i++) {
      var cmd = item.commands[i]
      if (cmd.enabled) {
        var data = {
          id      : "id-detailscreen-items-"+i,
          text    : cmd.text                  ,
          cmdwith : cmd.cmdwith               ,
          targets : targetsAreVisible()
        }
        $("#id-detailscreen-items").append(_.template(mTPL.dtl__i)(data))    
        if (cmd.cmdwith) {
          if (targetsAreVisible()) {
            $("#"+data.id).on("click", { cmdidx: cmd.idx }, function(event) {
              mSCR.Hide(obj)
              DetailScreen(screenidx, objidx, true, event.data.cmdidx)
            })
          }
        } else {
          $("#"+data.id).on("click", { objidx: objidx, cmdidx: cmd.idx }, function(event) {
            mSCR.Hide(obj)
            ExecuteCommand(event.data.objidx, event.data.cmdidx, false)
          })
        }
      }
    }
  }

  function DetailScreen_updateWithCmds(screenidx, objidx, cmdidx, obj) {
    if (targetsAreVisible()) {
      $("#id-detailscreen-items").empty()
      var item = __itembyobjidx(_screens[screenidx].items, objidx).commands[cmdidx-1]
      for(var i = 0 ; i < item.targets.length ; i++) {
        var tgt = item.targets[i]
        if (item.withall || targetIsVisible(tgt.ref)) {
          var data = {
            id      : "id-detailscreen-items-"+i,
            text    : tgt.name                  ,
            cmdwith : false                     ,
            targets : true
          }
          $("#id-detailscreen-items").append(_.template(mTPL.dtl__i)(data))    
          $("#"+data.id).on("click", { cmdidx: cmdidx, tgtidx: tgt.idx }, function(event) {
            mSCR.Hide(obj)
            ExecuteCommand(
              objidx, event.data.cmdidx, event.data.tgtidx
            )
          })
        }
      }
    } else {
      mSCR.Hide(obj)
    }
  }

  function ExecuteCommand(objidx, cmdidx, tgtidx) {
    mLUA.Call("JS2LUA_ExecuteCommand", objidx, cmdidx, tgtidx)
  }

  _this.Reset = function() {
    for(var i = LOCATIONSCREEN ; i <= TASKSCREEN ; i++)
      _screens[i].items = []
    mSCR.Clear()
  }

  _this.Create = function(emudiv) {
    mSCR.Create(emudiv)

    //
    // This event is sent by the mLUA module when the Lua VM is crashed 
    //
    _this.listenTo(mLUA, "evt-luavm-error", function(errmsg) {
      ShowLuaVMError(errmsg)
    })
    
    _this.listenTo(mWIG, "evt-wig-refresh-objects", function(obj) {
      _screens[LOCATIONSCREEN ].items = obj.zones
      _screens[ITEMSCREEN     ].items = obj.items
      _screens[INVENTORYSCREEN].items = obj.inven
      _screens[TASKSCREEN     ].items = obj.tasks

      mSCR.Update()
    })

    _this.listenTo(mWIG, "evt-wig-getinput", function(txt, media, type, choice1, choice2, choice3, choice4) {
      GetInput(txt, media, type, choice1, choice2, choice3, choice4)
    })

    _this.listenTo(mWIG, "evt-wig-messagebox", function(txt, media, btn1, btn2) {
      MessageBox(txt, media, btn1, btn2)
    })

    _this.listenTo(mWIG, "evt-wig-showscreen", function(idxScreen, idxObject) {
      ShowScreen(idxScreen, idxObject)
    })
  }

  // extends module with Backbone Events
  _.extend(_this, Backbone.Events)
  return _this
});
