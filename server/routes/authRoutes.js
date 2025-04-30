export const authRoutes = (app) => {
    app.get("/auth/status", (req, res) => {
        if (req.isAuthenticated()) {
            res.json({ authenticated: true, user: req.user });
        } else {
            res.json({ authenticated: false });
        }
    });
};