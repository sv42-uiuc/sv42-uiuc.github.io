
// Global Variables


// ~~~~~~~~~~~~~~~~ Page Interaction Functions ~~~~~~~~~~~~~~~~~~~~~~~~~
function homeScreen(){
    document.getElementById("bar-chart").style.visibility = "hidden";
    document.getElementById("donut-chart").style.visibility = "hidden";
    buildHomePage();
    buildYearSelector(0);
    //buildBarChart(1964);
}

// Plot Conductor - Manage the plots to be updated
// Need to update: Facts, Event Country Medal Breakdown, Event Medal Handout Per Country, NavBar
function updateScene(aYear){
    
    // For Charts Section
    // Clear Existing Charts
    // Get Filtered Data for Event Year
    // Build the BarChart
    // SetUp Donut Chart

    if (aYear == 0){
        clearPreviousChartFromDOM();
        homeScreen();
    } else {
        clearPreviousChartFromDOM();
        buildEventInsights(aYear);
        buildBarChart(aYear);
        buildYearSelector(aYear);
    }
    
}

// Clear Previous Chart from Page
function clearPreviousChartFromDOM(){
    document.getElementById("bar-chart").style.visibility = "hidden";
    document.getElementById("donut-chart").style.visibility = "hidden";
    document.getElementById("year-selector").innerHTML = "";
    document.getElementById("bar-chart").innerHTML= "";
    document.getElementById("donut-chart").innerHTML = "";
    document.getElementById("olympic-insights").innerHTML = "";
}

// Build the Year Selector at the Bottom of the Screen
// Create a Function to Manage what is displayed on the page
function buildYearSelector(aYear){
    var navBarSelector = '<br><nav class="nav justify-content-center nav-fill">';
    var tmp = "";

    if (aYear == 0) {
        tmp = `<a class="nav-link text-large disabled" href="javascript:updateScene(${String(0)})">Home</a>`;
    } else {
        tmp = `<a class="nav-link text-large" href="javascript:updateScene(${String(0)})">Home</a>`;
    }
    navBarSelector += tmp;

    // Insert NavBar HTML for each year
    for (var i = 1964; i < 2024; i+=4 ) {
        tmp = "";
        if (i == aYear){
            tmp += '<a class="nav-link text-large disabled"'
        } else {
            tmp += '<a class="nav-link text-large"'
        }
        tmp += ' href="javascript:updateScene('+String(i)+')">' + String(i) + '</a>';
        navBarSelector += tmp;
    };

    navBarSelector += "</nav>";
    document.getElementById("year-selector").innerHTML = navBarSelector;
    document.getElementById("year-selector").style.visibility = "visible";
}

function buildHomePage(){
    
    document.getElementById("olympic-insights").innerHTML = "";

    let innerhtml = `<div class="jumbotron"">
        <div class="container"> 
            <h1>A Historical Look of the Olympic Medals</h1>
            <hr><br>
            <h4>
                The three main objectives, as noted by the Olympic Comittee, is to promote <em>excellence, respect, and friendship.</em>
                With the olympics starting again this summer, lets take a look at each countries historical ability to excel throughout the games.
                Taking an overview of the last 50 years, we will see which countries did the best and those events that lead them to victory<br><br><br>
            </h4>
            <h4>Lets Start!</h4>
        </div>
    </div>`;
    document.getElementById("olympic-insights").innerHTML = innerhtml;
}

//~~~~~~~~~~~~ Functions tied to Event Insights ~~~~~~~~~~~~~~~~~~~~
function getRandInt(max){
    // Function came from Mozilla Example --> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.floor(Math.random() * max);
}

