--[[
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
--]]

require "Wherigo"

-----------------------------------------------------------------------------
-- GROUNDSPEAK runtime (modified by Dirk):
--   Wherigo.VectorToPoint   = nil
--   Wherigo.TranslatePoint  = nil
--   Wherigo.ProcessLocation takes 2 arguments (ZonePoint, accuracy)
-----------------------------------------------------------------------------
Wherigo.VectorToZone = function(point, zone)
  return WIGInternal.VectorToZone(point, zone)
end
Wherigo.VectorToSegment = function(point, p1, p2)
  return WIGInternal.VectorToSegment(point, p1, p2)
end
Wherigo.TranslatePoint = function(point, distance, degrees)
  return WIGInternal.TranslatePoint(point, distance, degrees)
end
Wherigo.VectorToPoint = function(p1, p2)
  return WIGInternal.VectorToPoint(p1, p2)
end
Wherigo.IsPointInZone = function(point, zone)
  return WIGInternal.IsPointInZone(point, zone)
end

-----------------------------------------------------------------------------
-- U T I L I T I E S
-----------------------------------------------------------------------------
local json = require("dkjson")
require("base64")

function convert_args(args)
  return js.convert_args(args)
end

function jsonencode(obj)
  return '"' .. b64enc(json.encode(obj)) .. '"'
end

function cleanstr(s)
  local r = s
  r = r:gsub("\r"        , ""    ) -- remove CR
  r = r:gsub("\\n"       , "\n"  ) -- replace '\n' with LF
  r = r:gsub("<[bB][rR]>", "\n"  ) -- replace <BR> with CRLF
  r = r:gsub("[\n]+"     , "<BR>") -- replace CRLF+ with <BR>
  return r
end

function mediaidx(obj)
  local idx = false
  if obj and obj ~= nil then
    idx = obj.ObjIndex
  end
  return idx
end

-----------------------------------------------------------------------------
-- J S --> L U A
-----------------------------------------------------------------------------
local __input_obj = nil
function JS2LUA_GetInput(arg)
   if __input_obj then
    local tmp = __input_obj
    __input_obj = nil
    tmp:GetInput(arg)
  end
end

local __messagebox_callback = nil
function JS2LUA_MessageBox(arg)
  if __messagebox_callback then
    local tmp = __messagebox_callback
    __messagebox_callback = nil
    tmp(arg)
  end
end

function JS2LUA_SetPlayerName(name)
  Player.Name = name
end

function JS2LUA_SetPlayerLocation(lat, lng, accuracy)
  local alt = 0
  Player:ProcessLocation(lat, lng, alt, accuracy)
end

function JS2LUA_SetStartingLocation(lat, lng)
  Player.Cartridge.StartingLocation.latitude  = lat
  Player.Cartridge.StartingLocation.longitude = lng
end

function JS2LUA_RefreshLocation(accuracy)
  Player:RefreshLocation(false, accuracy)
end

_commands = {}
function JS2LUA_ExecuteCommand(objidx, cmdidx, tgtidx)
  local cmd = _commands[objidx].CommandsArray[cmdidx]
  if cmd then
    if tgtidx then
      if cmd.WorksWithList then
        cmd:exec(cmd.WorksWithList[tgtidx])
      else
        for _, o in ipairs(Player:GetVisibleInventory()) do
          if o.ObjIndex == tgtidx then
            cmd:exec(o)
            break
          end
        end
      end
    else
      cmd:exec()
    end
  end
end

local _timers = {}
function JS2LUA_TimerTick(idx)
  local obj = _timers[idx]
  if obj then
    obj:Tick()
  end
end

function JS2LUA_StartCartridge()
  Player.Cartridge:Start()
  LUA2JS_CartridgeStarted()
end

-----------------------------------------------------------------------------
-- L U A --> J S
-----------------------------------------------------------------------------
function LUA2JS_CartridgeLoaded()
  js.run("mWIG.CartridgeLoaded()")
end

function LUA2JS_CartridgeStarted()
  js.run("mWIG.CartridgeStarted()")
end

function LUA2JS_GetInput(item)
  __input_obj = item
  local obj = {
    txt     = cleanstr(item.Text) ,
    media   = mediaidx(item.Media),
    type    = item.InputType      ,
    choices = item.Choices
  }
  js.run("mWIG.GetInput("..jsonencode(obj)..")")
end

