import test from 'node:test';
import assert from 'node:assert/strict';
import { getApproach } from './bus-route.ts';

const path = [[38.23, 21.71], [38.235, 21.72], [38.24, 21.73], [38.245, 21.74], [38.25, 21.75]];
const stops = [0, 2, 3, 4].map(index => ({
  code: String(index), name: `Stop ${index}`, latitude: path[index][0], longitude: path[index][1],
}));

test('the approach starts at the bus and ends at the selected stop, excluding the rest of the route', () => {
  const bus = [38.2375, 21.725];
  const approach = getApproach(bus, path, stops, '3');
  assert.ok(approach);
  assert.deepEqual(approach.path, [bus, path[2], path[3]]);
  assert.deepEqual(approach.stops.map(stop => stop.code), ['2', '3']);
});

test('a bus on the final segment only highlights the part remaining before the stop', () => {
  const bus = [38.2425, 21.735];
  const approach = getApproach(bus, path, stops, '3');
  assert.ok(approach);
  assert.deepEqual(approach.path, [bus, path[3]]);
});

test('no approach is drawn backwards to a stop the bus has already passed', () => {
  assert.equal(getApproach([38.2475, 21.745], path, stops, '3'), null);
});

test('off-route GPS data does not create a misleading approach path', () => {
  assert.equal(getApproach([38.3, 21.8], path, stops, '3'), null);
});
