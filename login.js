var login_button = document.getElementById("login_button");

function validate_login() {
    var email = document.getElementById('login_e').value;
    var password = document.getElementById('login_p').value;

    // Reset errors
    document.getElementById('emailError').innerText = '';
    document.getElementById('passwordError').innerText = '';

    var flag = true;

    if (email == '') {
        document.getElementById('emailError').innerText = 'Email is required';
        flag = false;
    }

    if (password == '') {
        document.getElementById('passwordError').innerText = 'Password is required';
        flag = false;
    }

    if (flag) {
        if (
            window.localStorage['email'] === email &&
            window.localStorage['password'] === password
            ) {
            console.log("log in successful!");
            } else {
            document.getElementById('log_failed').innerText =
                'Email or password is wrong, please try again';
            }
        
    }
}



 login_button.addEventListener("click", function (e) {
        e.preventDefault(); 
        validate_login();
});