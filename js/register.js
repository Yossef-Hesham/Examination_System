var regis_button = document.getElementById("register_button");

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validate_register() {
    var name = document.getElementById('n').value.trim();
    var email = document.getElementById('e').value.trim();
    var password = document.getElementById('p').value;
    var confirm_password = document.getElementById('cp').value;

    document.getElementById('nameError').innerText = '';
    document.getElementById('emailError').innerText = '';
    document.getElementById('passwordError').innerText = '';
    document.getElementById('cpError').innerText = '';
    document.getElementById('has_account').innerText = '';

    var isValid = true;

    if (name === '') {
        document.getElementById('nameError').innerText = 'Name is required';
        isValid = false;
    }

    if (email === '') {
        document.getElementById('emailError').innerText = 'Email is required';
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('emailError').innerText = 'Enter a valid email';
        isValid = false;
    }

    if (password.length < 8) {
        document.getElementById('passwordError').innerText =
            'Password must be at least 8 characters';
        isValid = false;
    }

    if (confirm_password !== password) {
        document.getElementById('cpError').innerText =
            'Passwords do not match';
        isValid = false;
    }

    if (isValid) {

        if (localStorage.getItem('email') === email) {
            document.getElementById('has_account').innerText =
                'Already have an account, please log in';
        } else {
            localStorage.clear()
            localStorage.setItem('name', name);
            localStorage.setItem('email', email);
            localStorage.setItem('password', password);


            alert('Registration is successful ✅');
            window.location.href = "login.html"; // optional redirect
        }
    }
}

regis_button.addEventListener("click", function (e) {
    e.preventDefault();
    validate_register();
});
