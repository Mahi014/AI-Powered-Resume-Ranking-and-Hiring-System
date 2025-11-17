import pool from "../db.js";

export const employerRoutes = (app, isLoggedIn) => {
    // Job employer form
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

    // Employer profile
    app.get("/employer-profile", isLoggedIn, async (req, res) => {
        const id = req.user.id;
        try {
          const result = await pool.query(
            "SELECT e.name, e.company, e.post, jd.job_id, jd.job_title, jd.job_description, jd.job_role FROM employer e LEFT JOIN job_description jd ON e.employer_id = jd.employer_id WHERE e.employer_id = $1",
            [id]
          );
    
          const rows = result.rows;
    
          if (rows.length === 0) {
            return res.json({ exists: false });
          }
    
          const { name, company, post } = rows[0];
          const jobs = rows
            .filter(row => row.job_id !== null)
            .map(({ job_id, job_title, job_description, job_role }) => ({
              job_id,
              job_title,
              job_description,
              job_role,
            }));
    
          res.json({
            exists: true,
            data: { name, company, post, jobs },
          });
        } catch (err) {
          console.error("Employer Profile Error:", err.message);
          res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // Check if employer exists
    app.get("/check/employer", isLoggedIn, async (req, res) => {
        try {
          const id = req.user.id;
          const result = await pool.query(
            "SELECT * FROM employer WHERE employer_id = $1",
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

    // Get all applicants for a specific job
    app.get("/job/:job_id/applicants", isLoggedIn, async (req, res) => {
      const { job_id } = req.params;
      try {
        const query = `
          SELECT 
            js.job_seeker_id,
            js.name,
            js.college,
            js.degree,
            js.graduation_year,
            js.resume_name,
            ja.rank
          FROM job_applied ja
          JOIN job_seeker js ON ja.job_seeker_id = js.job_seeker_id
          WHERE ja.job_id = $1
          ORDER BY ja.rank ASC NULLS LAST, js.name;
        `;

        const result = await pool.query(query, [job_id]);

        res.json({
          success: true,
          applicants: result.rows,
        });
      } catch (err) {
        console.error("Error fetching applicants:", err.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
      }
    });

    // Preview a specific applicant's resume 
    app.get("/resume/:job_seeker_id", isLoggedIn, async (req, res) => {
      const { job_seeker_id } = req.params;
      try {
        const result = await pool.query(
          "SELECT resume_name, resume_data FROM job_seeker WHERE job_seeker_id = $1",
          [job_seeker_id]
        );

        if (result.rows.length === 0) {
          return res.status(404).send("Resume not found.");
        }
        const { resume_name, resume_data } = result.rows[0];
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${resume_name}"`);
        res.send(resume_data);
      } catch (err) {
        console.error("Error fetching resume:", err.message);
        res.status(500).send("Error retrieving resume.");
      }
    });

};
