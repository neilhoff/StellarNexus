import axios from 'axios'
import { Buffer } from 'buffer'

const graphUrl = 'https://graph.microsoft.com/beta'

const GraphService = {
  async callGraph (token, searchString) {
    const response = await axios.get(graphUrl + '/' + searchString, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  },
  async getUserInfo (token) {
    const userInfo = await axios.get(graphUrl + '/me', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return userInfo.data
  },
  async getUserInfoByEmail (token, email) {
    const user = await axios.get(graphUrl + `/users?$filter=mail+eq+'${email}'`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return user.data.value
  },
  async getUserPresence (token, id) {
    const presence = await axios.get(graphUrl + `/users/${id}/presence`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return presence.data
  },
  async getGroupId (token, displayName) {
    const response = await axios.get(graphUrl + `/groups?$filter=displayName eq '${displayName}'`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return response.data.value[0].id
  },
  async getGroupMembers (token, groupName, queryParams = '') {
    const groupId = await this.getDealerGroupId(token, groupName)

    const groupMembers = await axios.get(`${graphUrl}/groups/${groupId}/members?${queryParams}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    return groupMembers.data.value
  },
  async getUserGroups (token) {
    // https://graph.microsoft.com/beta/me/memberOf?$select=displayName
    return axios.get(graphUrl + '/me/memberOf?$select=displayName&$top=999', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
  },
  async getAllUserPhotos (token, size, id) {
    // https://stackoverflow.com/a/48936098/756623
    // The available sizes are:
    // '48x48', '64x64', '96x96', '120x120', '240x240', '360x360', '432x432', '504x504', and '648x648'.
    const photoBuffer = await axios(`${graphUrl}/users/${id}/photos/${size}/$value`,
      {
        headers:
          { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer'
      })
    // https://stackoverflow.com/a/53702497/756623
    const link = `data:image/png;base64,${Buffer.from(photoBuffer.data, 'binary').toString('base64')}`
    return link
  },
  async getUserPhoto (token, size) {
    // https://stackoverflow.com/a/48936098/756623
    // The available sizes are:
    // '48x48', '64x64', '96x96', '120x120', '240x240', '360x360', '432x432', '504x504', and '648x648'.
    const photoBuffer = await axios(`${graphUrl}/me/photos/${size}/$value`,
      {
        headers:
          { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer'
      })
    // https://stackoverflow.com/a/53702497/756623
    return `data:image/png;base64,${Buffer.from(photoBuffer.data, 'binary').toString('base64')}`
  }
}

export { graphUrl, GraphService }