// Build Function that provides event insights
async  function buildEventInsights(aYear){
    // Get Data + Filter + GroupBy Country
    const data = await d3.csv("Data/Clean/fun_fact_df.csv");
    let event = data.filter(function (d) {
        return d.year == aYear
    })[0];

    // Synonym Round
    let city_adjectives = [
        "picturesque",
        "beautiful",
        "scenic",
        "striking",
        "amazing"
    ];
    let event_adjectives = [
        "one for the history books.",
        "one to remember.",
        "as exciting as ever.",
        "simply exhilarating."
    ];
    let winner_adjectives = [
        "dominating",
        "monopolizing wins in",
        "overshadowing its competitors within",
        "reign over" 
    ];

    let tmp = 0;
    // console.log(event);
    let innerhtml = `<div class="jumbotron"">
        <div class="container"> 
            <h1 class="display-3">${event.edition}</h1>
            <hr><br>
            <p class="lead">* The ${event.edition} was hosted between ${event.start_date} and ${event.end_date}</p>
            <p class="lead">* Hosted in the ${city_adjectives[getRandInt(city_adjectives.length)]} city of ${event.city}, ${event.country}. The event was ${event_adjectives[getRandInt(event_adjectives.length)]}</p> 
            <p class="lead">* Roughly <u>${event.total_countries}</u> countries worldwide sent <u> ${Math.floor(event.total_athletes)}</u> Olympians to compete in multitude of events.</p> 
            <p class="lead">* There were over <strong>${Math.floor(event.total_events)}</strong> different olympic events that year.</p>
            <p class="lead">* This event resulted in <em>${event.winner}</em> ${winner_adjectives[getRandInt(winner_adjectives.length)]} the event. Winning <strong>${event.total}</strong> medals throughout the games</p>
            <hr><br>
            <p style="font-size:25px"><u><em>* Click a country on the medal barchart to see the events tied to that medal</em></u></p>
        </div>
    </div>`;

    document.getElementById("olympic-insights").innerHTML = innerhtml;

}

//~~~~~~~~~~~ Functions tied to Bar Chart Plot ~~~~~~~~~~~~~~~~~~~~~

