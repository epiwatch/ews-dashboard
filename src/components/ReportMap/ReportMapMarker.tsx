import { MapMarkerData } from "@/types";
import L from "leaflet";

export class ReportMapMarker extends L.Marker {
  data!: MapMarkerData;

  constructor(
    latLng: L.LatLngExpression,
    data: MapMarkerData,
    options?: L.MarkerOptions,
  ) {
    super(latLng, options);
    this.setData(data);
  }

  getData() {
    return this.data;
  }

  setData(data: MapMarkerData) {
    this.data = data;
  }
}
