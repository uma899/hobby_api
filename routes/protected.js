import express from "express";
import authenticateToken from "../middleware.js"

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: `Welcome, ${req.user.username}!` });
});

export default router;