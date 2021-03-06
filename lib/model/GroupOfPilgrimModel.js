import _ from 'lodash';
import math from 'mathjs';

import { Smooth } from './smooth';

// can only use require due to incorrect export in d3-random
const d3 = require('d3-random');

export default class GroupOfPilgrimModel {
  // name === 'Kaaba'
  // route : randomly one route in Kaaba
  // groupSize : size of point
  constructor(name, rawRoute, { groupSize }) {
    this.pathScore = 100;

    // generate different tracks
    const numOfTracks = math.round(groupSize / 2);
    const trackList = this._generateTrackPath(numOfTracks, rawRoute);

    // interpolate
    this.routeList = trackList.map(track => ({
      track,
      smooth: this._interpolatePilgrimRoutes(track),
      people: [],
    }));

    this.forwardFunction = (() => {
      const forwardUnit = 0.12;
      const r = d3.randomNormal(forwardUnit, forwardUnit * 0.08);
      return () => math.max(0, math.min(forwardUnit * 1.3, r()));
    })();

    // dispatch group into different tracks
    // but should not far for each other
    const centraCoefficient = 20;  // in loop
    const coefficientRandom = d3.randomNormal(centraCoefficient, 0.15);
    for (let i = 0; i < groupSize; i += 1) {
      const route = this.routeList[math.randomInt(0, numOfTracks)];
      const p = {
        coefficient: math.max(0, coefficientRandom()),
        id: i,
      };
      route.people.push(p);
    }
  }

  _generateTrackPath(numOfTrack, route) {
    const locationDeviation = 0.0002 / 2.5;
    const tracks = _.fill(Array(numOfTrack), 0).map(() =>
      route.map(location => [
        d3.randomNormal(location[0], locationDeviation)(),
        d3.randomNormal(location[1], locationDeviation)()
      ])
    );
    return tracks;
  }

  _interpolatePilgrimRoutes(route) {
    const path = Smooth(route, {
      method: Smooth.METHOD_CUBIC,
      // clip: Smooth.CLIP_PERIODIC,
    }, { scaleTo: this.pathScore });
    return path;
  }

  refresh() {
    this.routeList.forEach((route) => {
      route.people.forEach((p) => {
        const nextP = p;
        if (math.abs(nextP.coefficient - 100) > 0.5) {
          nextP.coefficient = math.min(100, nextP.coefficient + this.forwardFunction());
        } else {
          nextP.coefficient += math.random(-0.05, 0.05);
        }
      });
    });
  }

  getPilgrimGroups() {
    const group = {};
    _.flatMap(
      this.routeList,
      route =>
        route.people.forEach((p) => {
          group[p.id] =
          { location: route.smooth(p.coefficient) };
        })
    );
    return group;
  }
}
