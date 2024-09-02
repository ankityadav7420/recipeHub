import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddRecipe() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (formData) =>
      axios.post("/api/recipes", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }),
    onSuccess: () => {
      toast.success("Recipe added successfully!", {
        autoClose: 5000
      });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      router.push("/");
    },
    onError: () => {
      toast.error("Error adding recipe.", {
        autoClose: 5000
      });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("instructions", instructions);
    if (image) {
      formData.append("image", image);
    }

    mutation.mutate(formData);
    setIsLoading(true);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const isButtonDisabled = !title || !ingredients || !instructions || isLoading;

  return (
    <div className="p-6 m-4 space-x-4">
      <h1 className="text-4xl font-bold mb-4 text-center text-blue-500">
        Add New Delicious Ideas
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 m-6">
        <div>
          <label className="block font-medium">Title:</label>
          <input
            type="text"
            value={title}
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 p-2 border rounded w-[70%]"
          />
        </div>
        <div>
          <label className="block font-medium">Ingredients:</label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
            placeholder="Used Ingredients"
            className="mt-1 p-2 border rounded w-[70%]"
          />
        </div>
        <div>
          <label className="block font-medium">Instructions:</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
            placeholder="Detailed Instructions"
            className="mt-1 p-2 border rounded w-[70%]"
          />
        </div>
        <div>
          <label className="block font-medium">Image:</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange}
            className="mt-1 p-2 border rounded w-[70%]"
          />
        </div>
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 ${
            isButtonDisabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={isButtonDisabled}
        >
          {isLoading ? "Adding..." : "Add Recipe"}
        </button>

        <div className="flex justify-end">
          <Link href="/">
            <span className="mt-6 inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">
              Cancel
            </span>
          </Link>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default AddRecipe;
