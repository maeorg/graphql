// Function to create SVG elements with attributes
const svgElement = (type, attributes) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", type);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
};


// Function to create the XP by project bar graph
export async function CreateXpByProjectGraph(data) {
    const sortedData = data.sort((a, b) => b.amount - a.amount);

    const barHeight = 20;
    const barGap = 10;
    const barWidth = 300;
    const xPadding = 10;
    const barColor = '#4CAF50'; // Changed bar color to green

    // Calculate the height of the SVG
    const graphHeight = (barHeight + barGap) * sortedData.length;

    // Create the SVG element
    const barGraph = svgElement('svg', {
        id: 'barGraph',
        height: graphHeight,
        width: '100%',
    });

    const maxValue = Math.max(...sortedData.map((item) => item.amount));

    sortedData.forEach((transaction, index) => {
        const barLength = (transaction.amount / maxValue) * barWidth;

        // Create the bar
        const bar = svgElement('rect', {
            class: 'barGraphBar', // Added class for styling
            x: xPadding,
            y: index * (barHeight + barGap),
            width: barLength,
            height: barHeight,
            fill: barColor,
        });

        const amountXPos = xPadding + barLength + 5;
        // Create the amount text
        const amountText = svgElement('text', {
            class: 'barGraphText', // Added class for styling
            x: amountXPos, // Move text to the end of the bar
            y: index * (barHeight + barGap) + barHeight / 2,
            'dominant-baseline': 'middle',
            fill: 'black',
        });
        amountText.textContent = (transaction.amount / 1000).toFixed(2) + ' kB - ';

        const projectNameXPos = amountXPos + amountText.textContent.length * 7;
        // Create the project name text
        const projectName = svgElement('text', {
            class: 'barGraphText', // Added class for styling
            x: projectNameXPos,
            y: index * (barHeight + barGap) + barHeight / 2,
            'dominant-baseline': 'middle',
            fill: 'black',
        });
        const projectNameInfo = transaction.path.substring(transaction.path.lastIndexOf('/') + 1);
        projectName.textContent = transaction.attrs?.reason ? transaction.attrs.reason : projectNameInfo;

        // Append elements to the SVG
        barGraph.appendChild(bar);
        barGraph.appendChild(projectName);
        barGraph.appendChild(amountText);
    });

    return barGraph;
};
