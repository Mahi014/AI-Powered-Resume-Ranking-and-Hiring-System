import express from "express";
import cors from "cors";
import passport from "passport";
import pool from "./db.js";

const app = express();

// Start server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});