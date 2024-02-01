/**
 * d3-simple-gauge.js | MIT license
 *
 * The code is based on this example (https://codepen.io/anon/pen/WKyXgr)
 * on CodePen and on this tutorial (https://jaketrent.com/post/rotate-gauge-needle-in-d3/).
 *
 * I refactored the code of the example to make it work with D3.js v5, and I restructured
 * the code to make it more flexible.
 *
 * Thanks to the original author for its work.
 */

import "d3-transition";
import { arc as d3Arc } from "d3-shape";
import { easeElastic } from "d3-ease";
import { range } from "d3-array";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";

const CONSTANTS = {
  BAR_WIDTH: 40,
  CHAR_INSET: 10,
  EASE_TYPE: easeElastic,
  NEEDLE_ANIMATION_DELAY: 0,
  NEEDLE_ANIMATION_DURATION: 3000,
  NEEDLE_RADIUS: 15,
  PAD_RAD: 0.05,
  SHOW_VALUE: false,
};

const percToDeg = (perc) => perc * 360;
const degToRad = (deg) => (deg * Math.PI) / 180;
const percToRad = (perc) => degToRad(percToDeg(perc));

/**
 * Defines the needle used in the gauge.
 */
class Needle {
  /**
   * Initializes a new instance of the Needle class.
   *
   * @param config                      The configuration to use to initialize the needle.
   * @param config.animationDelay       The delay in ms before to start the needle animation.
   * @param config.animationDuration    The duration in ms of the needle animation.
   * @param config.color                The color to use for the needle.
   * @param config.easeType             The ease type to use for the needle animation.
   * @param config.el                   The parent element of the needle.
   * @param config.length               The length of the needle.
   * @param config.percent              The initial percentage to use.
   * @param config.radius               The radius of the needle.
   * @param config.showValue            Whether to show the numerical value
   */
  constructor(config) {
    this._animationDelay = config.animationDelay;
    this._animationDuration = config.animationDuration;
    this._color = config.color;
    this._easeType = config.easeType;
    this._el = config.el;
    this._length = config.length;
    this._percent = config.percent;
    this._radius = config.radius;
    this._showValue = config.showValue;
    this._interval = config.interval;
    this._startAngle = config.startAngle;
    this._gaugeAngle = config.gaugeAngle;
    this._sectionsColors = config.sectionsColors;
    this._sectionsProportions = config.sectionsProportions;
    this._textSize = config.textSize;
    this._sectionsTextColours = config.sectionsTextColours;
    this._initialize();
  }

