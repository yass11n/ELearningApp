// in every model hn3ml require ll mongoose
const mongoose = require('mongoose');
// 1-we create schema like that
const categorySchema = new mongoose.Schema(
   // we put attributes here 
  {
  name: { type: String, required: true },
  description: { type: String },

  // Additional Fields
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
},
{
  timestamps: true 
  // bt3ml 7agten (created at,updated at) in database to get lateset for example
}
);
// 2-create model mn 5lalh h2der 23ml el CRUD operations
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;