async function buildBarChart(aYear){

    // Set Margins
    const margin = {top: 50, right: 20, bottom: 30, left: 200};
    const width = 1200 - margin.left - margin.right;
    const height = 1600 - margin.top - margin.bottom;
    
    // Append Plot
    let svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("font", "12px Montserrat")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Get Data + Filter + GroupBy Country
    const data = await d3.csv("Data/Clean/Country_Medals_1960_to_2020.csv");
    let filteredData = data.filter(function (d) {
        return d.year == aYear && d.total != 0;
    });

    // {edition, edition_id, sport, event, year, country_noc, ...rest}
    const onlyMedals = filteredData.map(({...rest}) => rest);
    const typeKeys = ['bronze', 'silver', 'gold']

    // Group together Medal Counts - Code From {https://stackoverflow.com/questions/61057507/how-to-convert-object-properties-string-to-integer-in-javascript}
    var helper = {};
    var result = onlyMedals.reduce(function(r, o) {
        var key = o.country;
        
        if(!helper[key]) {
            helper[key] = Object.assign({}, o); // create a copy of o

            Object.keys(helper[key]).forEach(function (k) {
                const parsed = parseInt(helper[key][k]);
                helper[key][k] = isNaN(parsed) ? helper[key][k] : parsed;
            })

            r.push(helper[key]);
        } else {
            Object.keys(o).forEach(function (k) {
                if (["bronze", "silver", "gold", "total"].includes(k)){
                    const parsed = parseInt(o[k]);
                    if (!isNaN(parsed)){
                        helper[key][k] += parsed;
                    }
                }
            })
        }
        return r;
    }, []);
    filteredData = result;

    // Sort By Total Medals
    filteredData.sort((a, b) => b.total - a.total);
    let max = Math.ceil(filteredData[0].total / 10) * 10; 

    // Stack Data
    const stack = d3.stack()
    .keys(typeKeys)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)
    const stackedData = stack(filteredData)

    // X scale and Axis
    const formater =  d3.format(".1s")
    const xScale = d3.scaleLinear()
        .domain([0, max])
        .range([0, width]);
    svg
    .append('g')
    .attr("transform", `translate(0, ${0})`)
    .call(d3.axisTop(xScale).ticks(8).tickSize(0).tickPadding(6))
    // .call(d => d.select(".domain").remove())
    .style("font-size", "16px");

    // Y scale and Axis
    const yScale = d3.scaleBand()
    .domain(filteredData.map(d => d.country))
    .range([0, height])
    .padding(.2);
    svg
    .append('g')
    .call(d3.axisLeft(yScale).tickSize(0).tickPadding(8))
    .style("font-size", "16px");

    // color palette
    const color = d3.scaleOrdinal()
    .domain(typeKeys)
    .range(['#B08D57','#AAA9AD','#D4AF37'])

    // set vertical grid line
    const GridLine = function() {return d3.axisBottom().scale(xScale)};
    svg
    .append("g")
        .attr("class", "grid")
    .call(GridLine()
        .tickSize(height, 0, 0)
        .tickFormat("")
        .ticks(12)
    );

    // create a tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "barChartTooltip")
        .attr("class", "tooltip");

    // tooltip events
    const mouseover = function(d) {
        tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.8);

        d3.select(this)
        .style("opacity", .5)
    }
    const mousemove = function(event, d) {
        const formater =  d3.format(",")
            tooltip
            .html(barChartToolTip(d.data))
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
    }
    const mouseleave = function(d) {
        tooltip
        .transition()
        .duration(500)
        .style("opacity", 0);
        d3.select(this)
        .style("opacity", 1)
    }

    const onclick = function (event, d){
        let color = this.parentNode.attributes.fill.value;
        buildTreeChart(d.data.year, d.data.country, color);
    }

    // set Y axis label
    svg
    .append("text")
        .attr("class", "chart-label")
        .attr("x", width / 2)
        .attr("y", -32)
        .attr("text-anchor", "middle")
    .text("Medals Awarded by Country")
    .style("font-size", "20px");

    // create bars
    svg.append("g")
    .selectAll("g")
    .data(stackedData)
    .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d.data.country))
        .attr("width",  d => xScale(d[1])-xScale(d[0]))
        .attr("height", yScale.bandwidth())
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", onclick)

    //set legend '#B08D57','#AAA9AD','#D4AF37'
    svg
        .append("rect")
            .attr("x", 0)
            .attr("y", -43)
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", '#B08D57')
    svg
        .append("text")
            .attr("class", "legend")
            .attr("x", 20)
            .attr("y", -32)
        .text("Bronze")
    svg
        .append("rect")
            .attr("x", 120)
            .attr("y", -(43))
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", '#AAA9AD')
    svg
        .append("text")
            .attr("class", "legend")
            .attr("x", 140)
            .attr("y", -32)
        .text("Silver")
    svg
        .append("rect")
            .attr("x", 240)
            .attr("y", -43)
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", '#D4AF37')
    svg
        .append("text")
            .attr("class", "legend")
            .attr("x", 260)
            .attr("y", -32)
        .text("Gold")
    
    document.getElementById("bar-chart").style.visibility = "visible";
    document.getElementById("donut-chart").style.visibility = "visible";
}

// Tooltip Formatter
function barChartToolTip(toolTipData) {
    // Set Tool Tip Class
    let innerhtml = "<strong>Country:</strong> " + toolTipData.country +"<br>";
    innerhtml += "<strong>Total Medals:</strong>" + toolTipData.total +"<br>"
    
    innerhtml += "<br><strong>Medal Breakdown</strong><br>" 
    + "<ol><li>Gold: "+String(toolTipData.gold)+" </li>"
    + "<li>Silver: "+String(toolTipData.silver)+" </li>"
    + "<li>Bronze: "+String(toolTipData.bronze)+" </li>"
    return innerhtml
    
};

//~~~~~~~~~~~ Functions tied to Donut Chart Plot ~~~~~~~~~~~~~~~~~~~~~

