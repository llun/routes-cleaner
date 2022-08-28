#!/usr/bin/env ts-node
import { kdTree } from "kd-tree-javascript";
import fs from "fs";
import path from "path";
import { Coordinate, distance, getLineWithoutDuplicate } from "../libs/map";
import Decimal from "decimal.js";

const ride1 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/netherlands/7648883160.json"),
    "utf8"
  )
);
const ride2 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/netherlands/7660086787.json"),
    "utf8"
  )
);

const set = new Set();
const tree = new kdTree([], distance, ["x", "y"]);
const line1 = getLineWithoutDuplicate(ride1);
const line2 = getLineWithoutDuplicate(ride2);

const LINES_CACHE = "cache.line.json";
let lines = [] as Coordinate[][];
try {
  fs.statSync(path.join(__dirname, LINES_CACHE));
  lines = JSON.parse(
    fs.readFileSync(path.join(__dirname, LINES_CACHE), "utf-8")
  );
} catch {
  let skip = 0;
  let currentLine = [] as Coordinate[];
  for (const p of line1) {
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
      console.log(skip, currentLine.length);
      if (currentLine.length > 15) {
        lines.push(currentLine);
      }
      currentLine = [];
    }
  }
  if (currentLine.length) {
    console.log(currentLine.length);
    lines.push(currentLine);
  }
  fs.writeFileSync(path.join(__dirname, LINES_CACHE), JSON.stringify(lines));
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
      color: colors[index],
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
