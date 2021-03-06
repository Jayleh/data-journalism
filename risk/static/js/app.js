let svgWidth = 960;
let svgHeight = 635;

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

let $chartGroup = $svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let url = '/data';

d3.json(url, (error, healthData) => {
    if (error) throw error;

    // console.log(healthData);

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
    let xTestExtent = d3.extent(healthData, data => data.median_income);
    let yTestExtent = d3.extent(healthData, data => data.physically_active);

    function xGetMinMax(xDataField) {
        // xMin = d3.min(healthData, data => data.xDataField);
        // xMax = d3.max(healthData, data => data.xDataField);
        xExtent = d3.extent(healthData, data => data[xDataField]);
    }

    function yGetMinMax(yDataField) {
        // yMin = d3.min(healthData, data => data.yDataField);
        // yMax = d3.max(healthData, data => data.yDataField);
        yExtent = d3.extent(healthData, data => data[yDataField]);
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
    $chartGroup.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .attr('id', 'x-axis')
        .call(bottomAxis);

    $chartGroup.append('g')
        .attr('id', 'y-axis')
        .call(leftAxis);

    // Create axes values lists
    let xValues = ['median_income', 'age_25_34', 'poverty', 'unemployed_greater_year'];
    let yValues = ['physically_active', 'binge_drink', 'smoke', 'own_home'];

    // Create axes values lists
    let xToolLabels = ['Income', 'Age', 'Poverty', 'Unemployed'];
    let yToolLabels = ['Active', 'Binge Drink', 'Smoke', 'Own Home'];

    // Create axes labels lists
    let xLabels = ['Income (Median)', 'Ages 25-34 (%)', 'In Poverty (%)', 'Unemployed >1 year (%)'];
    let yLabels = ['Physically Active (%)', 'Binge Drink (%)', 'Smoke (%)', 'Own a Home (%)'];

    // Append a group for the x axis labels
    let $xTextGroup = $chartGroup.append('g');

    // Append x-axis labels
    for (let i = 0, ii = xLabels.length, spacer = 0; i < ii; i++ , spacer += 20) {
        $xTextGroup.append('text')
            .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + margin.top + spacer})`)
            .attr('class', 'axis-text x-axis-text')
            .attr('data-value', xValues[i])
            .attr('data-tool', xToolLabels[i])
            .text(xLabels[i]);
    }

    // Append a group for the y axis labels
    let $yTextGroup = $chartGroup.append('g');

    // Append y-axis labels
    for (let i = 0, ii = yLabels.length, spacer = 0; i < ii; i++ , spacer += 20) {
        $yTextGroup.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + 20 + spacer)
            .attr('x', 0 - (chartHeight / 2))
            .attr('dy', '1em')
            .attr('class', 'axis-text y-axis-text')
            .attr('data-value', yValues[i])
            .attr('data-tool', yToolLabels[i])
            .text(yLabels[i]);
    }

    // Select all x and y axes text, assign to variables
    let $xAxisLabel = d3.selectAll('.x-axis-text').classed('inactive', true);
    let $yAxisLabel = d3.selectAll('.y-axis-text').classed('inactive', true);


    // Create default plot
    function createDefault() {
        // Set x and y axes text activity
        $xAxisLabel.classed('inactive', true);
        $yAxisLabel.classed('inactive', true);

        d3.select(`.x-axis-text[data-value='median_income']`)
            .classed('inactive', false)
            .classed('active', true);

        d3.select(`.y-axis-text[data-value='physically_active']`)
            .classed('inactive', false)
            .classed('active', true);

        // Create a group for the circles
        let $circleGroup = $chartGroup.append('g');

        $circleGroup.selectAll('circle')
            .data(healthData)
            .enter()
            .append('circle')
            .attr('cx', data => xLinearScale(data.median_income))
            .attr('cy', data => yLinearScale(data.physically_active))
            .attr('r', '15')
            .attr('fill', 'rgb(75, 133, 142)')
            .attr('opacity', '0.9');

        // Create a group for the text in each circle
        let $circleTextGroup = $chartGroup.append('g');

        $circleTextGroup.selectAll('text')
            .data(healthData)
            .enter()
            .append('text')
            .attr('x', data => xLinearScale(data.median_income))
            .attr('y', data => yLinearScale(data.physically_active))
            .classed('state-abbrev', true)
            .text(data => data.abbrev);

        updateTooltip();
    }


    // Generate default plot
    createDefault();


    // updateTooltip function for tooltip
    function updateTooltip() {
        let $xActive = d3.selectAll('.x-axis-text')
            .filter('.active');
        let $xActiveTool = $xActive.attr('data-tool');
        let $xActiveValue = $xActive.attr('data-value');

        let $yActive = d3.selectAll('.y-axis-text')
            .filter('.active');
        let $yActiveTool = $yActive.attr('data-tool');
        let $yActiveValue = $yActive.attr('data-value');

        // Initialize tooltip
        let toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([50, -70])
            .html(data => {
                return (`<strong>${data.state}<br>${$xActiveTool}: ${data[$xActiveValue]}
                        <br>${$yActiveTool}: ${data[$yActiveValue]}</strong>`)
            });

        // Create the tooltip in $chartGroup.
        $chartGroup.call(toolTip);

        let $circleGroup = $chartGroup.selectAll('circle');

        // Tooltip mouse events
        $circleGroup
            .on("mouseover", data => toolTip.show(data))
            .on("mouseout", data => toolTip.hide(data));
    }


    // Change x axis text activity
    $xAxisLabel.on('click', function () {

        $xAxisLabel.filter('.active')
            .classed('active', false)
            .classed('inactive', true);

        let $clickedField = d3.select(this);
        let $clickedFieldValue = $clickedField.attr('data-value');

        $clickedField
            .classed('inactive', false)
            .classed('active', true);

        updateTooltip();

        xGetMinMax($clickedFieldValue);

        xLinearScale.domain(xExtent);

        $svg.select("#x-axis")
            .transition()
            .duration(1000)
            .ease(d3.easeElastic)
            .call(bottomAxis);

        let $circleGroup = $chartGroup.selectAll('circle');

        $circleGroup
            .transition()
            .duration(1000)
            .attr('cx', data => xLinearScale(data[$clickedFieldValue]));

        let $circleTextGroup = $chartGroup.selectAll('.state-abbrev');

        $circleTextGroup
            .transition()
            .duration(1000)
            .attr('x', data => xLinearScale(data[$clickedFieldValue]));
    });

    // Change y axis text activity
    $yAxisLabel.on('click', function () {

        $yAxisLabel.filter('.active')
            .classed('active', false)
            .classed('inactive', true);

        let $clickedField = d3.select(this);
        let $clickedFieldValue = $clickedField.attr('data-value');

        $clickedField
            .classed('inactive', false)
            .classed('active', true);

        updateTooltip();

        yGetMinMax($clickedFieldValue);

        yLinearScale.domain(yExtent);

        $svg.select("#y-axis")
            .transition()
            .duration(1000)
            .ease(d3.easeElastic)
            .call(leftAxis);

        let $circleGroup = $chartGroup.selectAll('circle');

        $circleGroup
            .transition()
            .duration(1000)
            .attr('cy', data => yLinearScale(data[$clickedFieldValue]));

        let $circleTextGroup = $chartGroup.selectAll('.state-abbrev');

        $circleTextGroup
            .transition()
            .duration(1000)
            .attr('y', data => yLinearScale(data[$clickedFieldValue]));
    });
});


// Read table from route and insert to index page
let corr_url = '/corr';

d3.json(corr_url, (error, table) => {
    if (error) throw error;

    let $corrTable = d3.select('#corr-table');

    $corrTable.html(table.corr_table);
});