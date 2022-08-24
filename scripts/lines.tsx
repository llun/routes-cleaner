#!/usr/bin/env ts-node
import { kdTree } from "kd-tree-javascript";
import fs from "fs";
import path from "path";
import { distance, getLineWithoutDuplicate } from "../libs/map";

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

const tree = new kdTree(getLineWithoutDuplicate(ride1), distance, ["x", "y"]);
const line2 = getLineWithoutDuplicate(ride2);
for (const c of line2) {
  console.log(tree.nearest(c, 1));
}
