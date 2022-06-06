/* eslint-env jest */
const AWS = require('aws-sdk')
const { handler } = require('./index')

const KEYS = [
  { Key: 'int/1.0.0/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'int/1.0.0/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'int/1.0.0/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'int/1.0.0/smbc-frontend.min.css' },
  { Key: 'int/1.0.0/smbc-frontend.min.js' },
  { Key: 'int/1.0.1/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'int/1.0.1/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'int/1.0.1/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'int/1.0.1/smbc-frontend.min.css' },
  { Key: 'int/1.0.1/smbc-frontend.min.js' },
  { Key: 'int/1.1.1/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'int/1.1.1/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'int/1.1.1/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'int/1.1.1/smbc-frontend.min.css' },
  { Key: 'int/1.1.1/smbc-frontend.min.js' },
  { Key: 'int/1.2.10/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'int/1.2.10/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'int/1.2.10/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'int/1.2.10/smbc-frontend.min.css' },
  { Key: 'int/1.2.10/smbc-frontend.min.js' },
  { Key: 'int/1.2.11/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'int/1.2.11/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'int/1.2.11/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'int/1.2.11/smbc-frontend.min.css' },
  { Key: 'int/1.2.11/smbc-frontend.min.js' },
  { Key: 'int/1.2.9/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'int/1.2.9/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'int/1.2.9/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'int/1.2.9/smbc-frontend.min.css' },
  { Key: 'int/1.2.9/smbc-frontend.min.js' },
  { Key: 'int/1.5.0/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'int/1.5.0/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'int/1.5.0/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'int/1.5.0/smbc-frontend.min.css' },
  { Key: 'int/1.5.0/smbc-frontend.min.js' },
  { Key: 'int/1.5.2/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'int/1.5.2/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'int/1.5.2/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'int/1.5.2/smbc-frontend.min.css' },
  { Key: 'int/1.5.2/smbc-frontend.min.js' },
  { Key: 'prod/1.0.0/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'prod/1.0.0/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'prod/1.0.0/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'prod/1.0.0/smbc-frontend.min.css' },
  { Key: 'prod/1.0.0/smbc-frontend.min.js' },
  { Key: 'prod/1.0.1/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'prod/1.0.1/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'prod/1.0.1/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'prod/1.0.1/smbc-frontend.min.css' },
  { Key: 'prod/1.0.1/smbc-frontend.min.js' },
  { Key: 'prod/1.1.1/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'prod/1.1.1/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'prod/1.1.1/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'prod/1.1.1/smbc-frontend.min.css' },
  { Key: 'prod/1.1.1/smbc-frontend.min.js' },
  { Key: 'prod/1.2.10/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'prod/1.2.10/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'prod/1.2.10/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'prod/1.2.10/smbc-frontend.min.css' },
  { Key: 'prod/1.2.10/smbc-frontend.min.js' },
  { Key: 'prod/1.2.11/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'prod/1.2.11/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'prod/1.2.11/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'prod/1.2.11/smbc-frontend.min.css' },
  { Key: 'prod/1.2.11/smbc-frontend.min.js' },
  { Key: 'prod/1.2.9/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'prod/1.2.9/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'prod/1.2.9/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'prod/1.2.9/smbc-frontend.min.css' },
  { Key: 'prod/1.2.9/smbc-frontend.min.js' },
  { Key: 'prod/1.5.0/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'prod/1.5.0/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'prod/1.5.0/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'prod/1.5.0/smbc-frontend.min.css' },
  { Key: 'prod/1.5.0/smbc-frontend.min.js' },
  { Key: 'prod/1.5.2/assets/images/smbc_header_mobile_logo_180x37.png' },
  { Key: 'prod/1.5.2/assets/images/smbc_header_mobile_logo_240x64.png' },
  { Key: 'prod/1.5.2/assets/fonts/font-awesome/fa-solid-900.eot' },
  { Key: 'prod/1.5.2/smbc-frontend.min.css' },
  { Key: 'prod/1.5.2/smbc-frontend.min.js' }
]

describe('versionHandler', () => {
  beforeEach(() => { AWS.Credentials = jest.fn() })

  it('Should return 400 when path null', async () => {
    expect((await handler({})).statusCode).toBe(400)
  })

  it('Should return 400 when path incorrect format', async () => {
    expect((await handler({ path: 'invalid_path' })).statusCode).toBe(400)
  })

  it('Should return 404 when getSpecificVersion throws error', async () => {
    const mockListObjectV2 = jest.fn((bucketParams, callback) => {
      callback(undefined, { Contents: KEYS })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({ path: '/int/1.0.2/smbc-frontend.min.css' })
    expect(result.statusCode).toBe(404)
    expect(result.body).toContain('No specific version available.')
  })

  it('Should return 302 when file found', async () => {
    const mockListObjectV2 = jest.fn((_, callback) => {
      callback(undefined, { Contents: KEYS })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({ path: '/int/1.0.0/smbc-frontend.min.css' })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain('/int/1.0.0/smbc-frontend.min.css')
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
    expect(result.headers.Location).toContain('/int/1.1.1/assets/fonts/fa-solid-900.woff')
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
    expect(result.headers.Location).toContain('/int/1.1.1/assets/fonts/fa-solid-900.ttf')
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
    expect(result.headers.Location).toContain('/int/1.1.1/assets/fonts/fa-solid-900.eot')
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
    expect(result.headers.Location).toContain('/int/2.4.4/smbc-frontend-ie8.min.css')
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
    expect(result.headers.Location).toContain('/int/2.4.8/smbc-frontend-ie8.min.css')
  })

  // match highest patch from major & minor
  it('Should match highest patch from major & minor', async () => {
    const mockListObjectV2 = jest.fn((_, callback) => {
      callback(undefined, { Contents: KEYS })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({ path: '/int/1.2/smbc-frontend.min.css' })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain('/int/1.2.11/smbc-frontend.min.css')
  })

  // match highest minor from major
  it('Should match highest minor from major', async () => {
    const mockListObjectV2 = jest.fn((_, callback) => {
      callback(undefined, { Contents: KEYS })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({ path: '/int/1/smbc-frontend.min.css' })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain('/int/1.5.2/smbc-frontend.min.css')
  })

  // match specific version
  it('Should match specific version', async () => {
    const mockListObjectV2 = jest.fn((_, callback) => {
      callback(undefined, { Contents: KEYS })
    })

    AWS.S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: mockListObjectV2
    }))

    const result = await handler({ path: '/int/1.2.9/smbc-frontend.min.css' })
    expect(result.statusCode).toBe(302)
    expect(result.headers.Location).toContain('/int/1.2.9/smbc-frontend.min.css')
  })

  afterEach(() => jest.resetAllMocks())
})
