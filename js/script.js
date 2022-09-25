let width = window.screen.availWidth
let height = window.screen.availHeight / 1.2

let tooltip = d3.select('body')
                .append('div')
                .attr('class', 'tooltip')

let active = d3.select(null),
  centered,
  current_state,
  current_state_selection


//Position of the tooltip relative to the cursor
var tooltip_offset = { x: 5, 
                      y: 100 
                    }

//Create a tooltip, hidden at the start
function show_tool(d) {
  if (d.state_name === current_state) {
    current_state_selection.attr('fill-opacity', 0.4)
  }

  d3.select(this).attr('fill-opacity', 0.4)

  tooltip.style('position' , 'absolute')
          .style('display', 'block')
          .style('padding' , "20px")
          .style('background-color', 'rgba(255,255,255,0.4)')
          .style('color' , 'black')
          .style('text-align' , "left" )
          .style('top',  (parseInt(d3.select(this).attr("cy")) + parseInt(tooltip_offset.y))  + 'px')
          .style('left', (parseInt(d3.select(this).attr("cx")) + parseInt(tooltip_offset.x))  + 'px')
          .html('City:' + d.city + ' <br/>  Males: ' + d.males + ' <br/> Females: ' + d.females + 
                '<br/> Children:' + d.kids + ' <br/> Teens:' + d.teens + ' <br/> Adults:' + (parseInt(d.males) + parseInt(d.females) - parseInt(d.kids) - parseInt(d.teens)),
    )    
}
      
function hide_tool(d) {
  if (d.state_name === current_state) {
    current_state_selection.attr('fill-opacity', 0.4)
  }

  d3.select(this).attr('fill-opacity', 0.9)

  tooltip.style('position' , 'absolute')
          .style('display', 'none')
          .style('padding' , "20px")
          .style('background-color', 'rgba(255,255,255,0.4)')
          .style('color' , 'black')    
}

let projection = d3.geoAlbersUsa()
                    .translate([width / 2, height / 2])
                    .scale([1300])

