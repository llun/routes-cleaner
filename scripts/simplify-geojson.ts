#!/usr/bin/env ts-node
import simplify from "simplify-js";
import fs from "fs";
import path from "path";

const json = JSON.parse(
  fs.readFileSync(path.join(__dirname, "geojson.json"), "utf8")
);
const { features } = json;
for (const feature of features) {
  const { geometry } = feature;
  const { coordinates } = geometry;
  const simplifyCoordinate = simplify(
    coordinates.map(([x, y]) => ({ x, y })),
    0.00001,
    true
  ).map(({ x, y }) => [x, y]);
  geometry.coordinates = simplifyCoordinate;
}
fs.writeFileSync(
  path.join(__dirname, "geojson.simplify.json"),
  JSON.stringify(json)
);
