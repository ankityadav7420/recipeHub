import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ReactPaginate from "react-paginate";

function RecipeList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 10;

  const {
    data: response,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["recipes", currentPage],
    queryFn: () =>
      axios
        .get(`/api/recipes?page=${currentPage}&limit=${recipesPerPage}`)
        .then((res) => res.data),
    keepPreviousData: true
  });

  const filteredRecipes = response?.data.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = response?.pagination.pages || 1;

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading recipes.</p>;

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div className="p-6 m-4 w-[100%] bg-gradient-to-br from-slate-100 to-red-70">
      <h1 className="text-4xl font-bold m-4">
        RecipeHub: A Collaborative Culinary Platform
      </h1>
      <div className="flex justify-end">
        <Link href="/add-recipe">
          <span className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            Add a New Recipe
          </span>
        </Link>
      </div>
      <input
        type="text"
        placeholder="Search recipes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 mt-4 p-2 border rounded w-full"
      />

      <ul className="space-y-2">
        {filteredRecipes?.map((recipe) => (
          <li key={recipe._id} className="p-4 bg-gray-100 shadow rounded-md">
            <Link href={`/recipes/${recipe._id}`}>
              <span className="text-xl text-blue-500 cursor-pointer">
                {truncateText(recipe.title, 100)}
              </span>

              <p className="p-2">{truncateText(recipe.ingredients, 100)} </p>
            </Link>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-end mt-6 flex-row">
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            pageCount={totalPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName="flex justify-center mt-6 space-x-2"
            pageClassName="inline-block"
            pageLinkClassName="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-blue-500 hover:text-white"
            previousClassName={`inline-block ${
              currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
            }`}
            previousLinkClassName="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-blue-500 hover:text-white"
            nextClassName={`inline-block ${
              currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""
            }`}
            nextLinkClassName="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-blue-500 hover:text-white"
            breakClassName="inline-block px-3 py-2"
            activeClassName="bg-blue-500 text-white cover"
            forcePage={currentPage - 1}
            disabledClassName="cursor-not-allowed opacity-50"
          />
        </div>
      )}
    </div>
  );
}

export default RecipeList;