  /**
   * Updates the needle position based on the percentage specified.
   *
   * @param percent      The percentage to use.
   */
  update(percent) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this._el
      .transition()
      .delay(this._animationDelay)
      .ease(this._easeType)
      .duration(this._animationDuration)
      .selectAll(".needle")
      .tween("progress", function () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const thisElement = this;
        const delta = percent - self._percent;
        const initialPercent = self._percent;
        return function (progressPercent) {
          self._percent = initialPercent + progressPercent * delta;
          select(thisElement).attr("d", self._getPath(self._percent));
        };
      });

    //transition for the numerical value display
    this._el
      .transition()
      .delay(this._animationDelay)
      .ease(this._easeType)
      .duration(this._animationDuration)
      .selectAll(".value-label")
      .tween("progress", function () {
        return function () {
          var value =
            (self._interval[1] - self._interval[0]) * self._percent +
            self._interval[0];
          // var value = ((51 - 17) * self._percent) + 17;
          var text_colour;
          if (self._percent < 0) {
            text_colour = "white";
          } else {
            for (var i = 0; i < self._sectionsProportions.length; i++) {
              if (self._percent < self._sectionsCutoffs[i]) {
                text_colour = self._sectionsTextColours[i];
                break;
              }
            }
          }

          if (self._percent < 0) {
            select(this).text("--").attr("fill", text_colour);
          } else {
            select(this).text(Math.round(value)).attr("fill", text_colour);
          }
          self._el.select(".value-sublabel").attr("fill", text_colour);
        };
      });

    // transition the colour of the inner circle
    this._el
      .transition()
      .delay(this._animationDelay)
      .ease(this._easeType)
      .duration(this._animationDuration)
      .selectAll(".needle-center")
      .tween("progress", function () {
        return function () {
          var colour;
          if (self._percent < 0) {
            colour = "grey";
          } else {
            for (var i = 0; i < self._sectionsProportions.length; i++) {
              if (self._percent < self._sectionsCutoffs[i]) {
                colour = self._sectionsColors[i];
                break;
              }
            }
          }

          select(this).attr("fill", colour);
        };
      });
  }

  /**
   * Initializes the needle.
   *
   * @private
   */
  _initialize() {
    //    console.log(this._sectionsColors);

    this._el
      .append("path")
      .attr("class", "needle")
      .attr("fill", "black")
      .attr("d", this._getPath(this._percent));

    this._el
      .append("circle")
      .attr("fill", "white")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", this._radius + 8);

    this._el
      .append("circle")
      .attr("class", "needle-center")
      .attr("fill", "grey")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", this._radius);

    if (this._color !== null) {
      this._el.select(".needle-center").style("fill", this._color);

      this._el.select(".needle").style("fill", this._color);
    }

    // console.log(this._interval);

    if (this._showValue !== null) {
      this._valueLabel = this._el
        .append("text")
        .attr("font-family", "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif")
        .attr("class", "value-label")
        .text("--")
        .attr("font-size", this._textSize)
        .attr("x", "0")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("y", 0)
        .attr("fill", "white");
      this._valueLabel = this._el
        .append("text")
        .attr("font-family", "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif")
        .attr("class", "value-sublabel")
        .text("out of 51")
        .attr("font-size", "120%")
        .attr("x", "0")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("y", 40)
        .attr("fill", "white");
    }

    var sectionsProportionsTotal = this._sectionsProportions.reduce(function (
      acc,
      val,
    ) {
      return acc + val;
    }, 0);
    this._sectionsCutoffs = [];
    var subtotal = 0;
    for (const element of this._sectionsProportions) {
      subtotal += element;
      this._sectionsCutoffs.push(subtotal / sectionsProportionsTotal);
    }
  }

  /**
   * Gets the needle path based on the percent specified.
   *
   * @param percent       The percentage to use to create the path.
   * @returns {string}    A string associated with the path.
   * @private
   */
  _getPath(percent) {
    const halfPI = Math.PI / 2;
    // stretch the range and start position of the gauge
    percent *= this._gaugeAngle / 0.5;
    percent += (this._startAngle - 0.75) * 2;
    const thetaRad = percToRad(percent / 2); // half circle
    // thetaRad here is in the range from -90 deg to 90 deg, we'll stretch to match the range of the gauge

    const centerX = 0;
    const centerY = 0;

    const topX = centerX - this._length * Math.cos(thetaRad);
    const topY = centerY - this._length * Math.sin(thetaRad);
    const baseX = centerX - (this._length - 30) * Math.cos(thetaRad);
    const baseY = centerY - (this._length - 30) * Math.sin(thetaRad);

    const leftX = baseX - 20 * Math.cos(thetaRad - halfPI);
    const leftY = baseY - 20 * Math.sin(thetaRad - halfPI);

    const rightX = baseX - 20 * Math.cos(thetaRad + halfPI);
    const rightY = baseY - 20 * Math.sin(thetaRad + halfPI);

    return `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`;
  }
}

/**
 * Defines a simple gauge.
 */
