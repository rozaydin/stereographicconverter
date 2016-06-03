/**
 * Created by rozaydin on 5/31/16.
 */

var StereographicConverter = require("./converter.js");

StereographicConverter.initializeReferencePoint(0.6842127, 0.57929886);
var res = StereographicConverter.convertStereoToGeodetic(134363.675558622, -264800.542034547);
console.log(res);