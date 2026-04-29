const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { randomUUID } = require('crypto')

const s3 = new S3Client({})

const CORS_HEADERS_UPLOAD = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }

exports.handler = async (event) => {
  const userId = event.requestContext?.authorizer?.claims?.sub
  const { fileType } = JSON.parse(event.body) // e.g. "image/jpeg"

  const key = `listings/${userId}/${randomUUID()}`

  const url = await getSignedUrl(s3, new PutObjectCommand({
    Bucket: process.env.IMAGES_BUCKET,
    Key: key,
    ContentType: fileType
  }), { expiresIn: 60 }) // URL expires in 60 seconds

  return {
    statusCode: 200,
    headers: CORS_HEADERS_UPLOAD,
    body: JSON.stringify({
      uploadUrl: url,
      imageUrl: `https://${process.env.IMAGES_BUCKET}.s3.amazonaws.com/${key}`
    })
  }
}