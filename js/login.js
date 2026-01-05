var login_button = document.getElementById("login_button");

function validate_login() {
    var email = document.getElementById('login_e').value;
    var password = document.getElementById('login_p').value;

    // Reset errors
    document.getElementById('emailError').innerText = '';
    document.getElementById('passwordError').innerText = '';

    var flag = false;

    if (email == '') {
        document.getElementById('emailError').innerText = 'Email is required';
        flag = false;
    }

    if (password == '') {
        document.getElementById('passwordError').innerText = 'Password is required';
        flag = false;
    }

    
        if (
            window.localStorage['email'] === email &&
            window.localStorage['password'] === password
            ) {
            flag = true;
            console.log("log in successful!");
            } else {
            document.getElementById('log_failed').innerText =
                'Email or password is wrong, please try again';
            }
        
    
    return flag;
}



// history.pushState(null,"",location.href);
// window.history.forward();
 login_button.addEventListener("click", function (e) {
        e.preventDefault(); 
        var flag = validate_login();
        if(flag){
            sessionStorage.setItem("user_name",window.localStorage['name'] );
            
            var raw = localStorage.getItem("exam_result");
            if(raw) window.location.href = "Result.html";

            else    window.location.href = "Exam.html";
            

        }
});