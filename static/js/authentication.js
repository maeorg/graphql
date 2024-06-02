export const CreateLoginContainer = () => {
  const loginContainer = document.createElement('div');
  loginContainer.id = 'loginContainer';

  const loginForm = document.createElement('form');
  loginForm.id = 'loginForm';

  const loginTitle = document.createElement('div');
  loginTitle.id = 'loginTitle';
  loginTitle.textContent = 'Log in';
  loginForm.appendChild(loginTitle);

  const loginInfo = document.createElement('div');
  loginInfo.id = 'loginInfo';
  loginInfo.textContent = 'Enter your 01.kood.tech credentials';
  loginForm.appendChild(loginInfo);

  const loginErrorMessage = document.createElement('div');
  loginErrorMessage.id = 'loginErrorMessage';
  loginErrorMessage.className = 'errorMessage';
  loginErrorMessage.innerHTML = '';
  loginForm.appendChild(loginErrorMessage);

  const usernameOrEmail = document.createElement('input');
  usernameOrEmail.id = 'usernameOrEmail';
  usernameOrEmail.type = 'text';
  usernameOrEmail.placeholder = 'Username or Email';
  usernameOrEmail.required = true;
  loginForm.appendChild(usernameOrEmail);

  const password = document.createElement('input');
  password.id = 'password';
  password.type = 'password';
  password.placeholder = 'Password';
  password.required = true;
  loginForm.appendChild(password);
  
  const loginButton = document.createElement('button');
  loginButton.id = 'loginButton';
  loginButton.type = 'submit';
  loginButton.textContent = 'Log in';
  loginForm.appendChild(loginButton);


  loginContainer.appendChild(loginForm);

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    loginErrorMessage.textContent = '';

    const usernameOrEmailInput = usernameOrEmail.value;
    const passwordInput = password.value;
    const credentials = `${usernameOrEmailInput}:${passwordInput}`;
    const encodedCredentials = btoa(credentials);

    LoginHandler(encodedCredentials);
  })

  return loginContainer;
}

export async function LoginHandler(encodedCredentials) {
  try {
    const response = await fetch('https://01.kood.tech/api/auth/signin', {
      method: 'POST',
      headers: {
        "Content-Type": "text/plain",
        "Content-Encoding": "base64",
        'Authorization': `Basic ${encodedCredentials}`
      }
    });

    if (response.ok) {
      const resultToken = await response.json();
      localStorage.setItem('jwt', resultToken);
      window.location.reload();
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    loginErrorMessage.textContent = 'Invalid credentials. Try again.';
  }
}

export async function CreateLogoutButton() {
  const logoutButton = document.createElement('button');
  logoutButton.id = 'logoutButton';
  logoutButton.textContent = 'Log out';

  logoutButton.addEventListener('click', function () {
    localStorage.removeItem('jwt');
    location.reload();
  });

  return logoutButton;
}
