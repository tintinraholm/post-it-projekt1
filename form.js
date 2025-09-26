const messageOutput = document.getElementById("message");

document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    messageOutput.textContent = "";
});

document.getElementById("showLogin").addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    messageOutput.textContent = "";
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("registerEmail").value;
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    const API_URL = 'http://localhost:8080/users'

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password }),
        });

        const data = await res.json();
        console.log("Register response:", data);
        if (res.ok) {
            messageEl.textContent = "Registrering lyckades! Du kan logga in.";
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        } else {
            messageOutput.textContent = data.msg || "Registrering misslyckades.";
        }
    } catch (error) {
        console.error("Fel vid registrering", error)
        messageOutput.textContent = "Något gick fel. Försök igen.";
    }

});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const API_URL = 'http://localhost:8080/users'

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (res.ok) {
            console.log("Login response:", data);
            localStorage.setItem("jwtToken", data.token);
            messageOutput.textContent = "Inloggning lyckades!";

            document.getElementById("authContainer").style.display = "none";
            boardsContainer.style.display = "block";

            //fetchBoards();
        } else {
            messageOutput.textContent = data.msg || "Fel vid inloggning.";
        }
    } catch (error) {
        console.error("Fel vid login:", error);
        messageOutput.textContent = "Något gick fel. Försök igen.";
    }
});

/** async function fetchBoards() {
    // Hämta JWT från localStorage
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        messageOutput = "Du måste logga in först!"
        return;
    }

    const API_URL = 'http://localhost:8080/users';

    try {
        const res = await fetch(`${API_URL}/boards`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        const data = await res.json();

        if (res.ok) {
            const boardsList = document.getElementById("boardsList");
            boardsList.innerHTML = "";

            // Loop genom alla boards och skapa list-items
            data.forEach(board => {
                const li = document.createElement("li");
                li.textContent = board.boardName;
                boardsList.appendChild(li);
            });

            console.log("Boards hämtade:", data);
        } else {
            messageOutput.textContent = data.msg || "Kunde inte hämta boards.";
        }
    } catch (error) {
        console.error("Fel vid hämtning av boards:", error);
        messageOutput.textContent = "Något gick fel. Försök igen.";  
    }
} */