let state_map = function () {
  let path = d3.geoPath()
                .projection(projection)
  statesData = './data/state_freq.csv'
  d3.selectAll('svg').remove()

  let svg = d3.select('body')
              .append('svg')
              .attr('width', width)
              .attr('height', height)

  var age_group = document.getElementById('age_group');
  var gender_type = document.getElementById('gender_select');
  var age = age_group.options[age_group.selectedIndex].value; 
  var gender = gender_type.options[gender_type.selectedIndex].value;

  d3.csv(statesData, function (data) {
    let dataArray = []
    let maxVal = 0
    for (var d = 0; d < data.length; d++) {
      if (
        (age == -1 ||
          (age == 1 && data[d].ageGroup <= 1) ||
          age == data[d].ageGroup) &&
        (gender == -1 || gender == data[d].gender)
      ) {
        dataArray.push(data[d])
      }
    }

    var groupedData = dataArray.reduce((acc, it) => {
      acc[it.state] = acc[it.state] + +it.count || +it.count
      return acc
    }, {})

    var groupedDataMale = dataArray
      .filter((x) => x.gender == 'M')
      .reduce((acc, it) => {
        acc[it.state] = acc[it.state] + +it.count || +it.count
        return acc
      }, {})

    var groupedDataFemale = dataArray
      .filter((x) => x.gender == 'F')
      .reduce((acc, it) => {
        acc[it.state] = acc[it.state] + +it.count || +it.count
        return acc
      }, {})
    var groupedDataAgeGroup1 = dataArray
      .filter((x) => x.ageGroup == 1.0)
      .reduce((acc, it) => {
        acc[it.state] = acc[it.state] + +it.count || +it.count
        return acc
      }, {})
    var groupedDataAgeGroup2 = dataArray
      .filter((x) => x.ageGroup == 2.0)
      .reduce((acc, it) => {
        acc[it.state] = acc[it.state] + +it.count || +it.count
        return acc
      }, {})
    var groupedDataAgeGroup3 = dataArray
      .filter((x) => x.ageGroup == 3.0)
      .reduce((acc, it) => {
        acc[it.state] = acc[it.state] + +it.count || +it.count
        return acc
      }, {})
    let minVal = 0

  

    d3.json('./data/us-states.json', function (json) {
      Object.keys(groupedData).forEach(function (key) {
        var dataState = key
        var dataValue = groupedData[key]
        maxVal = Math.max(maxVal, dataValue)

        for (var j = 0; j < json.features.length; j++) {
          var jsonState = json.features[j].properties.name
          if (dataState == jsonState) {
            json.features[j].properties.value = dataValue
            break
          }
        }

      })

      d3.functor = function functor(v) {
        return typeof v === 'function'
          ? v
          : function () {
              return v
            }
      }

      var tip = d3
        .tip()
        .attr('class', 'd3-tip')
        .offset([-40, 0])
        .html(function (d) {
          var x = +d.properties.value
          return
          ;+"<div id='tipDiv'></div><br>"
        })

      svg.call(tip)

      let ramp = d3
        .scaleSequential(
          d3.interpolate('rgb(254,235,226)', 'rgb(174,1,126)'),
        )
        .domain([minVal, maxVal])

      var div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

      d3.csv('./data/city_freq.csv', function (data) {
        svg
          .selectAll('path')
          .data(json.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('transform', 'translate(0,-100)')
          .attr('z-index', 1)
          .style('z-index', 1)
          .style('stroke', 'black')
          .style('stroke-width', '1.5')
          .style('fill', function (d) {
            return ramp(
              d.properties.value === undefined ? 0 : d.properties.value,
            )
          })
          .on('mouseover', function (d) {
            let id = d
            d3.selectAll('#tipDiv').remove()
            val = d.properties.value
            if (!val) {
              val = 0
            }
            div.transition().duration(200).style('opacity', 0.9)
            div
              .html(
                'Total deaths in ' + d.properties.name + ' are: ' + val,
              )
              .style('left', d3.event.pageX + 'px')
              .style('top', d3.event.pageY - 28 + 'px')
            tip.show(d)
            var state = d.properties.name
            var dataset = [
              groupedDataMale[state] || 0,
              groupedDataFemale[state] || 0,
              groupedDataAgeGroup1[state] || 0,
              groupedDataAgeGroup2[state] || 0,
              groupedDataAgeGroup3[state] || 0,
            ]
            var barHeight = 25
            var tipSVG = div
              .append('svg')
              .attr('width', 150)
              .attr('height', barHeight * 5)
            var x = d3
              .scaleLinear()
              .domain([0, d3.max(dataset)])
              .range([0, 150])
            var bar = tipSVG
              .selectAll('g')
              .data(dataset)
              .enter()
              .append('g')
              .attr('transform', function (d, i) {
                return 'translate(0,' + i * barHeight + ')'
              })
            bar
              .append('rect')

              .attr('width', x)
              .attr('height', barHeight - 1)
              .attr('fill', function (d, i) {
                return 'cyan'
              })
            bar
              .append('text')
              .attr('x', 2)
              .attr('y', barHeight / 2)
              .attr('dy', '.35em')
              .attr('fill', function (d) {
                if (d === d3.max(dataset)) {
                  return 'black'
                } else {
                  return 'black'
                }
              })
              .style('font-size', '12px')
              .text(function (d, i) {
                switch (i) {
                  case 0:
                    return 'Males: ' + d
                  case 1:
                    return 'Females: ' + d
                  case 2:
                    return 'Children : ' + d
                  case 3:
                    return 'Teens : ' + d
                  case 4:
                    return 'Adults : ' + d
                }
              })
          })
          .on('mouseout', function (d) {
            div.transition().duration(747).style('opacity', 0)
          })

        let cities = svg
          .append('g')
          .attr('class', 'circles')
          .attr('cursor', 'pointer')

        let features = svg
          .append('g')
          .attr('class', 'features')
          .attr('cursor', 'pointer')

        cities
          .selectAll('path')
          .data(data)
          .enter()
          .append('circle')
          .attr('transform', 'translate(0,-100)')
          .attr('z-index', 10000)
          .style('z-index', 10000)
          .style('opacity', 0.6)
          .attr('cx', function (d) {
            return projection([d.lng, d.lat])[0]
          })
          .attr('cy', function (d) {
            return projection([d.lng, d.lat])[1]
          })
          .attr('r', function (d) {
            return Math.sqrt(parseInt(d.males + d.females) * 0.02) 
          })
          .style('fill', 'blue')
          .on('mouseover', show_tool)
          .on('mouseout', hide_tool)
      })

      axisScale = d3.scaleLinear().domain(ramp.domain()).range([50, 550])
      axisBottom = (g) =>
        g
          .attr('class', `x-axis`)
          .attr(
            'transform',
            'translate(' + window.screen.availWidth / 2.9 + ',0)',
          )
          .call(d3.axisBottom(axisScale).ticks(10).tickSize(-10))
      const linearGradient = svg
        .append('linearGradient')
        .attr('id', 'linear-gradient')
      linearGradient
        .selectAll('stop')
        .data(
          ramp.ticks().map((t, i, n) => ({
            offset: `${(100 * i) / n.length}%`,
            color: ramp(t),
          })),
        )
        .enter()
        .append('stop')
        .attr('offset', (d) => d.offset)
        .attr('stop-color', (d) => d.color)
      svg
        .append('g')
        .attr(
          'transform',
          'translate(' + (window.screen.availWidth / 2.9 + 42) + ',0)',
        )
        .append('rect')
        .attr('transform', 'translate(10,50)')
        .attr('width', 501)
        .attr('height', 20)
        .style('fill', 'url(#linear-gradient)')
      svg.append('g').call(axisBottom)
    })
  })
}

function get_map() {
  state_map()
}

get_map()
