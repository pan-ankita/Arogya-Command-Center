import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import cookieParser from "cookie-parser";
import router from "./routes";
import { logger } from "./lib/logger";

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
    facilityId: number | null;
  }
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionSecret =
  process.env.SESSION_SECRET ?? "arogya-live-secret-fallback";

//for local development
// app.use(
//   session({
//     secret: sessionSecret,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     },
//   }),
// );

// for vercel deployment
// app.use(
//   session({
//     secret: sessionSecret,
//     resave: false,
//     saveUninitialized: false,

//     cookie: {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     },
//   }),
// );

//for both local development and vercel deployment
const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;
