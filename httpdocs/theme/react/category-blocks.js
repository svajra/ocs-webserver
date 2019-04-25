"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function CategoryBlocks() {
    console.log(window.catTree);

    var _React$useState = React.useState(window.catTree),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        categories = _React$useState2[0],
        setCategories = _React$useState2[1];

    var categoriesDisplay = void 0;
    if (categories) categoriesDisplay = categories.map(function (c, index) {
        return React.createElement(CategoryBlockItem, { category: c });
    });
    return React.createElement(
        "div",
        { id: "category-blocks" },
        React.createElement(
            "div",
            { className: "container aih-container aih-section" },
            React.createElement(
                "div",
                { className: "aih-row" },
                categoriesDisplay
            )
        )
    );
}

function CategoryBlockItem(props) {
    var c = props.category;
    var imgUrl = "/theme/react/assets/img/aih-" + c.title.toLowerCase() + ".png";
    var ribbonCssClass = "aih-ribbon aih-" + c.title.toLowerCase();
    return React.createElement(
        "a",
        { href: "/browse/cat/" + c.id },
        React.createElement(
            "div",
            { className: "aih-card" },
            React.createElement("div", { className: ribbonCssClass }),
            React.createElement("img", { className: "aih-thumb", src: imgUrl }),
            React.createElement(
                "div",
                { className: "aih-content" },
                React.createElement(
                    "h3",
                    { className: "aih-title" },
                    c.title
                ),
                React.createElement(
                    "p",
                    { className: "aih-counter" },
                    c.product_count,
                    " ",
                    React.createElement(
                        "span",
                        null,
                        "products"
                    )
                )
            )
        )
    );
}

var rootElement = document.getElementById("category-blocks-container");
ReactDOM.render(React.createElement(CategoryBlocks, null), rootElement);
