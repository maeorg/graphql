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

    const barHeight = 15;
    const barGap = 10;
    const barWidth = 400;
    const xPadding = 10;

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
        });

        const amountXPos = xPadding + barLength + 5;
        // Create the amount text
        const amountText = svgElement('text', {
            class: 'barGraphText', // Added class for styling
            x: amountXPos, // Move text to the end of the bar
            y: index * (barHeight + barGap) + barHeight / 2,
            'dominant-baseline': 'middle',
        });
        amountText.textContent = (transaction.amount / 1000).toFixed(2) + ' kB - ';

        const projectNameXPos = amountXPos + amountText.textContent.length * 8;
        // Create the project name text
        const projectName = svgElement('text', {
            class: 'barGraphText', // Added class for styling
            x: projectNameXPos,
            y: index * (barHeight + barGap) + barHeight / 2,
            'dominant-baseline': 'middle',
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

export async function CreateAuditRatioLineChart(data) {
    const container = document.getElementById('chartContainer');
    container.innerHTML = ''; // Clear any existing charts

    const lineChart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    lineChart.setAttribute("id", "auditRatioLineChart");
    lineChart.setAttribute("viewBox", "0 0 400 200");
    lineChart.setAttribute("width", "100%");
    lineChart.setAttribute("height", "100%");
    container.appendChild(lineChart);

    // Define margins and dimensions for the chart
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // Define padding for the background rect
    const padding = 10;

    // Add background color for the chart area
    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("x", margin.left - padding);
    background.setAttribute("y", margin.top - padding);
    background.setAttribute("width", width + 2 * padding);
    background.setAttribute("height", height + padding);
    background.setAttribute("fill", "black"); // Change this to your desired background color
    lineChart.appendChild(background);

    // Parse date and ratio values from data
    const parseDate = dateString => new Date(dateString);
    const parseRatio = ratio => ratio;

    // Filter data based on the selected time period
    const timePeriodSelect = document.getElementById('timePeriod');
    const selectedPeriod = timePeriodSelect.value;

    const now = new Date();
    let startDate;

    switch (selectedPeriod) {
        case '1m':
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case '3m':
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 3);
            break;
        case '6m':
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
            break;
        case '1y':
            startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case 'all':
        default:
            startDate = new Date(-8640000000000000); // Effectively start from the earliest possible date
            break;
    }
    const filteredData = data.filter(d => parseDate(d.date) >= startDate);

    const parsedData = filteredData.map(d => ({ date: parseDate(d.date), ratio: parseRatio(d.ratio) }));

    // Find min and max values for x and y
    const minX = Math.min(...parsedData.map(d => d.date));
    const maxX = Math.max(...parsedData.map(d => d.date));
    const minY = 0;
    const maxY = Math.max(...parsedData.map(d => d.ratio));

    // Define scales for x and y axes
    const scaleX = value => (value - minX) / (maxX - minX) * width + margin.left;
    const scaleY = value => height - (value - minY) / (maxY - minY) * height + margin.top;

    // Create path for the line
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let pathData = `M${scaleX(parsedData[0].date)},${scaleY(parsedData[0].ratio)}`;
    for (let i = 1; i < parsedData.length; i++) {
        pathData += ` L${scaleX(parsedData[i].date)},${scaleY(parsedData[i].ratio)}`;
    }
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#763bb9");
    path.setAttribute("stroke-width", "1");
    lineChart.appendChild(path);

    // Add dots at each data point
    parsedData.forEach(d => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", scaleX(d.date));
        circle.setAttribute("cy", scaleY(d.ratio));
        circle.setAttribute("r", 1);
        circle.setAttribute("fill", "#763bb9");
        lineChart.appendChild(circle);
    });

    // Add y-axis labels and ticks
    for (let i = 0; i <= 10; i++) {
        const ratio = maxY * (i / 10);
        const y = scaleY(ratio);

        // Add tick line
        const tickLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tickLine.setAttribute("x1", margin.left - padding);
        tickLine.setAttribute("y1", y);
        tickLine.setAttribute("x2", margin.left - 5 - padding); // Adjust the length of the tick line
        tickLine.setAttribute("y2", y);
        tickLine.setAttribute("stroke", "#ccc");
        tickLine.setAttribute("stroke-width", "1");
        lineChart.appendChild(tickLine);

        // Add label
        const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        labelText.textContent = ratio.toFixed(1); // Adjust the number of decimal places as needed
        labelText.setAttribute("x", margin.left - 10 - padding); // Adjust the position of the label
        labelText.setAttribute("y", y + 3); // Adjust the vertical position of the label
        labelText.setAttribute("text-anchor", "end");
        labelText.setAttribute("font-size", "7px");
        lineChart.appendChild(labelText);
    }

    // Add date labels
    let prevTextX = -Infinity;
    for (let i = 0; i < parsedData.length; i++) {
        const d = parsedData[i];
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const labelText = `${d.date.toLocaleString('default', { day: 'numeric', month: 'short' })}, ${d.date.getFullYear().toString().slice(-2)}`;
        let textX = scaleX(d.date);
        let textY = height + margin.bottom;

        // Calculate the width of the text
        const textWidth = labelText.length * 4; // Approximate width based on character count

        // Only add the label if it does not overlap with the previous one
        if (textX - textWidth / 2 > prevTextX) {
            text.textContent = labelText;
            text.setAttribute("x", textX);
            text.setAttribute("y", textY);
            text.setAttribute("text-anchor", "middle"); // Center the text horizontally
            text.setAttribute("font-size", "7px"); // Adjust font size as needed
            lineChart.appendChild(text);

            // Update the previous text X position
            prevTextX = textX + textWidth / 2;
        }
    }

    // Event listener for the time period select
    timePeriodSelect.addEventListener('change', () => CreateAuditRatioLineChart(data));

    return lineChart;
}
