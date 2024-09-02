const express = require("express");
const {
  addRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} = require("../controllers/recipeController");

const router = express.Router();

router.post("/recipes", addRecipe);
router.get("/recipes", getRecipes);
router.get("/recipes/:id", getRecipeById);
router.put("/edit/recipes/:id", updateRecipe);
router.delete("/recipes/:id", deleteRecipe);

module.exports = router;
