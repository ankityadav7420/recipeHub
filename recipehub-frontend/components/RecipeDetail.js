import React, { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ConfirmationDialog from "../components/ConfirmationDialog";
import Image from "next/image";
import Link from "next/link";

function RecipeDetail() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const {
    data: recipe,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => axios.get(`/api/recipes/${id}`).then((res) => res.data.data),
    enabled: !!id
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: () => axios.delete(`/api/recipes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries("recipes");
      router.push("/");
    },
    onError: (error) => {
      console.error("Error deleting the recipe:", error);
    }
  });

  const handleEdit = () => {
    router.push(`/recipes/edit/${id}`);
  };

  const handleDelete = () => {
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteRecipeMutation.mutate();
    setIsDialogOpen(false);
  };

  const cancelDelete = () => {
    setIsDialogOpen(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading recipe details.</p>;

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex justify-end">
        <Link href="/">
          <span className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            Recipe List Home
          </span>
        </Link>
      </div>
      <div className="flex flex-col md:flex-row items-start m-4">
        <div className="md:w-1/2 pr-6 m-2">
          <h1 className="text-5xl font-bold mb-4 break-words">
            {recipe?.title}
          </h1>
          <p className="mb-4 text-gray-700 m-2 break-words">
            <strong className="font-semibold text-lg">Ingredients:</strong>{" "}
            {recipe?.ingredients}
          </p>
          <p className="mb-4 text-gray-700 m-2 break-words">
            <strong className="font-semibold text-lg">Instructions:</strong>{" "}
            {recipe?.instructions}
          </p>
          <div className="mt-6 flex space-x-4">
            <button
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>

        {recipe?.images && recipe.images.length > 0 && (
          <div className="md:w-1/2 flex justify-center mt-12 md:mt-0">
            <Image
              src={recipe.images[0].url}
              alt={recipe?.title}
              className="rounded-lg shadow-lg m-8"
              width={900}
              height={700}
              layout="responsive"
            />
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default RecipeDetail;
