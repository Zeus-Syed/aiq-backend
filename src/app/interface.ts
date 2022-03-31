export interface Plant {
  name: string,
  latitude: number,
  longitude: number,
  facilityCode: number,
  netGeneration: number,
  percentage: string,
  plantState: string,
  filter: any
}

export interface Marker {
  position: coordinates,
  title: string,
  netGeneration: number,
  state: string,
  percentage: string,
}

export interface coordinates {
  lat: number,
  lng: number
}

export interface Info {
  title: string,
  netGeneration: number,
  state: string,
  percentage: string,
}

export interface MapOptions {
  mapTypeId: string,
  zoomControl: boolean,
  scrollwheel: boolean,
  disableDoubleClickZoom: boolean,
  maxZoom: number,
  minZoom: number,
}