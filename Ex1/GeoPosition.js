"use strict";
 var GeoPosition = (function () {
    function GeoPosition(_latitude, _longitude) {
        this.Longitude = _longitude || 0;
        this.Latitude = _latitude || 0;
    }
    /**
     * Calculate distance in meters
     * @param pos Position 2
     */
    GeoPosition.prototype.Distance = function (pos) {
        // radius of the sphere (Earth)
        var rad = 6399594; //6384000; //6372795; in meters 
        // coordinates of two points
        var llat1 = this.Latitude;
        var llong1 = this.Longitude;
        var llat2 = pos.Latitude;
        var llong2 = pos.Longitude;
        // in radians
        var lat1 = llat1 * Math.PI / 180;
        var lat2 = llat2 * Math.PI / 180;
        var long1 = llong1 * Math.PI / 180;
        var long2 = llong2 * Math.PI / 180;
        // cosines and sines of latitudes and longitude differences
        var cl1 = Math.cos(lat1);
        var cl2 = Math.cos(lat2);
        var sl1 = Math.sin(lat1);
        var sl2 = Math.sin(lat2);
        var delta = long2 - long1;
        var cdelta = Math.cos(delta);
        var sdelta = Math.sin(delta);
        // calculating the length of a large circle
        var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
        var x = sl1 * sl2 + cl1 * cl2 * cdelta;
        var ad = Math.atan2(y, x);
        var dist = ad * rad;
        return dist; // in meters
    };
    /**
     * Is zero coordinates?
     */
    GeoPosition.prototype.IsZero = function () {
        return this.equals(GeoPosition.Zero);
    };
    /**
     * to string this object
     */
    GeoPosition.prototype.toString = function () {
        return "[" + this.Latitude + "(\u03C6), " + this.Longitude + "(\u03BB)]";
    };
    /**
     * equals objects
     * @param y second object
     */
    GeoPosition.prototype.equals = function (y) {
        if (typeof y != typeof this)
            return false;
        if (y === undefined)
            return false;
        return this.Latitude == y.Latitude && this.Longitude == y.Longitude;
    };
    /**
     * get hash code this object
     */
    GeoPosition.prototype.hashCode = function () {
        return (this.Longitude * 397) ^ this.Latitude;
    };
    /**
     * Is the current coordinate in the inside area
     * @param area area
     */
    GeoPosition.prototype.IsInsideArea = function (area) {
        var i;
        var angle = 0;
        var point1_lat;
        var point1_long;
        var point2_lat;
        var point2_long;
        var n = area.length;
        for (i = 0; i < n; i++) {
            point1_lat = area[i].Latitude - this.Latitude;
            point1_long = area[i].Longitude - this.Longitude;
            point2_lat = area[(i + 1) % n].Latitude - this.Latitude;
            point2_long = area[(i + 1) % n].Longitude - this.Longitude;
            angle += GeoPosition.Angle2D(point1_lat, point1_long, point2_lat, point2_long);
        }
        if (Math.abs(angle) < Math.PI)
            return false;
        else
            return true;
    };
    /**
     * Calculates center position from section
     * @param secStart section start position
     * @param secEnd section end position
     */
    GeoPosition.SectionCenterPosition = function (secStart, secEnd) {
        var min, max, longitude, latitude;
        min = Math.min(secStart.Longitude, secEnd.Longitude);
        max = Math.max(secStart.Longitude, secEnd.Longitude);
        longitude = min + (max - min) / 2;
        min = Math.min(secStart.Latitude, secEnd.Latitude);
        max = Math.max(secStart.Latitude, secEnd.Latitude);
        latitude = min + (max - min) / 2;
        return new GeoPosition(latitude, longitude);
    };
    /**
     * Calculates distance to section
     * @param point Point position
     * @param secStart section start position
     * @param secEnd section end position
     */
    GeoPosition.DistanceToSection = function (point, secStart, secEnd) {
        var secCenter = GeoPosition.SectionCenterPosition(secStart, secEnd);
        var a = point.Distance(secStart);
        var b = point.Distance(secEnd);
        var c = point.Distance(secCenter);
        var d = Math.min(a, b);
        d = Math.min(d, c);
        return d;
    };
    /**
     * Calculates distance to section (extension version)
     * @param point Point position
     * @param secStart section start position
     * @param secEnd section end position
     */
    GeoPosition.DistanceToSectionEx = function (point, secStart, secEnd) {
        var perp = GeoPosition.GetPerp(point, secStart, secEnd);
        if (perp != null)
            return point.Distance(perp);
        return GeoPosition.DistanceToSection(point, secStart, secEnd);
    };
    /**
     * Getting Perpendicular
     * @param point point
     * @param secStart section start position
     * @param secEnd section end position
     */
    GeoPosition.GetPerp = function (point, secStart, secEnd) {
        var xx = (secEnd.Longitude - secStart.Longitude);
        var yy = (secEnd.Latitude - secStart.Latitude);
        var shortestLength = ((xx * (point.Longitude - secStart.Longitude))
            + (yy * (point.Latitude - secStart.Latitude)))
            / ((xx * xx) + (yy * yy));
        var perp = new GeoPosition(secStart.Latitude + yy * shortestLength, secStart.Longitude + xx * shortestLength);
        if (perp.Longitude < secEnd.Longitude && perp.Longitude > secStart.Longitude &&
            perp.Latitude < secEnd.Latitude && perp.Latitude > secStart.Latitude)
            return perp;
        return null;
    };
    /**
     * Calculate Angle2D
     */
    GeoPosition.Angle2D = function (y1, x1, y2, x2) {
        var dtheta, theta1, theta2;
        theta1 = Math.atan2(y1, x1);
        theta2 = Math.atan2(y2, x2);
        dtheta = theta2 - theta1;
        while (dtheta > Math.PI)
            dtheta -= (Math.PI * 2);
        while (dtheta < -Math.PI)
            dtheta += (Math.PI * 2);
        return dtheta;
    };
    /**
     * Validate GSP position
     */
    GeoPosition.IsValidGpsCoordinate = function (latitude, longitude) {
        if (latitude > -90 && latitude < 90 && longitude > -180 && longitude < 180)
            return true;
        return false;
    };
    /**
     * Parse gps position
     */
    GeoPosition.GetGpsPosition = function (latitude, longitude) {
        switch (latitude[0]) {
            case 'N':
                latitude = latitude.replace(latitude.substring(0, 1), "");
                break;
            case 'S':
                latitude = latitude.replace('S', '-');
                break;
            default:
                throw new Error("Invalid latitude specified: " + latitude);
        }
        switch (longitude[0]) {
            case 'E':
                longitude = longitude.replace(longitude.substring(0, 1), "");
                break;
            case 'W':
                longitude = longitude.replace('W', '-');
                break;
            default:
                throw new Error("Invalid longitude specified: " + longitude);
        }
        return new GeoPosition(parseFloat(latitude.replace(',', '.')), parseFloat(longitude.replace(',', '.')));
    };
    /**
     * Zero value - ocean
     */
    GeoPosition.Zero = new GeoPosition(0, 0);
    return GeoPosition;
}());
module.exports= GeoPosition;