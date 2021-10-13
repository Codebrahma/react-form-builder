import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

/**
 * @fileoverview react-star-rating
 * @author @cameronjroe
 * Referenced from https://codesandbox.io/s/oq6l8ppon9
 * <StarRating
 *   name={string} - name for form input (required)
 *   rating={number} - a set rating between the rating amount (optional)
 *   disabled={boolean} - whether to disable the rating from being selected (optional)
 *   editing={boolean} - whether the rating is explicitly in editing mode (optional)
 *   onRatingClick={function} - a handler function that gets called onClick of the rating (optional)
 *   />
 */

export default class StarRating extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: props.rating || 0,
      temp_rating: 0,
    };
  }

  handleMouseover(rating) {
    const { disabled } = this.props;

    if (disabled) {
      return;
    }

    this.setState((prev) => ({
      rating,
      temp_rating: prev.rating,
    }));
  }

  handleMouseout() {
    const { disabled } = this.props;

    if (disabled) {
      return;
    }

    this.setState((prev) => ({
      rating: prev.temp_rating,
    }));
  }

  rate(rating) {
    const { onRatingClick, disabled } = this.props;

    if (disabled) {
      return;
    }

    this.setState({
      rating,
      temp_rating: rating,
    });

    onRatingClick(rating);
  }

  render() {
    const { name, disabled } = this.props;
    const { rating } = this.state;

    // Restricted to 5 stars.
    const RATING_AMOUNT = 5;
    let stars = [];
    for (let i = 0; i < RATING_AMOUNT; i++) {
      let starClass = "star-rated-outline";
      const isValidRating = rating >= i + 0.5 && rating !== 0;
      if (isValidRating) {
        starClass = "star-rated";
      }

      const starStyles = {
        display: "inline-block",
        width: "15px",
        fontSize: "32px",
        overflow: "hidden",
      };

      stars.push(
        <span className="star" key={`star-${i + 0.5}`} name={name}>
          <span
            style={{
              ...starStyles,
              direction: "ltr",
            }}
            className={starClass}
            onMouseOver={() => this.handleMouseover(i + 0.5)}
            onClick={() => this.rate(i + 0.5)}
            onMouseOut={() => this.handleMouseout()}
          >
            {isValidRating ? (
              <i className="fa fa-star" aria-hidden="true"></i>
            ) : (
              <i className="fa fa-star-o" aria-hidden="true"></i>
            )}
          </span>
          <span
            style={{
              ...starStyles,
              direction: "rtl",
            }}
            className={starClass}
            onMouseOver={() => this.handleMouseover(i + 1)}
            onClick={() => this.rate(i + 1)}
            onMouseOut={() => this.handleMouseout()}
          >
            {rating >= i + 1 && rating !== 0 ? (
              <i className="fa fa-star" aria-hidden="true"></i>
            ) : (
              <i className="fa fa-star-o" aria-hidden="true"></i>
            )}
          </span>
        </span>
      );
    }
    return (
      <div className="rating-stars">
        <div className={`star-container ${disabled ? "star-disabled" : ""}`}>
          {stars}
          <span className="rating-number">{rating}</span>
        </div>
      </div>
    );
  }
}

StarRating.propTypes = {
  name: PropTypes.string.isRequired,
  rating: PropTypes.number,
  onRatingClick: PropTypes.func,
  disabled: PropTypes.bool,
  editing: PropTypes.bool,
};

StarRating.defaultProps = {
  rating: 0,
  onRatingClick() {},
  disabled: false,
};
