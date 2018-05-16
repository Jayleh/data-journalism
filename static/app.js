let svgWidth = 960;
let svgHeight = 600;

let margin = {
    top: 45,
    right: 30,
    bottom: 130,
    left: 130
};

let chartWidth = svgWidth - margin.left - margin.right;
let chartHeight = svgHeight - margin.top - margin.bottom;

let $svg = d3.select('#plot')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

let chartGroup = $svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let csvPath = '../data/data.csv';

d3.csv(csvPath, (error, healthData) => {
    if (error) throw error;

    console.log(healthData);

    // Parse data, cast as numbers
    healthData.forEach(data => {
        data.physically_active = +data.physically_active;
        data.binge_drink = +data.binge_drink;
        data.smoke = +data.smoke;
        data.own_home = +data.own_home;
        data.age_25_34 = +data.age_25_34;
        data.median_income = +data.median_income;
        data.poverty = +data.poverty;
        data.unemployed_greater_year = +data.unemployed_greater_year;
    });

    // Create domain functions for dynamic variables
    // let xMin, xMax, yMin, yMax;
    let xExtent, yExtent;
    let xTestExtent = d3.extent(healthData, data => data.age_25_34);
    let yTestExtent = d3.extent(healthData, data => data.physically_active);

    function xGetMinMax(xDataField) {
        // xMin = d3.min(healthData, data => data.xDataField);
        // xMax = d3.max(healthData, data => data.xDataField);
        xExtent = d3.extent(healthData, data => data.xDataField);
    }

    function yGetMinMax(yDataField) {
        // yMin = d3.min(healthData, data => data.yDataField);
        // yMax = d3.max(healthData, data => data.yDataField);
        yExtent = d3.extent(healthData, data => data.yDataField);
    }

    // Create scale functions
    let xLinearScale = d3.scaleLinear()
        .domain(xTestExtent)
        .range([0, chartWidth]);

    let yLinearScale = d3.scaleLinear()
        .domain(yTestExtent)
        .range([chartHeight, 0]);

    // Create axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Generate axes groups
    chartGroup.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    chartGroup.append('g')
        .call(leftAxis);

    // Create axes values lists
    let xValues = ['age_25_34', 'median_income', 'median_income', 'poverty', 'unemployed_greater_year'];
    let yValues = ['physically_active', 'binge_drink', 'smoke', 'own_home'];

    // Create axes labels lists
    let xLabels = ['Age (25-34)', 'Income (Median)', 'Poverty', 'Unemployed (>1 year)'];
    let yLabels = ['Physically Active', 'Binge Drink', 'Smoke', 'Own a Home'];

    // Append x-axis labels
    for (let i = 0, ii = xLabels.length, spacer = 0; i < ii; i++ , spacer += 20) {
        chartGroup.append('text')
            .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + margin.top + spacer})`)
            .attr('class', 'axis-text x-axis-text')
            .attr('value', xValues[i])
            .text(xLabels[i]);
    }

    // Append y-axis labels
    for (let i = 0, ii = yLabels.length, spacer = 0; i < ii; i++ , spacer += 20) {
        chartGroup.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + 20 + spacer)
            .attr('x', 0 - (chartHeight / 2))
            .attr('dy', '1em')
            .attr('class', 'axis-text y-axis-text')
            .attr('value', yValues[i])
            .text(yLabels[i]);
    }

    // Create default plot
    function createDefault() {
        let $circleGroup = chartGroup.selectAll('circle')

        // Remove all circles (if any)
        // $circleGroup.remove()

        $circleGroup
            .data(healthData)
            .enter()
            .append('circle')
            .attr('cx', data => xLinearScale(data.age_25_34))
            .attr('cy', data => yLinearScale(data.physically_active))
            .attr('r', '15')
            .attr('fill', 'blue')
            .attr('opacity', '0.7');
    }

    createDefault();

    // Generate circle group
    function warp(variable) {
        console.log(variable);
    }

    // Change x axis text activity
    // function xRestyleText() {
    let $xAxisLabel = d3.selectAll('.x-axis-text');

    $xAxisLabel.on('click', function () {

        $xAxisLabel.filter('.active')
            .classed('active', false)
            .classed('inactive', true);

        let $clickedField = d3.select(this);

        // console.log($clickedField);

        $clickedField
            .classed('inactive', false)
            .classed('active', true);
    });
    // }

});
