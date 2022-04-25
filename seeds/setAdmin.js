const mongoose = require("mongoose");
const User = require("../models/user");

mongoose
	.connect("mongodb://localhost:27017/shoe-store")
	.then(() => {
		console.log("Mongo Connected!!");
	})
	.catch(e => {
		console.log("Mongo Connection Failed!!");
		console.log(e);
	});

const setAdmin = async () => {
	const user = await User.findOneAndUpdate({
		username: "kyland",
		isAdmin: true,
	});
};

setAdmin().then(() => {
	mongoose.connection.close();
});
