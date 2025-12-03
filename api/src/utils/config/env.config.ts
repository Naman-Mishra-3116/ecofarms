export default () => {
  return {
    app: {
      port: parseInt(process.env.PORT?.toString()!),
      mode: process.env.NODE_ENV,
      name: process.env.NAME,
    },

    database: {
      uri: process.env.DB_URI,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      name: process.env.DB_NAME,
    },

    jwt: {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      secret: process.env.JWT_SECRET,

      adminAccessExpiry: parseInt(process.env.JWT_ADMIN_ACC_TOKEN_EXPIRY_TIME!),
      userAccessExpiry: parseInt(process.env.JWT_USER_ACC_TOKEN_EXPIRY_TIME!),
      refreshExpiry: parseInt(process.env.JWT_REF_TOKEN_EXPIRY_TIME!),
      resetExpiry: parseInt(process.env.JWT_RES_TOKEN_EXPIRY_TIME!),
    },

    mail: {
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT!),
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASSWORD,
      from: process.env.MAIL_FROM,
    },

    google: {
      client: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl: process.env.GOOGLE_CLIENT_REDIRECT,
    },

    payment: {
      key: process.env.PAYMENT_API_KEY,
      secret: process.env.PAYMENT_KEY_SECRET,
    },
  };
};
