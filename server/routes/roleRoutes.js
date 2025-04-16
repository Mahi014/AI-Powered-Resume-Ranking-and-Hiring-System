import pool from "../db.js";

export const roleRoutes = (app, isLoggedIn) => {
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
};