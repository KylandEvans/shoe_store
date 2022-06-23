const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	subTitle: {
		type: String,
		required: true,
	},
	image: {
		type: String,
	},
	description: {
		type: String,
		required: true,
	},
	brand: {
		type: String,
		required: true,
	},
	gender: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	size: {
		type: [String],
		required: true,
	},
});

module.exports = mongoose.model("Product", productSchema);
