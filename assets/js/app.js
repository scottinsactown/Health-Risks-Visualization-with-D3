// *** D3 Health Risk Analysis ***

// Default values for chart
let clickedXvalue = "smokes"; 
let clickedYvalue= "income";

function makeResponsive() {

// Set starting dimensions    
let svgArea = d3.select("body").select("svg");
if (!svgArea.empty()) {
    svgArea.remove();
  }
let svgHeight = window.innerHeight-70;
let svgWidth = window.innerWidth;

let margin = {
    top:20,
    right: 175,
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

// ** Function to update X scale
function xScale(healthdata, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d=> d[chosenXAxis]) * 0.8,
        d3.max(healthdata, d => d[chosenXAxis]) * 1.2 
        ])
        .range([0,width]);
    return xLinearScale;
}

// ** Function to update Y scale
function yScale(healthdata, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d=> d[chosenYAxis]) * 0.8, 
        d3.max(healthdata, d => d[chosenYAxis]) * 1.2 
        ])
        .range([height,0]);
    return yLinearScale;
}

// *** Function to update X axis
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
    return xAxis;
}

// ** Function to update Y axis
function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);
    return yAxis;
}

// ** Function to update circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis])); 
    return circlesGroup;
}

// ** Function to update circle labels
function renderLabels(circleLabels, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circleLabels.transition()
    .duration(1000)
    .attr("x",d=> newXScale(d[chosenXAxis])) // or cs
    .attr("y", d => newYScale(d[chosenYAxis])); // or cy
    return circleLabels;
}

// ** Function to update tooltip
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

// ** Get data from CSV
d3.csv("assets/data/data.csv").then(function(healthdata, err)  {
    if (err) throw err;

    // ** Parse data
    healthdata.forEach(function(data) {
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.age = +data.age;
        data.poverty = +data.poverty;
    });

    // Use defaults for chart unless user has selected other options already
    chosenXAxis = clickedXvalue; 
    chosenYAxis = clickedYvalue;

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

        // Highlight CA (first data row in CSV and therefore first circle)
        chartGroup.select("circle").attr("fill", "red")
        
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
    let labelsGroupX = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
    
    var smokesLabel = labelsGroupX
        .append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "smokes")
        .classed("active", false)
        .classed("inactive", true)
        .text("Smokes (%)");

        if (chosenXAxis === "smokes") {
        smokesLabel.classed("active", true)
        .classed("inactive",false);
        }   

    var obesityLabel = labelsGroupX
        .append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "obesity")
        .classed("active", false)
        .classed("inactive", true)
        .text("Obesity (%)");

        if (chosenXAxis === "obesity") {
        obesityLabel.classed("active", true)
        .classed("inactive",false);
        }

    var healthcareLabel = labelsGroupX
        .append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "healthcare")
        .classed("active", false)
        .classed("inactive", true)
        .text("Lacking Healthcare (%)");
    
        if (chosenXAxis === "healthcare") {
            healthcareLabel.classed("active", true)
            .classed("inactive",false);
            }

    // Create group for 3 Y-axis labels
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", "rotate(0)")

    var incomeLabel = labelsGroupY
        .append("text")
        .attr("y", 100)
        .attr("x", -125)
        .attr("dy", "1em")
        .attr("value", "income")
        .classed("active", false)
        .classed("inactive", true)
        .text("Income (Median)");

        if (chosenYAxis === "income") {
            incomeLabel.classed("active", true)
            .classed("inactive",false);
            }

    var ageLabel = labelsGroupY
      .append("text")
      .attr("y", 120)
      .attr("x", -125)
      .attr("dy", "1em")
      .attr("value", "age")
      .classed("active", false)
      .classed("inactive", true)
      .text("Age (Median)");

        if (chosenYAxis === "age") {
        ageLabel.classed("active", true)
        .classed("inactive",false);
        }

    var povertyLabel = labelsGroupY
        .append("text")
        .attr("y", 140)
        .attr("x", -125)
        .attr("dy", "1em")
        .attr("value", "poverty")
        .classed("active", false)
        .classed("inactive", true)
        .text("Poverty (%)");

        if (chosenYAxis === "poverty") {
            povertyLabel.classed("active", true)
            .classed("inactive",false);
            }
      
    // Update tooltip
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // ** X axis labels event listener
    chartGroup.selectAll("text")
        .on("click", function() {
            let value = d3.select(this).attr("value");
            if (value === "smokes" || value === "obesity" || value === "healthcare") {
                if (value !== chosenXAxis) {
                chosenXAxis = value;
                clickedXvalue = value;

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
        }
        else if 
         (value === "income" || value === "age" || value === "poverty") {
            if (value !== chosenYAxis) {
                chosenYAxis = value;
                clickedYvalue = value

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


