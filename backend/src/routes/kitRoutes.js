const express = require("express");

const {
    createKit,
    getKits,
    getKitById,
    updateKit,
    deleteKit,
    generateKit,
    regenerateBrief,
    regenerateQuestions
} = require("../controllers/kitController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Generate complete interview kit
router.post(
    "/generate",
    authMiddleware,
    generateKit
);


// Regenerate only company brief
router.put(
    "/:id/regenerate-brief",
    authMiddleware,
    regenerateBrief
);


// Regenerate questions of one category
router.put(
    "/:id/regenerate-questions",
    authMiddleware,
    regenerateQuestions
);


// Existing CRUD routes
router.post(
    "/",
    authMiddleware,
    createKit
);


router.get(
    "/",
    authMiddleware,
    getKits
);


router.get(
    "/:id",
    authMiddleware,
    getKitById
);


router.put(
    "/:id",
    authMiddleware,
    updateKit
);


router.delete(
    "/:id",
    authMiddleware,
    deleteKit
);


module.exports = router;