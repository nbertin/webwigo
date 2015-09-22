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

-------------------------------------------------------------------------------
-- E M U L A T O R  P R O T E C T I O N
-------------------------------------------------------------------------------
local function _suicide()
  error(
    "The author of this cartridge has specified that it should not be playable in "..
    "the emulator.<br><br>"..
    "note: the code for the protection detection is experimental. If you think "..
    "it's a false-positive, please do not hesitate to contact the author to confirm "..
    "if the cartridge is protected or not and then, get in touch with us!"
  )
end

local function _builder()
  function _match(mincount, patterns)
    local matched = 0
    for k, v in pairs(_G) do
      for _, pattern in pairs(patterns) do
        if string.match(k, pattern) then
          matched = matched + 1
        end
      end
    end
    return matched >= mincount
  end
  if _match(3, { "^WWB_" }) then
    return "earwigo"
  end
  if _match(2, { "^_Urwigo", "^Garmin" }) then
    return "urwigo"
  end
  return nil
end

local function _urwigo_env(t, callback)
  local proxy  = {}
  local mt     = {
    __index    = function(t, k)
      print("########## read", k)
      if (k == "Platform") then
        callback()
        return "Win32"
      end
      if (k == "DeviceID") then
        callback()
        return "Desktop"
      end
      return ""
    end
  }
  setmetatable(proxy, mt)
  return proxy
end

local function _protected()
  local builder = _builder()
  local result  = false

  -- earwigo detection
  if builder == "earwigo" then
    result = (WWB_noemul and type(WWB_noemul) == "function")
  end

  -- urwigo detection
  if builder == "urwigo" then
    local count = 0

    local function env_access(k)
      count = count + 1
    end
    Env = _urwigo_env(Env, env_access)

    local oldfct = _Urwigo.MessageBox
    _Urwigo.MessageBox = function(tbl)
      count = count + 1
    end
    cart.OnStart()
    _Urwigo.MessageBox = oldfct
    result = (count == 3)
  end

  return result
end

-------------------------------------------------------------------------------
-- C A R T R I D G E  L O A D E R 
-------------------------------------------------------------------------------
cart = dofile("cartridge.lua")
if _protected() then
  _suicide()
end

EnvProtect()
Player.Cartridge = cart

for _,v in ipairs(cart:GetAllOfType("ZMedia")) do
  LUA2JS_RefreshMedia(v)
end

for _,v in ipairs(cart:GetAllOfType("Zone")) do
  LUA2JS_RefreshZone(v)
end

LUA2JS_CartridgeLoaded()
