import { DateYMDString } from "./date";

export type InfoCardProps = {
  onClick: () => void,
  imageStyle: string,
  title: string,
  content: string
}

interface MapIllness {
  [index: string]: number;
}

export type MapMarkerData = {
  country: string;
  iso3: string;
  lat: string;
  long: string;
  report_count: number;
  illness: MapIllness;
};

export enum MapState {
  INITIAL_LANG_LOAD = "INITIAL_LANG_LOAD",
  INITIAL_DATA_LOAD = "INITIAL_DATA_LOAD",
  FINISHED_INITIAL_DATA_LOAD = "FINISHED_INITIAL_DATA_LOAD",
  APPLY_DISEASE_SYNDROME_FILTER = "APPLY_DISEASE_SYNDROME_FILTER",
  LOAD_MAP_DATA = "LOAD_MAP_DATA",
  FINISHED_LOAD_MAP_DATA = "FINISHED_LOAD_MAP_DATA",
  CREATE_MARKERS_CLUSTERS = "CREATE_MARKERS_CLUSTERS",
  FINISHED_FILTER_APPLY = "FINISHED_FILTER_APPLY",
  IDLE = "IDLE",
}

export enum MenuMapBackground {
  Esri_WorldStreetMap = "Esri_WorldStreetMap",
  Esri_WorldTopoMap = "Esri_WorldTopoMap",
  Esri_WorldImagery = "Esri_WorldImagery",
  Esri_WorldGrayCanvasLight = "Esri_WorldGrayCanvasLight",
  Esri_WorldGrayCanvasDark = "Esri_WorldGrayCanvasDark",
}

export type MenuMapBackgroundType = keyof typeof MenuMapBackground;

export interface Subregions {
  [index: string]: string[];
}

export type MapCountry = {
  country_name: string;
  iso3: string;
  lat: string;
  long: string;
  report_count: number;
  filter_term: IllnessInLocations;
  diseases: IllnessInLocations;
  syndromes: IllnessInLocations;
};

export interface IllnessInLocations {
  [index: string]: number | undefined;
}

export type Country = {
  id: string;
  country_name: string;
  iso3: string;
  iso2?: string | null;
  lat: number;
  long: number;
  subregion: string;
  region: string;
};

export type Disease = {
  id?: string;
  disease: string;
  active: boolean;
  name?: string;
  colour: string;
};

export type Syndrome = {
  id?: string;
  syndrome: string;
  active: boolean;
  name?: string;
  colour: string;
};

export type Report = {
  id: number;
  diseases?: string | null;
  syndromes?: string | null;
  location: string;
  date: DateYMDString;
};

export interface DiseaseInLocations {
  [index: string]: number;
}

interface DiseasesInDay {
  [index: string]: number;
}

export interface DiseasesInRange {
  [index: string]: DiseasesInDay | null;
}

export interface IllnessesInRegion {
  [index: string]: number;
}

export interface BarChartDatasetsItem {
  labels: string;
  data: Array<number>;
  backgroundColor?: string;
}
export interface BarChartProps {
  title: string;
  labels: Array<string>;
  datasets: Array<BarChartDatasetsItem>;
}

export interface BarChartLegendItem {
  backgroundColor?: string;
  label: string;
}
export interface BarChartLegendProps {
  data: Array<BarChartLegendItem>;
}

export interface PieChartDatasetsItem {
  data: Array<number>;
  backgroundColor?: Array<string>;
}

export interface PieChartProps {
  title: string;
  subTitle: string;
  labels: Array<string>;
  datasets: Array<PieChartDatasetsItem>;
}

// dataUtils type
export interface CheckArrayType {
  label: string;
  count: number;
  backgroundColor: string;
}

export interface SelectionType {
  label: string;
  color: string;
}

export interface InputDataType {
  [key: string]: unknown;
}

export interface OutputDataType {
  [key: string]: null | InputDataType;
}

export interface Top10DiseasesType {
  id: number;
  disease: string;
  num: number;
}

export interface RegionType {
  [key: string]: Array<string>;
}

export interface ClusterType {
  [key: string]: string;
}

export interface PieType {
  label: string;
  count: number;
}

export type Props = {
  children?: JSX.Element | JSX.Element[];
};

export interface MapDataType {
  [key: string | number]: string | number | object | boolean;
}
export interface PieType {
  label: string;
  count: number;
}
