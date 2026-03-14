

function CategoryForm({ user, categories, formdata, handleInputChange }) {
  // Filter categories based on user role
  let filteredCategories = [];

  switch (user.role) {
    case "QHSE_coordinator":
      filteredCategories = categories.filter(cat => cat.name === "HSE_materials");
      break;

    case "Environmental_lab_manager":
    case "lab_supervisor":
      filteredCategories=categories.filter(cat => cat.name === "lab_items");
      break;
    case "admin":
      filteredCategories=categories?.filter(cat=>cat.name==="Office_items")
      break;
      
    default:
      filteredCategories = categories; // admins see all
      break;
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Category</label>
      <select
        name="category"
        value={formdata.category}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select Category</option>
        {filteredCategories.map((category,index) => (
          <option key={category._id || index} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CategoryForm;
