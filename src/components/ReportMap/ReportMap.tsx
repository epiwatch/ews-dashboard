import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import styles from "../../styles/Map.module.css";
import React, { useState, useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import { MapContainer, TileLayer } from "react-leaflet";
import polylabel from "polylabel";
import mapJsonData from "../../pages/api/jsons/map_data.json"; // TODO: replace with API call
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

const moment = require("moment");
const randomcolor = require("randomcolor");

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/marker-icon-2x.png",
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
});

function ReportMap() {
  const [mapMode, setMapMode] = useState("0");

  const mainMap = useRef(null) as any;
  const pieChartTooltip = useRef(null) as any;
  const [zoom, setZoom] = useState<number>(3);
  const [center, setCenter] = useState<any[]>([48, -1.219482]);
  const [diseases, setDiseases] = useState<any>([]);
  const [syndromes, setSyndromes] = useState<any>([]);
  const [mapDiseases, setMapDiseases] = useState<any>([]);
  const [mapSyndromes, setMapSyndromes] = useState<any>([]);
  const [regions, setRegions] = useState<any>({});
  const [clusterColors, setClusterColors] = useState<any>({});
  const clusterOptions = useMemo(
    () => ({
      iconCreateFunction: function (cluster: any) {
        return L.divIcon({
          html: d3_pie_chart_data(cluster),
          className: "cluster-div2",
          iconSize: d3_pie_chart_icon_size(cluster),
        });
      },
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
    }),
    [clusterColors],
  );
  const [mapData, setMapData] = useState<any>(mapJsonData);
  const [selectedDiseases, setSelectedDiseases] = useState<any>([
    "ALL DISEASES",
  ]);
  const [selectedSyndromes, setSelectedSyndromes] = useState<any>([]);
  const [selectedDiseasesFilter, setSelectedDiseasesFilter] = useState<any>([]);
  const [selectedSyndromesFilter, setSelectedSyndromesFilter] = useState<any>(
    [],
  );
  const [selectedDiseasesSyndromesFilter, setSelectedDiseasesSyndromesFilter] =
    useState<any>([]);

  const [countryOutlineByCountry, setCountryOutlineByCountry] = useState<any>(
    {},
  );
  const [geojsonByCountry, setGeojsonByCountry] = useState<any>({});
  const [currentTileProvider, setCurrentTileProvider] =
    useState<string>("Esri_WorldImagery");
  const [regionalMarkerClusters, setRegionalMarkerClusters] = useState<any>({});
  const [continents, setContinents] = useState<any>({});
  const svgHoverScale = useMemo(() => 1.2, []);
  const tileProviders = useMemo(
    () => ({
      esri_worldgraycanvas_dark: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        options: { maxZoom: 16 },
      },
      esri_worldgraycanvas_light: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        options: { maxZoom: 16 },
      },
      stadia_alidade_smooth: {
        dark: {
          url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
          attribution:
            '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
          options: { maxZoom: 20 },
        },
        light: {
          url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
          attribution:
            '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
          options: { maxZoom: 20 },
        },
      },
      Esri_WorldStreetMap: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
        options: { maxZoom: 20 },
      },
      Esri_WorldTopoMap: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        attribution:
          "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
        options: { maxZoom: 20 },
      },
      Esri_WorldImagery: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        options: { maxZoom: 20 },
      },
      Esri_WorldGrayCanvas: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        options: { maxZoom: 16 },
      },
      usgs: {
        us_imagery_topo: {
          url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}",
          attribution:
            'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
          options: { maxZoom: 20 },
        },
      },
    }),
    [],
  );
  const [dateRangeMode, setDateRangeMode] = useState<string>("7day");
  const [dateRangeStart, setDateRangeStart] = useState<string>(
    moment().startOf("day").subtract(7, "days").format("YYYY-MM-DD"),
  );
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("");
  const [finishedDataLoad, setFinishedDataLoad] = useState<boolean>(false);
  const [activeTouchEvent, setActiveTouchEvent] = useState<boolean>(false);
  const [chartColourPalette, setChartColourPalette] =
    useState<string>("bright");
  const [d3ColourScale, setD3ColourScale] = useState<any>(
    d3.scaleOrdinal(d3.schemeCategory10),
  );

  const handleMode = (event: any) => {
    const selectedMode = event.target.value;
    setMapMode(selectedMode);
  };
  useEffect(() => {
    initialLoad();
    // Empty dependency array, so this function only run once during init
  }, []);

  const getChartColour = (disease_name: string) => {
    return clusterColors[disease_name];
  };

  const getClusterColours = () => {
    //assigns a unique and random color to each disease/syndrome
    const total_disease_syndrome: { [key: string]: string } = {};
    mapDiseases.map((el: any) => {
      if (el.name != "ALL DISEASES") {
        total_disease_syndrome[el.name] = "";
      }
    });
    mapSyndromes.map((el: any) => (total_disease_syndrome[el.name] = ""));

    const disease_syndrome_keys = Object.keys(total_disease_syndrome);

    const colors = randomcolor({
      count: disease_syndrome_keys.length,
      luminosity: chartColourPalette,
      format: "rgb",
      seed: 1,
    });

    for (let i = 0; i < disease_syndrome_keys.length; i++) {
      total_disease_syndrome[disease_syndrome_keys[i]] = colors[i];
    }

    setClusterColors(total_disease_syndrome);

    switch (chartColourPalette) {
      case "bright":
        setD3ColourScale(d3.scaleOrdinal(d3.schemeCategory10));
        break;
      case "light":
        setD3ColourScale(d3.scaleOrdinal(d3.schemePastel1));
        break;
      case "dark":
        setD3ColourScale(d3.scaleOrdinal(d3.schemeDark2));
        break;
    }

    // force the d3 scale to be in the order of the legend, not in the order of usage in pie charts
    for (const index in selectedDiseasesSyndromesFilter) {
      getChartColour(selectedDiseasesSyndromesFilter[index]);
    }
    // console.log(this.selected_diseases_syndromes_filter)
  };

  const d3_pie_chart_data = (cluster: any) => {
    // console.log("Cluster has", cluster.getChildCount(), "children");
    // creates donut chart marker for clusters
    const clusterMarkers = cluster.getAllChildMarkers();

    const counts: any = {};

    const populate_donut_counts = (marker_points: any, names: any) => {
      Object.keys(marker_points).forEach((el) => {
        if (names.includes(el.toLowerCase())) {
          if (counts[el.toLowerCase()] == undefined) {
            counts[el.toLowerCase()] = marker_points[el];
          } else {
            counts[el.toLowerCase()] += marker_points[el];
          }
        }
      });
    };

    // loop through markers of given cluster
    // counts the number of reports of each filtered disease/syndrome across the cluster
    // also keeps track of the cluster's combined report count
    let selected_disease_names = [];
    if (selectedDiseasesFilter[0] == "ALL DISEASES") {
      selected_disease_names = diseases.map((disease: any) => {
        if (disease.name != "ALL DISEASES") return disease.name;
      });
    } else {
      selected_disease_names = [...selectedDiseasesFilter];
    }
    for (const clusterMarker of clusterMarkers) {
      const markerDiseases = clusterMarker.options.data_object.diseases;
      const markerSyndromes = clusterMarker.options.data_object.syndromes;
      populate_donut_counts(markerDiseases, selected_disease_names);
      populate_donut_counts(markerSyndromes, selectedSyndromesFilter);
    }

    const offsets = [];
    let total = 0;
    const sorted_counts_keys = Object.keys(counts).sort();
    sorted_counts_keys.forEach((key) => {
      offsets.push(total);
      total += counts[key];
    });
    // const pie_data = [];
    const pie_data: Array<{ label: string; count: unknown }> = [];
    for (const [key, value] of Object.entries(counts)) {
      pie_data.push({ label: key, count: value });
    }

    const fontSize =
      total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
    const radius =
      total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
    const width = radius * 2 * svgHoverScale; // leave some space for the highlighted sections to "pop out"
    const height = width;

    const svgDom = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
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
      .value(function (d: any) {
        return d.count;
      }) // how to extract the numerical data from each entry in our dataset
      .sort(null); // by default, data sorts in oescending value. this will mess with our animation so we set it to null

    // creating the chart
    svg
      .selectAll("path") // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
      .data(pie(pie_data as any)) //associate dataset wit he path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
      .enter() //creates placeholder nodes for each of the values
      .append("path") // replace placeholders with path elements
      .attr("d", arc as any) // define d attribute with arc function above
      // .attr('fill', function(d) { return color(d.data.label); }) // use color scale to define fill of each label in dataset
      .attr("fill", function (d: any) {
        return getChartColour(d.data.label);
      })
      .style("pointer-events", "auto")
      .attr("class", "cluster-mouse-events")
      .attr("data-label", function (d: any) {
        return d.data.label;
      })
      .attr("data-count", function (d: any) {
        return d.data.count;
      });

    svg
      .append("circle")
      .attr("fill", "black")
      .attr("opacity", "0.5")
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

    const chartHTML = svgDom.outerHTML;

    return chartHTML;
  };

  const d3_pie_chart_icon_size = (cluster: any) => {
    const clusterMarkers = cluster.getAllChildMarkers();
    const counts: any = {};

    const populate_donut_counts = (marker_points: any, names: any) => {
      Object.keys(marker_points).forEach((el) => {
        if (names.includes(el)) {
          if (counts[el] == undefined) {
            counts[el] = marker_points[el];
          } else {
            counts[el] += marker_points[el];
          }
        }
      });
    };

    let selected_disease_names = [];
    if (selectedDiseasesFilter[0] == "ALL DISEASES") {
      selected_disease_names = diseases.map((disease: any) => {
        if (disease.name != "ALL DISEASES") return disease.name;
      });
    } else {
      selected_disease_names = [selectedDiseasesFilter];
    }

    for (const clusterMarker of clusterMarkers) {
      const marker_diseases = clusterMarker.options.data_object.diseases;
      const marker_syndromes = clusterMarker.options.data_object.syndromes;
      populate_donut_counts(marker_diseases, selected_disease_names);
      populate_donut_counts(marker_syndromes, selectedSyndromesFilter);
    }

    const offsets = [];
    let total = 0;
    const sorted_counts_keys = Object.keys(counts).sort();
    sorted_counts_keys.forEach((key) => {
      offsets.push(total);
      total += counts[key];
    });
    const radius =
      total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
    const width = radius * 2 * svgHoverScale;
    const height = width;

    return L.point(width, height);
  };

  const addCountryGeojson = (
    feature: any,
    tempContinents: any,
    tempGeojsonByCountry: any,
    tempCountryOutlineByCountry: any,
  ) => {
    const continentName = feature.properties.continent;
    const countryName = feature.properties.name;
    const isoName = feature.properties.iso_a3;
    tempContinents[continentName]["countries"].push(countryName);
    tempGeojsonByCountry[isoName] = feature;
    tempCountryOutlineByCountry[isoName] = L.geoJSON(feature, {
      style: { color: "#ffff00" },
    });
  };

  const applyAllDiseaseFilter = () => {
    setSelectedDiseases(["ALL DISEASES"]);
  };

  const applyDiseaseSyndromeFilter = () => {
    setSelectedDiseasesFilter([...selectedDiseases]);
    setSelectedSyndromesFilter([...selectedSyndromes]);

    let selected_disease_names = [];
    if (selectedDiseasesFilter[0] == "ALL DISEASES") {
      selected_disease_names = diseases.map((disease: any) => disease.name);
    } else {
      selected_disease_names = [...selectedDiseasesFilter];
    }

    setSelectedDiseasesSyndromesFilter(
      [...selected_disease_names, ...selectedSyndromesFilter].sort(),
    );

    doApiUpdate();
  };

  // Searches through the regions and returns which region the country is in.
  // eg : find_region("AUS") -> "Oceania"
  // return false if country is not found in any region
  const findRegion = (iso_a3: string) => {
    for (const [key, value] of Object.entries(regions)) {
      if (String(value).includes(iso_a3)) return key;
    }
    return false;
  };

  const getTooltipHtml = (country: any) => {
    let final_string =
      "<b>" + country.country_name + " (" + country.iso3 + ")" + "</b><br />";
    final_string += "<i>" + country.report_count;
    if (country.report_count === 1) final_string += " report</i><br />";
    else final_string += " reports</i><br />";
    // final_string += country.diseases.join('<br/>')
    return final_string;
  };

  const clearCountryOutlines = () => {
    const tempCountryOutlineByCountry = countryOutlineByCountry;
    for (const key in countryOutlineByCountry) {
      tempCountryOutlineByCountry[key].remove();
    }
    setCountryOutlineByCountry(tempCountryOutlineByCountry);
  };

  const markerMouseover = (event: any) => {
    if (event.target.options.data_object.iso3 in countryOutlineByCountry) {
      countryOutlineByCountry[event.target.options.data_object.iso3].addTo(
        mainMap.current,
      );
    } else {
      console.log("Not found " + event.target.options.data_object.iso3);
    }
  };

  const markerMouseout = () => {
    clearCountryOutlines();
  };

  const clearPieChartToolTip = () => {
    pieChartTooltip?.current.setAttribute("style", "display:none");
  };

  const addSvgListeners = () => {
    const svgPathElements = document.getElementsByClassName(
      "cluster-mouse-events",
    );
    const eventEnter = (event: any, element: any, touch: any) => {
      const touchElement = touch
        ? document.elementFromPoint(
            event.touches[0].pageX,
            event.touches[0].pageY,
          )
        : null;
      element.setAttribute("transform", "scale(" + svgHoverScale + ")");
      let posTop, posLeft;
      if (touch) {
        posTop = event.touches[0].clientY - 120 + "px"; // always 10px below the cursor
        posLeft = event.touches[0].clientX + 10 + "px"; // always 10px below the cursor
      } else {
        // posTop = this.mobile ? event.clientY - 50 + "px" : event.clientY - 50 + "px";
        // posLeft = this.mobile ? event.clientX + "px" : event.clientX - 240 + "px";
        posTop = event.clientY - 50 + "px";
        posLeft = event.clientX - 240 + "px";
      }
      element.setAttribute("stroke", "white");
      element.setAttribute("stroke-width", "2px");
      pieChartTooltip.current.setAttribute(
        "style",
        "display:block; top:" + posTop + "; left:" + posLeft,
      );
      pieChartTooltip.current.querySelector(".label").innerHTML =
        "<b>" + element.getAttribute("data-label") + "</b>";
      if (element.getAttribute("data-count") === "1") {
        pieChartTooltip.current.querySelector(".count").innerHTML =
          "<i>" + element.getAttribute("data-count") + " report</i>";
      } else {
        pieChartTooltip.current.querySelector(".count").innerHTML =
          "<i>" + element.getAttribute("data-count") + " reports</i>";
      }
    };
    const eventExit = (event: any, element: any) => {
      element.setAttribute("transform", "scale(1)");
      element.setAttribute("stroke", "none");

      pieChartTooltip.current.setAttribute("style", "display:none");
    };
    // console.log(svgPathElements)
    for (const svgPathElement of svgPathElements) {
      let touchElement: any = null;
      svgPathElement.addEventListener("mouseover", (event) => {
        if (!activeTouchEvent) {
          // console.log("mouseover");
          eventEnter(event, event.target, false);
        }
      });
      svgPathElement.addEventListener("mouseout", (event) => {
        if (!activeTouchEvent) {
          // console.log("mouseout")
          eventExit(event, event.target);
        }
      });
      svgPathElement.addEventListener("mousemove", (event) => {
        if (!activeTouchEvent) {
          // console.log("mousemove");
          eventEnter(event, event.target, false);
        }
      });
      svgPathElement.addEventListener("touchstart", (event) => {
        setActiveTouchEvent(true);
        // console.log("touchstart");
        eventEnter(event, event.target, true);
        mainMap.current.dragging.disable();
      });
      svgPathElement.addEventListener("touchend", (event) => {
        setActiveTouchEvent(false);
        // console.log("touchend");
        eventExit(event, touchElement);
        mainMap.current.dragging.enable();
      });
      svgPathElement.addEventListener("touchcancel", (event) => {
        setActiveTouchEvent(false);
        // console.log("touchcancel");
        eventExit(event, touchElement);
        mainMap.current.dragging.enable();
      });
      svgPathElement.addEventListener("touchmove", (event: any) => {
        // console.log("touchmove");
        setActiveTouchEvent(true);
        let element = touchElement;
        element = !element ? event.target : element;
        if (
          element !==
          document.elementFromPoint(
            event.touches[0].pageX,
            event.touches[0].pageY,
          )
        ) {
          eventExit(event, element);
          const currTouchElement = document.elementFromPoint(
            event.touches[0].pageX,
            event.touches[0].pageY,
          ) as any;
          if (currTouchElement.classList.contains("cluster-mouse-events")) {
            touchElement = currTouchElement;
          }
        } else {
          eventEnter(event, element, true);
        }
        mainMap.current.dragging.disable();
      });
    }
  };

  const cluster_anim_end = () => {
    addSvgListeners();
    clearCountryOutlines();
    clearPieChartToolTip();
  };

  const createMarkersClusters = async () => {
    console.log("create clusters");

    mapData.forEach((country: any) => {
      if (!country.iso3) return null;
      let lat, lon;
      if (country.iso3 in geojsonByCountry) {
        // Find the "pole of inaccessibility" for each country, as per https://github.com/mapbox/polylabel
        let pos;
        if (geojsonByCountry[country.iso3]["geometry"]["type"] === "Polygon") {
          // If the country id defined by a single polygon, find the "centre" of that polygon
          pos = polylabel(
            geojsonByCountry[country.iso3]["geometry"]["coordinates"],
          );
        } else if (
          geojsonByCountry[country.iso3]["geometry"]["type"] === "MultiPolygon"
        ) {
          // Otherwise if the country is defined my a multipolygon, find the centre of each of those polygons,
          // and then use the one that has the largest "distance"
          let max_dist = 0;
          // console.log("MULTI");
          for (const element of geojsonByCountry[country.iso3]["geometry"][
            "coordinates"
          ]) {
            const test_polylabel = polylabel(element) as any;
            if (test_polylabel["distance"] > max_dist) {
              pos = test_polylabel;
              max_dist = pos["distance"];
            }
          }
        }
        lat = pos[1];
        lon = pos[0];
      } else {
        lat = country.lat;
        lon = country.long;
      }

      const marker = L.marker(new L.LatLng(lat, lon), {
        data_object: country,
      } as any);

      const region = findRegion(country.iso3);
      if (region) regionalMarkerClusters[region].addLayer(marker);

      // adding to group, not directly to map any more
      // marker.addTo(mainMap.current);
      marker.on("mouseover", markerMouseover);
      marker.on("mouseout", markerMouseout);
      // marker.on("dblclick", this.marker_doubleclick);
      marker.bindTooltip(getTooltipHtml(country));
    });

    //  await sleep(3000);

    for (const key in regionalMarkerClusters) {
      regionalMarkerClusters[key].addTo(mainMap.current);
      regionalMarkerClusters[key].on("animationend", cluster_anim_end);
    }

    getClusterColours();
  };

  const doApiUpdate = () => {
    if (finishedDataLoad) {
      setFinishedDataLoad(false);
      // TODO: call for map data here
      // console.log("regions", regions);
      for (const region in regions) {
        regionalMarkerClusters[region].clearLayers();
      }
      createMarkersClusters();
      setFinishedDataLoad(true);
    }
  };

  const clusterMouseover = (event: any) => {
    event.layer.getAllChildMarkers().forEach((child: any) => {
      if (child.options.data_object.iso3 in countryOutlineByCountry) {
        countryOutlineByCountry[child.options.data_object.iso3].addTo(
          mainMap.current,
        );
      }
    });
  };

  useEffect(() => {
    if (regions["Africa"]) {
      const tempRegionalMarkerClusters: any = {};
      for (const key in regions) {
        const cluster = L.markerClusterGroup(clusterOptions);
        // cluster.on("clustermouseover", this.cluster_mouseover);
        // cluster.on("clustermouseout", this.cluster_mouseout);
        tempRegionalMarkerClusters[key] = cluster;
      }
      setRegionalMarkerClusters(tempRegionalMarkerClusters);
    }
  }, [regions, clusterOptions]);

  const loadGeojson = async () => {
    setRegions(
      await (await fetch(process.env.NEXT_PUBLIC_API_URL + "/regions")).json(),
    );

    const world_data = await (
      await fetch(process.env.NEXT_PUBLIC_API_URL + "/world_data")
    ).json();
    const tempContinents = {
      Africa: { countries: [] },
      Asia: { countries: [] },
      Europe: { countries: [] },
      "North America": { countries: [] },
      Oceania: { countries: [] },
      "South America": { countries: [] },
    };
    const tempGeojsonByCountry = {};
    const tempCountryOutlineByCountry = {};
    world_data["features"].forEach((worldFeature: any) =>
      addCountryGeojson(
        worldFeature,
        tempContinents,
        tempGeojsonByCountry,
        tempCountryOutlineByCountry,
      ),
    );

    setContinents(tempContinents);
    setGeojsonByCountry(tempGeojsonByCountry);
    setCountryOutlineByCountry(tempCountryOutlineByCountry);
  };

  const loadSyndromes = async () => {
    const syndromeData = await (
      await fetch(process.env.NEXT_PUBLIC_API_URL + "/syndrome")
    ).json();
    const tempSyndromes = syndromeData.map((el: any) => {
      const new_syndrome_name = el["syndrome"].toLowerCase();
      const new_syndrome_obj = {
        ...el,
        name: new_syndrome_name,
        syndrome: new_syndrome_name,
      };
      return new_syndrome_obj;
    });
    setSyndromes(tempSyndromes);
    setMapSyndromes(tempSyndromes);
  };

  const loadDiseases = async () => {
    const diseaseData = await (
      await fetch(process.env.NEXT_PUBLIC_API_URL + "/disease")
    ).json();
    const tempDiseases = diseaseData.map((el: any) => {
      const new_disease_name = el["disease"].toLowerCase();
      const new_disease_obj = {
        ...el,
        name: new_disease_name,
        disease: new_disease_name,
      };
      return new_disease_obj;
    });
    setDiseases(tempDiseases);
    tempDiseases.unshift({ name: "ALL DISEASES" });
    setMapDiseases(tempDiseases);
  };

  const initialLoad = async () => {
    await loadGeojson();
    await loadSyndromes();
    await loadDiseases().then(() => {
      setFinishedDataLoad(true);
    });
  };

  useEffect(() => {
    applyDiseaseSyndromeFilter();
  }, [diseases]);

  const currentTile = (tileProviders as any)[currentTileProvider];

  return (
    <div>
      <div>
        <ToggleButtonGroup
          color="primary"
          value={mapMode}
          exclusive
          onChange={handleMode}
          aria-label="Platform"
        >
          <ToggleButton value="0">ReportMap</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div>
        {mapDiseases.length == 0 && <h1>Loading...please wait</h1>}
        {!finishedDataLoad && <h1>data loading ... </h1>}

        {/*{finishedDataLoad === true && (*/}
        {/*    */}
        {/*)}*/}
        <div>
          <MapContainer
            ref={mainMap}
            center={center as any}
            zoom={zoom}
            maxZoom={16}
            scrollWheelZoom={false}
            worldCopyJump={true}
            className={styles.reportMap}
          >
            <TileLayer
              attribution={currentTile["attribution"]}
              url={currentTile["url"]}
              // options={currentTile["options"]}
            />
          </MapContainer>

          {/* The pie chart tooltip that shows when you hover over slices in the pie chart */}
          <div
            className="leaflet-container leaflet-tooltip leaflet-tooltip-pane pie-chart-tooltip"
            ref={pieChartTooltip}
          >
            <div className="label">label</div>
            <div className="count">count</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportMap;
