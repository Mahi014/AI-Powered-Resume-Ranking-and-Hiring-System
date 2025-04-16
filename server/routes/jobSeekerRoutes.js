import pool from "../db.js";
import multer from "multer";

// Memory storage for direct database insert
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

export const jobSeekerRoutes = (app, isLoggedIn) => {
    // Job seeker form
    app.post("/job-seeker-form", isLoggedIn, upload.single("resume"), async (req, res) => {
        try {
          const { name, college, degree, graduation_year } = req.body;
          const resumeFile = req.file;
      
          if (!resumeFile) {
            return res.status(400).json({ Success: "false", message: "No file uploaded" });
          }
      
          const job_seeker_id = req.user.id;
      
          await pool.query(
            "INSERT INTO job_seeker (job_seeker_id, name, college, degree, graduation_year, resume_name, resume_data) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [
              job_seeker_id,
              name,
              college,
              degree,
              graduation_year,
              resumeFile.originalname,
              resumeFile.buffer,
            ]
          );
      
          res.json({ Success: "true" });
        } catch (err) {
          console.error(err.message);
          res.status(500).json({ Success: "false" });
        }
    });

    // Job seeker profile
    app.get("/job-seeker-profile", isLoggedIn, async (req, res) => {
        const id = req.user.id;
    
        try {
          const check = await pool.query(
            "SELECT * FROM job_seeker WHERE job_seeker_id = $1",
            [id]
          );
    
          if (check.rows.length === 0) {
            return res.json({ exists: false });
          }
    
          const result = await pool.query(
            "SELECT js.name, js.college, js.degree, js.graduation_year, js.resume_name, js.resume_data, ja.id AS application_id, jd.job_id, jd.job_title, jd.job_description, jd.job_role FROM job_seeker js LEFT JOIN job_applied ja ON js.job_seeker_id = ja.job_seeker_id LEFT JOIN job_description jd ON ja.job_id = jd.job_id WHERE js.job_seeker_id = $1",
            [id]
          );
    
          const rows = result.rows;
          const { name, college, degree, graduation_year, resume_name, resume_data } = rows[0];
    
          const jobs = rows
            .filter(row => row.job_id !== null)
            .map(({ application_id, job_id, job_title, job_description, job_role }) => ({
              application_id,
              job_id,
              job_title,
              job_description,
              job_role
            }));
    
          res.json({
            exists: true,
            data: {
              name,
              college,
              degree,
              graduation_year,
              resume_name,
              resume_data,
              jobs
            }
          });
        } catch (err) {
          console.error("Job Seeker Profile Error:", err.message);
          res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // Check if job seeker exists
    app.get("/check/job-seeker", isLoggedIn, async (req, res) => {
        try {
          const id = req.user.id;
          const result = await pool.query(
            "SELECT * FROM job_seeker WHERE job_seeker_id = $1",
            [id]
          );
      
          if (result.rows.length > 0) {
            res.json({ exists: true });
          } else {
            res.json({ exists: false });
          }
        } catch (err) {
          console.error(err.message);
          res.status(500).json({ exists: false });
        }
    });

    // Preview resume
    app.get("/job-seeker-resume", isLoggedIn, async (req, res) => {
        const id = req.user.id;
      
        try {
          const result = await pool.query(
            "SELECT resume_name, resume_data FROM job_seeker WHERE job_seeker_id = $1",
            [id]
          );
      
          if (result.rows.length === 0) {
            return res.status(404).send("Resume not found.");
          }
      
          const { resume_name, resume_data } = result.rows[0];
      
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="${resume_name}"`);
          res.send(resume_data);
        } catch (err) {
          console.error("Resume fetch error:", err.message);
          res.status(500).send("Error retrieving resume.");
        }
    });
};