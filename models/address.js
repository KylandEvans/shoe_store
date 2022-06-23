const mongoose = require("mongoose");

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
