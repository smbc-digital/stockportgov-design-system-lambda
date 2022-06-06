const AWS = require('aws-sdk')

const KEY = process.env.KEY
const SECRET = process.env.SECRET
const S3_URL = process.env.S3_URL
const REGION = 'eu-west-1'
const BUCKETNAME = 'stockportgov-design-system'

const getS3ObjectKeys = (prefix) => {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({ region: REGION, credentials: new AWS.Credentials(KEY, SECRET) })
    const bucketParams = { Bucket: BUCKETNAME, Prefix: prefix }

    s3.listObjectsV2(bucketParams, (err, data) => {
      if (err) {
        reject(new Error('Error from ListObjects - No versions available.'))
      } else if (data) {
        resolve(data.Contents.map(_ => _.Key))
      }
    })
  })
}

const getSpecificVersion = async (environment, version, filename) => {
  var prefix = `${environment}/${version}`
  const keys = await getS3ObjectKeys(prefix)
  if (!keys) {
    throw new Error(`No specific version available. Was not able to find v${version} in the ${environment} bucket`)
  }

  const key = keys.find(key => key === `${prefix}/${filename}`)
  if (!key) {
    throw new Error(`No specific version available. Was not able to find v${version} of ${filename}`)
  }

  return key
}

const getLatestPatchVersion = async (environment, major, minor, filename) => {
  const prefix = `${environment}/${major}.${minor}.`
  const keys = await getS3ObjectKeys(prefix)
  if (!keys) {
    throw new Error(`No versions available. Was not able to find patch for v${major}.${minor}.x in the ${environment} bucket for ${filename}`)
  }

  const versionsWithFilename = keys.filter(key => key.endsWith(filename))
  if (!versionsWithFilename) {
    throw new Error(`No versions available. Was not able to find patch for v${major}.${minor}.x in the ${environment} bucket for ${filename}`)
  }

  const regex = /^[\w\W]*\/([0-9]*)\.([0-9]*)\.([0-9]*)\/[\w\W]*$/
  var versions = versionsWithFilename.map(key => {
    const matches = key.match(regex)
    if (matches) {
      return Object.create({ major: matches[1], minor: matches[2], patch: matches[3] })
    }
  })

  // Sort descending
  versions.sort(function (a, b) { return parseInt(b.patch) - parseInt(a.patch) })

  const latestPatchVersion = versions[0]
  var version = `${latestPatchVersion.major}.${latestPatchVersion.minor}.${latestPatchVersion.patch}`

  return `${environment}/${version}/${filename}`
}

const getLatestMinorVersion = async (environment, major, filename) => {
  const prefix = `${environment}/${major}.`
  const keys = await getS3ObjectKeys(prefix)
  if (!keys) {
    throw new Error(`No versions available. Was not able to find latest minor version for v${major}.x.x in the ${environment} bucket for ${filename}`)
  }

  const versionsWithFilename = keys.filter(key => key.endsWith(filename))
  if (!versionsWithFilename) {
    throw new Error(`No versions available. Was not able to find latest minor version for v${major}.x.x in the ${environment} bucket for ${filename}`)
  }

  const regex = /^[\w\W]*\/([0-9]*)\.([0-9]*)\.([0-9]*)\/[\w\W]*$/
  var versions = versionsWithFilename.map(key => {
    const matches = key.match(regex)
    if (matches) {
      return Object.create({ major: matches[1], minor: matches[2], patch: matches[3] })
    }
  })

  // Sort descending
  versions.sort(function (a, b) { return parseInt(b.patch) - parseInt(a.patch) })
  versions.sort(function (a, b) { return parseInt(b.minor) - parseInt(a.minor) })

  const latestMinorVersion = versions[0]
  var version = `${latestMinorVersion.major}.${latestMinorVersion.minor}.${latestMinorVersion.patch}`

  return `${environment}/${version}/${filename}`
}

const StatusCode = code => new Promise(resolve => resolve({ statusCode: code }))

const versionHandler = async ({ path }) => {
  if (!path) return StatusCode(400)

  const regex = /^\/(int|qa|stage|prod)\/([0-9]|[0-9]\.[0-9]|[0-9]\.[0-9]\.[0-9])\/([\w\W]*.[min.css|min.js|woff|woff2|ttf|eot])$/
  const matches = path.match(regex)
  if (!matches) return StatusCode(400)

  const environment = matches[1]
  const version = matches[2]
  const fileName = matches[3]

  try {
    var key
    const versionArray = version.split('.')
    if (versionArray.length === 3) {
      key = await getSpecificVersion(environment, version, fileName)
    } else if (versionArray.length === 2) {
      key = await getLatestPatchVersion(environment, versionArray[0], versionArray[1], fileName)
    } else if (versionArray.length === 1) {
      key = await getLatestMinorVersion(environment, versionArray[0], fileName)
    }

    return {
      statusCode: 302, headers: { Location: `${S3_URL}/${key}` }
    }
  } catch (error) {
    return {
      statusCode: 404, body: error.message
    }
  }
}

module.exports = {
  getSpecificVersion,
  getLatestPatchVersion,
  getLatestMinorVersion,
  handler: versionHandler
}
