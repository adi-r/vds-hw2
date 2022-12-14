let height = window.screen.availHeight / 1.5
let width = window.screen.availWidth

let tooltip = d3.select('#map_canvas')
                .append('div')
                .attr('class', 'tooltip')

//Position of the tooltip relative to the cursor
var tooltip_offset = { x: 10, 
                      y: 100 
}
let active = d3.select(null),
  centered,
  current_state,
  current_state_selection

//Create a tooltip
function show_tool(d) {
  console.log('current_state', current_state)
  if (d.state_name === current_state) {
    current_state_selection.attr('fill-opacity', 0.6)
  }

  d3.select(this).attr('fill-opacity', 0.6)

  tooltip.style('position' , 'absolute')
          .style('opacity', 0.9)
          .style('display', 'block')
          .style('padding' , "20px")
          .style('background-color', 'rgba(242,243,244,0.9)')
          .style('color' , 'black')
          .style('text-align' , "center" )
          .style('font-size', '12px')
          .style('width', '180px')
          .style('height', '150px')
          .style('padding', '2px')
          .style('top',  (d3.select(this).attr("cy") + tooltip_offset.y) + 'px')
          .style('left', (d3.select(this).attr("cx") + tooltip_offset.x)  + 'px')
          .html('Death count in ' + d.city + '<br/> Kids:' + d.kids + ' <br/> Teens:' + d.teens + ' <br/> Adults:' + (parseInt(d.males) + parseInt(d.females) - parseInt(d.kids) - parseInt(d.teens))  
          + ' <br/>  Males: ' + d.males + ' <br/> Females: ' + d.females,
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
          .style('background-color', 'rgba(242,243,244,0.4)')
          .style('color' , 'black')    
}

let projection = d3.geoAlbersUsa()
                    .translate([width / 2, height / 2])
                    .scale([1300])

let state_map = function () {
  let path = d3.geoPath()
                .projection(projection)
  state_freq = './data/state_stats.csv'
  d3.selectAll('svg').remove()

  let svg = d3.select('#map_canvas')
              .append('svg')
              .attr('width', width)
              .attr('height', height)

  var age_group = document.getElementById('age_group');
  var gender_type = document.getElementById('gender_select');
  var age = age_group.options[age_group.selectedIndex].value; 
  var gender = gender_type.options[gender_type.selectedIndex].value;

  d3.csv(state_freq, function (data) {
    let arr = []
    let max = 0
    for (var d = 0; d < data.length; d++) {
      if (
        (age == -1 ||
          (age == 1 && data[d].ageGroup <= 1) ||
          age == data[d].ageGroup) &&
        (gender == -1 || gender == data[d].gender)
      ) {
        arr.push(data[d])
      }
    }

    var groupby_gender = arr.reduce((acc, it) => {
      acc[it.state] = acc[it.state] + +it.count || +it.count
      return acc
    }, {})

    var groupby_male = arr.filter((x) => x.gender == 'M')
                          .reduce((acc, it) => {
                            acc[it.state] = acc[it.state] + +it.count || +it.count
                            return acc
                          }, {})

    var groupby_female = arr.filter((x) => x.gender == 'F')
                            .reduce((acc, it) => {
                              acc[it.state] = acc[it.state] + +it.count || +it.count
                              return acc
                            }, {})
      
    var groupby_kids = arr.filter((x) => x.ageGroup == 1.0)
                          .reduce((acc, it) => {
                            acc[it.state] = acc[it.state] + +it.count || +it.count
                            return acc
                          }, {})

    var groupby_teens = arr.filter((x) => x.ageGroup == 2.0)
                            .reduce((acc, it) => {
                              acc[it.state] = acc[it.state] + +it.count || +it.count
                              return acc
                            }, {})
    
    var groupby_adults = arr.filter((x) => x.ageGroup == 3.0)
                            .reduce((acc, it) => {
                              acc[it.state] = acc[it.state] + +it.count || +it.count
                              return acc
                            }, {})

    let min = 0

    d3.json('./data/us-states.json', function (json) {
      Object.keys(groupby_gender).forEach(function (key) {
        var state_key = key
        var data_val = groupby_gender[key]
        max = Math.max(max, data_val)

        for (var j = 0; j < json.features.length; j++) {
          var state_json = json.features[j].properties.name
          if (state_key === state_json) {
            json.features[j].properties.value = data_val
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

      var tip = d3.tip()
                  .attr('class', 'd3-tip')
                  .offset([-40, 0])
                  .html(function (d) {
                    var x = +d.properties.value
                    return
                    ;+"<div id='tip'></div><br>"
                  })

      svg.call(tip)

      let color_range = d3.scaleSequential(d3.interpolate('rgb(253,224,221)', 'rgb(174,1,126)'),)
                          .domain([min, max])

      var div = d3.select('#map_canvas')
                  .append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0.9)

      d3.csv('./data/city_freq.csv', function (data) {
        json.features[52] = {properties: {name: "Alabama", density: 94.65, value: 258}}
        svg.selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('transform', 'translate(0,-100)')
            .style('stroke-width', '1.2')
            .style('stroke', 'black')
            .style('z-index', 1)
            .style('fill', function (d) {
              console.log('dd', d.properties)
            return color_range(
              d.properties.value === undefined ? 259 : d.properties.value,
            )
          })
          .on('mouseover', function (d) {
            let id = d
            d3.selectAll('#tip').remove()
            val = d.properties.value
            if (!val) {
              val = 0
            }
            div.transition()
                .duration(300)
                .style('opacity', 0.9)
            div.html(d.properties.name + "'s number of deaths:" + val + '<br/>Death rate% per 100k population: ' + ((val/100000.0) * 100).toFixed(3) + '%',)
                .style('top', d3.event.pageY - 50 + 'px')
                .style('left', d3.event.pageX - 5 + 'px')
            tip.show(d)
            var state = d.properties.name
            var dataset = [
              groupby_male[state] || 0,
              groupby_female[state] || 0,
              groupby_kids[state] || 0,
              groupby_teens[state] || 0,
              groupby_adults[state] || 0,
            ]
            var barHeight = 25
            var tipSVG = div.append('svg')
                            .attr('width', 150)
                            .attr('height', barHeight * 5)
            var x = d3.scaleLinear()
                      .domain([0, d3.max(dataset)])
                      .range([0, 150])
            var bar = tipSVG.selectAll('g')
                            .data(dataset)
                            .enter()
                            .append('g')
                            .attr('transform', function (d, i) {
                              return 'translate(0,' + i * barHeight + ')'
                            })
            bar.append('rect')
                .attr('width', x)
                .attr('height', barHeight - 1)
                .attr('fill', function (d, i) {
                  return 'limegreen'
                })
            bar.append('text')
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
                  if(i === 0) {
                    return 'Males: ' + d
                  } else if(i === 1) {
                    return 'Females: ' + d
                  } else if(i === 2) {
                    return 'Kids : ' + d
                  } else if(i === 3) {
                    return 'Teens : ' + d
                  } else if(i === 4) {
                    return 'Adults : ' + d
                  } else {
                    console.log('invalid value')
                  }
                })
          })
          .on('mouseout', function (d) {
            div.transition().duration(500).style('opacity', 0)
          })

        let cities = svg.append('g')
                        .attr('class', 'circles')
                        .attr('cursor', 'pointer')
          

        let features = svg.append('g')
                          .attr('class', 'features')
                          .attr('cursor', 'pointer')
          

        cities.selectAll('path')
            .data(data)
            .enter()
            .append('circle')
            .attr('transform', 'translate(0,-100)')
            .style('z-index', 10000)
            .style('opacity', 0.7)
            .attr('cx', function (d) {
              return projection([d.lng, d.lat])[0]
            })
            .attr('cy', function (d) {
              return projection([d.lng, d.lat])[1]
            })
            .attr('r', function (d) {
              return Math.sqrt((d.males + d.females) * 0.06) 
            })
            .style('fill', 'black')
            .on('mouseover', show_tool)
            .on('mouseout', hide_tool)
          
      })

      scale_axis = d3.scaleLinear().domain(color_range.domain()).range([50, 550])
      axisBottom = (g) =>
        g
          .attr('class', `x-axis`)
          .attr(
            'transform',
            'translate(' + window.screen.availWidth / 3 + ',' +(height -50) +')',
          )
          .call(d3.axisBottom(scale_axis).ticks(10).tickSize(-10))
      const linearGradient = svg
        .append('linearGradient')
        .attr('id', 'linear-gradient')
      linearGradient
        .selectAll('stop')
        .data(
          color_range.ticks().map((t, i, n) => ({
            offset: `${(100 * i) / n.length}%`,
            color: color_range(t),
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
          'translate(' + (window.screen.availWidth / 3 + 42)+ ',' +(height - 120) +')',
        )
        .append('rect')
        .attr('transform', 'translate(10,50)')
        .attr('width', 500)
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
