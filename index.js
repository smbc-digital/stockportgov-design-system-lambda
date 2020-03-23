const AWS = require('aws-sdk')
const semverSort = require('semver-sort')

const key = process.env.KEY
const secret = process.env.SECRET
const S3_URL = process.env.S3_URL

const getEnvironment = string => {
    const matches = string.match(/(int|qa|stage|prod){1}\//)

    if(!matches)
        throw new Error("No environment provided.")
    
    return matches[1]
}

const getVersionObject = string => {
    let version = {
        major: string.match(/([0-9]{1,})[.]{0,1}/),
        minor: string.match(/[.]([0-9]{1,})[.]{0,1}/),
        patch: string.match(/[0-9]{0,}[.][0-9]{0,}[.]([0-9]{1,})/),
        original: string
    }

    version.major = version.major && version.major[1] ? version.major[1] : null
    version.minor = version.minor && version.minor[1] ? version.minor[1] : null
    version.patch = version.patch && version.patch[1] ? version.patch[1] : null

    return version
}

const getS3Versions = () => new Promise((res, rej) => {
    const s3 = new AWS.S3({
        region: 'eu-west-1',
        credentials: new AWS.Credentials(key, secret)
    })

    const bucketParams = {
        Bucket: 'stockportgov-design-system'
    }

    s3.listObjectsV2(bucketParams, (err, data) => {
        if (err)
            rej(new Error('No versions available.'))
        else if (data)
            res(data.Contents.map(_ => _.Key))
    })
})

const getLatestVersion = async fileVersion => {
    const versions = await getS3Versions()

    const environment = getEnvironment(fileVersion)
    const versionSearchingFor = getVersionObject(fileVersion)
    const filteredVersions = versions
        .filter(version => version.includes(`${environment}/`))
        .filter(version => /[aA-zZ]\/[0-9]+./.test(version))

    const foundVersion = semverSort
        .desc(filteredVersions)
        .map(version => getVersionObject(version))
        .filter(version =>
            version.major === versionSearchingFor.major &&
            (!versionSearchingFor.minor || version.minor === versionSearchingFor.minor) &&
            (!versionSearchingFor.patch || version.patch === versionSearchingFor.patch))

    if (!foundVersion.length)
        throw new Error('No versions available.')

    return foundVersion.map(v => v.original)
}

exports.handler = async ({ path }) => {
    if(!path)
        return new Promise(res => res({
            statusCode: 400
        }))
    
    const matches = path.match(/^(\/(int|qa|stage|prod){1}\/?([0-9]+(\.[0-9]+){0,2})\/)(smbc-frontend.min.css|smbc-frontend-ie8.min.css){1}/)

    // wrapped in promise as lambda requries a promise to be returned
    if (!matches)
        return new Promise(res => res({
            statusCode: 400
        }))

    const version = matches[1]
    try {
        const filesFound = await getLatestVersion(version)
        const regex = new RegExp(`(${matches[matches.length-1]}){1}`, 'g')
        const key = filesFound.find(key => !!regex.exec(key))

        if (!key)
            throw new Error('No versions available.')

        return {
            statusCode: 302,
            headers: {
                Location: `${S3_URL}/${key}`
            }
        }
    } catch (error) {
        return {
            statusCode: 404,
            body: error.message
        }
    }
}