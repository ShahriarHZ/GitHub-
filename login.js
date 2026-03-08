document.getElementById("login-btn").addEventListener("click",function(){
    const nameInput=document.getElementById("number-input");
    const name=nameInput.value;
    const pinInput=document.getElementById("pin-input");
    const pin=pinInput.value;
    if(name=="admin" && pin=="admin123"){
        alert("Login success");
        window.location.assign("./home.html");
    }
    else
    {
        alert("Login failed");
        return;
    }
})