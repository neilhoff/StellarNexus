export function setUserPhoto (state, photo) {
  state.userPhoto = photo
}

export function setUserInfo (state, user) {
  state.userInfo = Object.assign({}, user)
}

export function userAccess (state, accessKey, accessValue) {
  state.userAccess[accessKey] = accessValue
}

export function setAdminAccess (state, adminAccess) {
  state.adminAccess = adminAccess
}

export function setSecurityVersion (state, securityVersion) {
  state.securityVersion = securityVersion
}
