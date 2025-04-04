import { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import Interweave from "interweave";

/* Redux Stuff */
import { connect } from "react-redux";
import { addProduct } from "store/cartProductsSlice";

/* Import Graphql Stuff */
import { Query } from "@apollo/client/react/components";
import { GET_PRODUCT } from "query/product.query";

/* Import Custom Utils */
import getCurrencyIcon from "util/getCurrencyIcon";
import getProductAmount from "util/getProductAmount";

import "./ProductPage.scss";

const mapStateToProps = (state) => ({
  currentCurrency: state.currency.current,
});

const mapDispatchToProps = (dispatch) => ({
  addProduct: (payload) => dispatch(addProduct(payload)),
});

class ProductPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeThumb: "",
      options: [],
    };
  }

  handleOptions = (attributeId, value) => {
    const { options } = this.state;
    const existedOption = options.find(
      (option) => option.attributeId === attributeId
    );

    if (existedOption) {
      this.setState((state) => ({
        ...state,
        options: options.map((x) =>
          x.attributeId === attributeId ? { ...existedOption, value } : x
        ),
      }));
    } else {
      this.setState((state) => ({
        ...state,
        options: [...options, { attributeId, value }],
      }));
    }
  };

  handleThumb = (image) => {
    this.setState((state) => ({
      ...state,
      activeThumb: image,
    }));
  };

  addToCart = (product) => {
    const { addProduct } = this.props;

    const payload = {
      product: product,
      options: this.state.options,
    };

    addProduct(payload);
    this.setState((state) => ({
      ...state,
      options: [],
    }));
  };

  render() {
    const id = this.props.match.params.id || "";
    const { activeThumb, options } = this.state;
    const { currentCurrency } = this.props;

    return (
      <Query query={GET_PRODUCT} variables={{ name: id }}>
        {({ loading, error, data }) => {
          if (loading) return <div className="preloader"></div>;
          if (error) console.log(error);
          const { product } = data;

          return (
            <div className="product">
              <div className="product__row | container">
                {/* Product Slider */}
                <div className="product__slider">
                  <div className="product__thumbs">
                    {product.gallery.map((image, index) => (
                      <img
                        onClick={() => this.handleThumb(image)}
                        src={image}
                        alt={product.name}
                        key={index}
                      />
                    ))}
                  </div>
                  <img
                    className="product__image"
                    src={activeThumb || product.gallery[0]}
                    alt={product.name}
                  />
                </div>

                {/* Product Details */}
                <div className="product__details">
                  <h3 className="product__subtitle">{product.brand}</h3>
                  <h2 className="product__title">{product.name}</h2>

                  {/* Map All Attributes */}
                  {product.attributes.map((attribute) => (
                    <div className="product__attribute" key={attribute.id}>
                      <span className="product__label">{attribute.name}:</span>
                      <ul className="product__options options">
                        {attribute.items.map((item) => {
                          const selectedOption = options.find(
                            (option) =>
                              option.attributeId === attribute.id &&
                              option.value === item.value
                          );

                          return attribute.type === "swatch" ? (
                            <li
                              style={{ background: item.value }}
                              className={selectedOption ? "active-swatch" : ""}
                              onClick={() =>
                                this.handleOptions(attribute.id, item.value)
                              }
                              key={item.id}
                            ></li>
                          ) : (
                            <li
                              className={selectedOption ? "active" : ""}
                              onClick={() =>
                                this.handleOptions(attribute.id, item.value)
                              }
                              key={item.id}
                            >
                              {item.value}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}

                  {/* Product Price Attribute */}
                  <div className="product__attribute">
                    <span className="product__label">price:</span>
                    <span className="product__price">
                      {getCurrencyIcon(currentCurrency)}
                      {getProductAmount(product, currentCurrency)}
                    </span>
                  </div>

                  {/* Product Main Button */}
                  {product.inStock ? (
                    <button
                      className="product__button button button--green"
                      onClick={() => this.addToCart(product)}
                    >
                      ADD TO CART
                    </button>
                  ) : (
                    <button className="product__button button button--red">
                      OUT OF STOCK
                    </button>
                  )}

                  <Interweave
                    className="product__description"
                    content={product.description}
                  />
                </div>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProductPage));
