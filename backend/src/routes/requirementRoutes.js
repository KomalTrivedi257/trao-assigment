const express = require("express");

const {
    extractRequirements
} = require("../controllers/requirementController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/extract", authMiddleware, extractRequirements);

module.exports = router;