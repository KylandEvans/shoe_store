const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const engine = require("ejs-mate");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Product = require("./models/product");
const User = require("./models/user");
const Address = require("./models/address");
const Order = require("./models/order");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

//ISSUES:
// Cart partial not displaying in admin edit shoes route
// Cart not saving user cart on logout
mongoose
	.connect("mongodb://localhost:27017/shoe-store")
	.then(() => {
		console.log("Mongo Connected!!");
	})
	.catch(e => {
		console.log("Mongo Connection Failed!!");
		console.log(e);
	});

const sessionConfig = {
	secret: "secret",
	resave: false,
	saveUninitialized: true,
};
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("assets"));
app.use(flash());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	res.locals.currentUser = req.user;
	res.locals.cart = req.session.cart;
	res.locals.total = req.session.cart;
	next();
});

// Sets Defaults and resets possible errors
app.use(async (req, res, next) => {
	if (!req.user && req.session.cart === 0) {
		req.session.total = 0.0;
	}
	if (req.user && req.user.cart.length === 0) req.user.total = 0.0;
	if (req.session.cart && req.session.cart.length === 0) {
		req.session.total = 0.0;
	}
	if (req.user) {
		req.user.cart = req.session.cart;
		req.user.total = req.session.total;
		await req.user.save();
	}
	next();
});

//Middleware functions

const isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.flash("error", "You must be signed in!");
		return res.redirect("/");
	} else {
		next();
	}
};

const isAdmin = (req, res, next) => {
	if (!req.user.isAdmin) {
		req.flash("error", "You don't have access to do that!");
		return res.redirect("/");
	} else {
		next();
	}
};

//functions

function getTaxPercentage(state) {
	switch (state) {
		case "CA":
			return 0.0725;
		case "TN":
		case "RI":
		case "MS":
		case "IN":
			return 0.07;
		case "MN":
			return 0.0688;
		case "NV":
			return 0.0685;
		case "NJ":
			return 0.0663;
		case "WA":
		case "KS":
		case "AR":
			return 0.065;
		case "CT":
			return 0.0635;
		case "TX":
		case "MA":
		case "IL":
			return 0.0625;
		case "WV":
		case "VT":
		case "SC":
		case "PA":
		case "MI":
		case "MD":
		case "KY":
		case "IA":
		case "ID":
		case "FL":
			return 0.06;
		case "UT":
			return 0.0595;
		case "OH":
			return 0.0575;
		case "AZ":
			return 0.056;
		case "NE":
		case "ME":
			return 0.055;
		case "VA":
			return 0.053;
		case "NM":
			return 0.0513;
		case "WI":
		case "ND":
			return 0.05;
		case "NC":
			return 0.0475;
		case "SD":
		case "OK":
			return 0.045;
		case "LA":
			return 0.0445;
		case "MO":
			return 0.0423;
		case "WY":
		case "NY":
		case "HI":
		case "GA":
		case "AL":
			return 0.04;
		case "CO":
			return 0.029;
		default:
			return 0;
	}
}

app.get("/", (req, res) => {
	const cart = req.session.cart;
	const total = req.session.total;
	res.render("home", { cart, total });
});

app.patch("/", async (req, res) => {
	const cart = req.session.cart;
	const arr = req.body.delete.split(",");
	const shoe = arr[0];
	const size = arr[1];
	const price = await Product.findById(shoe);
	req.session.total = req.session.total - price.price;

	for (let i = 0; i < cart.length; i++) {
		if (cart[i].shoe._id === shoe && cart[i].size === size) {
			cart.splice(i, 1);
			break;
		}
	}

	if (req.user) {
		const userCart = req.user.cart;
		for (let i = 0; i < userCart.length; i++) {
			if (userCart[i].shoe._id.toString() === shoe && userCart[i].size === size) {
				req.user.total = req.user.total - price.price;
				userCart.splice(i, 1);
				await req.user.save();
				break;
			}
		}
	}
	res.redirect("/");
});

app.get("/shoes/nike", async (req, res) => {
	const products = await Product.find({ brand: "nike" });
	const cart = req.session.cart;
	const total = req.session.total;
	res.render("shoes", { products, cart, total });
});

app.get("/shoes/newbalance", async (req, res) => {
	const products = await Product.find({ brand: "newbalance" });
	const cart = req.session.cart;
	const total = req.session.total;
	res.render("shoes", { products, cart, total });
});

app.get("/shoes/puma", async (req, res) => {
	const products = await Product.find({ brand: "puma" });
	const cart = req.session.cart;
	const total = req.session.total;
	res.render("shoes", { products, cart, total });
});

