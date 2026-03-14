

function CategorySelect({ user, categories,selectedCategory, setSearchTerm, searchTerm,setSelectedCategory }) {
    // Filter categories based on user role
    let filteredCategories = [];
   
    const access_free_roles=["procurement_officer","human_resources","global_admin"]
  switch (user.role) {
    case "QHSE_coordinator":
      filteredCategories = categories?.filter(cat => cat.name === "HSE_materials");
      break;

    case "Environmental_lab_manager":
    case  "lab_supervisor":
      filteredCategories=categories?.filter(cat => cat.name === "lab_items");
      break;
    case "admin":
      filteredCategories=categories?.filter(cat=>cat.name==="Office_items")
      break;
    default:
      filteredCategories = categories; // admins see all
      break;
  }

  return (
     <div className="mb-4 flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded flex-grow"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded"
              >
                {access_free_roles.includes(user.role) &&<option value="All">All Categories</option>}
                {(Array.isArray(categories) && categories.length > 0) ? (
                filteredCategories?.map((category,index) => (
                    <option key={category?._id || index} value={category?.name || ""}>
                {category?.name || "Unnamed Category"}
              </option>
            ))
          ) : (
            <option disabled>No categories available</option>
          )}
              </select>
            </div>
  );
}

export default CategorySelect;
