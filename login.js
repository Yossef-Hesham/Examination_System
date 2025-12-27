



function prevent_nums(){

    


}




var login_button = document.getElementById("login_button");
var login_email = document.getElementById("login_e");
var login_pass = document.getElementById("login_p");

 login_button.addEventListener("click", function (e) {
     e.preventDefault(); 
     if(window.localStorage['email'] === login_email.value &&
         window.localStorage['password'] === login_pass.value
     )
         console.log("yes");
     else 
         console.log("no");

});