app.get("/shoes/men", async (req, res) => {
	const products = await Product.find({ gender: "men" });
	const cart = req.session.cart;
	const total = req.session.total;
	res.render("shoes", { products, cart, total });
});

app.get("/shoes/women", async (req, res) => {
	const products = await Product.find({ gender: "women" });
	const cart = req.session.cart;
	const total = req.session.total;
	res.render("shoes", { products, cart, total });
});

app.get("/shoes/:id", async (req, res) => {
	const products = await Product.findById(req.params.id);
	const cart = req.session.cart;
	const total = req.session.total;
	res.render("shoes/details", { products, cart, total });
});

app.post("/shoes/:id", async (req, res) => {
	const { id } = req.params;
	const shoe = await Product.findById(id);
	const { size } = req.body;
	if (!req.user) {
		if (req.session.cart) {
			req.session.total += Number.parseFloat(shoe.price);
			req.session.cart.push({
				shoe,
				size,
			});
		} else {
			req.session.total = Number.parseFloat(shoe.price);
			req.session.cart = [
				{
					shoe,
					size,
				},
			];
		}
	} else if (req.user) {
		if (req.user.cart && req.session.cart.length) {
			req.session.total += Number.parseFloat(shoe.price);
			req.session.cart.push({
				shoe,
				size,
			});
			req.user.total += Number.parseFloat(shoe.price);
			req.user.cart.push({
				shoe,
				size,
			});
		} else {
			req.session.total = Number.parseFloat(shoe.price);
			req.session.cart = [
				{
					shoe,
					size,
				},
			];
			req.user.total = Number.parseFloat(shoe.price);
			req.session.cart = [
				{
					shoe,
					size,
				},
			];
		}
		await req.user.save();
	}
	res.redirect(`/shoes/${id}`);
});

app.post(
	"/login",
	passport.authenticate("local", {
		failureFlash: true,
		failureRedirect: "/",
	}),
	(req, res) => {
		req.session.cart = [];
		req.user.cart.forEach(item => {
			req.session.cart.push(item);
		});
		req.session.total = 0.0;
		req.session.total = req.user.total;
		const username = req.body.username[0].toUpperCase() + req.body.username.substring(1);
		req.flash("success", `Welcome back, ${username}`);
		res.redirect("/");
	}
);

app.post("/register", async (req, res) => {
	try {
		const { firstName, lastName, email, phone, username, password } = req.body;
		const user = new User({
			firstName,
			lastName,
			email,
			phone,
			username,
			cart: [],
			total: 0.0,
		});
		const registeredUser = await User.register(user, password);
		if (req.session.cart && req.session.cart.length) {
			req.session.cart.forEach(item => {
				registeredUser.cart.push(item);
			});
			registeredUser.total = req.session.total;
			registeredUser.save();
			console.log(req.session.cart);
		}
		req.login(user, err => {
			if (err) console.log(err);
			req.flash("success", `Welcome, ${user.firstName}`);
			return res.redirect("/");
		});
	} catch (err) {
		req.flash("error", err.message);
		res.redirect("/");
	}
});

app.post("/logout", (req, res) => {
	req.logout();
	req.session.cart = [];
	req.session.total = 0.0;
	req.flash("success", "You have been successfully logged out!");
	res.redirect("/");
});

app.post("/user/add/address", isLoggedIn, async (req, res) => {
	const { address1, address2, city, state, zipCode } = req.body;
	const id = req.user._id;
	console.log(address1, address2, city, state, zipCode);
	const newAddress = new Address({
		address1,
		address2,
		city,
		state,
		zipCode,
	});
	await newAddress.save(async function (err, newAddress) {
		const user = await User.findById(id);
		await user.addresses.push(newAddress._id);
		await user.save();
		const newUser = await User.findById(id).populate("addresses");
		console.log(newUser);
	});
	res.redirect("/checkout");
});

app.get("/checkout", isLoggedIn, async (req, res) => {
	const cart = req.session.cart;
	const total = req.session.total;
	const addresses = await req.user.populate("addresses");
	console.log(addresses);
	const taxPercentage = getTaxPercentage(addresses.addresses[0].state);
	const shippingFee = req.user.total > 50 ? 0 : 24.98;
	const tax = req.user.total * taxPercentage;
	const orderTotal = req.user.total + shippingFee + tax;
	res.render("checkout", { total, cart, taxPercentage, shippingFee, tax, orderTotal });
});

