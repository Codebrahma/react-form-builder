import React from "react";
import PropTypes from 'prop-types';
import cx from 'classnames';

/**
 * @fileoverview react-star-rating
 * @author @cameronjroe
 * Referenced from https://codesandbox.io/s/oq6l8ppon9
 * <StarRating
 *   name={string} - name for form input (required)
 *   caption={string} - caption for rating (optional)
 *   ratingAmount={number} - the rating amount (required, default: 5)
 *   rating={number} - a set rating between the rating amount (optional)
 *   disabled={boolean} - whether to disable the rating from being selected (optional)
 *   editing={boolean} - whether the rating is explicitly in editing mode (optional)
 *   size={string} - size of stars (optional)
 *   onRatingClick={function} - a handler function that gets called onClick of the rating (optional)
 *   />
 */

export default class StarRating extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: this.props.rating || 0,
      temp_rating: 0
    };
  }

  handleMouseover(rating) {
    this.setState(prev => ({
      rating,
      temp_rating: prev.rating
    }));
  }

  handleMouseout() {
    this.setState(prev => ({
      rating: prev.temp_rating
    }));
  }

  rate(rating) {
    this.setState({
      rating,
      temp_rating: rating
    });
  }

  render() {
    const { rating } = this.state;
    let stars = [];
    for (let i = 0; i < 5; i++) {
      let starClass = "star-rated-outline";
      const isValidRating = rating >= i+0.5 && rating !== 0;
      if (isValidRating) {
        starClass = "star-rated";
      }

      const starStyles = {
        display: "inline-block",
        width: "16px",
        fontSize: "32px",
        overflow: "hidden",
      }

      stars.push(
        <span className="star" key={`star-${i+0.5}`}>
          <span
            style={{
              ...starStyles,
              direction: "ltr"
            }}
            className={starClass}
            onMouseOver={() => this.handleMouseover(i+0.5)}
            onClick={() => this.rate(i+0.5)}
            onMouseOut={() => this.handleMouseout()}
          >{isValidRating ? <i>&#x2605;</i> : <i>&#x2606;</i>}
          </span>
          <span
            style={{
              ...starStyles,
              direction: "rtl"
            }}
            className={starClass}
            onMouseOver={() => this.handleMouseover(i+1)}
            onClick={() => this.rate(i+1)}
            onMouseOut={() => this.handleMouseout()}
          >{rating >= i+1 && rating !== 0 ? <i>&#x2605;</i> : <i>&#x2606;</i>}
          </span>
        </span>
      );
    }
    return (
      <div className="rating-stars">
        <div className="star-container">{stars}</div>
      </div>
    );
  }
}

StarRating.propTypes = {
  name: PropTypes.string.isRequired,
  caption: PropTypes.string,
  ratingAmount: PropTypes.number.isRequired,
  rating: PropTypes.number,
  onRatingClick: PropTypes.func,
  disabled: PropTypes.bool,
  editing: PropTypes.bool,
  size: PropTypes.string,
};

StarRating.defaultProps = {
  step: 0.5,
  rating: 0,
  ratingAmount: 5,
  onRatingClick() {},
  disabled: false,
};
