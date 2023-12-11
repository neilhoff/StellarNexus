import { GraphService } from './GraphService'

const auth = {
  globalAdminAccessGroup: process.env.GLOBAL_ADMIN_GROUP,
  adminAccessGroup: process.env.SITE_ADMIN_GROUP
}

async function checkAccess (token, adGroup) {
  const groups = await GraphService.getUserGroups(token)
  return groups.data.value.some(group => group.displayName === adGroup)
}
async function getAdminStatus (token) {
  const globalAdmin = await checkAccess(token, auth.globalAdminAccessGroup)
  const siteAdmin = await checkAccess(token, auth.adminAccessGroup)
  return globalAdmin || siteAdmin
}

const AccessRules = {
  async isAdmin (token) {
    let admin = false
    admin = await getAdminStatus(token)
    return admin
  }
}

export { AccessRules }
