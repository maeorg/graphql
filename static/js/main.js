import { CreateLoginContainer } from "./authentication.js";
import { LoadGraphsPage } from "./graphsPage.js";

const main = document.querySelector('.main');

function CreateMenu() {
    const menuContainer = document.createElement('div');
    menuContainer.id = 'menuContainer';
    const menuTitle = document.createElement('div');
    menuTitle.id = 'menuTitle';
    menuTitle.innerText = '01.kood.tech profile page';
    menuContainer.appendChild(menuTitle);
    main.prepend(menuContainer);
};


if (localStorage.getItem('jwt')) {
    CreateMenu();
    await LoadGraphsPage();
} else {
    main.innerHTML = '';
    CreateMenu();
    const loginContainer = CreateLoginContainer();
    main.appendChild(loginContainer);
}
