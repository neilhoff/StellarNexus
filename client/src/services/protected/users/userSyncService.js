import { ServiceHelpers } from 'src/services/serviceHelpers'

async function syncCurrentUser (displayName = null) {
  return ServiceHelpers.postToApi(`${process.env.ARC_API_URL}/users/sync`, { displayName })
}

const userSyncService = {
  syncCurrentUser
}

export { userSyncService }
