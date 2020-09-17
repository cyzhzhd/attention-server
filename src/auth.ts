import express from "express";

const router = express.Router();

// TODO: use pubkey to encrypt hashed password
router.get('/pubkey', (req, res) => {
    res.sendStatus(200);
})

export default router;