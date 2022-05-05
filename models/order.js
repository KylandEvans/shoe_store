const mongoose = require("mongoose");
const Product = require("./product");

mongoose
	.connect("mongodb://localhost:27017/shoe-store")
	.then(() => {})
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
		address1: {
			type: String,
			required: true,
		},
		address2: {
			type: String,
			required: false,
		},
		city: {
			type: String,
			required: true,
		},
		state: {
			type: String,
			required: true,
		},
		zipCode: {
			type: Number,
			required: true,
		},
	},
	paymentMethod: {
		type: Number,
		required: true,
	},
	items: [
		{
			item: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
				required: true,
			},
			size: {
				type: Number,
				required: true,
			},
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
		type: String,
		default: new Date().toLocaleDateString(),
	},
	orderTimeStamp: {
		type: Date,
		default: Date.now(),
	},
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
