var regis_button = document.getElementById("register_button");
var name_user = document.getElementById("n");
var email = document.getElementById("e");
var password = document.getElementById("p");
var confirm_password = document.getElementById("cp");


regis_button.addEventListener("click", function (e) {
    e.preventDefault(); // stop page refresh
    
    console.log(name_user.value);
    window.localStorage["FullName"] = name_user.value;
    window.localStorage["email"] = email.value;
    window.localStorage["password"] = password.value;
    window.localStorage["confirm_password"] = confirm_password.value;
    window.localStorage["FullName"] = name_user.value;
});

function validateForm() {
//   let x = document.forms["myForm"]["fname"].value;
  if (name_user.value == "" || email.value == "" || password.value == "" || confirm_password.value == "") {
    alert("Name must be filled out");
    return false;
  }
}



