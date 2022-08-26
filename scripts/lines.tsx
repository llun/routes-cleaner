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

const newLine = [] as Coordinate[];
let skip = 0;
for (const p of line1) {
  const [nearest] = tree.nearest(p, 1);
  if (!nearest) {
    tree.insert(p);
    newLine.push(p);
    skip = 0;
    continue;
  }
  const [, distance] = nearest;
  if (new Decimal(distance).greaterThan(new Decimal(0.0001))) {
    tree.insert(p);
    newLine.push(p);
    skip = 0;
    continue;
  }
  skip++;
  console.log(nearest, skip);
}
