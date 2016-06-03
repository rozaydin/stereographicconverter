"use strict";

var deltaPosition,
    deltaLatitude,
    deltaLongitude;

var Xo = 0.0,
    Ao = 0.0,
    R = 0.0,
    n = 0.0,
    c = 0.0;

// WGS-84 constants
const WGS84_ES = 0.00669437999013,       // eccentricity squared, semi-major axis
    WGS84_EQUATORIAL_RADIUS = 6378137.0, // ellipsoid equatorial getRadius, in meters
    WGS84_POLAR_RADIUS = 6356752.3;      // ellipsoid polar getRadius, in meters

// WGS-84 constants
const a = 6378137.0,	// Semi-major axis
    b = 6356752.3142,	// Semi-minor axis
    f = 1 / (a / (a - b)),
    e = Math.sqrt(2 * f - f * f),
    k0 = 1.0;

const util = {
    calculateConformalCoordinates: function (latitude, longitude) {

        let p0 = a * (1 - e * e) / Math.pow(1 - e * e * Math.sin(latitude) * Math.sin(latitude), 1.5);
        let v0 = a / Math.pow(1 - e * e * Math.sin(latitude) * Math.sin(latitude), 0.5);

        R = Math.pow(p0 * v0, 0.5);
        n = Math.pow(1 + ( (e * e * Math.pow(Math.cos(latitude), 4)) / (1 - e * e) ), 0.5);

        let S1 = (1 + Math.sin(latitude)) / (1 - Math.sin(latitude));
        let S2 = (1 - e * Math.sin(latitude)) / (1 + e * Math.sin(latitude));
        let w1 = Math.pow(S1 * Math.pow(S2, e), n);

        c = ( n + Math.sin(latitude) ) * (1 - ((w1 - 1) / (w1 + 1))) / ( (n - Math.sin(latitude)) * (1 + ((w1 - 1) / (w1 + 1))));
        Xo = Math.asin((c * w1 - 1) / (c * w1 + 1));
        Ao = longitude;

    },
    convertStereoToGeodeticFalse: function (posX, posY) {

        let g = 2 * R * k0 * Math.tan(Math.PI / 4 - Xo / 2);
        let h = 4 * R * k0 * Math.tan(Xo) + g;
        let i = Math.atan(posX / (h + posY));
        let j = Math.atan(posX / (g - posY)) - i;
        let X = Xo + 2 * Math.atan(( posY - posX * Math.tan(j / 2) ) / ( 2 * R * k0 ));
        let longitude = (j + 2 * i) / n + Ao;
        let isometricLatitude = 0.5 * Math.log((1 + Math.sin(X)) / (c * (1 - Math.sin(X)) )) / n;
        let latitudeCurr = 2 * Math.atan(Math.pow(Math.E, isometricLatitude)) - Math.PI / 2;
        let isoLatitudeCurr = Math.log(Math.tan(latitudeCurr / 2 + Math.PI / 4) * Math.pow((1 - e * Math.sin(latitudeCurr)) / (1 + e * Math.sin(latitudeCurr)), e / 2));
        let latitude = latitudeCurr - (isoLatitudeCurr - isometricLatitude) * Math.cos(latitudeCurr) * (1 - e * e * Math.sin(latitudeCurr) * Math.sin(latitudeCurr)) / (1 - e * e);

        while (latitude - latitudeCurr > 0.005) {
            latitude = latitudeCurr - (isoLatitudeCurr - isometricLatitude) * Math.cos(latitudeCurr) * (1 - e * e * Math.sin(latitudeCurr) * Math.sin(latitudeCurr)) / (1 - e * e);
        }

        return {lat: latitude, lng: longitude, alt: 0.0};

    }
};

module.exports = {

    initializeReferencePoint: function (referenceLatitude, referenceLongitude) {

        util.calculateConformalCoordinates(referenceLatitude, referenceLongitude)

        deltaPosition = util.convertStereoToGeodeticFalse(0.0, 0.0)
        deltaLatitude = referenceLatitude - deltaPosition.lat
        deltaLongitude = referenceLongitude - deltaPosition.lng

    },
    convertStereoToGeodetic: function (posX, posY) {

        let g = 2 * R * k0 * Math.tan(Math.PI / 4 - Xo / 2);
        let h = 4 * R * k0 * Math.tan(Xo) + g;
        let i = Math.atan(posX / (h + posY));
        let j = Math.atan(posX / (g - posY)) - i;
        let X = Xo + 2 * Math.atan(( posY - posX * Math.tan(j / 2) ) / ( 2 * R * k0 ));
        let longitude = (j + 2 * i) / n + Ao;
        let isometricLatitude = 0.5 * Math.log((1 + Math.sin(X)) / (c * (1 - Math.sin(X)) )) / n;
        let latitudeCurr = 2 * Math.atan(Math.pow(Math.E, isometricLatitude)) - Math.PI / 2;
        let isoLatitudeCurr = Math.log(Math.tan(latitudeCurr / 2 + Math.PI / 4) * Math.pow((1 - e * Math.sin(latitudeCurr)) / (1 + e * Math.sin(latitudeCurr)), e / 2));
        let latitude = latitudeCurr - (isoLatitudeCurr - isometricLatitude) * Math.cos(latitudeCurr) * (1 - e * e * Math.sin(latitudeCurr) * Math.sin(latitudeCurr)) / (1 - e * e);

        while (latitude - latitudeCurr > 0.005) {
            latitude = latitudeCurr - (isoLatitudeCurr - isometricLatitude) * Math.cos(latitudeCurr) * (1 - e * e * Math.sin(latitudeCurr) * Math.sin(latitudeCurr)) / (1 - e * e);
        }

        return {lat: latitude + deltaLatitude, lng: longitude, alt: 0.0};

    }

};