import pool from "../db.js";

export const jobRoutes = (app, isLoggedIn) => {
    // See all jobs
    app.get("/find-job", isLoggedIn, async (req, res) => {
        try {
            const result = await pool.query(
                "SELECT jd.job_id, jd.job_title, jd.job_description, jd.job_role, e.company FROM job_description jd JOIN employer e ON jd.employer_id = e.employer_id"
            );
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Add job
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
    // Delete Job
    app.delete("/job/:job_id", isLoggedIn, async (req, res) => {
      try {
        const employer_id = req.user.id;
        const { job_id } = req.params;
        // Delete related applications first (foreign key constraint)
        await pool.query("DELETE FROM job_applied WHERE job_id = $1", [job_id]);
        // Delete the job
        await pool.query("DELETE FROM job_description WHERE job_id = $1", [job_id]);
        res.json({ success: true, message: "Job deleted successfully" });
      } catch (err) {
        console.error("Delete job error:", err.message);
        res.status(500).json({ success: false, message: "Failed to delete job" });
      }
    });
    
    // Job apply
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

    // Get job details
    app.get("/job/:job_id", isLoggedIn, async (req, res) => {
      const { job_id } = req.params;
      try {
        const result = await pool.query(
          "SELECT job_title, job_description, job_role FROM job_description WHERE job_id = $1",
          [job_id]
        );
        if (result.rows.length === 0) {
          return res.json({ success: false, message: "Job not found" });
        }
        res.json({ success: true, job: result.rows[0] });
      } catch (err) {
        console.error("Error fetching job details:", err.message);
        res.status(500).json({ success: false });
      }
    });

};