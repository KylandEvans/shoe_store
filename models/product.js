const mongoose = require("mongoose");

mongoose
	.connect("mongodb://localhost:27017/shoe-store")
	.then(() => {
		console.log("Mongo Connected!!");
	})
	.catch(e => {
		console.log("Mongo Connection Failed!!");
		console.log(e);
	});

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
