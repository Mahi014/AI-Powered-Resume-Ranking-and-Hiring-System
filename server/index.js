import express from "express";
import cors from "cors";
import passport from "passport";
import pool from "./db.js";
import { googleAuthRoutes } from "./googleAuth.js";
import { sessionMiddleware } from "./sessionMiddleware.js";
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


// Google Auth Routes
googleAuthRoutes(app);

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Not authenticated" });
};

app.get("/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false });
    }
});

//choose role
app.post("/choose-role", isLoggedIn, async (req, res) => {
    try{
        const{role}=req.body;
        const id = req.user.id;

        await pool.query(
            "UPDATE login SET role = $1 WHERE id=$2",
            [role,id]
        );
        res.json({ "Success": "true" });
    }catch (err) {
        res.json({ "Success": "false" });
        console.error(err.message);
    }
});


//job seeker form
app.post("/job-seeker-form", isLoggedIn, async (req, res) => {
    try {
        const {name, college, degree, graduation_year, resume_name, resume_data} = req.body;
        const job_seeker_id = req.user.id; 

        await pool.query(
            "INSERT INTO job_seeker (job_seeker_id,name,college,degree,graduation_year,resume_name,resume_data) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [job_seeker_id, name, college, degree, graduation_year, resume_name, resume_data]
        );
        res.json({ "Success": "true" });
    } catch (err) {
        res.json({ "Success": "false" });
        console.error(err.message);
    }
});

//Job employer form
app.post("/job-employer-form", isLoggedIn, async (req, res) => {
    try {
        const {name, company, post} = req.body;
        const employer_id = req.user.id; 

        await pool.query(
            "INSERT INTO employer (employer_id,name,company,post) VALUES ($1, $2, $3, $4) RETURNING *",
            [employer_id, name, company, post]
        );
        res.json({ "Success": "true" });
    } catch (err) {
        res.json({ "Success": "false" });
        console.error(err.message);
    }
});

//job seeker profile
app.get("/job-seeker-profile",isLoggedIn, async (req, res) => {
    const id = req.user.id;
    try{
        const result = await pool.query(`SELECT 
            js.name,
            js.college,
            js.degree,
            js.graduation_year,
            js.resume_name,
            js.resume_data,
            ja.id AS application_id,
            jd.job_id,
            jd.job_title,
            jd.job_description,
            jd.job_role
        FROM 
            job_seeker js
        JOIN 
            job_applied ja ON js.job_seeker_id = ja.job_seeker_id
        JOIN 
            job_description jd ON ja.job_id = jd.job_id
        WHERE 
            js.job_seeker_id = $1`,[id])

        res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

//Employer Profile
app.get("/employer-profile",isLoggedIn, async (req, res) => {
    const id = req.user.id;
    try{
        const result = await pool.query(`SELECT 
            e.name AS employer_name,
            e.company,
            e.post,
            jd.job_id,
            jd.job_title,
            jd.job_description,
            jd.job_role
        FROM 
            employer e
        JOIN 
            job_description jd ON e.employer_id = jd.employer_id
        WHERE 
            e.employer_id = $1;`,[id])

        res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

//see all jobs
app.get("/find-job",isLoggedIn, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                jd.job_id,
                jd.job_title,
                jd.job_description,
                jd.job_role,
                e.company
            FROM 
                job_description jd
            JOIN 
                employer e ON jd.employer_id = e.employer_id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// add job
app.post("/add-job", isLoggedIn, async (req, res) => {
    try {
        const { job_title, job_description, job_role } = req.body;
        const employer_id = req.user.id;

        await pool.query(
            "INSERT INTO job_description (employer_id, job_title, job_description, job_role) VALUES ($1, $2, $3, $4) RETURNING *",
            [employer_id, job_title, job_description, job_role]
        );
        res.json({ "Success": "true" });
    } catch (err) {
        console.error(err.message);
        res.json({ "Success": "false" });
    }
});

//job apply
app.post("/job-apply", isLoggedIn, async (req, res) => {
    try {
      const job_seeker_id = req.user.id; 
      const { job_id } = req.body;

      const alreadyApplied = await pool.query(
        "SELECT * FROM job_applied WHERE job_id = $1 AND job_seeker_id = $2",
        [job_id, job_seeker_id]
      );
  
      if (alreadyApplied.rows.length > 0) {
        return res.status(400).json({ success: false, message: "Already applied to this job." });
      }
  
      await pool.query(
        "INSERT INTO job_applied (job_id, job_seeker_id) VALUES ($1, $2) RETURNING *",
        [job_id, job_seeker_id]
      );
  
      res.json({ success: true, message: "Application submitted successfully." });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, message: "Something went wrong." });
    }
  });

// Start server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});