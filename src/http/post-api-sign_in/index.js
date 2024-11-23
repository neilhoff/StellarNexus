const arc = require('@architect/functions')
const bcrypt = require('bcrypt')


async function signIn (req, context) {
  let { session } = req
  // Setup bcrypt
  const saltRounds = 10
  const salt = bcrypt.genSaltSync(saltRounds)

  // Setup the Database
  let db = await arc.tables()
  let usersTable = db.users

  // Make sure there is an initial defaultAdmin TODO: Figure out how to seed the database on initial load
  let defaultAdmin = await usersTable.get({ username: 'admin' })
  if (!defaultAdmin) {
    const passwordHash = bcrypt.hashSync('admin', salt)
    defaultAdmin = await usersTable.put({
      username: 'admin',
      passwordHash
    })
  }
  function setSessionExpire (days) {
    const currentDate = new Date()
    const futureDate = new Date(currentDate)
    futureDate.setDate(currentDate.getDate() + days)
    return futureDate
  }

  async function validateUser (username, password) {
    const now = new Date()
    const sessionExpire = session.user ? new Date(session.user.sessionExpire) : null
    if (sessionExpire && now < sessionExpire) {
      console.log('Session still valid')
      // Valid session so return the user
      return session.user
    } else {
      console.log('Session not valid, signing in...')
      const user = await usersTable.get({ username: username })
      const passwordMatch = await bcrypt.compare(password, user.passwordHash)
      if (username === user.username && passwordMatch) {
        session.user = {
          ...user,
          sessionExpire: setSessionExpire(10)
        }
        return session.user
      } else {
        session.user = null
        return {
          message: 'Username or password incorrect'
        }
      }
    }
  }
  // passport.use(new LocalStrategy(async (username, password, cb) => {
  //   const now = new Date()
  //   const sessionExpire = new Date(session.user.sessionExpire)
  //   if (now < sessionExpire) {
  //     console.log('Session still valid')
  //     // Valid session so return the user
  //     cb(null, session.user)
  //   } else {
  //     console.log('Session not valid, signing in...')
  //     const user = await usersTable.get({ username: username })
  //     const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  //     if (username === user.username && passwordMatch) {
  //       session.user = {
  //         ...user,
  //         sessionExpire: setSessionExpire(10)
  //       }
  //       cb(null, session.user)
  //     } else {
  //       session.user = null
  //       cb(null, { message: 'Username or password incorrect' })
  //     }
  //   }

  // }))

  // // Passport requires an Express res() function
  // const res = { end: () => { console.log('res.end') } }

  // // Create a promisified version of Passport Authentication
  // function __promisifiedPassportAuthentication () {
  //   return new Promise((resolve, reject) => {
  //     passport.authenticate('local', (err, user, info) => {
  //       if (!user) { reject(err) }
  //       resolve(user)
  //     })(req, res)
  //   })
  // }
  // const result = await __promisifiedPassportAuthentication()
  // console.log('result', result)
  console.log('validate user')
  const result = await validateUser()
  console.log('finish validateUser')
  return {
    session,
    body: JSON.stringify(result),
    cors: true,
    statusCode: 200
  }

}

exports.handler = arc.http(signIn)