function LUA2JS_MessageBox(Text, Media, Btn1, Btn2, wrapper)
  __messagebox_callback = wrapper
  local obj = {
    txt   = cleanstr(Text),
    media = Media         ,
    btn1  = Btn1          ,
    btn2  = Btn2
  }
  js.run("mWIG.MessageBox("..jsonencode(obj)..")")
end

function LUA2JS_ShowScreen(idxScreen, idxObject)
  local args = {
    idxScreen,
    idxObject
  }
  js.run("mWIG.ShowScreen("..convert_args(args)..")")
end

function LUA2JS_RefreshZone(zone)
  local obj = {
    idx     = zone.ObjIndex,
    name    = zone.Name    ,
    active  = zone.Active  ,
    visible = zone.Visible ,
    points  = {}
  }
  for k,v in pairs(zone.Points) do
    obj.points[k] = {
      lat = v.latitude,
      lng = v.longitude
    }
  end
  js.run("mWIG.RefreshZone("..jsonencode(obj)..")")
end

function toObject(item, routing)
  local obj = {
    class       = item.ClassName            ,
    idx         = item.ObjIndex             ,
    name        = item.Name                 ,
    description = cleanstr(item.Description),
    icon        = mediaidx(item.Icon )      ,
    media       = mediaidx(item.Media)      ,
    complete    = false                     ,
    distance    = 0                         ,
    bearing     = 0                         ,
    commands    = {}
  }
  if routing then -- Zones and Objects
    local src = Player.ObjectLocation
    local dst = item:GetObjectLocation()
    if dst then
      d, b = Wherigo.VectorToPoint(src, dst)
      obj.distance = d:GetValue("m")
      obj.bearing  = b
    end
  end
  if item.ClassName == "ZCharacter" or item.ClassName == "ZItem" then
    for k,v in ipairs(item.CommandsArray) do
        local cmd = {
          idx     = v.Index         ,
          text    = cleanstr(v.Text),
          enabled = v.Enabled       ,
          keyword = v.Keyword       ,
          cmdwith = v.CmdWith       ,
          withall = v.WorksWithAll  ,
          targets = {}
        }
        if v.CmdWith then
          if v.WorksWithList then
            for i, o in ipairs(v.WorksWithList) do
              table.insert(cmd.targets, { name = o.Name, idx = i, ref = o.ObjIndex })
            end
          else
            for i, o in ipairs(Player:GetVisibleInventory()) do
              table.insert(cmd.targets, { name = o.Name, idx = o.ObjIndex, ref = o.ObjIndex })
            end
          end
        end
        table.insert(obj.commands, cmd)
        _commands[item.ObjIndex] = item
    end
  end
  if item.ClassName == "ZTask" then
    obj.complete = item.Complete
  end
  return obj
end

local not_refresh = 0
local cnt_refresh = 0
local prv_refresh = ""
function LUA2JS_RefreshObjects(obj)
  local cur_refresh = jsonencode(obj)
  if cur_refresh ~= prv_refresh then
    js.run('mWIG.RefreshObjects('..cur_refresh..')')
    prv_refresh = cur_refresh
    cnt_refresh = cnt_refresh + 1
  else
    not_refresh = not_refresh + 1
  end
end

function __refresh_objects()
  local _zones = {}
  for _,v in ipairs(Player:GetActiveVisibleZones()) do
    table.insert(_zones, toObject(v, true))
  end
  
  local _items = {}
  for _,v in ipairs(Player:GetVisibleObjects()) do
    table.insert(_items, toObject(v, true))
  end
  
  local _inven = {}
  for _,v in ipairs(Player:GetVisibleInventory()) do
    table.insert(_inven, toObject(v, false))
  end

  local _tasks = {}
  for _,v in ipairs(Player:GetActiveVisibleTasks()) do
      table.insert(_tasks, toObject(v, false))
  end
  
  local obj = {
    zones = _zones,
    items = _items,
    inven = _inven,
    tasks = _tasks
  }
  LUA2JS_RefreshObjects(obj)
end

function LUA2JS_RefreshMedia(media)
  local obj = {
    idx         = media.ObjIndex   ,
    name        = media.Name       ,
    resources   = media.Resources
  }
  js.run("mWIG.RefreshMedia("..jsonencode(obj)..")")
end

