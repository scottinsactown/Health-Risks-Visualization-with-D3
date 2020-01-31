// *** D3 Health Risk Analysis ***

function makeResponsive() {

// Set starting dimensions    
var svgArea = d3.select("body").select("svg");
if (!svgArea.empty()) {
    svgArea.remove();
  }
  var svgHeight = window.innerHeight;
  var svgWidth = window.innerWidth;

let margin = {
    top:20,
    right: 125,
    bottom: 110,
    left: 100
};

let width = svgWidth - margin.left - margin.right; 
let height = svgHeight - margin.top - margin.bottom; 

// SVG wrapper
let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth) 
    .attr("height", svgHeight) 

// Append SVG group
let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left+100},${margin.top})`);

// Function to update X scale
function xScale(healthdata, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d=> d[chosenXAxis]) * 0.8,
        d3.max(healthdata, d => d[chosenXAxis]) * 1.2 
        ])
        .range([0,width]);
    return xLinearScale;
}

//Function to update Y scale
function yScale(healthdata, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d=> d[chosenYAxis]) * 0.8, 
        d3.max(healthdata, d => d[chosenYAxis]) * 1.2 
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

// Function to update tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "smokes") {
        var xlabel = "Smokes: ";
        var xmeasure = "%";
      }
      else if (chosenXAxis === "obesity") {
        var xlabel = "Obesity: ";
        var xmeasure = "%";
      }
      else {
        var xlabel = "Lacking Healthcare: ";
        var xmeasure = "%";
      }

    if (chosenYAxis === "income") {
        var ylabel = "Median Income: $";
        var ymeasure = "";
      }
      else if (chosenYAxis === "age") {
        var ylabel = "Median Age: ";
        var ymeasure = " yrs";
      }
      else {
        var ylabel = "Poverty: ";
        var ymeasure = "%";
      }

    let toolTip = d3.tip()
        .attr("class", "tooltip") 
        .offset([100,-20])
        .html(function(d) {
            return(`${d.state}<br>${ylabel}${d[chosenYAxis]}${ymeasure}<br>
            ${xlabel}${d[chosenXAxis]}${xmeasure}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
   
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

    // Set chart defaults
    let chosenXAxis = "smokes"; 
    let chosenYAxis = "income";

    // Set axes scales
    let xLinearScale = xScale(healthdata, chosenXAxis);
    let yLinearScale = yScale(healthdata, chosenYAxis);

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
        .text("Smokes (%)");

    let obesityLabel = labelsGroup
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obesity (%)");

    let healthcareLabel = labelsGroup
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Healthcare (%)");
    
// Create group for 3 Y-axis labels

    let incomeLabel = chartGroup.append("text")
        .attr("transform", "rotate(0)")
        .attr("y", 100)
        .attr("x", -125)
        .attr("dy", "1em")
        .attr("value", "income")
        .classed("active", true)
        .text("Income (Median)");

    let ageLabel = chartGroup.append("text")
       .attr("transform", "rotate(0)")
      .attr("y", 120)
      .attr("x", -125)
      .attr("dy", "1em")
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");

    let povertyLabel = chartGroup.append("text")
        .attr("transform", "rotate(0)")
        .attr("y", 140)
        .attr("x", -125)
        .attr("dy", "1em")
        .attr("value", "poverty")
        .classed("inactive", true)
        .text("Poverty (%)");

    // Update tooltip
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X axis labels event listener
    chartGroup.selectAll("text")
        .on("click", function() {
            let value = d3.select(this).attr("value");
            console.log(value);
            if (value === "smokes" || value === "obesity" || value === "healthcare") {
                if (value !== chosenXAxis) {
                chosenXAxis = value;
                console.log(chosenXAxis);

                xLinearScale = xScale(healthdata, chosenXAxis);
                xAxis = renderXAxes(xLinearScale, xAxis);
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
            console.log(value);
        }
        else if 
         (value === "income" || value === "age" || value === "poverty") {
            if (value !== chosenYAxis) {
                chosenYAxis = value
                console.log(chosenYAxis);

                yLinearScale = yScale(healthdata, chosenYAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);
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
                else if (chosenYAxis === "age") {
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
}
makeResponsive();

d3.select(window).on("resize", makeResponsive);

