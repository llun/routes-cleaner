import Decimal from "decimal.js";

export interface Coordinate {
  x: Decimal;
  y: Decimal;
}

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

export function getLineWithoutDuplicate(activity: Streams) {
  return activity.latlng.data
    .map(([x, y]) => ({ x: new Decimal(y), y: new Decimal(x) } as Coordinate))
    .filter((position, index, array) => {
      if (index < 1) return true;
      return distance(position, array[index - 1]) > 0;
    });
}

export function distance(c1: Coordinate, c2: Coordinate) {
  return Decimal.sqrt(
    Decimal.pow(c2.x.minus(c1.x), new Decimal(2)).plus(
      Decimal.pow(c2.y.minus(c1.y), new Decimal(2))
    )
  ).toNumber();
}