export class SimpleGauge {
  /**
   * Initializes a new instance of the SimpleGauge class.
   *
   * @param config                        The configuration to use to initialize the gauge.
   * @param [config.animationDelay]       The delay in ms before to start the needle animation. By default, the value
   *                                      is 0.
   * @param [config.animationDuration]    The duration in ms of the needle animation. By default, the value is 3000.
   * @param [config.barWidth]             The bar width of the gauge. By default, the value is 40.
   * @param [config.chartInset]           The char inset to use. By default, the value is 10.
   * @param [config.easeType]             The ease type to use for the needle animation. By default, the value is
   *                                      "d3.easeElastic".
   * @param config.el                     The D3 element to use to create the gauge (must be a group or an SVG element).
   * @param config.height                 The height of the gauge.
   * @param [config.interval]             The interval (min and max values) of the gauge. By default, the interval
   *                                      ia [0, 1].
   * @param [config.needleColor]          The needle color.
   * @param [config.needleRadius]         The radius of the needle. By default, the radius is 15.
   * @param [config.percent]              The percentage to use for the needle position. By default, the value is 0.
   * @param config.sectionsCount          The number of sections in the gauge.
   * @param [config.sectionsColors]       The color to use for each section.
   * @param [config.sectionsProportions]  The proportions for each
   * @param config.width                  The width of the gauge.
   */
  constructor(config) {
    if (config.el == null) {
      throw new Error("The element must be valid.");
    }
    if (isNaN(config.height) || config.height <= 0) {
      throw new RangeError("The height must be a positive number.");
    }
    if (isNaN(config.sectionsCount) || config.sectionsCount <= 0) {
      throw new RangeError("The sections count must be a positive number.");
    }
    if (isNaN(config.width) || config.width <= 0) {
      throw new RangeError("The width must be a positive number.");
    }
    if (
      config.animationDelay !== undefined &&
      (isNaN(config.animationDelay) || config.animationDelay < 0)
    ) {
      throw new RangeError(
        "The transition delay must be greater or equal to 0.",
      );
    }
    if (
      config.animationDuration !== undefined &&
      (isNaN(config.animationDuration) || config.animationDuration < 0)
    ) {
      throw new RangeError(
        "The transition duration must be greater or equal to 0.",
      );
    }
    if (
      config.barWidth !== undefined &&
      (isNaN(config.barWidth) || config.barWidth <= 0)
    ) {
      throw new RangeError("The bar width must be a positive number.");
    }
    if (
      config.chartInset !== undefined &&
      (isNaN(config.chartInset) || config.chartInset < 0)
    ) {
      throw new RangeError("The chart inset must be greater or equal to 0.");
    }
    if (
      config.needleRadius !== undefined &&
      (isNaN(config.needleRadius) || config.needleRadius < 0)
    ) {
      throw new RangeError("The needle radius must be greater or equal to 0.");
    }
    if (
      config.sectionsColors !== undefined &&
      config.sectionsColors.length !== config.sectionsCount
    ) {
      throw new RangeError(
        "The sectionsColors length must match with the sectionsCount.",
      );
    }

    this._animationDelay =
      config.animationDelay !== undefined
        ? config.animationDelay
        : CONSTANTS.NEEDLE_ANIMATION_DELAY;

    this._animationDuration =
      config.animationDuration !== undefined
        ? config.animationDuration
        : CONSTANTS.NEEDLE_ANIMATION_DURATION;

    this._chartInset =
      config.chartInset !== undefined
        ? config.chartInset
        : CONSTANTS.CHAR_INSET;

    console.log(config);
    this._barWidth =
      config.barWidth !== undefined &&
      !(isNaN(config.barWidth) || config.barWidth <= 0)
        ? config.barWidth
        : CONSTANTS.BAR_WIDTH;
    this._easeType =
      config.easeType !== null ? config.easeType : CONSTANTS.EASE_TYPE;
    this._el = config.el;
    this._height = config.height;
    this._needleRadius =
      config.needleRadius !== undefined
        ? config.needleRadius
        : CONSTANTS.NEEDLE_RADIUS;
    this._sectionsCount = config.sectionsCount;
    this._sectionsProportions = config.sectionsProportions;
    this._width = config.width;
    this._sectionsColors = config.sectionsColors;
    this._needleColor = config.needleColor;
    this._showValue =
      config.showValue !== undefined ? config.showValue : CONSTANTS.SHOW_VALUE;

    this.interval = config.interval !== null ? config.interval : [0, 1];
    this.percent = config.percent !== undefined ? config.percent : 0;
    this.startAngle =
      config.startAngle !== undefined ? config.startAngle : 0.75;
    this.gaugeAngle = config.gaugeAngle !== undefined ? config.gaugeAngle : 0.5;
    this.scale = config.scale !== undefined ? config.scale : 1.0;
    this.textSize = config.textSize !== undefined ? config.textSize : "200%";
    this.sectionsTextColours = config.sectionsTextColours;

    if (config.forcePercent !== undefined) {
      this.forcePercent(config.forcePercent);
    }

    this._initialize();
  }

  /**
   * Gets the interval of the gauge.
   *
   * @returns {Array}   An array of two elements that represents the min and the max values of the gauge.
   */
  get interval() {
    return this._scale.domain();
  }

  /**
   * Sets the interval of the gauge (min and max values).
   *
   * @param interval
   */
  set interval(interval) {
    if (
      !(interval instanceof Array) ||
      interval.length !== 2 ||
      isNaN(interval[0]) ||
      isNaN(interval[1]) ||
      interval[0] > interval[1]
    ) {
      throw new Error("The interval specified is invalid.");
    }
    this._scale = scaleLinear().domain(interval).range([0, 1]).clamp(true);
  }

  /**
   * Gets the needle percent.
   *
   * @returns {number|*}    The percentage position of the needle.
   */
  get percent() {
    return this._percent;
  }

