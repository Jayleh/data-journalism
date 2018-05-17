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

let $chartGroup = $svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

let csvPath = '../data/data.csv';

d3.csv(csvPath, (error, healthData) => {
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

    // Create axes labels lists
    let xLabels = ['Income (Median)', 'Age (25-34)', 'Poverty', 'Unemployed (>1 year)'];
    let yLabels = ['Physically Active', 'Binge Drink', 'Smoke', 'Own a Home'];

    // Append x-axis labels
    for (let i = 0, ii = xLabels.length, spacer = 0; i < ii; i++ , spacer += 20) {
        $chartGroup.append('text')
            .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + margin.top + spacer})`)
            .attr('class', 'axis-text x-axis-text')
            .attr('value', xValues[i])
            .text(xLabels[i]);
    }

    // Append y-axis labels
    for (let i = 0, ii = yLabels.length, spacer = 0; i < ii; i++ , spacer += 20) {
        $chartGroup.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + 20 + spacer)
            .attr('x', 0 - (chartHeight / 2))
            .attr('dy', '1em')
            .attr('class', 'axis-text y-axis-text')
            .attr('value', yValues[i])
            .text(yLabels[i]);
    }

    // Select all x and y axes text, assign to variables
    let $xAxisLabel = d3.selectAll('.x-axis-text').classed('inactive', true);
    let $yAxisLabel = d3.selectAll('.y-axis-text').classed('inactive', true);


    // Create default plot
    function createDefault() {
        // Initialize tooltip
        let toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([0, -60])
            .html(function (data) {
                return (`<strong>${data.state}`)
            });

        // Create the tooltip in $chartGroup.
        $chartGroup.call(toolTip);

        let $circleGroup = $chartGroup.selectAll('circle');

        $circleGroup
            .data(healthData)
            .enter()
            .append('circle')
            .attr('cx', data => xLinearScale(data.median_income))
            .attr('cy', data => yLinearScale(data.physically_active))
            .attr('r', '15')
            .attr('fill', 'blue')
            .attr('opacity', '0.7')
            .on("mouseover", function (data) {
                toolTip.show(data)
            })
            .on("mouseout", function (data) {
                toolTip.hide(data)
            });

        $xAxisLabel.classed('inactive', true);
        $yAxisLabel.classed('inactive', true);

        d3.select(`.x-axis-text[value='median_income']`)
            .classed('inactive', false)
            .classed('active', true);

        d3.select(`.y-axis-text[value='physically_active']`)
            .classed('inactive', false)
            .classed('active', true);

        // Display tooltip on 
        //     $circleGroup
        //         .on("mouseover", function (data) {
        //             toolTip.show(data)
        //         })
        //         .on("mouseout", function (data) {
        //             toolTip.hide(data)
        //         });
    }

    // Generate default plot
    createDefault();

    // Change x axis text activity
    $xAxisLabel.on('click', function () {

        $xAxisLabel.filter('.active')
            .classed('active', false)
            .classed('inactive', true);

        let $clickedField = d3.select(this);
        let $clickedFieldValue = $clickedField.attr('value');
        console.log($clickedFieldValue);

        $clickedField
            .classed('inactive', false)
            .classed('active', true);

        xGetMinMax($clickedFieldValue);
        console.log(xExtent);

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
    });

    // Change y axis text activity
    $yAxisLabel.on('click', function () {

        $yAxisLabel.filter('.active')
            .classed('active', false)
            .classed('inactive', true);

        let $clickedField = d3.select(this);
        let $clickedFieldValue = $clickedField.attr('value');
        console.log($clickedFieldValue);

        $clickedField
            .classed('inactive', false)
            .classed('active', true);

        yGetMinMax($clickedFieldValue);
        console.log(yExtent);

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
    });


    // function xTooltip() {
    //     // Initialize tooltip
    //     let toolTip = d3.tip()
    //         .attr("class", "x-tooltip")
    //         .offset([80, -60])
    //         .html(data => {
    //             return (`<strong>${data.state}<strong><hr>${data[$clickedFieldValue]}<br>`)
    //         });

    //     // Create the tooltip in $chartGroup.
    //     $chartGroup.call(toolTip)

    //     // Display tooltip on 
    //     $circleGroup
    //         .on("mouseover", data => toolTip.show(data))
    //         .on("mouseout", data => toolTip.hide(data));
    // }

});
