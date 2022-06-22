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
const registerFromSubmitBtn = document.querySelector(".register-button");
const formRegisterForm = document.querySelector(".register-form");

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

// Front-end Validations on register Form
registerFromSubmitBtn.addEventListener("click", () => {
	registerFromSubmitBtn.disabled = true;
	const firstName = document.querySelector(".register-first-name-input");
	const lastName = document.querySelector(".register-last-name-input");
	const email = document.querySelector(".register-email-input");
	const phone = document.querySelector(".register-phone-input");
	const userName = document.querySelector(".register-user-name-input");
	const password = document.querySelector(".register-password-input");
	const passwordCheck = document.querySelector(".register-password-check-input");
	const firstNameIssue = document.querySelector(".first-name-issue-span");
	const lastNameIssue = document.querySelector(".last-name-issue-span");
	const emailIssue = document.querySelector(".email-issue-span");
	const phoneIssue = document.querySelector(".phone-issue-span");
	const userNameMissingIssue = document.querySelector(".username-missing-issue-span");
	const passwordIssue = document.querySelector(".password-issue-span");
	const passwordCheckIssue = document.querySelector(".password-check-issue-span");

	function validateEmail(email) {
		return email.match(
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
	}

	function validatePhone(phone) {
		return phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);
	}

	function passwordStrengthValidate(password, username, email) {
		if (!password.length) {
			return false;
		}

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

	let issues = [];
	if (!firstName.value) {
		issues.push(1);
	}
	if (!lastName.value) {
		issues.push(2);
	}
	if (!validateEmail(email.value) || !email.value) {
		issues.push(3);
	}
	if (!validatePhone(phone.value) || !phone.value) {
		issues.push(4);
	}
	if (!userName.value) {
		issues.push(5);
	}
	if (!password.value || !passwordStrengthValidate(password.value, userName.value, email.value)) {
		issues.push(6);
	}
	if (password.value !== passwordCheck.value) {
		issues.push(7);
	}

	if (issues.length) {
		registerFromSubmitBtn.disabled = false;
		if (issues.includes(1)) {
			firstNameIssue.classList.remove("d-none");
		}
		if (issues.includes(2)) {
			lastNameIssue.classList.remove("d-none");
		}
		if (issues.includes(3)) {
			emailIssue.classList.remove("d-none");
		}
		if (issues.includes(4)) {
			phoneIssue.classList.remove("d-none");
		}
		if (issues.includes(5)) {
			userNameMissingIssue.classList.remove("d-none");
		}
		if (issues.includes(6)) {
			passwordIssue.classList.remove("d-none");
		}
		if (issues.includes(7)) {
			passwordCheckIssue.classList.remove("d-none");
		}
		if (!issues.includes(1)) {
			firstNameIssue.classList.add("d-none");
		}
		if (!issues.includes(2)) {
			lastNameIssue.classList.add("d-none");
		}
		if (!issues.includes(3)) {
			emailIssue.classList.add("d-none");
		}
		if (!issues.includes(4)) {
			phoneIssue.classList.add("d-none");
		}
		if (!issues.includes(5)) {
			userNameMissingIssue.classList.add("d-none");
		}
		if (!issues.includes(6)) {
			passwordIssue.classList.add("d-none");
		}
		if (!issues.includes(7)) {
			passwordCheckIssue.classList.add("d-none");
		}
	} else {
		formRegisterForm.submit();
	}
	console.log(issues);
	issues = [];
	console.log(issues);
	formRegisterForm.submit();
});
