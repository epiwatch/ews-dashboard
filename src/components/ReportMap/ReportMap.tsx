import L, {
  LatLngExpression,
  LeafletEvent,
  Map,
  MarkerClusterGroupOptions,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import styles from "../../styles/Map.module.css";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  Ref,
  useCallback,
} from "react";
import Control from "./Control";
import { MapContainer, TileLayer, ZoomControl, AttributionControl } from "react-leaflet";
import polylabel from "polylabel";
import worldDataJson from "./jsons/world_low.json";
import dayjs, { Dayjs } from "dayjs";
import {
  ClusterType,
  Country,
  Disease,
  MapDataType,
  MapMarkerData,
  MapState,
  MenuMapBackground,
  MenuMapBackgroundType,
  RegionType,
  Syndrome,
} from "@/types";
import IllnessFilter from "./IllnessFilter";
import { d3_pie_chart_data, d3_pie_chart_icon_size } from "./ClusterMarker";
import { FetchDataDateFormat } from "../utils/constant";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Image from "next/image";
import { ReportMapMarker } from "./ReportMapMarker";
import { useTranslation } from "react-i18next";
import { checkLang } from "../utils/dataUtils";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const randomcolor = require("randomcolor");

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/marker-icon-2x.png",
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
});

function ReportMap() {
  const { t, i18n } = useTranslation();

  const [allDiseases, setAllDiseases] = useState<Disease | null>(null);
  const [currMapState, setCurrMapState] = useState(MapState.INITIAL_LANG_LOAD);
  const mainMap = useRef<Map | undefined>(null);
  const pieChartTooltip = useRef<HTMLDivElement>(null);
  const zoom = 3;
  const center: number[] = [48, -1.219482];
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [syndromes, setSyndromes] = useState<Syndrome[]>([]);
  const [mapDiseases, setMapDiseases] = useState<Disease[]>([]);
  const [mapSyndromes, setMapSyndromes] = useState<Syndrome[]>([]);
  const [regions, setRegions] = useState<RegionType>({});
  const [clusterColors, setClusterColors] = useState<ClusterType>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const clusterColorsRef = useRef(clusterColors);
  const [regionalMarkerClusters, setRegionalMarkerClusters] = useState<object>(
    {},
  );
  const [mapData, setMapData] = useState<MapDataType[]>([]);

  const [selectedDiseases, setSelectedDiseases] = useState<Disease[]>([]);
  const [selectedSyndromes, setSelectedSyndromes] = useState<Syndrome[]>([]);
  const [selectedDiseasesFilter, setSelectedDiseasesFilter] = useState<
    string[]
  >([]);
  const selectedDiseasesFilterRef = useRef(selectedDiseasesFilter);
  const [selectedSyndromesFilter, setSelectedSyndromesFilter] = useState<
    string[]
  >([]);
  const selectedSyndromesFilterRef = useRef(selectedSyndromesFilter);
  const [selectedDiseasesSyndromesFilter, setSelectedDiseasesSyndromesFilter] =
    useState<Array<string | undefined>>([]);

  const [countryOutlineByCountry, setCountryOutlineByCountry] =
    useState<object>({});
  const [geojsonByCountry, setGeojsonByCountry] = useState<object>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTileProvider, setCurrentTileProvider] =
    useState<MenuMapBackgroundType>(MenuMapBackground.Esri_WorldImagery);
  const [continents, setContinents] = useState<object>({});
  const svgHoverScale = 1.2;

  const tileProviders = useMemo(
    () => ({
      Esri_WorldGrayCanvasDark: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        options: { maxZoom: 16 },
      },
      Esri_WorldGrayCanvasLight: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        options: { maxZoom: 16 },
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
    }),
    [],
  );
  const [dateRangeStart, setDateRangeStart] = useState<Dayjs | null>(
    dayjs().subtract(7, "days"),
  );
  const [dateRangeEnd, setDateRangeEnd] = useState<Dayjs | null>(dayjs());
  const [activeTouchEvent, setActiveTouchEvent] = useState<boolean>(false);
  const chartColourPalette = "bright";
  const [legendExpanded, setLegendExpanded] = useState<boolean>(true);

  const clusterOptions = useMemo(
    () => ({
      iconCreateFunction: function (cluster: never) {
        return L.divIcon({
          html: d3_pie_chart_data(
            cluster,
            selectedDiseasesFilterRef,
            selectedSyndromesFilterRef,
            svgHoverScale,
            getChartColour,
          ),
          className: "cluster-div2",
          iconSize: d3_pie_chart_icon_size(
            cluster,
            selectedDiseasesFilterRef,
            selectedSyndromesFilterRef,
            svgHoverScale,
          ),
        });
      },
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
    }),
    [],
  );

  const getChartColour = (disease_name: string) => {
    return clusterColorsRef.current[disease_name];
  };

  const addCountryGeojson = (
    feature: object,
    tempContinents: object,
    tempGeojsonByCountry: object,
    tempCountryOutlineByCountry: object,
  ) => {
    const continentName = Object(feature).properties.continent;
    const countryName = Object(feature).properties.name;
    const isoName = Object(feature).properties.iso_a3;
    Object(tempContinents)[continentName]["countries"].push(countryName);
    Object(tempGeojsonByCountry)[isoName] = feature;
    Object(tempCountryOutlineByCountry)[isoName] = L.geoJSON(Object(feature), {
      style: { color: "#ffff00" },
    });
  };

  const applyDiseaseSyndromeFilter = useCallback(() => {
    setSelectedDiseasesFilter([]);
    setSelectedSyndromesFilter([]);
    setSelectedDiseasesSyndromesFilter([]);
    setCurrMapState(MapState.APPLY_DISEASE_SYNDROME_FILTER);

    let selected_disease_names: string[] = [];
    if (selectedDiseases[0] && allDiseases !== null && selectedDiseases[0].disease == allDiseases.disease) {
      selected_disease_names = diseases.map((disease: Disease) =>
        disease.name !== undefined && disease.name !== allDiseases.name
          ? disease.name
          : "",
      );
    } else {
      selected_disease_names = selectedDiseases.map((v: Disease) =>
        v.name !== undefined ? v.name : v.disease,
      );
    }
    const selected_syndrome_names = selectedSyndromes.map((v: Syndrome) =>
      v.name !== undefined ? v.name : v.syndrome,
    );
    selectedDiseasesFilterRef.current = selected_disease_names;
    selectedSyndromesFilterRef.current = selected_syndrome_names;

    setSelectedDiseasesFilter(selected_disease_names);
    setSelectedSyndromesFilter(selected_syndrome_names);
    setSelectedDiseasesSyndromesFilter(
      [...selected_disease_names, ...selected_syndrome_names].sort(),
    );
  }, [diseases, selectedDiseases, selectedSyndromes]);

  // Searches through the regions and returns which region the country is in.
  // eg : find_region("AUS") -> "Oceania"
  // return false if country is not found in any region
  const findRegion = useCallback(
    (iso_a3: string) => {
      for (const [key, value] of Object.entries(regions)) {
        if (String(value).includes(iso_a3)) return key;
      }
      return false;
    },
    [regions],
  );

  const getTooltipHtml = (country: MapMarkerData) => {
    let final_string =
      "<b>" + country.country + " (" + country.iso3 + ")" + "</b><br />";
    final_string += "<i>" + country.report_count;
    if (country.report_count === 1) final_string += ` ${t("map.report_tag")}</i><br />`;
    else final_string += ` ${t("map.reports_tag")}</i><br />`;

    return final_string;
  };

  const clearCountryOutlines = useCallback(() => {
    const tempCountryOutlineByCountry = countryOutlineByCountry;
    for (const key in countryOutlineByCountry) {
      Object(tempCountryOutlineByCountry)[key].remove();
    }
    setCountryOutlineByCountry(tempCountryOutlineByCountry);
  }, [countryOutlineByCountry]);

  const markerMouseover = useCallback(
    (event: LeafletEvent) => {
      if (
        event.target.getData().iso3 in countryOutlineByCountry &&
        mainMap.current !== null
      ) {
        Object(countryOutlineByCountry)[event.target.getData().iso3].addTo(
          mainMap.current,
        );
      } else {
        console.log("Not found " + event.target.getData().iso3);
      }
    },
    [countryOutlineByCountry],
  );

  const markerMouseout = useCallback(() => {
    clearCountryOutlines();
  }, [clearCountryOutlines]);

  const clearPieChartToolTip = () => {
    if (pieChartTooltip.current !== null) {
      pieChartTooltip.current.setAttribute("style", "display:none");
    }
  };

  const addSvgListeners = useCallback(() => {
    const svgPathElements = document.getElementsByClassName(
      "cluster-mouse-events",
    );
    const eventEnter = (event: TouchEvent, element: Element) => {
      element.setAttribute("transform", "scale(" + svgHoverScale + ")");
      const posTop = Object(event).clientY - 110 + "px";
      const posLeft = Object(event).clientX - 60 + "px";
      element.setAttribute("stroke", "white");
      element.setAttribute("stroke-width", "2px");
      if (pieChartTooltip.current) {
        pieChartTooltip.current?.setAttribute(
          "style",
          "display:block; top:" + posTop + "; left:" + posLeft,
        );

        const labelEle = pieChartTooltip.current?.querySelector(".label");
        if (!labelEle) {
          throw new ReferenceError("label not found.");
        }
        labelEle.innerHTML =
          "<b>" + element.getAttribute("data-label") + "</b>";

        if (element.getAttribute("data-count") === "1") {
          const countEle = pieChartTooltip.current.querySelector(".count");

          if (!countEle) {
            throw new ReferenceError("count not found.");
          }
          countEle.innerHTML =
            "<i>" + element.getAttribute("data-count") + ` ${t("map.report_tag")}</i>`;
        } else {
          const secCountEle = pieChartTooltip.current.querySelector(".count");
          if (!secCountEle) {
            throw new ReferenceError("count not found.");
          }
          secCountEle.innerHTML =
            "<i>" + element.getAttribute("data-count") + ` ${t("map.reports_tag")}</i>`;
        }
      }
    };
    const eventExit = (_event: Event, element: Element) => {
      element.setAttribute("transform", "scale(1)");
      element.setAttribute("stroke", "none");

      if (pieChartTooltip?.current !== null) {
        pieChartTooltip.current?.setAttribute("style", "display:none");
      }
    };
    for (const svgPathElement of svgPathElements) {
      let touchElement: EventTarget | null = null;
      svgPathElement.addEventListener("mouseover", (event) => {
        if (!activeTouchEvent) {
          eventEnter(Object(event), Object(event.target));
        }
      });
      svgPathElement.addEventListener("mouseout", (event) => {
        if (!activeTouchEvent) {
          eventExit(event, Object(event.target));
        }
      });
      svgPathElement.addEventListener("mousemove", (event) => {
        if (!activeTouchEvent) {
          eventEnter(Object(event), Object(event.target));
        }
      });
      svgPathElement.addEventListener("touchstart", (event) => {
        setActiveTouchEvent(true);
        eventEnter(Object(event), Object(event.target));

        if (mainMap.current !== null) {
          mainMap.current?.dragging.disable();
        }
      });
      svgPathElement.addEventListener("touchend", (event) => {
        setActiveTouchEvent(false);
        eventExit(event, Object(touchElement));
        if (mainMap.current !== null) {
          mainMap.current?.dragging.enable();
        }
      });
      svgPathElement.addEventListener("touchcancel", (event) => {
        setActiveTouchEvent(false);
        eventExit(event, Object(touchElement));
        if (mainMap.current !== null) {
          mainMap.current?.dragging.enable();
        }
      });
      svgPathElement.addEventListener("touchmove", (event) => {
        setActiveTouchEvent(true);
        let element = touchElement;
        element = !element !== null ? element : event.target;
        if (
          element !==
          document.elementFromPoint(
            Object(event).touches[0].pageX,
            Object(event).touches[0].pageY,
          )
        ) {
          eventExit(event, Object(element));
          const currTouchElement = document.elementFromPoint(
            Object(event).touches[0].pageX,
            Object(event).touches[0].pageY,
          ) as Element;
          if (currTouchElement.classList.contains("cluster-mouse-events")) {
            touchElement = currTouchElement;
          }
        } else {
          eventEnter(Object(event), Object(element));
        }
        if (mainMap.current !== null) {
          mainMap.current?.dragging.disable();
        }
      });
    }
  }, [activeTouchEvent]);

  const cluster_anim_end = useCallback(() => {
    addSvgListeners();
    clearCountryOutlines();
    clearPieChartToolTip();
  }, [addSvgListeners, clearCountryOutlines]);

  const refreshMarkerClusters = useCallback(() => {
    for (const key in regionalMarkerClusters) {
      Object(regionalMarkerClusters)[key].refreshClusters();
    }
  }, [regionalMarkerClusters]);

  const createMarkersClusters = useCallback(() => {
    mapData.forEach((countryMapData: MapDataType) => {
      const country = countries.find(
        (e: Country) =>
          e.iso3 == countryMapData.iso3 ||
          e.country_name == countryMapData.country,
      );
      if (country == null) return null;
      let lat, lon;
      if (String(country.iso3) in geojsonByCountry) {
        // Find the "pole of inaccessibility" for each country, as per https://github.com/mapbox/polylabel
        let pos: (string | number)[] = [];
        if (
          Object(geojsonByCountry)[String(country.iso3)]["geometry"]["type"] ===
          "Polygon"
        ) {
          // If the country id defined by a single polygon, find the "centre" of that polygon
          pos = polylabel(
            Object(geojsonByCountry)[String(country.iso3)]["geometry"][
              "coordinates"
            ],
          );
        } else if (
          Object(geojsonByCountry)[String(country.iso3)]["geometry"]["type"] ===
          "MultiPolygon"
        ) {
          // Otherwise if the country is defined my a multipolygon, find the centre of each of those polygons,
          // and then use the one that has the largest "distance"
          let max_dist = 0;
          for (const element of Object(geojsonByCountry)[String(country.iso3)][
            "geometry"
          ]["coordinates"]) {
            const test_polylabel = polylabel(element) as number[] & {
              distance: number;
            };
            if (test_polylabel["distance"] > max_dist) {
              pos = test_polylabel;
              max_dist = Object(pos)["distance"];
            }
          }
        }
        lat = pos[1];
        lon = pos[0];
      } else {
        lat = country.lat;
        lon = country.long;
      }
      const countryMarkerData: unknown = {
        ...countryMapData,
        country: country.country_name,
        iso3: country.iso3,
        lat: country.lat,
        long: country.long,
      };

      const marker = new ReportMapMarker(
        new L.LatLng(Number(lat), Number(lon)),
        countryMarkerData as MapMarkerData,
      );

      const region = findRegion(String(country.iso3));
      if (region !== false) {
        Object(regionalMarkerClusters)[region].addLayer(marker);
      }

      // adding to group, not directly to map any more
      marker.on("mouseover", markerMouseover);
      marker.on("mouseout", markerMouseout);
      marker.bindTooltip(getTooltipHtml(countryMarkerData as MapMarkerData));
    });

    for (const key in regionalMarkerClusters) {
      Object(regionalMarkerClusters)[key].addTo(mainMap.current);
      Object(regionalMarkerClusters)[key].on("animationend", cluster_anim_end);
    }
    refreshMarkerClusters();
    addSvgListeners();
    setCurrMapState(MapState.IDLE);
  }, [
    cluster_anim_end,
    countries,
    findRegion,
    geojsonByCountry,
    mapData,
    markerMouseout,
    markerMouseover,
    refreshMarkerClusters,
    regionalMarkerClusters,
  ]);

  const getUrlParams = useCallback(() => {
    let urlParams = "";
    const dateStr = (date: Dayjs) => dayjs(date).format(FetchDataDateFormat);
    const selectedDiseasesIds = selectedDiseases.map((el) => el.id);
    const selectedSyndromesIds = selectedSyndromes.map((el) => el.id);

    const illnessStr = (
      illnessIdStr: string,
      selectedIllnesses: (string | undefined)[],
    ) => `&${illnessIdStr}=` + selectedIllnesses.join(`&${illnessIdStr}=`);
    urlParams = `&start_date=${dateRangeStart ? dateStr(dateRangeStart) : ""
    }&end_date=${dateRangeEnd ? dateStr(dateRangeEnd) : ""}`;
    if (selectedDiseases.length > 0 && allDiseases !== null && selectedDiseases[0].disease !== allDiseases.disease) {
      urlParams += illnessStr("disease_list", selectedDiseasesIds);
    }
    if (selectedSyndromes.length > 0) {
      urlParams += illnessStr("syndrome_list", selectedSyndromesIds);
    }
    return urlParams;
  }, [dateRangeEnd, dateRangeStart, selectedDiseases, selectedSyndromes]);

  const loadMapData = useCallback(
    () =>
      Promise.resolve(
        fetch(process.env.NEXT_PUBLIC_API_URL + `/map?lang=${i18n.language}${getUrlParams()}`)
          .then((res) => {
            if (res && res.status === 200) {
              return res.json();
            } else {
              return null;
            }
          })
          .then((obj) => {
            if (obj !== null) {
              setMapData(obj.country_list);
              setCurrMapState(MapState.FINISHED_LOAD_MAP_DATA);
            }
          }),
      ),
    [getUrlParams],
  );

  const loadCountries = () =>
    Promise.resolve(
      fetch(process.env.NEXT_PUBLIC_API_URL + `/countries?lang=${i18n.language}`)
        .then((res) => {
          if (res && res.status === 200) {
            return res.json();
          } else {
            return null;
          }
        })
        .then((obj) => {
          if (obj !== null && obj.length > 0) {
            setCountries(obj);
          }
        }),
    );

  useEffect(
    function doApiUpdate() {
      if (
        currMapState == MapState.APPLY_DISEASE_SYNDROME_FILTER &&
        (selectedDiseases[0] && allDiseases !== null && selectedDiseases[0].disease == allDiseases.disease
          ? selectedDiseasesFilter.length == diseases.length
          : selectedDiseasesFilter.length == selectedDiseases.length) &&
        selectedSyndromesFilter.length == selectedSyndromes.length &&
        selectedDiseasesSyndromesFilter.length > 0
      ) {
        setMapData([]);
        setCurrMapState(MapState.LOAD_MAP_DATA);
        for (const region in regions) {
          Object(regionalMarkerClusters)[region].clearLayers();
        }
        loadMapData();
      }
    },
    [
      selectedSyndromesFilter,
      selectedDiseasesSyndromesFilter,
      currMapState,
      diseases,
      loadMapData,
      regionalMarkerClusters,
      regions,
      selectedDiseases,
      selectedDiseasesFilter,
      selectedSyndromes,
    ],
  );

  const clusterMouseover = useCallback(
    (event: LeafletEvent) => {
      event.propagatedFrom
        .getAllChildMarkers()
        .forEach((child: ReportMapMarker) => {
          if (child.getData().iso3 in countryOutlineByCountry) {
            Object(countryOutlineByCountry)[child.getData().iso3].addTo(
              mainMap.current,
            );
          }
        });
    },
    [countryOutlineByCountry],
  );

  const clusterMouseout = useCallback(() => {
    clearCountryOutlines();
  }, [clearCountryOutlines]);

  const initializeLanguage = () => {
    checkLang(i18n);
    const allDiseasesObj: Disease = {
      id: "0",
      disease: t("map.all_diseases_upper"),
      active: true,
      name: t("map.all_diseases_upper"),
      colour: "",
    };
    setAllDiseases(allDiseasesObj);
    setSelectedDiseases([allDiseasesObj]);
  };

  const loadGeojson = useCallback(
    () =>
      Promise.resolve(
        fetch(process.env.NEXT_PUBLIC_API_URL + "/regions")
          .then((res) => {
            if (res && res.status === 200) {
              return res.json();
            } else {
              return null;
            }
          })
          .then((obj) => {
            if (obj !== null) {
              setRegions(obj);
              const world_data = worldDataJson as GeoJSON.FeatureCollection;
              const tempContinents = {
                "Africa": { countries: [] },
                "Asia": { countries: [] },
                "Europe": { countries: [] },
                "North America": { countries: [] },
                "Oceania": { countries: [] },
                "South America": { countries: [] },
              };
              const tempGeojsonByCountry = {};
              const tempCountryOutlineByCountry = {};

              world_data["features"].forEach((worldFeature: GeoJSON.Feature) =>
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
            }
          }),
      ),
    [],
  );

  const loadSyndromes = () =>
    Promise.resolve(
      fetch(process.env.NEXT_PUBLIC_API_URL + `/syndrome?lang=${i18n.language}`)
        .then((res) => {
          if (res && res.status === 200) {
            return res.json();
          } else {
            return null;
          }
        })
        .then((obj) => {
          if (obj !== null && obj.length > 0) {
            const tempSyndromes = obj.map((el: Syndrome) => {
              const new_syndrome_name = el["syndrome"].toLowerCase();
              return {
                ...el,
                name: new_syndrome_name,
                syndrome: new_syndrome_name,
              };
            });
            setSyndromes(tempSyndromes);
            setMapSyndromes(tempSyndromes);
          }
        }),
    );

  const loadDiseases = () =>
    Promise.resolve(
      fetch(process.env.NEXT_PUBLIC_API_URL + `/disease?lang=${i18n.language}`)
        .then((res) => {
          if (res && res.status === 200) {
            return res.json();
          } else {
            return null;
          }
        })
        .then((obj) => {
          if (obj !== null && obj.length > 0) {
            const filterDiseases = obj.filter((el: Disease) => el["disease"] !== undefined && el["disease"] !== null);
            const tempDiseases = filterDiseases.map((el: Disease) => {
              const new_disease_name = el["disease"].toLowerCase();
              return {
                ...el,
                name: new_disease_name,
                disease: new_disease_name,
              };
            });

            setDiseases(tempDiseases);
            tempDiseases.unshift(allDiseases);
            setMapDiseases(tempDiseases);
          }
        }),
    );

  const loadClusterColours = useCallback(() => {
    //assigns a unique and random color to each disease/syndrome
    const total_disease_syndrome: { [key: string]: string } = {};
    mapDiseases.forEach((el: Disease) => {
      if (allDiseases !== null && el.name !== allDiseases.name && el.name != null) {
        total_disease_syndrome[el.name] = "";
      }
    });

    mapSyndromes.forEach((el: Syndrome) => {
      if (el.name != null) {
        total_disease_syndrome[el.name] = "";
      }
    });

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
    clusterColorsRef.current = total_disease_syndrome;

    // force the d3 scale to be in the order of the legend, not in the order of usage in pie charts
    for (const index in selectedDiseasesSyndromesFilter) {
      getChartColour(String(selectedDiseasesSyndromesFilter[index]));
    }
  }, [mapDiseases, mapSyndromes, selectedDiseasesSyndromesFilter]);

  const highlightPinsWithReport = (illness: string) => {
    const goldIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    for (const i in regionalMarkerClusters) {
      const regionMarkers = Object(regionalMarkerClusters)[i].getLayers();
      for (const element of regionMarkers) {
        if (
          element ===
          Object(regionalMarkerClusters)[i].getVisibleParent(element)
        ) {
          const diseases_and_syndromes: string[] = [];
          Object.keys(element.getData().illness).map((el) =>
            diseases_and_syndromes.push(el.toLowerCase()),
          );
          if (diseases_and_syndromes.indexOf(illness) >= 0) {
            element.setIcon(goldIcon);
          }
        }
      }
    }
  };

  const unhighlightPins = () => {
    const blueIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    for (const i in regionalMarkerClusters) {
      const regionMarkers = Object(regionalMarkerClusters)[i].getLayers();
      for (let j = 0; j < regionMarkers.length; j++) {
        regionMarkers[j].setIcon(blueIcon);
      }
    }
  };

  const legendMouseover = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    target.setAttribute("style", "font-weight:bold");

    // highlight all the SVG path elements for the disease
    const svgPathElements = document.getElementsByClassName(
      "cluster-mouse-events",
    );
    for (const element of svgPathElements) {
      if (element.getAttribute("data-label") === target.textContent) {
        element.setAttribute("stroke", "white");
        element.setAttribute("transform", "scale(" + svgHoverScale + ")");
      }
    }
    highlightPinsWithReport(target.textContent as string);
  };

  const legendMouseout = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    target.setAttribute("style", "");
    const svgPathElements = document.getElementsByClassName(
      "cluster-mouse-events",
    );
    for (const element of svgPathElements) {
      if (element.getAttribute("data-label") === target.textContent) {
        element.setAttribute("stroke", "none");
        element.setAttribute("transform", "scale(1)");
      }
    }
    unhighlightPins();
  };

  useEffect(
    function initialApplyDiseaseSyndromeFilter() {
      if (
        Object.entries(continents).length > 0 &&
        Object.entries(geojsonByCountry).length > 0 &&
        Object.entries(countryOutlineByCountry).length > 0 &&
        diseases.length > 0 &&
        mapDiseases.length > 0 &&
        syndromes.length > 0 &&
        mapSyndromes.length > 0 &&
        countries.length > 0 &&
        currMapState == MapState.INITIAL_DATA_LOAD
      ) {
        applyDiseaseSyndromeFilter();
      }
    },
    [
      continents,
      geojsonByCountry,
      countryOutlineByCountry,
      diseases,
      countries,
      mapDiseases,
      syndromes,
      mapSyndromes,
      currMapState,
      applyDiseaseSyndromeFilter,
    ],
  );

  useEffect(
    function applyClustersToMap() {
      if (currMapState == MapState.FINISHED_LOAD_MAP_DATA) {
        setCurrMapState(MapState.CREATE_MARKERS_CLUSTERS);
        createMarkersClusters();
        // setRegionalMarkerClusters(regionalMarkerClusters);
        // refreshMarkerClusters();
      }
    },
    [currMapState, createMarkersClusters],
  );

  useEffect(
    function initialLangLoad() {
      initializeLanguage();
    },
    []
  );

  useEffect(
    function startInitialLoad() {
      if (currMapState == MapState.INITIAL_LANG_LOAD &&
        selectedDiseases.length > 0 &&
        allDiseases !== null) {
        setCurrMapState(MapState.INITIAL_DATA_LOAD);
        loadGeojson();
        loadSyndromes();
        loadDiseases();
        loadCountries();
      }
    },
    [currMapState, selectedDiseases, allDiseases, loadGeojson],
  );

  useEffect(
    function initialLoadClusterColours() {
      if (
        currMapState == MapState.INITIAL_DATA_LOAD &&
        mapDiseases.length > 0 &&
        mapSyndromes.length > 0
      ) {
        loadClusterColours();
      }
    },
    [currMapState, mapDiseases, mapSyndromes, loadClusterColours],
  );

  useEffect(
    function initialRegionalMarkerClusters() {
      if (
        currMapState == MapState.INITIAL_DATA_LOAD &&
        Object.entries(regions).length > 0
      ) {
        const tempRegionalMarkerClusters: object = {};
        for (const key in regions) {
          const cluster = L.markerClusterGroup(
            clusterOptions as MarkerClusterGroupOptions,
          );
          cluster.on("clustermouseover", clusterMouseover);
          cluster.on("clustermouseout", clusterMouseout);
          Object(tempRegionalMarkerClusters)[key] = cluster;
        }
        setRegionalMarkerClusters(tempRegionalMarkerClusters);
      }
    },
    [currMapState, regions, clusterMouseover, clusterMouseout, clusterOptions],
  );

  const currentTile = Object(tileProviders)[currentTileProvider];
  let loading;
  if (currMapState !== MapState.IDLE) {
    loading = (
      <div className={styles.overlay}>
        <Image
          src="/loadingLogo.jpg"
          alt="Overlay Image"
          className={styles.animatedImage}
          width={150}
          height={60}
        />
      </div>
    );
  } else {
    loading = <div />;
  }

  return (
    <div className={`${styles.mapContainer} body-borderless`}>
      <div className={styles.mapWrapper}>
        <MapContainer
          ref={mainMap as Ref<Map>}
          center={center as LatLngExpression | undefined}
          zoom={zoom}
          maxZoom={currentTile["options"]["maxZoom"]}
          scrollWheelZoom={true}
          worldCopyJump={true}
          zoomControl={false}
          className={styles.reportMap}
          attributionControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution={currentTile["attribution"]}
            url={currentTile["url"]}
          />
          <AttributionControl position="bottomleft" />
          <Control position="topleft">
            <IllnessFilter
              {...{
                mapDiseases,
                mapSyndromes,
                selectedDiseases,
                setSelectedDiseases,
                selectedSyndromes,
                setSelectedSyndromes,
                applyDiseaseSyndromeFilter,
                allDiseases,
                dateRangeStart,
                dateRangeEnd,
                setDateRangeStart,
                setDateRangeEnd
              }}
            />
          </Control>
          <Control position="topright">
            <Accordion
              expanded={legendExpanded}
              onChange={() => setLegendExpanded(!legendExpanded)}
              sx={legendExpanded == false ? { width: "140px" } : null}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>{t("map.legend_tag")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={styles.legend}>
                  {selectedDiseasesSyndromesFilter.length > 0 &&
                    selectedDiseasesSyndromesFilter.map((name, index) => (
                      <span
                        style={{
                          display:
                            name == null ||
                              name == undefined ||
                              name.length == 0
                              ? "none"
                              : "block",
                        }}
                        key={`${name}-${index}`}
                      >
                        <div
                          onMouseOver={legendMouseover}
                          onMouseOut={legendMouseout}
                        >
                          <div
                            className={styles.legendDiseaseSyndrome}
                            style={{
                              backgroundColor: getChartColour(name as string),
                              pointerEvents: "none",
                            }}
                          />
                          <span
                            style={{ padding: "5px", pointerEvents: "none" }}
                          >
                            {name}
                          </span>
                        </div>
                      </span>
                    ))}
                  {selectedDiseasesSyndromesFilter.length <= 0 && (
                    <div>{t("map.no_filter_tag")}</div>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>
          </Control>
        </MapContainer>
        {loading}
        {/* The pie chart tooltip that shows when you hover over slices in the pie chart */}
        <div
          className={`leaflet-container leaflet-tooltip leaflet-tooltip-pane ${styles.pieChartTooltip}`}
          ref={pieChartTooltip}
        >
          <div className="label">label</div>
          <div className="count">count</div>
        </div>
      </div>
    </div>
  );
}

export default ReportMap;
