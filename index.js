if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const ejs = require("ejs");
const engine = require("ejs-mate");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Product = require("./models/product");
const catchAsync = require("./Utils/catchAsync");
const ExpressError = require("./Utils/ExpressError");
const User = require("./models/user");
const Address = require("./models/address");
const Order = require("./models/order");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const nodemailer = require("nodemailer");
const Email = require("email-templates");

//ISSUES:

//TODO:'s
// When site is published add links to email when register and order placed
// Add admin and guest accounts to database before production
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
	secret: process.env.SESSION_CONFIG_SECRET,
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
	req.session.returnTo = req.header("Referer");
	// console.log(req.user); // TEMP: Remove when done with emails
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

const registrationError = (req, res, next) => {
	// console.log(req.body);
	const errors = registrationCheck(req.body);
	if (errors.length > 0) {
		req.flash("error", errors.join());
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

//Functions

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

function validateAdminNewShoe(shoe, issues) {
	if (!shoe.name.length) {
		issues.push("Name field cannot be empty!");
	}
	if (!shoe.subTitle.length) {
		issues.push("Subtitle field cannot be empty!");
	}
	if (!shoe.price.length) {
		issues.push("Price field cannot be empty!");
	}
	if (shoe.price <= 0) {
		issues.push("Price cannot be less than zero!");
	}
	if (!shoe.image.length) {
		issues.push("Image field cannot be empty!");
	}
	if (!shoe.size) {
		issues.push("Must select at least one size!");
	}
	if (!shoe.description) {
		issues.push("Description field cannot be empty!");
	}
	return issues;
}

function registrationCheck(registerData) {
	//returns if email is valid
	function validateEmail(email) {
		return email.match(
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
	}

	//returns if phone number is valid
	function validatePhone(phone) {
		return phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);
	}

	//validate the strength of password
	function passwordStrengthValidate(password, username, email) {
		if (password.length < 8) {
			return false;
		}

		if (!password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)) {
			return false;
		}

		if (password === email) {
			return false;
		}

		if (password === username) {
			return false;
		}

		return true;
	}

	let errors = [];
	if (!registerData.firstName.length) {
		errors.push("First name cannot be empty!");
	}
	if (!registerData.lastName.length) {
		errors.push("Last name cannot be empty!");
	}
	if (!registerData.email.length) {
		errors.push("Email cannot be empty!");
	}
	if (!registerData.phone.length) {
		errors.push("Phone number cannot be empty!");
	}
	if (!registerData.username.length) {
		errors.push("Username cannot be empty!");
	}
	if (!registerData.password.length) {
		errors.push("Password cannot be empty!");
	}
	//validates that email is valid
	if (!validateEmail(registerData.email)) {
		errors.push("Email is not valid!");
	}
	//validates that phone number is valid
	if (!validatePhone(registerData.phone)) {
		errors.push("Phone number is not valid!");
	}
	//validate password matches confirmation password
	if (registerData.password !== registerData.confirmPassword) {
		errors.push("Passwords do not match!");
	}
	//validate password strength
	if (
		!passwordStrengthValidate(registerData.password, registerData.username, registerData.email)
	) {
		errors.push("Password is too weak!");
	}
	return errors;
}

let transporter = nodemailer.createTransport({
	host: "smtp-mail.outlook.com",
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.OUTLOOK_AUTH_USER,
		pass: process.env.OUTLOOK_AUTH_PASS,
	},
});

async function sendEmail(obj) {
	return await transporter.sendMail(obj);
}

async function loadTemplate(templateName, locals = {}) {
	let email = new Email({
		views: {
			options: {
				extension: "ejs",
			},
		},
	});
	let template = path.join(__dirname, `views/templates/${templateName}`);
	const rendered = await email.render(template, locals);
	return rendered;
}

// Standard Routes
app.get("/", (req, res) => {
	const cart = req.session.cart;
	const total = req.session.total;
	res.render("home", { cart, total });
});

app.patch(
	"/",
	catchAsync(async (req, res) => {
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
	})
);

app.get(
	"/shoes/nike",
	catchAsync(async (req, res) => {
		const products = await Product.find({ brand: "nike" });
		const cart = req.session.cart;
		const total = req.session.total;
		res.render("shoes", { products, cart, total });
	})
);

app.get(
	"/shoes/newbalance",
	catchAsync(async (req, res) => {
		const products = await Product.find({ brand: "new balance" });
		const cart = req.session.cart;
		const total = req.session.total;
		res.render("shoes", { products, cart, total });
	})
);

app.get(
	"/shoes/puma",
	catchAsync(async (req, res) => {
		const products = await Product.find({ brand: "puma" });
		const cart = req.session.cart;
		const total = req.session.total;
		res.render("shoes", { products, cart, total });
	})
);

app.get(
	"/shoes/men",
	catchAsync(async (req, res) => {
		const products = await Product.find({ gender: "men" });
		const cart = req.session.cart;
		const total = req.session.total;
		res.render("shoes", { products, cart, total });
	})
);

