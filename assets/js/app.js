// *** D3 Health Risk Analysis ***

// Set starting dimensions
let svgWidth = 850; // defering to viewBox below
let svgHeight = 600; // defering to viewBox below

let margin = {
    top:100,
    right: 40,
    bottom: 100,
    left: 100
};

let width = svgWidth - margin.left - margin.right; //called in labelsGroup
let height = svgHeight - margin.top - margin.bottom; //called in LabelsGroup

// SVG wrapper
let svg = d3
    .select("#scatter")
    .append("svg")
    // .attr("width", svgWidth) // defering to viewBox below
    // .attr("height", svgHeight) // defering to viewBox below
    .attr("viewBox", `-0 -50 800 1000`);

// Append SVG group
let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Initial Params
let chosenXAxis = "smokes";

// Function to update x scale
function xScale(healthdata, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d=> d[chosenXAxis]) * 0.8,
        d3.max(healthdata, d => d[chosenXAxis]) * 1.1 //was 1.2 - make sure all fits
        ])
        .range([0,width]);

    return xLinearScale;
}

// Function to update x axis
function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;
}

//Function to update circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// Function used to update tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "smokes") {
        var label = "Smokes:";
      }
      else if (chosenXAxis === "obesity") {
        var label = "Obesity:";
      }
      else {
        var label = "Lacking Healthcare:";
      }

    let toolTip = d3.tip()
        .attr("class", "tooltip") //.d3-tip?
        .offset([80,-60])
        .html(function(d) {
            return(`${d.income} ${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
        });
    
    return circlesGroup;
}

// Get data from CSV
d3.csv("assets/data/data.csv").then(function(healthdata, err)  {
    if (err) throw err;

    // Parse data
    healthdata.forEach(function(data) {
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
    });

    // Set axes scales
    let xLinearScale = xScale(healthdata, chosenXAxis);
    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthdata, d => d.income)])
        .range([height, 0]);

    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Append axes
    let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform",`translate(0, ${height})`)
    .call(bottomAxis);

    chartGroup.append("g")
    .call(leftAxis);

    //Append circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(healthdata)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis])) 
        .attr("cy", d => yLinearScale(d.income)) //change when multi
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");

    // Create group for 3 x-axis labels
    let labelsGroup = circlesGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
    
    let smokesLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "smokes")
        .classed("active", true)
        .text("Smokes ***");

    let obesityLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obesity ***");

    let healthcareLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Healthcare ***");
    
    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Income ***");
    
    // Update tooltip
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // X axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            let value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value
                console.log(chosenXAxis);

                xLinearScale = xScale(healthdata, chosenXAxis);
                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                
                if (chosenXAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);    
                }
                else if (chosenXAxis === "obesity") {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true); 
                }
                else {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);                    
                }
            }
        });
    }).catch(function(error) {
        console.log(error);     
});