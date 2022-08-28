import mapboxgl, { LineLayer } from "mapbox-gl";
import React, { FC, useEffect, useRef } from "react";
import { Streams } from "./map";

import "mapbox-gl/dist/mapbox-gl.css";
import styles from "../styles/Home.module.css";

import reduceJson from "../scripts/geojson.json";

const MAPBOX_PUBLIC_KEY =
  "pk.eyJ1IjoibGx1biIsImEiOiJja2FqN2k2djIwNDU5MnlvNjR4YXRrMzFsIn0.Oir7SYHkVKBlgbPHldtRGQ";

interface Props {
  rides: Streams[];
}

const getGeoJSON = (
  streams: Streams,
  color: string
): GeoJSON.Feature<GeoJSON.Geometry> => ({
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: streams.latlng.data.map(([x, y]) => [y, x]),
  },
  properties: {
    name: "ride",
    color,
  },
});

const getLayer = (id: string, width: number = 2): LineLayer => ({
  id,
  type: "line",
  source: id,
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": ["get", "color"],
    "line-width": width,
  },
});

export const RideMap: FC<Props> = (props) => {
  const { rides } = props;
  const mapEl = useRef<HTMLDivElement>(null);
  mapboxgl.accessToken = MAPBOX_PUBLIC_KEY;

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      center: [4.902218907700037, 52.37208643243944],
      zoom: 10,
      minZoom: 6.8,
    });
    map.on("load", async () => {
      map.addSource("ride", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [getGeoJSON(rides[0], "red")],
        },
      });
      map.addSource("reduce", {
        type: "geojson",
        data: reduceJson as any,
      });
      console.log(reduceJson);
      // map.addLayer(getLayer("ride"));
      map.addLayer(getLayer("reduce", 4));
    });
  });

  return <div ref={mapEl} id="map" className={styles.map} />;
};