  /**
   * Sets the needle percent. The percent must be between 0 and 1.
   *
   * @param percent         The percentage to set.
   */
  set percent(percent) {
    if (isNaN(percent) || percent < 0 || percent > 1) {
      throw new RangeError("The percentage must be between 0 and 1.");
    }
    if (this._needle) {
      this._needle.update(percent);
    }
    this._percent = percent;
    this._update();
  }

  /**
   * Sets the needle position based on the specified value inside the interval.
   * If the value specified is outside the interval, the value will be
   * clamped to fit inside the domain.
   *
   * @param value           The value to use to set the needle position.
   */
  set value(value) {
    if (isNaN(value)) {
      throw new Error("The specified value must be a number.");
    }
    this.percent = this._scale(value);
  }

  // sets the needle percent, without doing the bounds check. lets you set it above/below the range
  // of the needle
  forcePercent(percent) {
    if (this._needle) {
      this._needle.update(percent);
    }
    this._percent = percent;
    this._update();
  }

  /**
   * Initializes the simple gauge.
   *
   * @private
   */
  _initialize() {
    var sectionsProportionsTotal = 0;
    if (this._sectionsProportions !== undefined)
      sectionsProportionsTotal = this._sectionsProportions.reduce(function (
        acc,
        val,
      ) {
        return acc + val;
      }, 0);
    const sectionPercentage = (1 / this._sectionsCount) * this.gaugeAngle;
    const padRad = CONSTANTS.PAD_RAD;

    let totalPercent = this.startAngle; // Start at 270deg
    const radius = Math.min(this._width, this._height * 2) / 2;

    this._chart = this._el
      .append("g")
      .attr(
        "transform",
        `translate(${this._width / 2}, ${this._height}) scale(${this.scale}, ${
          this.scale
        })`,
      );

    this._arcs = this._chart
      .selectAll(".arc")
      .data(range(1, this._sectionsCount + 1))
      .enter()
      .append("path")
      .attr("class", (sectionIndex) => `arc chart-color${sectionIndex}`)
      .attr("d", (sectionIndex) => {
        var thisSectionPercentage = sectionPercentage;
        if (this._sectionsProportions !== undefined) {
          // console.log("prop");
          // console.log(sectionsProportionsTotal);
          // console.log(this._sectionsProportions[sectionIndex-1]);
          thisSectionPercentage *=
            (this._sectionsProportions[sectionIndex - 1] /
              sectionsProportionsTotal) *
            this._sectionsCount;
          // console.log(sectionPercentage, thisSectionPercentage);
        }

        const arcStartRad = percToRad(totalPercent);
        const arcEndRad = arcStartRad + percToRad(thisSectionPercentage);
        totalPercent += thisSectionPercentage;

        const startPadRad = sectionIndex === 0 ? 0 : padRad / 2;
        const endPadRad = sectionIndex === this._sectionsCount ? 0 : padRad / 2;
        const arc = d3Arc()
          .outerRadius(radius - this._chartInset)
          .innerRadius(radius - this._chartInset - this._barWidth)
          .startAngle(arcStartRad + startPadRad)
          .endAngle(arcEndRad - endPadRad);

        return arc(this);
      });

    if (this._sectionsColors !== null) {
      this._arcs.style(
        "fill",
        (sectionIndex) => this._sectionsColors[sectionIndex - 1],
      );
    }

    // console.log(this.interval);
    this._needle = new Needle({
      animationDelay: this._animationDelay,
      animationDuration: this._animationDuration,
      color: this._needleColor,
      easeType: this._easeType,
      el: this._chart,
      length: this._height * 0.72,
      percent: this._percent,
      radius: this._needleRadius,
      showValue: this._showValue,
      interval: this.interval,
      startAngle: this.startAngle,
      gaugeAngle: this.gaugeAngle,
      sectionsColors: this._sectionsColors,
      sectionsProportions: this._sectionsProportions,
      sectionsTextColours: this.sectionsTextColours,
      textSize: this.textSize,
    });
    this._update();
  }

  /**
   * Updates the active arc and the gauge status (min or max) based on the current percent.
   *
   * @private
   */
  _update() {
    if (this._arcs == null) {
      return;
    }
    this._arcs.classed(
      "active",
      (d, i) =>
        i === Math.floor(this._percent * this._sectionsCount) ||
        (i === this._arcs.size() - 1 && this._percent === 1),
    );
    this._chart.classed("min", this._percent === 0);
    this._chart.classed("max", this._percent === 1);
  }
}