// ~~~~~~~~~~~~~~~~~~~~ Functions tied to Tree Map Plot ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Tree Chart Experiment
async function buildTreeChart(aYear, aCountry, aColorScheme){
    
    document.getElementById("donut-chart").innerHTML = "";

    // Convert Color Scheme ['bronze', 'silver', 'gold']
    let tmp = {
        '#B08D57':"Bronze",
        '#AAA9AD':"Silver",
        '#D4AF37':"Gold"
    };

    // Get Data + Filter + GroupBy Country
    let data = await d3.csv("Data/Clean/Country_Medals_1960_to_2020.csv");
    data = data.filter(function (d) {
        return d.year == aYear && d.total != 0 && d.country == aCountry && d.medal == tmp[aColorScheme];
    });

    var helper = {
        "name": `${aCountry}: ${tmp[aColorScheme]}`,
        "children": []
    };
    var result = data.reduce(function(r, o) {
        // let medal = o.medal;
        let sport = o.sport;
        let event = o.event;
        let base = null;
        
        // Check if Medal is in List Already
        if((helper.children.find((element) => element.name == sport)) == null) {
            helper.children.push({
                "name": sport,
                "children": []
            });
        }
        base = helper.children;

        // Check if Sport is in there
        if((base[getIndexOfElement(base, sport)].children.find((element) => element.name == event)) == null) {
            base[getIndexOfElement(base, sport)].children.push({
                "name": event,
                "children": []
            });
        };       
    }, []);
    data = helper;

    // Specify the charts’ dimensions. The height is variable, depending on the layout.
    const width = 1200;
    const marginTop = 250;
    const marginRight = 25;
    const marginBottom = 50;
    const marginLeft = 180;

    // Rows are separated by dx pixels, columns by dy pixels. These names can be counter-intuitive
    // (dx is a height, and dy a width). This because the tree must be viewed with the root at the
    // “bottom”, in the data domain. The width of a column is based on the tree’s height.
    const root = d3.hierarchy(data);
    const dx = 18;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);

    // Define the tree layout and the shape for links.
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    // Create the SVG container, a layer for the links and a layer for the nodes.
    const svg = d3
        .select("#donut-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", dx)
        .attr("viewBox", [-marginLeft, -marginTop, width, dx])
        .attr("style", "max-width: 100%; height: auto; font: 18px sans-serif; user-select: none;");

    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

    const gNode = svg.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");

    function update(event, source) {
        const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
        const nodes = root.descendants().reverse();
        const links = root.links();

        // Compute the new tree layout.
        tree(root);

        let left = root;
        let right = root;
        root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
        });

        const height = right.x - left.x + marginTop + marginBottom;

        const transition = svg.transition()
            .duration(duration)
            .attr("height", height)
            .attr("viewBox", [-marginLeft, left.x - marginTop, width, height])
            .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

        // Update the nodes…
        const node = gNode.selectAll("g")
        .data(nodes, d => d.id)
        

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
            d.children = d.children ? null : d._children;
            update(event, d);
            });

        nodeEnter.append("circle")
            .attr("r", 2.5)
            .attr("fill", d => d._children ? "#555" : "#999")
            .attr("stroke-width", 10);

        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -6 : 6)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .text(d => d.data.name)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "white")
            .attr("paint-order", "stroke");

        // Transition nodes to their new position.
        const nodeUpdate = node.merge(nodeEnter).transition(transition)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition(transition).remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // Update the links…
        const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().append("path")
            .attr("d", d => {
            const o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.merge(linkEnter).transition(transition)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition(transition).remove()
            .attr("d", d => {
            const o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
            });

        // Stash the old positions for transition.
        root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
        });
    }

    // Do the first update to the initial configuration of the tree — where a number of nodes
    // are open (arbitrarily selected as the root, plus nodes with 7 letters).
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.data.name.length%Math.floor(Math.random() * 5) !== Math.floor(Math.random() * 4) ){
            d.children = null;  
        }
    });

    update(null, root);
    document.getElementById("donut-chart").style.visibility = "visible";

}

function getIndexOfElement(anArray, aName){
    for (let index = 0; index < anArray.length; index++) {
        if (anArray[index].name == aName) {
            return index;
        }
    }
    return null;
}

// ~~~~~~~~~~~~~~~~~~~~ Functions tied to Fact Section ~~~~~~~~~~~~~~~~~~~~~~~~~~~~