import { CreateLogoutButton } from "./authentication.js";
import { GetProgressWithGrades, GetUserProfileInfo, GetUserTransactions } from "./graphQLRequests.js";
import { CreateAuditRatioLineChart, CreateXpByProjectGraph } from "./graphsSVG.js";

export async function LoadGraphsPage() {
    const main = document.querySelector('.main');

    const userToken = localStorage.getItem('jwt');
    const userProfile = await GetUserProfileInfo(userToken);

    const logoutButton = await CreateLogoutButton();
    const menuContainer = document.getElementById('menuContainer');
    menuContainer.appendChild(logoutButton);

    const welcomeInfoContainer = await CreateWelcomeInfoContainer(userProfile);
    main.appendChild(welcomeInfoContainer);

    const profileContainer = await CreateProfileContainer(userProfile);
    main.appendChild(profileContainer);

    const userTransactions = await GetUserTransactions(userToken);
    const sortedUserTransactions = userTransactions.data.transaction.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const xpTransactions = sortedUserTransactions.filter(transaction => transaction.type === "xp" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));
    const upTransactions = sortedUserTransactions.filter(transaction => transaction.type === "up" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));
    const downTransactions = sortedUserTransactions.filter(transaction => transaction.type === "down" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));

    const xpBarGraphContainer = await CreateXpGraphsContainer(xpTransactions, upTransactions, downTransactions);
    main.appendChild(xpBarGraphContainer);

    function CreateAuditsRatioData() {
        let auditsRatiosData = [];
        const oldestToNewestTransactions = userTransactions.data.transaction.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const auditRatioTransactions = oldestToNewestTransactions.filter(transaction => (transaction.type === "up" || transaction.type === "down") && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));
        let upTransactionsSum = 0;
        let downTransactionsSum = 0;
        for (const transaction of auditRatioTransactions) {
            const date = transaction.createdAt;
            if (transaction.type == "up") {
                upTransactionsSum += transaction.amount;
            } else if (transaction.type == "down") {
                downTransactionsSum += transaction.amount;
            }
            const auditRatio = (upTransactionsSum / downTransactionsSum).toFixed(1);
            auditsRatiosData.push({ date: date, ratio: auditRatio });
        }
        return auditsRatiosData;
    }
    const auditsRatiosData = CreateAuditsRatioData();

    // create and update audit ratio line chart
    const auditRatioLineChartContainer = document.createElement('div');
    auditRatioLineChartContainer.id = 'auditRatioLineChartContainer';
    const chartContainer = document.createElement('div');
    chartContainer.id = 'chartContainer';

    const auditRatioLineChartTitle = document.createElement('div');
    auditRatioLineChartTitle.id = 'auditRatioLineChartTitle';
    auditRatioLineChartTitle.textContent = 'Audits Ratio Chart';
    auditRatioLineChartContainer.appendChild(auditRatioLineChartTitle);

    const timePeriodContainer = document.createElement('div');
    timePeriodContainer.id = 'timePeriodContainer';
    auditRatioLineChartContainer.appendChild(timePeriodContainer);
    const timePeriod = document.createElement('select');
    timePeriod.id = 'timePeriod';
    function addOption(value, text) {
        const option = document.createElement('option');
        option.value = value;
        option.innerText = text;
        timePeriod.appendChild(option);
    }
    const options = [{ value: 'all', text: 'All Time' },
    { value: '1y', text: 'Last 1 Year' },
    { value: '6m', text: 'Last 6 Months' },
    { value: '3m', text: 'Last 3 Months' },
    { value: '1m', text: 'Last 1 Month' }
    ];
    options.forEach(option => {
        addOption(option.value, option.text);
    });
    timePeriodContainer.appendChild(timePeriod);
    auditRatioLineChartContainer.appendChild(chartContainer);
    main.appendChild(auditRatioLineChartContainer);
    await CreateAuditRatioLineChart(auditsRatiosData);

    const auditsInfoContainer = await CreateAuditsInfoContainer(userToken, upTransactions, downTransactions);
    main.appendChild(auditsInfoContainer);


    const gradesAndXpContainer = document.createElement('div');
    gradesAndXpContainer.id = 'gradesAndXpContainer';
    const transactionsContainer = await CreateTransactionsContainer(userToken, xpTransactions);
    gradesAndXpContainer.appendChild(transactionsContainer);
    const gradesContainer = await CreateProgressWithGradesContainer(userToken)
    gradesAndXpContainer.appendChild(gradesContainer);
    main.appendChild(gradesAndXpContainer);
}

