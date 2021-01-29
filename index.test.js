/* eslint-env jest */

const AWS = require('aws-sdk')
const semverSort = require('semver-sort')
const {
  getEnvironment,
  getVersionObject,
  getS3Versions,
  getLatestVersion,
  handler
} = require('./index')

describe('getEnvironment', () => {
  it('Should return int/qa/stage/prod environment', () => {
    const environment = [
      getEnvironment('int/'),
      getEnvironment('qa/'),
      getEnvironment('stage/'),
      getEnvironment('prod/')
    ]
    expect(environment[0]).toEqual('int')
    expect(environment[1]).toEqual('qa')
    expect(environment[2]).toEqual('stage')
    expect(environment[3]).toEqual('prod')
  })

  it('Should throw error if it does not match the condition', () => {
    expect(() => {
      getEnvironment('test/')
    }).toThrow()

    expect(() => {
      getEnvironment('test')
    }).toThrow()

    expect(() => {
      getEnvironment('int')
    }).toThrow()
  })
})

describe('getVersionObject', () => {
  it('Should return correct version', () => {
    const version = getVersionObject('/1.2.3/')
    expect(version.major).toBe('1')
    expect(version.minor).toBe('2')
    expect(version.patch).toBe('3')
    expect(version.original).toBe('/1.2.3/')
  })

  it('Should return correct version if only major provided', () => {
    const version = getVersionObject('/1/')
    expect(version.major).toBe('1')
    expect(version.minor).toBe(null)
    expect(version.patch).toBe(null)
    expect(version.original).toBe('/1/')
  })

  it('Should return correct version if only major and minor provided', () => {
    const version = getVersionObject('/1.2/')
    expect(version.major).toBe('1')
    expect(version.minor).toBe('2')
    expect(version.patch).toBe(null)
    expect(version.original).toBe('/1.2/')
  })

  it('Should return version if version provided does not match condition', () => {
    const version = getVersionObject('/test/')
    expect(version.major).toBe(null)
    expect(version.minor).toBe(null)
    expect(version.patch).toBe(null)
    expect(version.original).toBe('/test/')
  })
})

describe('getS3Versions', () => {
  it('Should return list of keys', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          {
            Key: '12345TEST'
          }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    AWS.Credentials = jest.fn()

    const result = await getS3Versions()

    expect(result).toContain('12345TEST')
    expect(result.length).toBe(1)
    expect(mockListObjectV2.mock.calls.length).toBe(1)
    expect(AWS.Credentials.mock.calls.length).toBe(1)
  })

  it('Should throw error', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(1, undefined) // eslint-disable-line
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    AWS.Credentials = jest.fn()

    try {
      await getS3Versions()
    } catch (error) {
      expect(error.message).toEqual('No versions available.')
    }

    expect(mockListObjectV2.mock.calls.length).toBe(1)
    expect(AWS.Credentials.mock.calls.length).toBe(1)
  })

  afterEach(() => jest.resetAllMocks())
})

describe('getLatestVersion', () => {
  beforeEach(() => {
    AWS.Credentials = jest.fn()
    semverSort.desc = jest.fn(versions => versions)
  })

  it('Should find specific version', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/2.0.1' },
          { Key: 'int/1.1.2' },
          { Key: 'int/1.1.1' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await getLatestVersion('int/1.1.1')

    expect(result.length).toBe(1)
    expect(result).toContain('int/1.1.1')
  })

  it('Should find latest version of major provided', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/2.0.1' },
          { Key: 'int/1.1.2' },
          { Key: 'int/1.1.1' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await getLatestVersion('int/1')

    expect(result.length).toBe(2)
    expect(result[0]).toEqual('int/1.1.2')
  })

  it('Should find latest version of major.minor provided', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/2.0.1' },
          { Key: 'int/1.1.2' },
          { Key: 'int/1.1.1' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await getLatestVersion('int/1.1')

    expect(result.length).toBe(2)
    expect(result[0]).toEqual('int/1.1.2')
  })

  it('Should throw error', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/2.0.1' },
          { Key: 'int/1.1.2' },
          { Key: 'int/1.1.1' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    try {
      await getLatestVersion('int/2.3.5')
    } catch (error) {
      expect(error.message).toEqual('No versions available.')
    }
  })

  afterEach(() => jest.resetAllMocks())
})

describe('versionHandler', () => {
  beforeEach(() => {
    AWS.Credentials = jest.fn()
    semverSort.desc = jest.fn(versions => versions)
  })

  it('Should return 400 when path null', async () => {
    expect((await handler({})).statusCode).toBe(400)
  })

  it('Should return 400 when path incorrect format', async () => {
    expect((await handler({ path: 'invalid_path' })).statusCode).toBe(400)
  })

  it('Should return 404 when getLatestVersion throws error', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/2.0.1' },
          { Key: 'int/1.1.2' },
          { Key: 'int/1.1.1' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({ path: '/int/1.1.0/smbc-frontend.min.css' })
    expect(result.statusCode).toBe(404)
    expect(result.body).toEqual('No versions available.')
  })

  it('Should return 302 when file found', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/2.0.1/smbc-frontend-ie8.min.css' },
          { Key: 'int/1.1.2/smbc-frontend-ie8.min.css' },
          { Key: 'int/1.1.1/smbc-frontend-ie8.min.css' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({
      path: '/int/1.1.1/smbc-frontend-ie8.min.css'
    })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain(
      '/int/1.1.1/smbc-frontend-ie8.min.css'
    )
  })

  it('Should return 302 when file found for .woff extenison', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/1.1.1/assets/fonts/fa-solid-900.woff' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({
      path: '/int/1/assets/fonts/fa-solid-900.woff'
    })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain(
      '/int/1.1.1/assets/fonts/fa-solid-900.woff'
    )
  })

  it('Should return 302 when file found for .tff extenison', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/1.1.1/assets/fonts/fa-solid-900.ttf' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({
      path: '/int/1/assets/fonts/fa-solid-900.ttf'
    })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain(
      '/int/1.1.1/assets/fonts/fa-solid-900.ttf'
    )
  })

  it('Should return 302 when file found for .eot extenison', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/1.1.1/assets/fonts/fa-solid-900.eot' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({
      path: '/int/1/assets/fonts/fa-solid-900.eot'
    })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain(
      '/int/1.1.1/assets/fonts/fa-solid-900.eot'
    )
  })

  it('Should return 302 with latest major when file found', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/2.4.4/smbc-frontend-ie8.min.css' },
          { Key: 'int/1.4.0/smbc-frontend-ie8.min.css' },
          { Key: 'int/1.1.2/smbc-frontend-ie8.min.css' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({
      path: '/int/2/smbc-frontend-ie8.min.css'
    })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain(
      '/int/2.4.4/smbc-frontend-ie8.min.css'
    )
  })

  it('Should return 302 with latest major and minor when file found', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, {
        Contents: [
          { Key: 'int/2.4.8/smbc-frontend-ie8.min.css' },
          { Key: 'int/2.4.3/smbc-frontend-ie8.min.css' },
          { Key: 'int/2.4.2/smbc-frontend-ie8.min.css' }
        ]
      })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({
      path: '/int/2.4/smbc-frontend-ie8.min.css'
    })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain(
      '/int/2.4.8/smbc-frontend-ie8.min.css'
    )
  })

  afterEach(() => jest.resetAllMocks())
})
