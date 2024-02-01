import { InputDataType } from "@/types";
import * as d3 from "d3";
import L from "leaflet";
import { MutableRefObject } from "react";

const populate_donut_counts = (
  marker_points: object,
  names: (string | undefined)[],
  counts: InputDataType,
) => {
  Object.keys(marker_points).forEach((el: string) => {
    if (names.includes(el.toLowerCase())) {
      if (counts[el.toLowerCase()] === undefined) {
        counts[el.toLowerCase()] = Object(marker_points)[el];
      } else {
        counts[el.toLowerCase()] += Object(marker_points)[el];
      }
    }
  });
  return counts;
};

const get_donut_counts = (
  cluster: object,
  selected_disease_names: string[],
  selected_syndrome_names: string[],
) => {
  const clusterMarkers = Object(cluster).getAllChildMarkers();
  let counts: InputDataType = {};

  for (const clusterMarker of clusterMarkers) {
    const markerIllnesses = clusterMarker.getData().illness;
    counts = populate_donut_counts(
      markerIllnesses,
      selected_disease_names,
      counts,
    );
    counts = populate_donut_counts(
      markerIllnesses,
      selected_syndrome_names,
      counts,
    );
  }

  const offsets: number[] = [];
  let total = 0;
  const sorted_counts_keys = Object.keys(counts).sort();
  sorted_counts_keys.forEach((key: string) => {
    offsets.push(total);
    total += Number(counts[key]);
  });

  return { offsets, total, counts, sorted_counts_keys };
};

const get_dimensions = (total: number, svgHoverScale: number) => {
  const fontSize =
    total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
  const radius = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
  const width = radius * 2 * svgHoverScale; // leave some space for the highlighted sections to "pop out"
  const height = width;

  return { fontSize, radius, width, height };
};

export const d3_pie_chart_data = (
  cluster: object,
  selected_disease_names: MutableRefObject<string[]>,
  selected_syndrome_names: MutableRefObject<string[]>,
  svgHoverScale: number,
  getChartColour: (index: string) => string,
) => {
  // creates donut chart marker for clusters

  // loop through markers of given cluster
  // counts the number of reports of each filtered disease/syndrome across the cluster
  // also keeps track of the cluster's combined report count
  const { total, counts } = get_donut_counts(
    cluster,
    selected_disease_names.current,
    selected_syndrome_names.current,
  );
  const { fontSize, radius, width, height } = get_dimensions(
    total,
    svgHoverScale,
  );

  const pie_data: Array<{ label: string; count: unknown }> = [];
  for (const [key, value] of Object.entries(counts)) {
    pie_data.push({ label: key, count: value });
  }
  const svgDom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgDom.setAttributeNS(
    "http://www.w3.org/2000/xmlns/",
    "xmlns",
    "http://www.w3.org/2000/svg",
  );
  svgDom.setAttributeNS(
    "http://www.w3.org/2000/xmlns/",
    "xmlns:xlink",
    "http://www.w3.org/1999/xlink",
  );

  const svg = d3
    .select(svgDom)
    .attr("pointer-events", "auto")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  const arc = d3
    .arc()
    .innerRadius(radius * 0.6) // none for pie chart
    .outerRadius(radius); // size of overall chart

  const pie = d3
    .pie() // start and end angles of the segments
    .value(function (d) {
      return Object(d).count;
    }) // how to extract the numerical data from each entry in our dataset
    .sort(null); // by default, data sorts in oescending value. this will mess with our animation so we set it to null

  // creating the chart
  svg
    .selectAll("path") // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
    .data(pie(Object(pie_data))) //associate dataset wit he path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
    .enter() //creates placeholder nodes for each of the values
    .append("path") // replace placeholders with path elements
    .attr("d", Object(arc)) // define d attribute with arc function above
    // .attr('fill', function(d) { return color(d.data.label); }) // use color scale to define fill of each label in dataset
    .attr("fill", function (d: object) {
      return getChartColour(Object(d).data.label);
    })
    .style("pointer-events", "auto")
    .attr("class", "cluster-mouse-events")
    .attr("data-label", function (d: object) {
      return Object(d).data.label;
    })
    .attr("data-count", function (d: object) {
      return Object(d).data.count;
    });

  svg
    .append("circle")
    .attr("fill", "black")
    .attr("opacity", "0.3")
    .attr("class", "cluster-centre-circle")
    .attr("cx", "0")
    .attr("cy", "0")
    .attr("r", radius * 0.6);

  svg
    .append("text")
    .attr("fill", "white")
    .attr("font-size", fontSize)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .html(String(total));

  return svgDom.outerHTML;
};

export const d3_pie_chart_icon_size = (
  cluster: object,
  selected_disease_names: MutableRefObject<string[]>,
  selected_syndrome_names: MutableRefObject<string[]>,
  svgHoverScale: number,
) => {
  const { total } = get_donut_counts(
    cluster,
    selected_disease_names.current,
    selected_syndrome_names.current,
  );
  const { width, height } = get_dimensions(total, svgHoverScale);

  return L.point(width, height);
};
