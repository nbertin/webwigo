--[[
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
--]]

-------------------------------------------------------------------------------
-- E M U L A T O R  P R O T E C T I O N
-------------------------------------------------------------------------------
--local function _suicide()
--  error(
--    "The author of this cartridge has specified that it should not be playable in "..
--    "the emulator.<br><br>"..
--    "note: the code for the protection detection is experimental. If you think "..
--    "it's a false-positive, please do not hesitate to contact the author to confirm "..
--    "if the cartridge is protected or not and then, get in touch with us!"
--  )
--end
--
--local function _builder()
--  function _match(mincount, patterns)
--    local matched = 0
--    for k, v in pairs(_G) do
--      for _, pattern in pairs(patterns) do
--        if string.match(k, pattern) then
--          matched = matched + 1
--        end
--      end
--    end
--    return matched >= mincount
--  end
--  if _match(3, { "^WWB_" }) then
--    return "earwigo"
--  end
--  if _match(2, { "^_Urwigo", "^Garmin" }) then
--    return "urwigo"
--  end
--  return nil
--end
--
--local function _urwigo_env(t, callback)
--  local proxy  = {}
--  local mt     = {
--    __index    = function(t, k)
--      if (k == "Platform") then
--        callback()
--        return "Win32"
--      end
--      if (k == "DeviceID") then
--        callback()
--        return "Desktop"
--      end
--      return ""
--    end
--  }
--  setmetatable(proxy, mt)
--  return proxy
--end
--
--local function _protected()
--  local builder = _builder()
--  local result  = false
--
--  -- earwigo detection
--  if builder == "earwigo" then
--    result = (WWB_noemul and type(WWB_noemul) == "function")
--  end
--
--  -- urwigo detection
--  if builder == "urwigo" then
--    local count = 0
--
--    local function env_access(k)
--      count = count + 1
--    end
--    Env = _urwigo_env(Env, env_access)
--
--    local oldfct = _Urwigo.MessageBox
--    _Urwigo.MessageBox = function(tbl)
--      count = count + 1
--    end
--    cart.OnStart()
--    _Urwigo.MessageBox = oldfct
--    result = (count == 3)
--  end
--
--  return result
--end

-------------------------------------------------------------------------------
-- C A R T R I D G E  L O A D E R
-------------------------------------------------------------------------------
cart = dofile("cartridge.lua")
--if _protected() then
--  _suicide()
--end
--
EnvProtect()
Player.Cartridge = cart

for _,v in ipairs(cart:GetAllOfType("ZMedia")) do
  LUA2JS_RefreshMedia(v)
end

for _,v in ipairs(cart:GetAllOfType("Zone")) do
  LUA2JS_RefreshZone(v)
end

LUA2JS_CartridgeLoaded()

