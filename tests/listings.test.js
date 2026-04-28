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
    test('creates a listing with generated id and createdAt from REST API Cognito claims', async () => {
      send.mockResolvedValue({})

      const response = await createListing({
        requestContext: {
          authorizer: {
            claims: {
              sub: 'user-sub-123'
            }
          }
        },
        body: JSON.stringify({
          title: 'Sofa for sale',
          section: 'For Sale',
          category: 'Furniture',
          item: 'Sofa',
          material: 'Leather',
          color: 'Brown',
          condition: 'Like New',
          dimensions: '84x35x32',
          brand: 'West Elm',
          price: '150',
          description: 'Like new',
          city: 'Chicago',
          phone: '555-111-2222'
        })
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)

      expect(body).toMatchObject({
        title: 'Sofa for sale',
        section: 'For Sale',
        category: 'Furniture',
        userId: 'user-sub-123',
        item: 'Sofa',
        material: 'Leather',
        color: 'Brown',
        condition: 'Like New',
        dimensions: '84x35x32',
        brand: 'West Elm',
        price: '150',
        description: 'Like new',
        city: 'Chicago',
        phone: '555-111-2222'
      })
      expect(body.id).toEqual(expect.any(String))
      expect(body.createdAt).toEqual(expect.any(String))

      const command = send.mock.calls[0][0]
      expect(command.input.TableName).toBe('marketplace-listings-dev')
      expect(command.input.Item).toEqual(body)
    })

    test('creates a listing from HTTP API JWT claims and ignores body userId', async () => {
      send.mockResolvedValue({})

      const response = await createListing({
        requestContext: {
          authorizer: {
            jwt: {
              claims: {
                'cognito:username': 'cognito-user-9'
              }
            }
          }
        },
        body: JSON.stringify({
          id: 'client-id',
          createdAt: '2000-01-01T00:00:00.000Z',
          title: 'Boat',
          section: 'For Sale',
          category: 'Boats',
          userId: 'body-user-should-not-win',
          yearBuilt: '2020',
          makeModel: 'Tracker 175',
          color: 'Blue',
          type: 'Fishing',
          condition: 'Excellent',
          price: '19000',
          description: 'Stored indoors',
          city: 'Madison',
          phone: '555-222-3333'
        })
      })

      const body = JSON.parse(response.body)
      expect(body.userId).toBe('cognito-user-9')
      expect(body.yearBuilt).toBe('2020')
      expect(body.color).toBe('Blue')
      expect(body.makeModel).toBe('Tracker 175')
      expect(body.id).not.toBe('client-id')
      expect(body.createdAt).not.toBe('2000-01-01T00:00:00.000Z')
    })

    test('falls back to body userId for local non-auth tests', async () => {
      send.mockResolvedValue({})

      const response = await createListing({
        body: JSON.stringify({
          title: 'Desk lamp',
          section: 'For Sale',
          category: 'Furniture',
          userId: 'local-user',
          item: 'Lamp',
          material: 'Metal',
          color: 'Black',
          condition: 'Good',
          dimensions: '16in tall',
          brand: 'Ikea',
          price: '20',
          description: 'Works well',
          city: 'Peoria',
          phone: '555-333-4444'
        })
      })

      expect(response.statusCode).toBe(201)
      expect(JSON.parse(response.body).userId).toBe('local-user')
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

    test('returns 400 when category-specific required fields are missing and does not write to DynamoDB', async () => {
      const response = await createListing({
        requestContext: {
          authorizer: {
            claims: {
              username: 'alice'
            }
          }
        },
        body: JSON.stringify({
          title: 'Sofa for sale',
          section: 'For Sale',
          category: 'Furniture',
          item: 'Sofa',
          material: 'Leather',
          price: '150'
        })
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({
        message: 'Missing required fields: color, condition, dimensions, brand, description, city, phone'
      })
      expect(send).not.toHaveBeenCalled()
    })

    test('returns 400 for an invalid section/category combination and does not write to DynamoDB', async () => {
      const response = await createListing({
        requestContext: {
          authorizer: {
            claims: {
              sub: 'user-sub-123'
            }
          }
        },
        body: JSON.stringify({
          title: 'Bad category',
          section: 'For Sale',
          category: 'Apartments',
          price: '1000'
        })
      })

      expect(response.statusCode).toBe(400)
      expect(JSON.parse(response.body)).toEqual({
        message: 'Invalid section/category combination'
      })
      expect(send).not.toHaveBeenCalled()
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