export async function CreateProgressWithGradesContainer(userToken) {
    const gradesContainer = document.createElement('div');
    gradesContainer.id = 'gradesContainer';

    let progressWithGrades = await GetProgressWithGrades(userToken);
    progressWithGrades = progressWithGrades.data.progress.sort((a, b) => b.grade - a.grade);

    const averageGrade = progressWithGrades.reduce((total, item) => total + item.grade, 0) / progressWithGrades.length;
    const averageGradeElement = document.createElement('div');
    averageGradeElement.id = 'averageGradeElement';
    averageGradeElement.textContent = 'Average Grade: ' + averageGrade.toFixed(2);
    gradesContainer.appendChild(averageGradeElement);

    const gradesTableColumnsTitlesContainer = document.createElement('div');
    gradesTableColumnsTitlesContainer.id = 'gradesTableColumnsTitlesContainer';

    const projectNameColumnTitle = document.createElement('div');
    projectNameColumnTitle.id = 'projectNameColumnTitle';
    projectNameColumnTitle.textContent = 'Project';
    gradesTableColumnsTitlesContainer.appendChild(projectNameColumnTitle);

    const gradeColumnTitle = document.createElement('div');
    gradeColumnTitle.id = 'gradeColumnTitle';
    gradeColumnTitle.textContent = `Grade`;
    gradesTableColumnsTitlesContainer.appendChild(gradeColumnTitle);

    gradesContainer.appendChild(gradesTableColumnsTitlesContainer);

    for (const projectItem of progressWithGrades) {
        const projectElement = document.createElement('div');
        projectElement.id = 'projectElement';

        const projectNameInfo = projectItem.path.substring(projectItem.path.lastIndexOf('/') + 1);
        const projectName = document.createElement('div');
        projectName.id = 'projectName';
        projectName.textContent = projectNameInfo;
        projectElement.appendChild(projectName);

        const grade = document.createElement('div');
        grade.id = 'grade';
        grade.textContent = projectItem.grade.toFixed(2);
        projectElement.appendChild(grade);

        gradesContainer.appendChild(projectElement);
    }

    return gradesContainer;
}

