import * as Joi from "joi";

export default () => {
  const config = {
    port: parseInt(process.env.PORT || "3000", 10),
    jwt: {
      secret: process.env.JWT_SECRET || "default_secret_default_secret_123456",
      expiresIn: "2h",
      refreshExpiresIn: "7d",
    },
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    },
    kafka: {
      brokers: process.env.KAFKA_BROKERS?.split(",") || [
        "host.docker.internal:9092",
      ],
    },
    database: {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
    },
    kyc: {
      apiUrl: process.env.KYC_API_URL ,
      apiKey: process.env.KYC_API_KEY ,
    },
    grpc: {
      host: process.env.GRPC_HOST ,
      port: parseInt(process.env.GRPC_PORT || "5678", 10),
    },
  };

  const schema = Joi.object({
    port: Joi.number().integer().min(1).max(65535).default(3000),
    jwt: {
      secret: Joi.string().min(32).required(),
      expiresIn: Joi.string().default("15m"),
      refreshExpiresIn: Joi.string().default("7d"),
    },
    redis: {
      host: Joi.string().hostname().default("localhost"),
      port: Joi.number().integer().min(1).max(65535).default(6379),
      url: Joi.string().required(),
    },
    kafka: {
      brokers: Joi.array()
        .items(Joi.string().pattern(/^[^:]+:\d+$/))
        .min(1)
        .required(),
    },
    database: {
      host: Joi.string().hostname().default("localhost"),
      port: Joi.number().integer().min(1).max(65535).default(6379),
      username: Joi.string().required(),
      password: Joi.string().required(),
      name: Joi.string().required(),
    },
    kyc: {
      apiUrl: Joi.string().uri(),
      apiKey: Joi.string().required(),
    },
    grpc: {
      host: Joi.string().required(),
      port: Joi.number().integer().min(1).max(65535),
    },
  });

  const { error } = schema.validate(config, { abortEarly: false });
  if (error) throw new Error(`Configuration Validation error:${error.message}`);
  return config;
};
