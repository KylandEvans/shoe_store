const mongoose = require("mongoose");
const Product = require("../models/product");

mongoose
	.connect("mongodb://localhost:27017/shoe-store")
	.then(() => {
		console.log("Mongo Connected!!");
	})
	.catch(e => {
		console.log("Mongo Connection Failed!!");
		console.log(e);
	});

const unseed = async () => {
	const d = await Product.deleteMany({});
};

unseed();

const gender = () => {
	const result = Math.floor(Math.random() * 2);
	if (result >= 1) {
		return "men";
	} else {
		return "women";
	}
};

const brands = () => {
	const result = Math.floor(Math.random() * 3) + 1;
	if (result === 1) {
		return "nike";
	} else if (result === 2) {
		return "newbalance";
	} else {
		return "puma";
	}
};

const price = () => {
	const p = Math.random() * 30 + 1;
	return parseFloat(p.toFixed(2));
};

const seedDB = async () => {
	for (let i = 0; i < 50; i++) {
		await new Product({
			name: "Nike Ariforce",
			subTitle: "Men's Running Shoes",
			image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/28d60e46-29e3-4fc2-bcd3-d5b466a07308/air-zoom-pegasus-38-mens-road-running-shoes-lq7PZZ.png",
			description:
				" is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
			brand: brands(),
			gender: gender(),
			price: price(),
			size: [
				"6",
				"6.5",
				"7",
				"7.5",
				"8",
				"8.5",
				"9",
				"9.5",
				"10",
				"10.5",
				"11",
				"11.5",
				"12",
				"12.5",
				"13",
			],
		}).save();
	}
};
seedDB().then(() => {
	mongoose.connection.close();
});
