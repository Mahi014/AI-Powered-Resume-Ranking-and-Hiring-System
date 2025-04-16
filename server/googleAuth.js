import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

// Google OAuth Setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    
    const email = profile._json.email; 
    const id = profile.id;


    const result = await pool.query("SELECT * FROM login WHERE google_id = $1", [id]);
    
    if (result.rows.length === 0) {
        
        await pool.query("INSERT INTO login (email, google_id,role) VALUES ($1, $2,$3)", [email, id,"none"]);
    }

    return done(null, { email, google_id: id });
}));

passport.serializeUser((user, done) => {
    done(null, user.email); 
});

passport.deserializeUser(async (email, done) => {
    const result = await pool.query("SELECT * FROM login WHERE email = $1", [email]);
    done(null, result.rows[0]);
});

// Google OAuth Routes
export const googleAuthRoutes = (app) => {
    
    app.get("/auth/google", passport.authenticate("google", {
        scope: ["email"]
    }));

    // after authentication route
    app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "http://localhost:3000" }), (req, res) => {
        res.redirect("http://localhost:3000/choose-role"); 
    });

    // Logout Route
    app.get("/logout", (req, res) => {
        req.logout((err) => {
            if (err) return next(err);
            res.json({ success: true });
        });
    });
};