app.get(
	"/shoes/women",
	catchAsync(async (req, res) => {
		const products = await Product.find({ gender: "woman" });
		const cart = req.session.cart;
		const total = req.session.total;
		res.render("shoes", { products, cart, total });
	})
);

app.get(
	"/shoes/:id",
	catchAsync(async (req, res) => {
		const products = await Product.findById(req.params.id);
		const cart = req.session.cart;
		const total = req.session.total;
		res.render("shoes/details", { products, cart, total });
	})
);

app.post(
	"/shoes/:id",
	catchAsync(async (req, res) => {
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
	})
);

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
		res.redirect(req.session.returnTo || "/");
		delete req.session.returnTo;
	}
);

app.post(
	"/register",
	registrationError,
	catchAsync(async (req, res) => {
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
			}
			let body = await loadTemplate("welcome");
			const obj = {
				from: `'Not Really a Shoe Store' <NotReallyAShoeStore@outlook.com>`,
				to: registeredUser.email,
				subject: `Welcome ${registeredUser.firstName}`,
				html: body,
			};
			await sendEmail(obj);
			req.login(user, err => {
				if (err) console.log(err);
				let temp = req.session.returnTo;
				delete req.session.returnTo;
				req.flash("success", `Welcome, ${user.firstName}`);
				return res.redirect(temp || "/");
			});
		} catch (err) {
			req.flash("error", err.message);
			res.redirect("/");
		}
	})
);

app.post("/logout", (req, res) => {
	req.logout();
	req.session.cart = [];
	req.session.total = 0.0;
	req.flash("success", "You have been successfully logged out!");
	res.redirect(req.session.returnTo || "/");
});

app.post(
	"/user/add/address",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const { address1, address2, city, state, zipCode } = req.body;
		const id = req.user._id;
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
		});
		res.redirect(req.session.returnTo || "/");
		delete req.session.returnTo;
	})
);

app.get(
	"/checkout",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const cart = req.session.cart;
		const total = req.session.total;
		const addresses = await req.user.populate("addresses");
		if (addresses.addresses.length) {
			const taxPercentage = getTaxPercentage(addresses.addresses[0].state);
			const shippingFee = req.user.total > 50 ? 0 : 24.98;
			const tax = req.user.total * taxPercentage;
			const orderTotal = req.user.total + shippingFee + tax;
			res.render("checkout", { total, cart, taxPercentage, shippingFee, tax, orderTotal });
		} else {
			res.render("checkout", {
				total,
				cart,
				taxPercentage: 0,
				shippingFee: 0,
				tax: 0,
				orderTotal: 0,
			});
		}
	})
);

app.get("/settings", isLoggedIn, (req, res) => {
	res.render("settings");
});

app.post(
	"/settings",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const userId = req.user._id;
		const { firstName, lastName, phone, email } = req.body;
		const user = await User.findByIdAndUpdate(userId, { firstName, lastName, phone, email });
		req.flash("success", "Your account settings have been updated successfully!!");
		res.redirect(req.session.returnTo || "/");
	})
);

app.get(
	"/settings/updateAddress",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const userAddresses = await req.user.populate("addresses");
		res.render("updateAddress", { addresses: userAddresses.addresses });
	})
);

app.get(
	"/settings/updateAddress/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const id = req.params.id;
		const address = await Address.findById(id);
		res.render("updateAddressForm", { address });
	})
);

app.patch(
	"/settings/updateAddress/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const id = req.params.id;
		const { address1, address2, city, state, zipCode } = req.body;
		const address = await Address.findByIdAndUpdate(id, {
			address1,
			address2,
			city,
			state,
			zipCode,
		});
		await address.save();
		res.redirect("/settings/updateAddress");
	})
);

app.delete(
	"/settings/address/delete/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const id = req.params.id;
		const address = await Address.findByIdAndDelete(id);
		const user = await User.findById(req.user._id);
		const userAddresses = user.addresses;
		for (let i = 0; i < userAddresses.length; i++) {
			if (address._id.toString() === userAddresses[i].toString()) {
				userAddresses.splice(i, 1);
			}
		}
		user.save();
		req.flash("success", "Address Successfully Deleted");
		res.redirect("/settings/updateAddress");
	})
);

app.get(
	"/orders",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const userOrders = await Order.where("user")
			.equals(req.user._id)
			.populate({
				path: "items",
				populate: { path: "item" },
			})
			.populate("shippingAddress");
		res.render("orders", { userOrders });
	})
);

