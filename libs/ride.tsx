import mapboxgl, { GeoJSONSourceRaw, LineLayer } from "mapbox-gl";
import React, { FC, useEffect, useRef } from "react";

import "mapbox-gl/dist/mapbox-gl.css";
import styles from "../styles/Home.module.css";

const MAPBOX_PUBLIC_KEY =
  "pk.eyJ1IjoibGx1biIsImEiOiJja2FqN2k2djIwNDU5MnlvNjR4YXRrMzFsIn0.Oir7SYHkVKBlgbPHldtRGQ";

export type LatLng = [number, number];

export interface LatLngStream {
  data: LatLng[];
  series_type: "distance";
  original_size: number;
  resolution: "low" | "medium" | "high";
}

export interface DistanceNumberStream {
  data: number;
  series_type: "distance";
  original_size: number;
  resolution: "low" | "medium" | "high";
}

export interface Streams {
  latlng: LatLngStream;
  distance: DistanceNumberStream;
  altitude: DistanceNumberStream;
}

interface Props {
  rides: Streams[];
}

const getGeoJSON = (streams: Streams): GeoJSONSourceRaw => ({
  type: "geojson",
  data: {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: streams.latlng.data.map(([x, y]) => [y, x]),
    },
    properties: {
      name: "ride",
    },
  },
});

const getLayer = (id: string, color: string): LineLayer => ({
  id,
  type: "line",
  source: id,
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": color,
    "line-width": 2,
  },
});

export const RideMap: FC<Props> = (props) => {
  const { rides } = props;
  const mapEl = useRef<HTMLDivElement>(null);
  mapboxgl.accessToken = MAPBOX_PUBLIC_KEY;

  useEffect(() => {
    const zoomLevel = (height?: number) => {
      switch (height) {
        case 250:
          return 6.8;
        case 400:
          return 7;
        default:
          return 7.25;
      }
    };

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      center: [4.902218907700037, 52.37208643243944],
      zoom: zoomLevel(mapEl?.current?.offsetHeight),
      minZoom: 6.8,
    });
    map.on("load", async () => {
      map.addSource("last-ride", getGeoJSON(rides[0]));
      map.addSource("before-last-ride", getGeoJSON(rides[1]));
      map.addLayer(getLayer("last-ride", "red"));
      map.addLayer(getLayer("before-last-ride", "blue"));
    });
  });

  return <div ref={mapEl} id="map" className={styles.map} />;
};
