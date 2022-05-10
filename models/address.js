const mongoose = require("mongoose");

mongoose
	.connect("mongodb://localhost:27017/shoe-store")
	.then(() => {})
	.catch(e => {
		console.log("Mongo Connection Failed!!");
		console.log(e);
	});

const addressSchema = new mongoose.Schema({
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
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
