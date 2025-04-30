// Logout Route
export const logoutRoutes=(app)=>{
    app.get("/logout", (req, res) => {
        req.logout((err) => {
            if (err) return next(err);
            res.json({ success: true });
        });
    });
};