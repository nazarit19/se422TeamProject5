const config = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_XxO7P5Dfq',           // from sam deploy outputs
    userPoolWebClientId: '56urbipcccru7lu9pdaf7hjqqo'
  },
  API: {
    endpoints: [
      {
        name: 'marketplace',
        endpoint: 'https://3slwzttu23.execute-api.us-east-1.amazonaws.com/dev/'               // from sam deploy outputs
      }
    ]
  }
};

export default config;