function LUA2JS_TimerStart(obj)
  _timers[obj.ObjIndex] = obj
  local args = {
    obj.ObjIndex,
    obj.Duration * 1000
  }
  js.run("mWIG.TimerStart("..convert_args(args)..")")
end

function LUA2JS_Exit()
  js.run("mLUA.Exit()")
end

-------------------------------------------------------------------------------
-- W I G I N T E R N A L
-------------------------------------------------------------------------------
WIGInternal = {}

WIGInternal.LogMessage = function(level, message)
  if level > Wherigo.LOGDEBUG then
    io.write(string.format("[%02d] %s\n", level, message))
  end
end

--
-- SaveClose
-- DriveTo
-- StopSound
-- Alert
--
WIGInternal.NotifyOS = function(cmd)
  --if cmd == "SaveClose" then
  --  return
  --elseif cmd == "DriveTo"   then
  --  return
  --elseif cmd == "StopSound" then
  --  return
  --elseif cmd == "Alert"     then
  --  return
  --end
  print("ERROR", cmd,  "(not implemented)")
end

WIGInternal.ZoneStateChangedEvent = function(zones)
  __refresh_objects()
end

WIGInternal.InventoryEvent = function(obj, src, dst)
  print("INFO ", "InventoryEvent", obj.Name)
  __refresh_objects()
end

WIGInternal.TimerEvent = function(obj, event)
  if (event == "start") then
    LUA2JS_TimerStart(obj)
    if obj.OnStart ~= nil then
      obj:OnStart()
    end
  elseif
     (event == "stop") then
    if obj.OnStop ~= nil then
      obj:OnStop()
    end
  end
end

WIGInternal.CartridgeEvent = function(event)
  --if (event == "sync") then
  --  return
  --end
  print("ERROR", "CartridgeEvent = ", event, "(not implemented)")
end

WIGInternal.CommandChangedEvent = function(cmd)
  print("INFO ", "CommandChangedEvent", cmd.Keyword)
  __refresh_objects()
end

WIGInternal.AttributeChangedEvent = function(obj, attr)
  print("INFO", "AttributeChangedEvent", obj.ClassName, obj.Name, attr)
  if (obj.ClassName == "Zone") then
      LUA2JS_RefreshZone(obj)
  else
    if obj.ClassName ~= "ZInput" or obj.ClassName ~= "ZMedia" then
      if Player and Player.Cartridge then
        __refresh_objects()
      end
    end
  end
end

WIGInternal.MessageBox = function(Text, Media, Btn1, Btn2, wrapper)
  if Media == -1 then
    Media = false
  end
  LUA2JS_MessageBox(Text, Media, Btn1, Btn2, wrapper)
end

WIGInternal.GetInput = function(obj)
  LUA2JS_GetInput(obj)
end

WIGInternal.MediaEvent = function(event, mediaObj)
  print("ERROR", "MediaEvent", event, mediaObj, "(not implemented)")
end

WIGInternal.ShowStatusText = function(text)
  print("ERROR", "ShowStatusText", text, "(not implemented)")
end
    
WIGInternal.ShowScreen = function(screenIdx, idxObj)
  LUA2JS_ShowScreen(screenIdx, idxObj)
end

-----------------------------------------------------------------------------
-- W E B W I G  R O U T I N E S
-----------------------------------------------------------------------------
-- 1 nautical mile
local NMI = 1852

function m2nmi(v)
  return v / NMI 
end

function nmi2m(v)
  return v * NMI 
end

-- round to nearest integer
function round(n)
  return math.floor(n+.5)
end

