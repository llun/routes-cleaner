#!/usr/bin/env ts-node
import { kdTree } from "kd-tree-javascript";
import fs from "fs";
import path from "path";
import { Coordinate, distance, getLineWithoutDuplicate } from "../libs/map";
import Decimal from "decimal.js";

const tree = new kdTree([], distance, ["x", "y"]);

function getCountry(country: "netherlands" | "singapore") {
  const countryPath = path.join(__dirname, `../data/${country}`);
  return fs
    .readdirSync(countryPath)
    .filter((item) => item.endsWith(".json"))
    .map((fileName) => {
      const filePath = path.join(countryPath, fileName);
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    });
}

function cleanLine(line: Coordinate[]) {
  const lines = [] as Coordinate[][];
  let skip = 0;
  let currentLine = [] as Coordinate[];
  for (const p of line) {
    const [nearest] = tree.nearest(p, 1);
    if (!nearest) {
      tree.insert(p);
      currentLine.push(p);
      skip = 0;
      continue;
    }
    const [, distance] = nearest;
    if (new Decimal(distance).greaterThan(new Decimal(0.0001))) {
      tree.insert(p);
      currentLine.push(p);
      skip = 0;
      continue;
    }
    skip++;
    if (skip > 15 && currentLine.length) {
      if (currentLine.length > 15) {
        console.log(skip, currentLine.length);
        lines.push(currentLine);
      }
      currentLine = [];
    }
  }
  if (currentLine.length) {
    console.log(currentLine.length);
    lines.push(currentLine);
  }
  return lines;
}

const country = getCountry("netherlands");
const lines = [] as Coordinate[][];
for (const ride of country) {
  lines.push(...cleanLine(getLineWithoutDuplicate(ride)));
}

const colors = [
  "#ff9500",
  "#eaff00",
  "#0dff00",
  "#00ffb7",
  "#00aeff",
  "#0d00ff",
  "#0d00ff",
  "#e600ff",
  "#948a03",
  "#245c02",
  "#025c59",
  "#540314",
  "#4a0a4a",
];

// Write geojson here
const features = lines.map((line, index) => {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: line.map(({ x, y }) => [
        new Decimal(x).toNumber(),
        new Decimal(y).toNumber(),
      ]),
    },
    properties: {
      name: "ride",
      color: colors[index] || colors[0],
    },
  };
});

const collection = {
  type: "FeatureCollection",
  features,
};
fs.writeFileSync(
  path.join(__dirname, "geojson.json"),
  JSON.stringify(collection)
);
