import { ServiceHelpers } from 'src/services/serviceHelpers'

async function getUsers () {
  const response = await ServiceHelpers.getFromApi(`${process.env.ARC_API_URL}/admin/users`, {})
  return response.users || []
}

async function updateUser (payload) {
  return ServiceHelpers.postToApi(`${process.env.ARC_API_URL}/admin/users/update`, payload)
}

async function setUserDisabled (email, disabled) {
  return ServiceHelpers.postToApi(`${process.env.ARC_API_URL}/admin/users/disable`, {
    email,
    disabled
  })
}

const userMaintenanceService = {
  getUsers,
  updateUser,
  setUserDisabled
}

export { userMaintenanceService }
