import * as Joi from "joi";

export default () => {
  const config = {
    port: parseInt(process.env.PORT || "3004", 10),
    jwt: {
      secret: process.env.JWT_SECRET || "default_secret_default_secret_123456",
    },
    kafka: {
      brokers: process.env.KAFKA_BROKERS?.split(",") || [
        "host.docker.internal:9092",
      ],
    },
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    },
    database: {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
    },
    notification: {
      sendgridApiKey: process.env.SENDGRID_API_KEY,
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
      fromEmail: process.env.FROM_EMAIL || "no-reply@fintechwallet.com",
    },
  };

  const schema = Joi.object({
    port: Joi.number().integer().min(1).max(65535).default(3000),
    jwt: {
      secret: Joi.string().min(32).required(),
    },
    kafka: {
      brokers: Joi.array()
        .items(Joi.string().pattern(/^[^:]+:\d+$/))
        .min(1)
        .required(),
    },
    redis: {
      host: Joi.string().hostname().default("localhost"),
      port: Joi.number().integer().min(1).max(65535).default(6379),
      url: Joi.string().required(),
    },
    database: {
      host: Joi.string().hostname().default("localhost"),
      port: Joi.number().integer().min(1).max(65535).default(6379),
      username: Joi.string().required(),
      password: Joi.string().required(),
      name: Joi.string().required(),
    },
    notification: {
      sendgridApiKey: Joi.string().required(),
      twilioAccountSid: Joi.string().required(),
      twilioAuthToken: Joi.string().required(),
      twilioPhoneNumber: Joi.string().required(),
      fromEmail: Joi.string().email().required(),
    },
  });

  const { error } = schema.validate(config, { abortEarly: false });
  if (error) throw new Error(`Configuration Validation error:${error.message}`);
  return config;
};
