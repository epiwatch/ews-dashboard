export type Country = {
  id: string,
  country_name: string,
  iso3: string,
  iso2?: string | null,
  latitude: number,
  longitude: number
}

export type Disease = {
  id?: string,
  disease: string,
  active: boolean
}

export type Syndrome = {
  id?: string,
  syndrome: string,
  active: boolean
}

export interface DiseaseInLocations {
  [index: string]: number
}

interface DiseasesInDay {
  [index: string]: number
}

export interface DiseasesInRange {
  [index: string]: DiseasesInDay | null
}

export interface IllnessesInRegion {
  [index: string]: number
}


export interface BarChartDatasetsItem {
  labels: string,
  data: Array<number>,
  backgroundColor?: string
}
export interface BarChartProps {
  title: string,
  labels: Array<string>,
  datasets: Array<BarChartDatasetsItem>
}

export interface BarChartLegendItem {
  backgroundColor?: string,
  label: string
}
export interface BarChartLegendProps {
  data: Array<BarChartLegendItem>,
}

export interface PieChartDatasetsItem {
  data: Array<number>,
  backgroundColor?: Array<string>
}

export interface PieChartProps {
  title: string,
  subTitle: string,
  labels: Array<string>,
  datasets: Array<PieChartDatasetsItem>
}

// dataUtils type
export interface CheckArrayType {
  label: string,
  count: number,
  backgroundColor: string
}

export interface SelectionType {
  label: string,
  color: string
}

export interface InputDataType {
  [key: string]: number | null
}
