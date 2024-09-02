const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    ingredients: {
      type: String,
      required: true
    },

    instructions: {
      type: String,
      required: true
    },

    images: [
      {
        public_id: {
          type: String
          // required: true
        },
        url: {
          type: String
          // required: true
        }
      }
    ]
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", RecipeSchema);

module.exports = Recipe;