app.post("/checkout", isLoggedIn, async (req, res) => {
	//TODO: Need to add validations
	// console.log(req.body);
	if (!req.body.shippingAddress) {
		req.flash("error", "Please select a shipping address!");
		res.redirect("/checkout");
	}
	if (!req.body.paymentSelect) {
		req.flash("error", "Please select payment method");
		res.redirect("/checkout");
	}
	if (!req.user.cart.length) {
		req.flash("error", "Can't submit order without any items!");
		res.redirect("/checkout");
	}
	const cartIds = [];
	for (let i = 0; i < req.user.cart.length; i++) {
		cartIds.push(req.user.cart[i].shoe._id);
	}
	// console.log(cartIds);
	// console.log(req.user.total);
	// console.log(req.user._id);
	console.log(req.body.shippingAddress);
	const shippingAddressId = req.body.shippingAddress;
	const address = await Address.findById(shippingAddressId);
	const taxPercentage = getTaxPercentage(address.state);
	const shippingFee = req.user.total > 50 ? 0 : 24.98;
	const tax = req.user.total * taxPercentage;
	const orderTotal = req.user.total + shippingFee + tax;
	const newOrder = new Order({
		user: req.user._id,
		shippingAddress: req.body.shippingAddress,
		paymentMethod: req.body.paymentSelect,
		items: cartIds,
		itemsTotal: req.user.total.toFixed(2),
		orderTax: tax.toFixed(2),
		shippingCost: shippingFee.toFixed(2),
		orderTotal: orderTotal.toFixed(2),
	});
	await newOrder.save();
	req.user.cart = [];
	req.session.cart = [];
	req.user.save();
	const orderId = newOrder;
	// console.log(orderId._id);
	req.flash("success", "Thank you for your order!");
	res.redirect(`/receipt/${orderId._id}`);
});

app.get("/receipt/:id", isLoggedIn, async (req, res) => {
	//TODO: redirect to this page from the checkout post and show order confirmation
	const id = req.params.id;
	const newOrder = await (await Order.findById(id).populate("items")).populate("shippingAddress");
	console.log(newOrder);
	res.render("receipt", { newOrder });
});

app.get("/admin/newShoe", isLoggedIn, isAdmin, (req, res) => {
	res.render("admin/new");
});

app.post("/admin/newShoe", isLoggedIn, isAdmin, async (req, res) => {
	const { name, subTitle, price, gender, image, size, description } = req.body;
	const brand = req.body.brand.toLowerCase();
	const product = new Product({
		name,
		subTitle,
		price,
		brand,
		gender,
		image,
		size,
		description,
	});
	await product.save();
	res.redirect("/admin/newShoe");
});

app.get("/admin/editShoes", isLoggedIn, isAdmin, async (req, res) => {
	const products = await Product.find();
	res.render("admin/edit", { products });
});

app.get("/admin/editShoes/:id", isLoggedIn, isAdmin, async (req, res) => {
	const id = req.params.id;
	const shoe = await Product.findById(id);
	res.render("admin/editDetails", { shoe });
});

app.patch("/admin/edit/:id", isLoggedIn, isAdmin, async (req, res) => {
	const id = req.params.id;
	const { name, subTitle, description, brand, gender, price, size } = req.body;
	const shoe = await Product.findByIdAndUpdate(id, {
		name,
		subTitle,
		description,
		brand,
		gender,
		price,
		size,
	});
	req.flash("success", "Your update was successful!");
	res.redirect("/");
});

app.delete("/admin/edit/:id", isLoggedIn, isAdmin, async (req, res) => {
	const id = req.params.id;
	const shoe = await Product.findByIdAndDelete(id);
	req.flash("success", `Your delete request was successful`);
	res.redirect("/");
});

app.get("/admin/addadmin", isLoggedIn, isAdmin, (req, res) => {
	//TODO: Add response to render add admin page
	res.send("This is the get route to get the add admin page");
});

app.get("/admin/addadmin/:q", isLoggedIn, isAdmin, async (req, res) => {
	//TODO: add logic to search database based on query string and render results page
	res.send("This is the get route to return the DB query to add a new admin");
});

app.patch("/admin/addadmin", isLoggedIn, isAdmin, (req, res) => {
	//TODO: Add logic to add a new admin
});

app.get("/admin/orders", isLoggedIn, isAdmin, (req, res) => {
	//TODO: Add response to list all of the orders
	res.send("This is the page that will list all of the different orders");
});

app.get("/admin/orders/:id", isLoggedIn, isAdmin, (req, res) => {
	//TODO: Add response with specific order details about the order
	res.send("This will show details about a specific order");
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
