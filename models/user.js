const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const product = require("./product");
const Address = require("./address");

const userSchema = new Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	phone: {
		type: Number,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	cart: [],
	total: {
		type: Number,
		default: 0.0,
	},
	addresses: [
		{
			type: Schema.Types.ObjectId,
			ref: "Address",
		},
	],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
