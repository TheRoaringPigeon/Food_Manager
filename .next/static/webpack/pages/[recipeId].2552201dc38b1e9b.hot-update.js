"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/[recipeId]",{

/***/ "./components/recipes/RecipeDetail.js":
/*!********************************************!*\
  !*** ./components/recipes/RecipeDetail.js ***!
  \********************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./RecipeDetail.module.css */ \"./components/recipes/RecipeDetail.module.css\");\n/* harmony import */ var _RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nfunction RecipeDetail(props) {\n    var _this = this;\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react__WEBPACK_IMPORTED_MODULE_1__.Fragment, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"section\", {\n                className: (_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_2___default().detail),\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                    src: props.image,\n                    alt: props.title\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                    lineNumber: 8,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                lineNumber: 7,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: (_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_2___default().content),\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                        children: props.id\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                        lineNumber: 11,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: (_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_2___default().ingredients),\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"ul\", {\n                            className: (_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_2___default().list),\n                            children: props.ingredients.map(function(ingredient) {\n                                return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Ingredient, {\n                                    name: indgredient.Ingredient,\n                                    amount: ingredient.Amount\n                                }, \"\".concat(ingredient.id + Math.random().toString()), false, {\n                                    fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                                    lineNumber: 15,\n                                    columnNumber: 21\n                                }, _this);\n                            })\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                            lineNumber: 13,\n                            columnNumber: 13\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                        lineNumber: 12,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                lineNumber: 10,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\components\\\\recipes\\\\RecipeDetail.js\",\n        lineNumber: 6,\n        columnNumber: 5\n    }, this);\n}\n_c = RecipeDetail;\n/* harmony default export */ __webpack_exports__[\"default\"] = (RecipeDetail);\nvar _c;\n$RefreshReg$(_c, \"RecipeDetail\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL3JlY2lwZXMvUmVjaXBlRGV0YWlsLmpzLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUFpQztBQUNjO0FBRS9DLFNBQVNFLFlBQVksQ0FBQ0MsS0FBSyxFQUFFOztJQUMzQixxQkFDRSw4REFBQ0gsMkNBQVE7OzBCQUNQLDhEQUFDSSxTQUFPO2dCQUFDQyxTQUFTLEVBQUVKLHdFQUFhOzBCQUMvQiw0RUFBQ00sS0FBRztvQkFBQ0MsR0FBRyxFQUFFTCxLQUFLLENBQUNNLEtBQUs7b0JBQUVDLEdBQUcsRUFBRVAsS0FBSyxDQUFDUSxLQUFLOzs7Ozt3QkFBSTs7Ozs7b0JBQ25DOzBCQUNWLDhEQUFDQyxLQUFHO2dCQUFDUCxTQUFTLEVBQUVKLHlFQUFjOztrQ0FDNUIsOERBQUNhLElBQUU7a0NBQUVYLEtBQUssQ0FBQ1ksRUFBRTs7Ozs7NEJBQU07a0NBQ25CLDhEQUFDSCxLQUFHO3dCQUFDUCxTQUFTLEVBQUVKLDZFQUFrQjtrQ0FDOUIsNEVBQUNnQixJQUFFOzRCQUFDWixTQUFTLEVBQUVKLHNFQUFXO3NDQUNyQkUsS0FBSyxDQUFDYSxXQUFXLENBQUNHLEdBQUcsQ0FBQyxTQUFDQyxVQUFVO3FEQUM5Qiw4REFBQ0MsVUFBVTtvQ0FDUEMsSUFBSSxFQUFFQyxXQUFXLENBQUNGLFVBQVU7b0NBQzVCRyxNQUFNLEVBQUVKLFVBQVUsQ0FBQ0ssTUFBTTttQ0FGWixFQUFDLENBQTJDLE9BQXpDTCxVQUFVLENBQUNMLEVBQUUsR0FBR1csSUFBSSxDQUFDQyxNQUFNLEVBQUUsQ0FBQ0MsUUFBUSxFQUFFLENBQUU7Ozs7eUNBRzVEOzZCQUFBLENBQ0w7Ozs7O2dDQUNBOzs7Ozs0QkFDSDs7Ozs7O29CQUNGOzs7Ozs7WUFDRyxDQUNYO0FBQ0osQ0FBQztBQXJCUTFCLEtBQUFBLFlBQVk7QUF1QnJCLCtEQUFlQSxZQUFZLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vY29tcG9uZW50cy9yZWNpcGVzL1JlY2lwZURldGFpbC5qcz81MTVjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZyYWdtZW50IH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCBzdHlsZXMgZnJvbSBcIi4vUmVjaXBlRGV0YWlsLm1vZHVsZS5jc3NcIjtcclxuXHJcbmZ1bmN0aW9uIFJlY2lwZURldGFpbChwcm9wcykge1xyXG4gIHJldHVybiAoXHJcbiAgICA8RnJhZ21lbnQ+XHJcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT17c3R5bGVzLmRldGFpbH0+XHJcbiAgICAgICAgPGltZyBzcmM9e3Byb3BzLmltYWdlfSBhbHQ9e3Byb3BzLnRpdGxlfSAvPlxyXG4gICAgICA8L3NlY3Rpb24+XHJcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtzdHlsZXMuY29udGVudH0+XHJcbiAgICAgICAgPGgxPntwcm9wcy5pZH08L2gxPlxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtzdHlsZXMuaW5ncmVkaWVudHN9PlxyXG4gICAgICAgICAgICA8dWwgY2xhc3NOYW1lPXtzdHlsZXMubGlzdH0+XHJcbiAgICAgICAgICAgICAgICB7cHJvcHMuaW5ncmVkaWVudHMubWFwKChpbmdyZWRpZW50KSA9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxJbmdyZWRpZW50IGtleT17YCR7aW5ncmVkaWVudC5pZCArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKX1gfSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17aW5kZ3JlZGllbnQuSW5ncmVkaWVudH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYW1vdW50PXtpbmdyZWRpZW50LkFtb3VudH1cclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L0ZyYWdtZW50PlxyXG4gICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlY2lwZURldGFpbDtcclxuIl0sIm5hbWVzIjpbIkZyYWdtZW50Iiwic3R5bGVzIiwiUmVjaXBlRGV0YWlsIiwicHJvcHMiLCJzZWN0aW9uIiwiY2xhc3NOYW1lIiwiZGV0YWlsIiwiaW1nIiwic3JjIiwiaW1hZ2UiLCJhbHQiLCJ0aXRsZSIsImRpdiIsImNvbnRlbnQiLCJoMSIsImlkIiwiaW5ncmVkaWVudHMiLCJ1bCIsImxpc3QiLCJtYXAiLCJpbmdyZWRpZW50IiwiSW5ncmVkaWVudCIsIm5hbWUiLCJpbmRncmVkaWVudCIsImFtb3VudCIsIkFtb3VudCIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/recipes/RecipeDetail.js\n"));

/***/ })

});