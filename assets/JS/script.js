const addToCartBtn = document.querySelector(".add-to-cart");
const sizeSelector = document.querySelectorAll(".select-size");
const closeBtn = document.querySelector(".cart-close");
const cartWrapper = document.querySelector(".cart-wrapper");
const cartBtn = document.querySelector(".cart-button");
const select = document.querySelectorAll(".select");
const modalCloseBtn = document.querySelectorAll(".modal-close");
const loginFormBtn = document.querySelector(".login-btn");
const registerFormBtn = document.querySelector(".register-btn");
const togglePassword = document.querySelectorAll(".toggle-password");
const passwordInput = document.querySelectorAll(".password-input");

try {
	modalCloseBtn.forEach(e => {
		e.addEventListener("click", () => {
			const loginModal = document.querySelector(".login-modal");
			const registerModal = document.querySelector(".register-modal");
			loginModal.style.display = "none";
			registerModal.style.display = "none";
		});
	});

	loginFormBtn.addEventListener("click", () => {
		const loginForm = document.querySelector(".login-modal");
		loginForm.classList.remove("animate__fadeOutDownBig");
		loginForm.classList.add("animate__fadeInUpBig");
		loginForm.style.display = "block";
		document.querySelector(".login-username-input").focus();
	});

	registerFormBtn.addEventListener("click", () => {
		const registerForm = document.querySelector(".register-modal");
		registerForm.classList.remove("animate__fadeOutDownBig");
		registerForm.classList.add("animate__fadeInUpBig");
		registerForm.style.display = "block";
		document.querySelector(".register-first-name-input").focus();
	});
} catch {
	console.log("User Logged In. No form to display!");
}

closeBtn.addEventListener("click", () => {
	cartWrapper.style.display = "none";
	const html = document.getElementsByTagName("html");
	const body = document.getElementsByTagName("body");

	html[0].classList.remove("noscroll");
	body[0].classList.remove("noscroll");
});

cartBtn.addEventListener("click", () => {
	cartWrapper.style.display = "block";
	const html = document.getElementsByTagName("html");
	const body = document.getElementsByTagName("body");

	html[0].classList.add("noscroll");
	body[0].classList.add("noscroll");
});

document.addEventListener("mouseup", e => {
	const container = document.querySelector(".cart");
	if (!container.contains(e.target)) {
		document.querySelector(".cart-wrapper").style.display = "none";
		const html = document.getElementsByTagName("html");
		const body = document.getElementsByTagName("body");

		html[0].classList.remove("noscroll");
		body[0].classList.remove("noscroll");
	}
});
