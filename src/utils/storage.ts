
function setValue(key: string, value: string) {
  return localStorage.setItem(key, value)
}

function getValue(key: string) {
  return localStorage.getItem(key)
}

function deleteValue(key: string) {
  localStorage.removeItem(key)
}

enum StorageKey {
  ApiKey = "apiKey",
  SysMessage = "sysMessage",
}

export function saveApiKey(value: string) {
  setValue(StorageKey.ApiKey, value)
}

export function getApiKey() {
  return getValue(StorageKey.ApiKey)
}

export function deleteApiKey() {
  deleteValue(StorageKey.ApiKey)
}

export function saveSysMessage(value: string) {
  setValue(StorageKey.SysMessage, value)
}

export function getSysMessage() {
  return getValue(StorageKey.SysMessage)
}

export function deleteSysMessage() {
  deleteValue(StorageKey.SysMessage)
}