WIGInternal.VectorToZone = function(point, zone)
  if Wherigo.IsPointInZone(point, zone) then
    return Wherigo.Distance(0), 0
  end
  local points = zone.Points
  local d, b = Wherigo.VectorToSegment(point, points[#points], points[1])
  for k, v in pairs(points) do
    if k > 1 then
      local _d, _b = Wherigo.VectorToSegment(point, points[k-1], points[k])
      if _d:GetValue("m") < d:GetValue("m") then
        d = _d
        b = _b
      end
    end
  end
  return d, b
end

WIGInternal.VectorToSegment = function(point, p1, p2)
  local d1, b1 = Wherigo.VectorToPoint(p1, point)
  local d1     = math.rad(m2nmi(d1:GetValue("m")) / 60.0)
  local ds, bs = Wherigo.VectorToPoint(p1, p2)
  local dist   = math.asin(math.sin(d1) * math.sin(math.rad(b1 - bs)))
  local dat    = math.acos(math.cos(d1) / math.cos(dist))

  if dat <= 0 then
    return Wherigo.VectorToPoint(point, p1)
  elseif dat >= math.rad(m2nmi(ds:GetValue("m")) / 60.0) then
    return Wherigo.VectorToPoint(point, p2)
  end

  local intersect = Wherigo.TranslatePoint(p1, Wherigo.Distance(nmi2m(dat * 60), "m"), bs)
  return Wherigo.VectorToPoint(point, intersect)
end

WIGInternal.TranslatePoint = function(point, distance, degrees)
  local d    = math.rad(m2nmi(distance:GetValue('m')) / 60.0)
  local b    = math.rad(degrees)
  local lat1 = math.rad(point.latitude)
  local lat2 = math.asin(math.sin(lat1) * math.cos(d) + math.cos(lat1) * math.sin(d) * math.cos(b))
  local dlon = math.atan2(math.sin(b) * math.sin(d) * math.cos(lat1), math.cos(d) - math.sin(lat1) * math.sin(lat2))
  return Wherigo.ZonePoint(math.deg(lat2), point.longitude + math.deg(dlon), point.altitude)
end

WIGInternal.VectorToPoint = function(p1, p2)
  if p1.longitude == p2.longitude then
    local d = Wherigo.Distance(nmi2m(math.abs(p1.latitude - p2.latitude) * 60), 'm')
    local b
    if p1.latitude <= p2.latitude then
      b = 0
    else
      b = 180
    end
    return d, b
  end
  local lat1 = math.rad(p1.latitude )
  local lon1 = math.rad(p1.longitude)
  local lat2 = math.rad(p2.latitude )
  local lon2 = math.rad(p2.longitude)
  local d    = 2 * math.asin(math.sqrt(
    math.sin((lat1-lat2)/2)^2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon1-lon2)/2)^2)
  )
  local b    = math.atan2(
    math.sin(lon2-lon1) * math.cos(lat2),
    math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(lon2-lon1)
  )
  return Wherigo.Distance(nmi2m(math.deg(d) * 60), "m"), ((math.deg(b) + 360) % 360)
end

WIGInternal.IsPointInZone = function(point, zone)
  -- from http://www.visibone.com/inpoly/
  -- easier way, without care of OriginalPoint
  local x1, y1, x2, y2
  local inside = false
  local points = zone.Points
  local xold   = points[#points].longitude
  local yold   = points[#points].latitude
  for k, p in pairs(points) do
    xnew = p.longitude
    ynew = p.latitude
    if (xnew - xold) % 360 < 180 then
      x1 = xold
      x2 = xnew
      y1 = yold
      y2 = ynew
    else
      x1 = xnew
      x2 = xold
      y1 = ynew
      y2 = yold
    end
    if (x1 < point.longitude) and (point.longitude <= x2) and
       (point.latitude - y1) * (x2-x1) < (y2-y1)*(point.longitude-x1) then
      inside = not inside
    end
    xold = xnew
    yold = ynew
  end
  return inside
end

-------------------------------------------------------------------------------
-- E N V
-------------------------------------------------------------------------------
local function __env_check(t, k, v)
  if ((k == "Platform") or (k == "DeviceID") or (k == "Device")) then
    error(k .. " is a read-only variable", 2)
  end
  rawset(t, k, v)
end

local function __readonly(t)
  local proxy = {}
  local mt = {       -- create metatable
    __index    = t,
    __newindex = __env_check
  }
  setmetatable(proxy, mt)
  return proxy
end

Env = __readonly{
  Platform     = "emscripten",
  CartFolder   = "/"         ,
  SyncFolder   = "/"         ,
  LogFolder    = "/"         ,
  PathSep      = "/"         ,
  DeviceID     = "webwigo"   , -- Desktop
  Version      = ""          , -- "2.11"
  CartFilename = ""          , -- from reader
  Downloaded   = 0           , -- from GWC
  Device       = "browser"     -- browser   
}

-------------------------------------------------------------------------------
-- D E B U G
-------------------------------------------------------------------------------
--[[
function __dump(object, msg)
  print(msg)
  if (object ~= nil and getmetatable(object) ~= nil) then
    for k, v in pairs(getmetatable(object)._self) do
      print(">", k, v)
    end
  end
end
]]
