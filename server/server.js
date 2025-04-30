import express from "express";
import cors from "cors";
import passport from "passport";
import { sessionMiddleware } from "./sessionMiddleware.js";
import { authRoutes } from "./routes/authRoutes.js";
import { roleRoutes } from "./routes/roleRoutes.js";
import { jobSeekerRoutes } from "./routes/jobSeekerRoutes.js";
import { employerRoutes } from "./routes/employerRoutes.js";
import { jobRoutes } from "./routes/jobRoutes.js";
import { googleAuthRoutes} from "./googleAuth.js";
import { isLoggedIn } from "./middleware/isLoggedIn.js";
import { logoutRoutes } from "./routes/logoutRoutes.js";

const app = express();

// Middleware Setup
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(sessionMiddleware);   
app.use(passport.initialize());
app.use(passport.session());

// Routes
googleAuthRoutes(app);
authRoutes(app);
logoutRoutes(app);
roleRoutes(app, isLoggedIn);
jobSeekerRoutes(app, isLoggedIn);
employerRoutes(app, isLoggedIn);
jobRoutes(app, isLoggedIn);

// Start server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});