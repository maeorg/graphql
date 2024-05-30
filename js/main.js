import { CreateLoginContainer } from "./authentication.js";
import { LoadGraphsPage } from "./graphsPage.js";

const main = document.querySelector('.main');

if (localStorage.getItem('jwt')) {
    await LoadGraphsPage();
} else {
    const loginContainer = CreateLoginContainer();
    main.appendChild(loginContainer);
}