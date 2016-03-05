/* global d3, topojson */

/**
 * A globe at the images location.
 */
backgrounds.Globe = new Model({
  options: {
    size: 80,
    selector: '.content__location__globe'
  },

  /**
   * Initialize
   * @param  {object} options The model options
   */
  init: function(options) {
    this.options = options || this.options;

    this.data_ = backgrounds.GlobeData;
    this.current_ = [0, 0];
    this.$pointer = document.querySelector('.content__location__globe__pointer');
    this.projection_ = d3.geo.orthographic()
      .scale(this.options.size / 2)
      .translate([this.options.size / 2, this.options.size / 2])
      .clipAngle(90)
      .rotate([-this.current_[0], -this.current_[1]]);

    this.path_ = d3.geo.path()
      .projection(this.projection_);

    this.svg_ = d3.select(this.options.selector).append('svg')
      .attr('width', this.options.size)
      .attr('height', this.options.size);

    this.world_ = this.svg_.append('path');

    this.world_
      .datum(
        topojson.feature(
          this.data_,
          this.data_.objects.land
        )
      )
      .attr('class', 'land');

    this.paths_ = this.svg_.selectAll('path');
  },

  /**
   * Converts a degree to a radian.
   * @param {Number} degree A degree of an angle.
   * @return {Number} returns the radian of the angle.
   */
  toRad: function(degree) {
    return degree * Math.PI / 180;
  },

  /**
   * Calculates the distance between two points.
   * @param {Number} lat1 latitude of the first point.
   * @param {Number} lon1 longitude of the first point.
   * @param {Number} lat2 latitude of the second point.
   * @param {Number} lon2 longitude of the second point.
   * @return {Number} Distance in meter.
   */
  distance: function (lat1, lon1, lat2, lon2) {
    var dLat = this.toRad(lat2 - lat1),
      dLon = this.toRad(lon2 - lon1),
      a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  /**
   * Set the photos position as the globes position.
   * @param {Object} photo The photo position to set
   */
  set: function(photo) {
    var lat = photo.lat,
      lng = photo.lng,
      from, to,
      diff,
      distance,
      duration;

    this.$pointer.classList.add('content__location__globe__pointer--hidden');

    this.old = this.current_;
    this.current_ = [lng, lat];

    from = [this.old[0], this.old[1]];
    to = this.current_;

    diff = from[0] - to[0];

    if (diff > 180) {
      from[0] -= 360;
    } else if (diff < -180) {
      from[0] += 360;
    }


    distance = this.distance(from[1], from[0], to[1], to[0]);
    duration = Math.max(distance * 1500, 500);

    d3.transition()
      .duration(duration)
      .tween('rotation', function() {
        return function(t) {
          var lat1 = from[1],
            lng1 = from[0],
            lat2 = to[1],
            lng2 = to[0],
            lat3 = lat1 + (lat2 - lat1) * t,
            lng3 = lng1 + (lng2 - lng1) * t;

          this.projection_.rotate([-lng3, -lat3]);
          this.paths_.attr('d', this.path_);
        }.bind(this);
      }.bind(this))
      .each('end', function() {
        this.$pointer.classList
          .remove('content__location__globe__pointer--hidden');
      }.bind(this));
  }
});