app.post(
	"/checkout",
	isLoggedIn,
	catchAsync(async (req, res) => {
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
		console.log(req.body);
		class Item {
			constructor(item, size) {
				this.item = item;
				this.size = size;
			}
		}
		const cartItems = [];
		for (let i = 0; i < req.user.cart.length; i++) {
			let item = new Item(req.user.cart[i].shoe._id, req.user.cart[i].size);
			cartItems.push(item);
		}
		const shippingAddressId = req.body.shippingAddress;
		const address = await Address.findById(shippingAddressId);
		const taxPercentage = getTaxPercentage(address.state);
		const shippingFee = req.user.total > 50 ? 0 : 24.98;
		const tax = req.user.total * taxPercentage;
		const orderTotal = req.user.total + shippingFee + tax;
		const newOrder = new Order({
			user: req.user._id,
			shippingAddress: {
				address1: address.address1,
				address2: address.address2,
				city: address.city,
				state: address.state,
				zipCode: address.zipCode,
			},
			paymentMethod: req.body.paymentSelect,
			items: cartItems,
			itemsTotal: req.user.total.toFixed(2),
			orderTax: tax.toFixed(2),
			shippingCost: shippingFee.toFixed(2),
			orderTotal: orderTotal.toFixed(2),
			orderDate: new Date().toLocaleDateString(),
		});
		await newOrder.save();
		const placedOrder = await Order.findById(newOrder._id)
			.populate({
				path: "items",
				populate: { path: "item" },
			})
			.populate("user");
		console.log(placedOrder.items);
		locals = {
			//User Information
			firstName: placedOrder.user.firstName,
			lastName: placedOrder.user.lastName,
			email: placedOrder.user.email,

			// Shipping Information
			address1: placedOrder.shippingAddress.address1,
			address2: placedOrder.shippingAddress.address2,
			city: placedOrder.shippingAddress.city,
			state: placedOrder.shippingAddress.state,
			zipCode: placedOrder.shippingAddress.zipCode,

			//Order Informtaion
			cardNumber: placedOrder.paymentMethod,
			items: placedOrder.items,
			itemsTotal: placedOrder.itemsTotal,
			orderTax: placedOrder.orderTax,
			shippingCost: placedOrder.shippingCost,
			orderTotal: placedOrder.orderTotal,
		};
		const body = await loadTemplate("order", locals);
		const obj = {
			from: `Not Really A Shoe Store <NotReallyAShoeStore@outlook.com>`,
			to: req.user.email,
			subject: `Thank you for placing your order!`,
			html: body,
		};
		const sent = await sendEmail(obj);
		console.log(sent);
		req.user.cart = [];
		req.session.cart = [];
		req.user.save();
		const orderId = newOrder;
		req.flash("success", "Thank you for your order!");
		res.redirect(`/receipt/${orderId._id}`);
	})
);

app.get(
	"/receipt/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const id = req.params.id;
		const newOrder = await (
			await Order.findById(id).populate({
				path: "items",
				populate: { path: "item" },
			})
		).populate("shippingAddress");
		res.render("receipt", { newOrder });
	})
);

app.get("/admin/newShoe", isLoggedIn, isAdmin, (req, res) => {
	let issues = [];
	res.render("admin/new", { issues });
});

app.post(
	"/admin/newShoe",
	isLoggedIn,
	isAdmin,
	catchAsync(async (req, res) => {
		let issues = [];
		validateAdminNewShoe(req.body, issues);
		if (issues.length) {
			res.render("admin/new", { issues });
		} else {
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
		}
	})
);

app.get(
	"/admin/editShoes",
	isLoggedIn,
	isAdmin,
	catchAsync(async (req, res) => {
		const products = await Product.find();
		res.render("admin/edit", { products });
	})
);

app.get(
	"/admin/editShoes/:id",
	isLoggedIn,
	isAdmin,
	catchAsync(async (req, res) => {
		const id = req.params.id;
		const shoe = await Product.findById(id);
		res.render("admin/editDetails", { shoe });
	})
);

app.patch(
	"/admin/edit/:id",
	isLoggedIn,
	isAdmin,
	catchAsync(async (req, res) => {
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
	})
);

app.delete(
	"/admin/edit/:id",
	isLoggedIn,
	isAdmin,
	catchAsync(async (req, res) => {
		const id = req.params.id;
		const shoe = await Product.findByIdAndDelete(id);
		req.flash("success", `Your delete request was successful`);
		res.redirect("/");
	})
);

app.get(
	"/admin/orders",
	isLoggedIn,
	isAdmin,
	catchAsync(async (req, res) => {
		const activeOrders = await Order.find({ orderStatus: "active" })
			.populate("user")
			.populate({
				path: "items",
				populate: { path: "item" },
			});
		res.render("admin/activeOrders", { activeOrders });
	})
);

app.get(
	"/admin/orders/all",
	isLoggedIn,
	isAdmin,
	catchAsync(async (req, res) => {
		const allOrders = await Order.find()
			.populate("user")
			.populate({
				path: "items",
				populate: { path: "item" },
			});
		res.render("admin/allOrders", { allOrders });
	})
);

app.get("/tos", (req, res) => {
	res.render("termsOfService");
});

app.get("/tou", (req, res) => {
	res.render("termsOfUsage");
});

app.get("/privacy", (req, res) => {
	res.render("privacyPolicy");
});

app.post(
	"/admin/orders/updateStatus/:id",
	isLoggedIn,
	isAdmin,
	catchAsync(async (req, res) => {
		const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: "complete" });
		res.redirect(req.session.returnTo || "/");
	})
);

app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Oh No, Something Went Wrong!!";
	res.status(statusCode).render("errors/pageNotFound", { err });
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
