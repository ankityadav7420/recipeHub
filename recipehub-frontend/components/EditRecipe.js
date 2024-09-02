import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

function EditRecipe() {
  const [recipe, setRecipe] = useState({
    title: "",
    ingredients: "",
    instructions: ""
  });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      axios
        .get(`/api/recipes/${id}`)
        .then((response) => setRecipe(response.data.data))
        .catch((error) => console.error(error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      setImage(files[0]);
    } else {
      setRecipe({ ...recipe, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();

    formData.append("title", recipe.title);
    formData.append("ingredients", recipe.ingredients);
    formData.append("instructions", recipe.instructions);

    if (image) {
      formData.append("image", image);
    }

    try {
      await axios.put(`/api/edit/recipes/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setNotification("Recipe updated successfully!");
      setTimeout(() => {
        router.push(`/recipes/${id}`);
      }, 2000);
    } catch (error) {
      setNotification("Error updating recipe. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    !recipe.title || !recipe.ingredients || !recipe.instructions || isLoading;

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Recipe</h1>

      {/* Notification message */}
      {notification && (
        <div className="mb-4 text-center">
          <p
            className={`p-2 rounded ${
              notification.includes("Error")
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {notification}
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={recipe.title}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Ingredients
        </label>
        <textarea
          name="ingredients"
          value={recipe.ingredients}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Instructions
        </label>
        <textarea
          name="instructions"
          value={recipe.instructions}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full h-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Image (optional)
        </label>
        <input
          type="file"
          name="image"
          accept=".jpg,.jpeg,.png"
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        type="submit"
        className={`bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded ${
          isButtonDisabled ? "cursor-not-allowed opacity-50" : ""
        }`}
        disabled={isButtonDisabled}
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
      <Link href="/">
        <span className="m-6 inline-block px-4 py-2 bg-red-300 text-white rounded hover:bg-red-700">
          Cancel
        </span>
      </Link>
    </form>
  );
}

export default EditRecipe;
