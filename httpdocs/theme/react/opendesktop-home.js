window.hpHelpers = function () {

  function dechex(number) {
    //  discuss at: http://locutus.io/php/dechex/
    // original by: Philippe Baumann
    // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
    // improved by: http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
    //    input by: pilus
    //   example 1: dechex(10)
    //   returns 1: 'a'
    //   example 2: dechex(47)
    //   returns 2: '2f'
    //   example 3: dechex(-1415723993)
    //   returns 3: 'ab9dc427'

    if (number < 0) {
      number = 0xFFFFFFFF + number + 1;
    }
    return parseInt(number, 10).toString(16);
  }

  function calculateScoreColor(score) {
    let blue,
        red,
        green,
        defaultColor = 200;
    if (score > 50) {
      red = defaultColor - (score - 50) * 4;
      green = defaultColor;
      blue = defaultColor - (score - 50) * 4;
    } else if (score < 51) {
      red = defaultColor;
      green = defaultColor - (score - 50) * 4;
      blue = defaultColor - (score - 50) * 4;
    }

    return "rgb(" + red + "," + green + "," + blue + ")";
  }

  return {
    dechex,
    calculateScoreColor
  };
}();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      hpVersion: window.hpVersion
    };
    this.initHomePage = this.initHomePage.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
    window.removeEventListener("orientationchange", this.updateDimensions);
  }

  componentDidMount() {
    this.initHomePage();
  }

  initHomePage() {

    window.addEventListener("resize", this.updateDimensions);
    window.addEventListener("orientationchange", this.updateDimensions);

    let env = "live";
    if (location.hostname.endsWith('cc')) {
      env = "test";
    } else if (location.hostname.endsWith('localhost')) {
      env = "test";
    }

    this.setState({ env: env });
  }

  updateDimensions() {

    const width = window.innerWidth;
    let device;
    if (width >= 910) {
      device = "large";
    } else if (width < 910 && width >= 610) {
      device = "mid";
    } else if (width < 610) {
      device = "tablet";
    }

    this.setState({ device: device });
  }

  render() {
    const featuredProduct = JSON.parse(window.data['featureProducts']);
    return React.createElement(
      "main",
      { id: "opendesktop-homepage" },
      React.createElement(SpotlightProduct, {
        env: this.state.env,
        featuredProduct: featuredProduct
      })
    );
  }
}

class SpotlightProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      featuredProduct: this.props.featuredProduct
    };
    this.onSpotlightMenuClick = this.onSpotlightMenuClick.bind(this);
  }

  onSpotlightMenuClick(val) {
    this.setState({ loading: true }, function () {
      let url = "/home/showfeaturejson/page/";
      if (val === "random") {
        url += "0";
      } else {
        url += "1";
      }
      const self = this;
      $.ajax({ url: url, cache: false }).done(function (response) {
        self.setState({ featuredProduct: response });
      });
    });
  }

  render() {

    let imageBaseUrl;
    if (this.props.env === 'live') {
      imageBaseUrl = 'cn.opendesktop.org';
    } else {
      imageBaseUrl = 'cn.opendesktop.cc';
    }

    let description = this.state.featuredProduct.description;
    if (description && description.length > 295) {
      description = this.state.featuredProduct.description.substring(0, 295) + "...";
    }

    let featuredLabelDisplay;
    if (this.state.featuredProduct.featured === "1") {
      featuredLabelDisplay = "featured";
    }

    let cDate = new Date(this.state.featuredProduct.created_at);
    cDate = cDate.toString();
    const createdDate = cDate.split(' ')[1] + " " + cDate.split(' ')[2] + " " + cDate.split(' ')[3];
    const productScoreColor = window.hpHelpers.calculateScoreColor(this.state.featuredProduct.laplace_score);

    let loadingContainerDisplay;
    if (this.state.loading) {
      loadingContainerDisplay = React.createElement(
        "div",
        { className: "loading-container" },
        React.createElement("div", { className: "ajax-loader" })
      );
    }

    return React.createElement(
      "div",
      { id: "spotlight-product" },
      React.createElement(
        "h2",
        null,
        "In the Spotlight"
      ),
      React.createElement(
        "div",
        { className: "container" },
        React.createElement(
          "div",
          { className: "spotlight-image" },
          React.createElement("img", { src: "https://" + imageBaseUrl + "/cache/300x230-1/img/" + this.state.featuredProduct.image_small })
        ),
        React.createElement(
          "div",
          { className: "spotlight-info" },
          React.createElement(
            "div",
            { className: "spotlight-info-wrapper" },
            React.createElement(
              "span",
              { className: "featured-label" },
              featuredLabelDisplay
            ),
            React.createElement(
              "div",
              { className: "info-top" },
              React.createElement(
                "h2",
                null,
                React.createElement(
                  "a",
                  { href: "/p/" + this.state.featuredProduct.project_id },
                  this.state.featuredProduct.title
                )
              ),
              React.createElement(
                "h3",
                null,
                this.state.featuredProduct.category
              ),
              React.createElement(
                "div",
                { className: "user-info" },
                React.createElement("img", { src: this.state.featuredProduct.profile_image_url }),
                this.state.featuredProduct.username
              ),
              React.createElement(
                "span",
                null,
                this.state.featuredProduct.comment_count,
                " comments"
              ),
              React.createElement(
                "div",
                { className: "score-info" },
                React.createElement(
                  "div",
                  { className: "score-number" },
                  "score ",
                  this.state.featuredProduct.laplace_score + "%"
                ),
                React.createElement(
                  "div",
                  { className: "score-bar-container" },
                  React.createElement("div", { className: "score-bar", style: { "width": this.state.featuredProduct.laplace_score + "%", "backgroundColor": productScoreColor } })
                ),
                React.createElement(
                  "div",
                  { className: "score-bar-date" },
                  createdDate
                )
              )
            ),
            React.createElement(
              "div",
              { className: "info-description" },
              description
            )
          ),
          React.createElement(
            "div",
            { className: "spotlight-menu" },
            React.createElement(
              "a",
              { onClick: () => this.onSpotlightMenuClick('random') },
              "random"
            ),
            React.createElement(
              "a",
              { onClick: () => this.onSpotlightMenuClick('featured') },
              "featured"
            )
          )
        )
      ),
      loadingContainerDisplay
    );
  }
}

class ProductCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: this.props.products,
      offset: 5,
      disableleftArrow: true
    };
    this.updateDimensions = this.updateDimensions.bind(this);
    this.animateProductCarousel = this.animateProductCarousel.bind(this);
    this.getNextProductsBatch = this.getNextProductsBatch.bind(this);
  }

  componentWillMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentDidMount() {
    this.updateDimensions();
  }

  updateDimensions(animateCarousel) {
    let itemsPerRow = 5;
    if (window.hpVersion === 2) {
      if (this.props.device === 'large') {
        itemsPerRow = 6;
      } else if (this.props.device === 'mid') {
        itemsPerRow = 5;
      } else if (this.props.device === 'tablet') {
        itemsPerRow = 2;
      }
    }

    const containerWidth = $('#main-content').width();
    const containerNumber = Math.ceil(this.state.products.length / (itemsPerRow - 1));
    const itemWidth = containerWidth / itemsPerRow;
    const sliderWidth = (containerWidth - itemWidth) * containerNumber;
    let sliderPosition = 0;
    if (this.state.sliderPosition) {
      sliderPosition = this.state.sliderPosition;
    }
    this.setState({
      sliderPosition: sliderPosition,
      containerWidth: containerWidth,
      containerNumber: containerNumber,
      sliderWidth: sliderWidth,
      itemWidth: itemWidth,
      itemsPerRow: itemsPerRow - 1
    }, function () {
      if (animateCarousel) {
        this.animateProductCarousel('right', animateCarousel);
      } else if (this.state.finishedProducts) {
        this.setState({ disableRightArrow: true });
      }
    });
  }

  animateProductCarousel(dir, animateCarousel) {
    let newSliderPosition = this.state.sliderPosition;
    const endPoint = this.state.sliderWidth - (this.state.containerWidth - this.state.itemWidth);

    if (dir === 'left') {
      if (this.state.sliderPosition > 0) {
        newSliderPosition = this.state.sliderPosition - (this.state.containerWidth - this.state.itemWidth);
      }
    } else {
      if (Math.trunc(this.state.sliderPosition) < Math.trunc(endPoint)) {
        newSliderPosition = this.state.sliderPosition + (this.state.containerWidth - this.state.itemWidth);
      } else {
        if (!animateCarousel) {
          this.getNextProductsBatch();
        }
      }
    }

    this.setState({ sliderPosition: newSliderPosition }, function () {

      let disableleftArrow = false;
      if (this.state.sliderPosition <= 0) {
        disableleftArrow = true;
      }

      let disableRightArrow = false;
      if (this.state.sliderPosition >= endPoint && this.state.finishedProducts === true) {
        disableRightArrow = true;
      }

      this.setState({ disableRightArrow: disableRightArrow, disableleftArrow: disableleftArrow });
    });
  }

  getNextProductsBatch() {
    this.setState({ disableRightArrow: true }, function () {
      let limit = this.state.itemsPerRow * (this.state.containerNumber + 1) - this.state.products.length;
      if (limit <= 0) {
        limit = this.state.itemsPerRow;
      }
      let url = "/home/showlastproductsjson/?page=1&limit=" + limit + "&offset=" + this.state.offset + "&catIDs=" + this.props.catIds + "&isoriginal=0";
      const self = this;
      $.ajax({ url: url, cache: false }).done(function (response) {

        let products = self.state.products,
            finishedProducts = false,
            animateCarousel = true;

        if (response.length > 0) {
          products = products.concat(response);
        } else {
          finishedProducts = true;
          animateCarousel = false;
        }

        const offset = self.state.offset + self.state.itemsPerRow;

        self.setState({
          products: products,
          offset: offset + response.length,
          finishedProducts: finishedProducts }, function () {
          self.updateDimensions(animateCarousel);
        });
      });
    });
  }

  render() {
    let carouselItemsDisplay;
    if (this.state.products && this.state.products.length > 0) {
      carouselItemsDisplay = this.state.products.map((product, index) => React.createElement(ProductCarouselItem, {
        key: index,
        product: product,
        itemWidth: this.state.itemWidth,
        env: this.props.env
      }));
    }

    let carouselArrowLeftDisplay;
    if (this.state.disableleftArrow) {
      carouselArrowLeftDisplay = React.createElement(
        "a",
        { className: "carousel-arrow arrow-left disabled" },
        React.createElement("span", { className: "glyphicon glyphicon-chevron-left" })
      );
    } else {
      carouselArrowLeftDisplay = React.createElement(
        "a",
        { onClick: () => this.animateProductCarousel('left'), className: "carousel-arrow arrow-left" },
        React.createElement("span", { className: "glyphicon glyphicon-chevron-left" })
      );
    }

    let carouselArrowRightDisplay;
    if (this.state.disableRightArrow) {
      carouselArrowRightDisplay = React.createElement(
        "a",
        { className: "carousel-arrow arrow-right disabled" },
        React.createElement("span", { className: "glyphicon glyphicon-chevron-right" })
      );
    } else {
      carouselArrowRightDisplay = React.createElement(
        "a",
        { onClick: () => this.animateProductCarousel('right'), className: "carousel-arrow arrow-right" },
        React.createElement("span", { className: "glyphicon glyphicon-chevron-right" })
      );
    }

    let hpVersionClass = "one";
    let carouselWrapperStyling = {};
    let carouselArrowsMargin;
    if (window.hpVersion === 2 && this.state.itemWidth) {
      hpVersionClass = "two";
      carouselWrapperStyling = {
        "paddingLeft": this.state.itemWidth / 2,
        "paddingRight": this.state.itemWidth / 2,
        "height": this.state.itemWidth * 1.35
      };
      carouselArrowsMargin = this.state.itemWidth / 4;
    }

    return React.createElement(
      "div",
      { className: "product-carousel " + hpVersionClass },
      React.createElement(
        "div",
        { className: "product-carousel-header" },
        React.createElement(
          "h2",
          null,
          React.createElement(
            "a",
            { href: "/browse/cat/" + this.props.catIds + "/" },
            this.props.title,
            " ",
            React.createElement("span", { className: "glyphicon glyphicon-chevron-right" })
          )
        )
      ),
      React.createElement(
        "div",
        { className: "product-carousel-wrapper", style: carouselWrapperStyling },
        React.createElement(
          "div",
          { className: "product-carousel-left", style: { "left": carouselArrowsMargin } },
          carouselArrowLeftDisplay
        ),
        React.createElement(
          "div",
          { className: "product-carousel-container" },
          React.createElement(
            "div",
            { className: "product-carousel-slider", style: { "width": this.state.sliderWidth, "left": "-" + this.state.sliderPosition + "px" } },
            carouselItemsDisplay
          )
        ),
        React.createElement(
          "div",
          { className: "product-carousel-right", style: { "right": carouselArrowsMargin } },
          carouselArrowRightDisplay
        )
      )
    );
  }
}

class ProductCarouselItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let imageUrl = this.props.product.image_small;
    if (imageUrl && this.props.product.image_small.indexOf('https://') === -1 && this.props.product.image_small.indexOf('http://') === -1) {
      let imageBaseUrl;
      if (this.props.env === 'live') {
        imageBaseUrl = 'cn.opendesktop.org';
      } else {
        imageBaseUrl = 'cn.opendesktop.cc';
      }
      imageUrl = 'https://' + imageBaseUrl + '/cache/200x171/img/' + this.props.product.image_small;
    }

    let paddingTop;
    let productInfoDisplay = React.createElement(
      "div",
      { className: "product-info" },
      React.createElement(
        "span",
        { className: "product-info-title" },
        this.props.product.title
      ),
      React.createElement(
        "span",
        { className: "product-info-user" },
        this.props.product.username
      )
    );

    if (window.hpVersion === 2) {
      paddingTop = this.props.itemWidth * 1.35 / 2 - 10;
      let cDate = new Date(this.props.product.created_at);
      cDate = cDate.toString();
      const createdDate = cDate.split(' ')[1] + " " + cDate.split(' ')[2] + " " + cDate.split(' ')[3];
      productInfoDisplay = React.createElement(
        "div",
        { className: "product-info" },
        React.createElement(
          "span",
          { className: "product-info-title" },
          this.props.product.title
        ),
        React.createElement(
          "span",
          { className: "product-info-category" },
          this.props.product.cat_title
        ),
        React.createElement(
          "span",
          { className: "product-info-date" },
          createdDate
        ),
        React.createElement(
          "span",
          { className: "product-info-commentcount" },
          this.props.product.count_comments,
          " comments"
        ),
        React.createElement(
          "div",
          { className: "score-info" },
          React.createElement(
            "div",
            { className: "score-number" },
            "score ",
            this.props.product.laplace_score + "%"
          ),
          React.createElement(
            "div",
            { className: "score-bar-container" },
            React.createElement("div", { className: "score-bar", style: { "width": this.props.product.laplace_score + "%" } })
          )
        )
      );
    }

    return React.createElement(
      "div",
      { className: "product-carousel-item", style: { "width": this.props.itemWidth } },
      React.createElement(
        "div",
        { className: "product-carousel-item-wrapper" },
        React.createElement(
          "a",
          { href: "/p/" + this.props.product.project_id, style: { "paddingTop": paddingTop } },
          React.createElement(
            "figure",
            { style: { "height": paddingTop } },
            React.createElement("img", { className: "very-rounded-corners", src: imageUrl })
          ),
          productInfoDisplay
        )
      )
    );
  }
}

ReactDOM.render(React.createElement(App, null), document.getElementById('main-content'));
