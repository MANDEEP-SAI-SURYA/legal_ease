document.getElementById("togglePassword").addEventListener("click", function () {
    const password = document.getElementById("password");
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    this.querySelector("i").classList.toggle("fa-eye-slash");
});

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const response = await fetch("/login", {
        method: "POST",
        body: formData
    });
    if (response.redirected) {
        window.location.href = response.url;
    } else {
        alert("Invalid login");
    }
});
