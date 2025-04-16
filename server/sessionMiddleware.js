import expressSession from "express-session";
import connectPgSimple from "connect-pg-simple";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const PgSession = connectPgSimple(expressSession);

export const sessionMiddleware = expressSession({
    store: new PgSession({
        pool: pool, 
        tableName: "session", 
        createTableIfMissing: true, 
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000, 
    },
});