export async function CreateXpGraphsContainer(xpTransactions, upTransactions, downTransactions) {
    const xpBarGraphContainer = document.createElement('div');
    xpBarGraphContainer.id = 'xpBarGraphContainer';

    const createButton = (text, onClick) => {
        const button = document.createElement('button');
        button.textContent = text;
        // button.addEventListener('click', onClick);
        button.addEventListener('click', () => {
            // Remove 'selected' class from all buttons
            document.querySelectorAll('.xpGraphButton').forEach(btn => btn.classList.remove('selectedGraphButton'));
            // Add 'selected' class to the clicked button
            button.classList.add('selectedGraphButton');
            onClick();
        });
        button.classList.add('xpGraphButton'); // Add class for styling
        return button;
    };

    const displayGraph = async (transactions) => {
        xpBarGraphArea.innerHTML = ''; // Clear previous content
        const barGraph = await CreateXpByProjectGraph(transactions);
        xpBarGraphArea.appendChild(barGraph);
    };

    const xpButton = createButton('My Projects', () => displayGraph(xpTransactions));
    const upButton = createButton('Done Audits', () => displayGraph(upTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))));
    const downButton = createButton('Received Audits', () => displayGraph(downTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))));

    const xpGraphsButtonContainer = document.createElement('div');
    xpGraphsButtonContainer.id = 'xpGraphsButtonContainer';
    xpGraphsButtonContainer.appendChild(xpButton);
    xpGraphsButtonContainer.appendChild(upButton);
    xpGraphsButtonContainer.appendChild(downButton);
    xpBarGraphContainer.appendChild(xpGraphsButtonContainer);
    const xpBarGraphArea = document.createElement('div');
    xpBarGraphArea.id = 'xpBarGraphArea';
    xpBarGraphContainer.appendChild(xpBarGraphArea);

    // display default graph when page loaded
    xpButton.click();

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

    const auditsElementsContainer = document.createElement('div');
    auditsElementsContainer.id = 'auditsElementsContainer';

    const displayAuditsList = (transactions) => {
        auditsElementsContainer.innerHTML = '';
        for (const transaction of transactions) {
            const auditElement = document.createElement('div');
            auditElement.id = 'auditElement';

            const projectNameInfo = transaction.path.substring(transaction.path.lastIndexOf('/') + 1);
            const auditProjectName = document.createElement('div');
            auditProjectName.id = 'auditProjectName';
            auditProjectName.className = 'audit-column';
            auditProjectName.innerText = projectNameInfo;
            auditElement.appendChild(auditProjectName);

            const auditXP = document.createElement('div');
            auditXP.id = 'auditXP';
            auditXP.className = 'audit-column';
            auditXP.innerText = (transaction.amount / 1000).toFixed(2) + ' kB';
            auditElement.appendChild(auditXP);

            const auditCreatedAt = document.createElement('div');
            auditCreatedAt.id = 'auditCreatedAt';
            auditCreatedAt.className = 'audit-column';
            auditCreatedAt.innerText = FormatDate(transaction.createdAt);
            auditElement.appendChild(auditCreatedAt);

            auditsElementsContainer.appendChild(auditElement);
        }
    }

    const doneAudits = document.createElement('div');
    doneAudits.id = 'doneAudits';
    doneAudits.className = 'chooseAuditsButton';
    doneAudits.innerText = 'Done: ' + (totalUp / 1000000).toFixed(2) + ' MB ->';
    doneAudits.addEventListener('click', () => {
        document.querySelectorAll('.chooseAuditsButton').forEach(btn => btn.classList.remove('selectedAuditsButton'));
        doneAudits.classList.add('selectedAuditsButton');
        displayAuditsList(upTransactions);
    });
    auditsInfoContainer.appendChild(doneAudits);
    doneAudits.click();

    const receivedAudits = document.createElement('div');
    receivedAudits.id = 'receivedAudits';
    receivedAudits.className = 'chooseAuditsButton';
    receivedAudits.innerText = 'Received: ' + (totalDown / 1000000).toFixed(2) + ' MB ->';
    receivedAudits.addEventListener('click', () => {
        document.querySelectorAll('.chooseAuditsButton').forEach(btn => btn.classList.remove('selectedAuditsButton'));
        receivedAudits.classList.add('selectedAuditsButton');
        displayAuditsList(downTransactions);
    });
    auditsInfoContainer.appendChild(receivedAudits);

    auditsInfoContainer.appendChild(auditsElementsContainer);

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

    const transactionsTableTitle = document.createElement('div');
    transactionsTableTitle.id = 'transactionsTableTitle';
    const projectName = document.createElement('div');
    projectName.id = 'projectName';
    projectName.className = 'xpTable-column';
    projectName.textContent = 'Project';
    transactionsTableTitle.appendChild(projectName);
    const amountInfo = document.createElement('div');
    amountInfo.id = 'amount';
    amountInfo.className = 'xpTable-column';
    amountInfo.textContent = `XP`;
    transactionsTableTitle.appendChild(amountInfo);
    transactionsContainer.appendChild(transactionsTableTitle);
    for (const xpTransaction of xpTransactions) {
        const transactionElement = document.createElement('div');
        transactionElement.id = 'transactionElement';

        const projectNameInfo = xpTransaction.path.substring(xpTransaction.path.lastIndexOf('/') + 1);
        const projectName = document.createElement('div');
        projectName.id = 'projectName';
        projectName.className = 'xpTable-column';
        projectName.textContent = xpTransaction.attrs.reason ? xpTransaction.attrs.reason : projectNameInfo;
        transactionElement.appendChild(projectName);

        const amountInfo = document.createElement('div');
        amountInfo.id = 'amount';
        amountInfo.className = 'xpTable-column';
        amountInfo.textContent = `${xpTransaction.amount / 1000} kB`;
        transactionElement.appendChild(amountInfo);

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
        hour12: false
    };

    return date.toLocaleString('en-US', options);
}