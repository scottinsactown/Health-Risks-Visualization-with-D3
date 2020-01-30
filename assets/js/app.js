// *** D3 Health Risk Analysis ***

// Set starting dimensions
let svgWidth = 960 //850; // defering to viewBox below but this still sets overall shape of plot
let svgHeight = 500 //850; // defering to viewBox below

let margin = {
    top:100,
    right: 40,
    bottom: 100,
    left: 100
};

let width = svgWidth - margin.left - margin.right; //called in xScale and labelsGroup
let height = svgHeight - margin.top - margin.bottom; //called in yLinearScale and labelsGroup

// SVG wrapper
let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth) // defering to viewBox below
    .attr("height", svgHeight) // defering to viewBox below
    // .attr("viewBox", `-0 -50 800 1000`);

// Append SVG group
let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Initial Params
let chosenXAxis = "smokes";
let chosenYAxis = "income";

// Function to update X scale
function xScale(healthdata, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d=> d[chosenXAxis]) * 0.8, //try .9 - make sure all fits
        d3.max(healthdata, d => d[chosenXAxis]) * 1.2 //try 1.1 - make sure all fits
        ])
        .range([0,width]);
    return xLinearScale;
}

//Function to update Y scale
function yScale(healthdata, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d=> d[chosenYAxis]) * 0.8, //try .9 - make sure all fits
        d3.max(healthdata, d => d[chosenYAxis]) * 1.2 //try 1.1 - make sure all fits
        ])
        .range([height,0]);
    return yLinearScale;
}

// Function to update X axis
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
    return xAxis;
}

// Function to update Y axis
function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);
    return yAxis;
}

//Function to update circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis])); 
    return circlesGroup;
}

// Function to update circle labels
function renderLabels(circleLabels, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circleLabels.transition()
    .duration(1000)
    .attr("x",d=> newXScale(d[chosenXAxis])) // or cs
    .attr("y", d => newYScale(d[chosenYAxis])); // or cy
    return circleLabels;
}

// Function used to update tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "smokes") {
        var xlabel = "Smokes:";
      }
      else if (chosenXAxis === "obesity") {
        var xlabel = "Obesity:";
      }
      else {
        var xlabel = "Lacking Healthcare:";
      }

    if (chosenYAxis === "income") {
        var ylabel = "Income:";
      }
      else if (chosenYAxis === "Age") {
        var ylabel = "Age:";
      }
      else {
        var ylabel = "Poverty:";
      }

    let toolTip = d3.tip()
        .attr("class", "tooltip") 
        .offset([100,-20])
        .html(function(d) {
            return(`${d.state}<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function(data) {
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
        data.age = +data.age;
        data.poverty = +data.poverty;
    });

    // Set axes scales
    let xLinearScale = xScale(healthdata, chosenXAxis);
    let yLinearScale = yScale(healthdata, chosenYAxis);
        // d3.scaleLinear()
        // .domain([0, d3.max(healthdata, d => d.income)])
        // .range([height, 0]);

    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Append axes
    let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform",`translate(0, ${height})`)
    .call(bottomAxis);

    let yAxis = chartGroup.append("g")
    .classed("y-axis", true) // y-axis correct? 
    .call(leftAxis);

    // chartGroup.append("g")
    // .call(leftAxis); // NEED? SINCE APPENDING ABOVE?

    //Append circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(healthdata)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis])) 
        .attr("cy", d => yLinearScale(d[chosenYAxis])) 
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", ".7");

        // Apply labels to circles
        let circleLabels = chartGroup.append("g")
        .selectAll(null)
        .data(healthdata)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis])+5) // minor placement adjustment or attr('dy',5)?
        .text(function(d) {
        return d.abbr;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");

    // Create group for 3 X-axis labels
    let labelsGroup = chartGroup.append("g")
        // .attr("transform", `translate(${width / 2}, ${height + 20})`)
    
    let smokesLabel = labelsGroup
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "smokes")
        .classed("active", true)
        .classed('axis-text', true)
        .text("Smokes (%)");

    let obesityLabel = labelsGroup
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "obesity")
        .classed("inactive", true)
        .classed('axis-text', true)
        .text("Obesity (%)");

    let healthcareLabel = labelsGroup
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .classed('axis-text', true)
        .text("Healthcare (%)");
    
// Create group for 3 Y-axis labels
    // let labelsYGroup = chartGroup.append("g")
    // .attr("transform", `translate(${width / 2}, ${height + 20})`)

    let incomeLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 20 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "income")
        .classed("active", true)
        .classed('axis-text', true)
        .text("Income (Median)");

    let ageLabel = labelsGroup.append("text")
       .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 40 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "age")
      .classed("inactive", true)
      .classed('axis-text', true)
      .text("Age (Median");

    let povertyLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 60 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "poverty")
        .classed('axis-text', true)
        .classed("inactive", true)
        .text("Poverty (%)");

    // append y axis
    // chartGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left)
    //     .attr("x", 40 - (height / 2))
    //     .attr("dy", "1em")
    //     .classed("axis-text", true)
    //     .text("Income (Median)");
    
    // Update tooltip
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X axis labels event listener
    labelsGroup.selectAll(".axis-text")
        .on("click", function() {
            let value = d3.select(this).attr("value");
            if (value === "smoking" || value === "obesity" || value === "healthcare") {
            if (value !== chosenXAxis) {
                chosenXAxis = value;
                console.log(chosenXAxis);

                xLinearScale = xScale(healthdata, chosenXAxis);
                xAxis = renderXAxes(xLinearScale, xAxis);
                // yAxis = renderYAxes (yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                circleLabels = renderLabels(circleLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                // Move circle labels
                circleLabels.transition()
                .duration(1000)
                .attr("x", d => xLinearScale(d[chosenXAxis]))
                .attr("y", d => yLinearScale(d[chosenYAxis])+5) // minor placement adjustment
                .text(function(d) {
                  return d.abbr;
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", "16px")
                .attr("text-anchor", "middle")
                .attr("fill", "white");
                
                // Highlight active choice
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
        }
        else {
            if (value !== chosenYAxis) {
                chosenYAxis = value
                console.log(chosenYAxis);

                yLinearScale = yScale(healthdata, chosenYAxis);
                // xAxis = renderXAxes(xLinearScale, xAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAvis, chosenYAxis, circlesGroup);
                circleLabels = renderLabels(circleLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                // Move circle labels
                circleLabels
                .transition()
                .duration(1000)
                .attr("x", d => xLinearScale(d[chosenXAxis]))
                .attr("y", d => yLinearScale(d[chosenYAxis])+5) // minor placement adjustment
                .text(function(d) {
                  return d.abbr;
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", "16px")
                .attr("text-anchor", "middle")
                .attr("fill", "white");
                
                // Highlight active choice
                if (chosenYAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);    
       
                    }
                else if (chosenXAxis === "age") {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true); 
                       
                    }
                else {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);                    
                        
                    }
            }
        }
    });
    }).catch(function(error) {
        console.log(error);     
});
