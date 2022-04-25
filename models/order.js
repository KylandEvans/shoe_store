const mongoose = require("mongoose");
const Product = require("./product");
const User = require("./user");
const Address = require("./address");

mongoose
	.connect("mongodb://localhost:27017/shoe-store")
	.then(() => {
		console.log("Mongo Connected!!");
	})
	.catch(e => {
		console.log("Mongo Connection Failed!!");
		console.log(e);
	});

const orderSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	shippingAddress: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Address",
		required: true,
	},
	paymentMethod: {
		type: Number,
		required: true,
	},
	items: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
	],
	itemsTotal: {
		type: Number,
		required: true,
	},
	orderTax: {
		type: Number,
		required: true,
	},
	shippingCost: {
		type: Number,
		required: true,
	},
	orderTotal: {
		type: Number,
		required: true,
	},
	orderStatus: {
		type: String,
		default: "active",
	},
	orderDate: {
		type: Date,
		default: Date.now(),
	},
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
