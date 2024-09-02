const Recipe = require("../models/Recipe");
const cloudinary = require("cloudinary").v2;
const fs = require("fs"); // Make sure to include this import

const isValidImageType = (mimeType) => {
  return (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/jpg"
  );
};

// Utility function to clean up temp files
const cleanupTempFile = async (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete temp file at ${filePath}:`, err);
    } else {
      console.log(`Successfully deleted temp file at ${filePath}`);
    }
  });
};

exports.addRecipe = async (req, res) => {
  try {
    let imageLink = null;

    if (req.files && req.files.image) {
      let image = req.files.image;

      if (!isValidImageType(image.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed."
        });
      }

      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "recipesHub"
      });

      imageLink = {
        public_id: result.public_id,
        url: result.secure_url
      };

      // Clean up the temporary file only if the image was processed
      await cleanupTempFile(image.tempFilePath);
    }

    if (imageLink) {
      req.body.images = [imageLink];
    }

    const recipe = await Recipe.create(req.body);

    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all recipes
exports.getRecipes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `recipes_page_${page}_limit_${limit}`;
    const cachedRecipes = await req.redisClient.get(cacheKey);

    // if (cachedRecipes) {
    //   return res.status(200).json(JSON.parse(cachedRecipes));
    // }

    const recipes = await Recipe.find()
      .sort({ createdAt: -1 }) // Sort by createdAt, newest first
      .skip(skip)
      .limit(limit);
    const total = await Recipe.countDocuments();

    req.redisClient.setEx(
      cacheKey,
      3600,
      JSON.stringify({
        success: true,
        total,
        pagination: {
          page,
          pages: Math.ceil(total / limit)
        },
        data: recipes
      })
    );

    res.status(200).json({
      success: true,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      },
      data: recipes
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecipeById = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `recipe_${id}`;

  try {
    if (!id) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }
    // Check if the recipe is cached
    const cachedRecipe = await req.redisClient.get(cacheKey);

    // if (cachedRecipe) {
    //   return res.status(200).json({
    //     success: true,
    //     data: JSON.parse(cachedRecipe)
    //   });
    // }

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    await req.redisClient.setEx(cacheKey, 3600, JSON.stringify(recipe));

    res.status(200).json({ success: true, data: recipe });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    let updatedData = req.body;

    if (req.files && req.files.image) {
      const image = req.files.image;

      if (!isValidImageType(image.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed."
        });
      }

      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "recipesHub"
      });

      const imageLink = {
        public_id: result.public_id,
        url: result.secure_url
      };

      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res
          .status(404)
          .json({ success: false, message: "Recipe not found" });
      }

      if (recipe.images && recipe.images.length > 0) {
        const oldImageId = recipe.images[0].public_id;
        await cloudinary.uploader.destroy(oldImageId);
      }

      recipe.images = [imageLink];

      Object.assign(recipe, updatedData);

      await recipe.save();

      res.status(200).json({ success: true, data: recipe });
    } else {
      // If no new image is uploaded, just update the other fields
      const recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
          new: true
        }
      );

      if (!recipe) {
        return res
          .status(404)
          .json({ success: false, message: "Recipe not found" });
      }

      res.status(200).json({ success: true, data: recipe });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }
    res.status(200).json({ success: true, message: "Recipe deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
