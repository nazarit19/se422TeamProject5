jest.mock('../src/lib/dynamo', () => ({
  getDocClient: jest.fn()
}))

const { getDocClient } = require('../src/lib/dynamo')
const createListing = require('../src/listings/create').handler
const getListings = require('../src/listings/get').handler
const getListingById = require('../src/listings/getById').handler

describe('listing handlers', () => {
  let send

  beforeEach(() => {
    process.env.LISTINGS_TABLE = 'marketplace-listings-dev'
    send = jest.fn()
    getDocClient.mockReturnValue({ send })
  })

  afterEach(() => {
    delete process.env.LISTINGS_TABLE
    jest.clearAllMocks()
  })

  describe('POST /listings', () => {
    test('creates a listing with generated id and createdAt', async () => {
      send.mockResolvedValue({})

      const response = await createListing({
        body: JSON.stringify({
          title: 'Sofa for sale',
          section: 'For Sale',
          category: 'Furniture',
          userId: 'alice@example.com',
          price: '150',
          description: 'Like new'
        })
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)

      expect(body).toMatchObject({
        title: 'Sofa for sale',
        section: 'For Sale',
        category: 'Furniture',
        userId: 'alice@example.com',
        price: '150',
        description: 'Like new'
      })
      expect(body.id).toEqual(expect.any(String))
      expect(body.createdAt).toEqual(expect.any(String))

      const command = send.mock.calls[0][0]
      expect(command.input.TableName).toBe('marketplace-listings-dev')
      expect(command.input.Item).toEqual(body)
    })

    test('preserves dynamic extra fields and ignores client id/createdAt', async () => {
      send.mockResolvedValue({})

      const response = await createListing({
        body: JSON.stringify({
          id: 'client-id',
          createdAt: '2000-01-01T00:00:00.000Z',
          title: 'Boat',
          section: 'For Sale',
          category: 'Boats',
          userId: 'bob',
          color: 'Blue',
          makeModel: 'Tracker 175'
        })
      })

      const body = JSON.parse(response.body)
      expect(body.color).toBe('Blue')
      expect(body.makeModel).toBe('Tracker 175')
      expect(body.id).not.toBe('client-id')
      expect(body.createdAt).not.toBe('2000-01-01T00:00:00.000Z')
    })

    test('returns 400 on invalid JSON', async () => {
      const response = await createListing({ body: '{bad json' })
      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({
        message: 'Request body must be valid JSON'
      })
    })

    test('returns 400 when required fields are missing', async () => {
      const response = await createListing({
        body: JSON.stringify({
          title: 'Missing section',
          category: 'Furniture',
          userId: 'alice'
        })
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({
        message: 'Missing required fields: section'
      })
    })
  })

  describe('GET /listings/{id}', () => {
    test('returns 200 when item exists', async () => {
      send.mockResolvedValue({
        Item: { id: 'listing-1', title: 'Desk' }
      })

      const response = await getListingById({
        pathParameters: { id: 'listing-1' }
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({
        id: 'listing-1',
        title: 'Desk'
      })

      const command = send.mock.calls[0][0]
      expect(command.input.Key).toEqual({ id: 'listing-1' })
    })

    test('returns 404 when item does not exist', async () => {
      send.mockResolvedValue({})

      const response = await getListingById({
        pathParameters: { id: 'missing' }
      })

      expect(response.statusCode).toBe(404)
      expect(JSON.parse(response.body)).toEqual({
        message: 'Listing not found'
      })
    })
  })

  describe('GET /listings', () => {
    test('returns empty array when no items exist', async () => {
      send.mockResolvedValue({ Items: [] })

      const response = await getListings()

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual([])
    })

    test('returns multiple items sorted by newest createdAt first', async () => {
      send
        .mockResolvedValueOnce({
          Items: [
            { id: 'older', createdAt: '2026-04-01T00:00:00.000Z', title: 'Older' }
          ],
          LastEvaluatedKey: { id: 'older' }
        })
        .mockResolvedValueOnce({
          Items: [
            { id: 'newer', createdAt: '2026-04-20T00:00:00.000Z', title: 'Newer' }
          ]
        })

      const response = await getListings()
      const body = JSON.parse(response.body)

      expect(response.statusCode).toBe(200)
      expect(body.map((item) => item.id)).toEqual(['newer', 'older'])
      expect(send).toHaveBeenCalledTimes(2)
    })
  })
})
