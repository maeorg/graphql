import { CreateLogoutButton } from "./authentication.js";
import { GetGradeForProjectByObjectId, GetUserAudits, GetUserProfileInfo, GetUserTransactions } from "./graphQLRequests.js";

export async function LoadGraphsPage() {
    const logoutButton = await CreateLogoutButton();
    const main = document.querySelector('.main');
    main.appendChild(logoutButton);

    const userToken = localStorage.getItem('jwt');
    const userProfile = await GetUserProfileInfo(userToken);

    const welcomeInfoContainer = await CreateWelcomeInfoContainer(userProfile);
    main.appendChild(welcomeInfoContainer);

    const profileContainer = await CreateProfileContainer(userProfile);
    main.appendChild(profileContainer);

    const userTransactions = await GetUserTransactions(userToken);
    const xpTransactions = userTransactions.data.transaction.filter(transaction => transaction.type === "xp" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));
    // Sort transactions by createdAt
    const sortedXpTransactions = xpTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const transactionsContainer = await CreateTransactionsContainer(userToken, sortedXpTransactions);
    main.appendChild(transactionsContainer);
    
    console.log(userProfile)
}

export async function CreateTransactionsContainer(userToken, xpTransactions) {
    const transactionsContainer = document.createElement('div');
    transactionsContainer.id = 'transactionsContainer';

    const totalXpInfo = xpTransactions.reduce((total, transaction) => total + transaction.amount, 0);
    const totalXp = document.createElement('div');
    totalXp.id = 'totalXp';
    totalXp.textContent = 'Total XP: ' + Math.round(totalXpInfo / 1000) + ' kB';
    transactionsContainer.appendChild(totalXp);

    const prefix = "/johvi/div-01/";
    for (const xpTransaction of xpTransactions) {
        const transactionElement = document.createElement('div');
        transactionElement.id = 'transactionElement';
        
        const projectNameInfo = xpTransaction.path.replace(prefix, "");
        const projectName = document.createElement('div');
        projectName.id = 'projectName';
        projectName.textContent = xpTransaction.attrs.reason ? xpTransaction.attrs.reason : 'Project: ' + projectNameInfo;
        transactionElement.appendChild(projectName);

        const amountInfo = document.createElement('div');
        amountInfo.id = 'amount';
        amountInfo.textContent = `XP: ${xpTransaction.amount / 1000} kB`;
        transactionElement.appendChild(amountInfo);

        const gradeInfo = document.createElement('div');
        gradeInfo.id = 'grade';
        const gradeResult = await GetGradeForProjectByObjectId(userToken, xpTransaction.objectId);
        const grade = gradeResult.data.result[0] ? gradeResult.data.result[0].grade.toFixed(2) : '-';
        gradeInfo.textContent = `Grade: ${grade}`;
        transactionElement.appendChild(gradeInfo);

        transactionsContainer.appendChild(transactionElement);
    }

    return transactionsContainer;
}

export async function CreateWelcomeInfoContainer(userProfile) {
    const welcomeInfoContainer = document.createElement('div');
    welcomeInfoContainer.id = 'welcomeInfoContainer';

    const firstName = userProfile.data.user[0].attrs.firstName
    const lastName = userProfile.data.user[0].attrs.lastName

    const welcomeInfo = document.createElement('div');
    welcomeInfo.id = 'welcomeInfo';
    welcomeInfo.textContent = `Welcome, ${firstName} ${lastName}!`;
    welcomeInfoContainer.appendChild(welcomeInfo);

    return welcomeInfoContainer;
}

export async function CreateProfileContainer(userProfile) {
    const profileContainer = document.createElement('div');
    profileContainer.id = 'profileContainer';

    const profileTitle = document.createElement('div');
    profileTitle.id = 'profileTitle';
    profileTitle.textContent = 'Profile info';
    profileContainer.appendChild(profileTitle);

    const loginName = document.createElement('div');
    loginName.id = 'loginName';
    loginName.textContent = 'Login: ' + userProfile.data.user[0].login;
    profileContainer.appendChild(loginName);

    const email = document.createElement('div');
    email.id = 'email';
    email.textContent = 'Email: ' + userProfile.data.user[0].attrs.email;
    profileContainer.appendChild(email);

    const telephone = document.createElement('div');
    telephone.id = 'telephone';
    telephone.textContent = 'Telephone: ' + userProfile.data.user[0].attrs.tel;
    profileContainer.appendChild(telephone);

    const addressCountry = document.createElement('div');
    addressCountry.id = 'addressCountry';
    addressCountry.textContent = 'Country: ' + userProfile.data.user[0].attrs.addressCountry;
    profileContainer.appendChild(addressCountry);

    return profileContainer;
}

