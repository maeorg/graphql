import { CreateLogoutButton } from "./authentication.js";
import { GetGradeForProjectByObjectId, GetUserAudits, GetUserProfileInfo, GetUserTransactions } from "./graphQLRequests.js";
import { CreateXpByProjectGraph } from "./graphsSVG.js";

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
    const sortedUserTransactions = userTransactions.data.transaction.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const xpTransactions = sortedUserTransactions.filter(transaction => transaction.type === "xp" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));
    const upTransactions = sortedUserTransactions.filter(transaction => transaction.type === "up" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));
    const downTransactions = sortedUserTransactions.filter(transaction => transaction.type === "down" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));

    const auditsInfoContainer = await CreateAuditsInfoContainer(userToken, upTransactions, downTransactions);
    main.appendChild(auditsInfoContainer);

    const transactionsContainer = await CreateTransactionsContainer(userToken, xpTransactions);
    main.appendChild(transactionsContainer);

    const xpBarGraphContainer = await CreateXpGraphsContainer(xpTransactions, upTransactions, downTransactions);
    main.appendChild(xpBarGraphContainer);
}

export async function CreateXpGraphsContainer(xpTransactions, upTransactions, downTransactions) {
    const xpBarGraphContainer = document.createElement('div');
    xpBarGraphContainer.id = 'xpBarGraphContainer';

    const createButton = (text, onClick) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    };

    const displayGraph = async (transactions) => {
        xpBarGraphArea.innerHTML = ''; // Clear previous content
        const barGraph = await CreateXpByProjectGraph(transactions);
        xpBarGraphArea.appendChild(barGraph);
    };

    const xpButton = createButton('My Projects', () => displayGraph(xpTransactions));
    const upButton = createButton('Done Audits', () => displayGraph(upTransactions));
    const downButton = createButton('Received Audits', () => displayGraph(downTransactions));

    const xpGraphsButtonContainer = document.createElement('div');
    xpGraphsButtonContainer.id = 'xpGraphsButtonContainer';
    xpGraphsButtonContainer.appendChild(xpButton);
    xpGraphsButtonContainer.appendChild(upButton);
    xpGraphsButtonContainer.appendChild(downButton);
    xpBarGraphContainer.appendChild(xpGraphsButtonContainer);
    const xpBarGraphArea = document.createElement('div');
    xpBarGraphArea.id = 'xpBarGraphArea';
    xpBarGraphContainer.appendChild(xpBarGraphArea);

    // show default graph when loaded
    displayGraph(xpTransactions);

    return xpBarGraphContainer;
}

export async function CreateAuditsInfoContainer(userToken, upTransactions, downTransactions) {
    const totalUp = upTransactions.reduce((total, transaction) => total + transaction.amount, 0);
    const totalDown = downTransactions.reduce((total, transaction) => total + transaction.amount, 0);

    const auditsInfoContainer = document.createElement('div');
    auditsInfoContainer.id = 'auditsInfoContainer';

    const auditsRatio = document.createElement('div');
    auditsRatio.id = 'auditsRatio';
    auditsRatio.innerText = 'Audits ratio: ' + (totalUp / totalDown).toFixed(1);
    auditsInfoContainer.appendChild(auditsRatio);

    const doneAudits = document.createElement('div');
    doneAudits.id = 'doneAudits';
    doneAudits.innerText = 'Done: ' + (totalUp / 1000000).toFixed(2) + ' MB';
    auditsInfoContainer.appendChild(doneAudits);

    const receivedAudits = document.createElement('div');
    receivedAudits.id = 'receivedAudits';
    receivedAudits.innerText = 'Received: ' + (totalDown / 1000000).toFixed(2) + ' MB';
    auditsInfoContainer.appendChild(receivedAudits);
    for (const transaction of downTransactions) {
        const receivedAuditElement = document.createElement('div');
        receivedAuditElement.id = 'receivedAuditElement';

        const projectNameInfo = transaction.path.substring(transaction.path.lastIndexOf('/') + 1);
        const receivedAuditProjectName = document.createElement('div');
        receivedAuditProjectName.id = 'receivedAuditProjectName';
        receivedAuditProjectName.className = 'audit-column';
        receivedAuditProjectName.innerText = projectNameInfo;
        receivedAuditElement.appendChild(receivedAuditProjectName);

        const receivedAuditXP = document.createElement('div');
        receivedAuditXP.id = 'receivedAuditXP';
        receivedAuditXP.className = 'audit-column';
        receivedAuditXP.innerText = (transaction.amount / 1000).toFixed(2) + ' kB';
        receivedAuditElement.appendChild(receivedAuditXP);

        const auditCreatedAt = document.createElement('div');
        auditCreatedAt.id = 'auditCreatedAt';
        auditCreatedAt.className = 'audit-column';
        auditCreatedAt.innerText = FormatDate(transaction.createdAt);
        receivedAuditElement.appendChild(auditCreatedAt);

        auditsInfoContainer.appendChild(receivedAuditElement);
    }

    return auditsInfoContainer;
}

export async function CreateTransactionsContainer(userToken, xpTransactions) {
    const transactionsContainer = document.createElement('div');
    transactionsContainer.id = 'transactionsContainer';

    const totalXpInfo = xpTransactions.reduce((total, transaction) => total + transaction.amount, 0);
    const totalXp = document.createElement('div');
    totalXp.id = 'totalXp';
    totalXp.textContent = 'Total XP: ' + Math.round(totalXpInfo / 1000) + ' kB';
    transactionsContainer.appendChild(totalXp);

    for (const xpTransaction of xpTransactions) {
        const transactionElement = document.createElement('div');
        transactionElement.id = 'transactionElement';

        const projectNameInfo = xpTransaction.path.substring(xpTransaction.path.lastIndexOf('/') + 1);
        const projectName = document.createElement('div');
        projectName.id = 'projectName';
        projectName.textContent = xpTransaction.attrs.reason ? xpTransaction.attrs.reason : 'Project: ' + projectNameInfo;
        transactionElement.appendChild(projectName);

        const amountInfo = document.createElement('div');
        amountInfo.id = 'amount';
        amountInfo.textContent = `XP: ${xpTransaction.amount / 1000} kB`;
        transactionElement.appendChild(amountInfo);

        // const gradeInfo = document.createElement('div');
        // gradeInfo.id = 'grade';
        // const gradeResult = await GetGradeForProjectByObjectId(userToken, xpTransaction.objectId);
        // const grade = gradeResult.data.result[0] ? gradeResult.data.result[0].grade.toFixed(2) : '-';
        // gradeInfo.textContent = `Grade: ${grade}`;
        // transactionElement.appendChild(gradeInfo);

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

export function FormatDate(inputDate) {
    const date = new Date(inputDate);

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    };

    return date.toLocaleString('en-US', options);
}