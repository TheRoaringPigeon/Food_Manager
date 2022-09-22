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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./RecipeDetail.module.css */ \"./components/recipes/RecipeDetail.module.css\");\n/* harmony import */ var _RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _Ingredient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Ingredient */ \"./components/recipes/Ingredient.js\");\n\n\n\n\nfunction RecipeDetail(props) {\n    var _this = this;\n    var setValid = function setValid(name, amount, measurement) {\n        var ingredient = props.ownedIngredients.filter(function(item) {\n            return item._id === name;\n        });\n        if (ingredient.length === 0) {\n            props.populateIngredient({\n                _id: name,\n                MeasureType: measurement,\n                MeasureAmount: 0\n            });\n            return false;\n        }\n        return ingredient[0].MeasureAmount >= amount;\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react__WEBPACK_IMPORTED_MODULE_1__.Fragment, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"section\", {\n                className: (_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_3___default().detail),\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"img\", {\n                    src: props.image,\n                    alt: props.title\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                    lineNumber: 22,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                lineNumber: 21,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: (_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_3___default().content),\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                        children: props.id\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                        lineNumber: 25,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: (_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_3___default().ingredients),\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"ul\", {\n                            className: (_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_3___default().list),\n                            children: props.ingredients.map(function(ingredient) {\n                                return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_Ingredient__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n                                    name: ingredient.Ingredient,\n                                    amount: ingredient.Amount,\n                                    measurement: ingredient.Measurement,\n                                    isValid: setValid(ingredient.Ingredient, ingredient.Amount, ingredient.Measurement)\n                                }, ingredient.Ingredient, false, {\n                                    fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                                    lineNumber: 29,\n                                    columnNumber: 21\n                                }, _this);\n                            })\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                            lineNumber: 27,\n                            columnNumber: 13\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                        lineNumber: 26,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: (_RecipeDetail_module_css__WEBPACK_IMPORTED_MODULE_3___default().instructions),\n                        children: props.instructions\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                        lineNumber: 38,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\RecipeDetail.js\",\n                lineNumber: 24,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\RecipeDetail.js\",\n        lineNumber: 20,\n        columnNumber: 5\n    }, this);\n}\n_c = RecipeDetail;\n/* harmony default export */ __webpack_exports__[\"default\"] = (RecipeDetail);\nvar _c;\n$RefreshReg$(_c, \"RecipeDetail\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL3JlY2lwZXMvUmVjaXBlRGV0YWlsLmpzLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFBaUM7QUFDYztBQUNUO0FBRXRDLFNBQVNHLFlBQVksQ0FBQ0MsS0FBSyxFQUFFOztRQUNsQkMsUUFBUSxHQUFqQixTQUFTQSxRQUFRLENBQUNDLElBQUksRUFBRUMsTUFBTSxFQUFFQyxXQUFXLEVBQUU7UUFDM0MsSUFBSUMsVUFBVSxHQUFHTCxLQUFLLENBQUNNLGdCQUFnQixDQUFDQyxNQUFNLENBQUNDLFNBQUFBLElBQUk7bUJBQUlBLElBQUksQ0FBQ0MsR0FBRyxLQUFLUCxJQUFJO1NBQUEsQ0FBQztRQUN6RSxJQUFJRyxVQUFVLENBQUNLLE1BQU0sS0FBSyxDQUFDLEVBQUM7WUFDMUJWLEtBQUssQ0FBQ1csa0JBQWtCLENBQUM7Z0JBQ3ZCRixHQUFHLEVBQUVQLElBQUk7Z0JBQ1RVLFdBQVcsRUFBRVIsV0FBVztnQkFDeEJTLGFBQWEsRUFBRSxDQUFDO2FBQ2pCLENBQUM7WUFDRixPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxPQUFPUixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUNRLGFBQWEsSUFBSVYsTUFBTSxDQUFDO0lBQy9DLENBQUM7SUFFRCxxQkFDRSw4REFBQ1AsMkNBQVE7OzBCQUNQLDhEQUFDa0IsU0FBTztnQkFBQ0MsU0FBUyxFQUFFbEIsd0VBQWE7MEJBQy9CLDRFQUFDb0IsS0FBRztvQkFBQ0MsR0FBRyxFQUFFbEIsS0FBSyxDQUFDbUIsS0FBSztvQkFBRUMsR0FBRyxFQUFFcEIsS0FBSyxDQUFDcUIsS0FBSzs7Ozs7d0JBQUk7Ozs7O29CQUNuQzswQkFDViw4REFBQ0MsS0FBRztnQkFBQ1AsU0FBUyxFQUFFbEIseUVBQWM7O2tDQUM1Qiw4REFBQzJCLElBQUU7a0NBQUV4QixLQUFLLENBQUN5QixFQUFFOzs7Ozs0QkFBTTtrQ0FDbkIsOERBQUNILEtBQUc7d0JBQUNQLFNBQVMsRUFBRWxCLDZFQUFrQjtrQ0FDOUIsNEVBQUM4QixJQUFFOzRCQUFDWixTQUFTLEVBQUVsQixzRUFBVztzQ0FDckJHLEtBQUssQ0FBQzBCLFdBQVcsQ0FBQ0csR0FBRyxDQUFDLFNBQUN4QixVQUFVO3FEQUM5Qiw4REFBQ1AsbURBQVU7b0NBQ1BJLElBQUksRUFBRUcsVUFBVSxDQUFDUCxVQUFVO29DQUMzQkssTUFBTSxFQUFFRSxVQUFVLENBQUN5QixNQUFNO29DQUN6QjFCLFdBQVcsRUFBRUMsVUFBVSxDQUFDMEIsV0FBVztvQ0FDbkNDLE9BQU8sRUFBRS9CLFFBQVEsQ0FBQ0ksVUFBVSxDQUFDUCxVQUFVLEVBQUVPLFVBQVUsQ0FBQ3lCLE1BQU0sRUFBRXpCLFVBQVUsQ0FBQzBCLFdBQVcsQ0FBQzttQ0FKdEUxQixVQUFVLENBQUNQLFVBQVU7Ozs7eUNBS3BDOzZCQUFBLENBQ0w7Ozs7O2dDQUNBOzs7Ozs0QkFDSDtrQ0FDTiw4REFBQ3dCLEtBQUc7d0JBQUNQLFNBQVMsRUFBRWxCLDhFQUFtQjtrQ0FDOUJHLEtBQUssQ0FBQ2lDLFlBQVk7Ozs7OzRCQUNqQjs7Ozs7O29CQUNGOzs7Ozs7WUFDRyxDQUNYO0FBQ0osQ0FBQztBQXZDUWxDLEtBQUFBLFlBQVk7QUF5Q3JCLCtEQUFlQSxZQUFZLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vY29tcG9uZW50cy9yZWNpcGVzL1JlY2lwZURldGFpbC5qcz81MTVjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZyYWdtZW50IH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCBzdHlsZXMgZnJvbSBcIi4vUmVjaXBlRGV0YWlsLm1vZHVsZS5jc3NcIjtcclxuaW1wb3J0IEluZ3JlZGllbnQgZnJvbSBcIi4vSW5ncmVkaWVudFwiO1xyXG5cclxuZnVuY3Rpb24gUmVjaXBlRGV0YWlsKHByb3BzKSB7XHJcbiAgZnVuY3Rpb24gc2V0VmFsaWQobmFtZSwgYW1vdW50LCBtZWFzdXJlbWVudCkge1xyXG4gICAgbGV0IGluZ3JlZGllbnQgPSBwcm9wcy5vd25lZEluZ3JlZGllbnRzLmZpbHRlcihpdGVtID0+IGl0ZW0uX2lkID09PSBuYW1lKTtcclxuICAgIGlmIChpbmdyZWRpZW50Lmxlbmd0aCA9PT0gMCl7XHJcbiAgICAgIHByb3BzLnBvcHVsYXRlSW5ncmVkaWVudCh7XHJcbiAgICAgICAgX2lkOiBuYW1lLFxyXG4gICAgICAgIE1lYXN1cmVUeXBlOiBtZWFzdXJlbWVudCxcclxuICAgICAgICBNZWFzdXJlQW1vdW50OiAwXHJcbiAgICAgIH0pXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBpbmdyZWRpZW50WzBdLk1lYXN1cmVBbW91bnQgPj0gYW1vdW50O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxGcmFnbWVudD5cclxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPXtzdHlsZXMuZGV0YWlsfT5cclxuICAgICAgICA8aW1nIHNyYz17cHJvcHMuaW1hZ2V9IGFsdD17cHJvcHMudGl0bGV9IC8+XHJcbiAgICAgIDwvc2VjdGlvbj5cclxuICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlcy5jb250ZW50fT5cclxuICAgICAgICA8aDE+e3Byb3BzLmlkfTwvaDE+XHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlcy5pbmdyZWRpZW50c30+XHJcbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9e3N0eWxlcy5saXN0fT5cclxuICAgICAgICAgICAgICAgIHtwcm9wcy5pbmdyZWRpZW50cy5tYXAoKGluZ3JlZGllbnQpID0+IFxyXG4gICAgICAgICAgICAgICAgICAgIDxJbmdyZWRpZW50IGtleT17aW5ncmVkaWVudC5JbmdyZWRpZW50fSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17aW5ncmVkaWVudC5JbmdyZWRpZW50fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbW91bnQ9e2luZ3JlZGllbnQuQW1vdW50fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlbWVudD17aW5ncmVkaWVudC5NZWFzdXJlbWVudH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNWYWxpZD17c2V0VmFsaWQoaW5ncmVkaWVudC5JbmdyZWRpZW50LCBpbmdyZWRpZW50LkFtb3VudCwgaW5ncmVkaWVudC5NZWFzdXJlbWVudCl9XHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlcy5pbnN0cnVjdGlvbnN9PlxyXG4gICAgICAgICAgICB7cHJvcHMuaW5zdHJ1Y3Rpb25zfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvRnJhZ21lbnQ+XHJcbiAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUmVjaXBlRGV0YWlsO1xyXG4iXSwibmFtZXMiOlsiRnJhZ21lbnQiLCJzdHlsZXMiLCJJbmdyZWRpZW50IiwiUmVjaXBlRGV0YWlsIiwicHJvcHMiLCJzZXRWYWxpZCIsIm5hbWUiLCJhbW91bnQiLCJtZWFzdXJlbWVudCIsImluZ3JlZGllbnQiLCJvd25lZEluZ3JlZGllbnRzIiwiZmlsdGVyIiwiaXRlbSIsIl9pZCIsImxlbmd0aCIsInBvcHVsYXRlSW5ncmVkaWVudCIsIk1lYXN1cmVUeXBlIiwiTWVhc3VyZUFtb3VudCIsInNlY3Rpb24iLCJjbGFzc05hbWUiLCJkZXRhaWwiLCJpbWciLCJzcmMiLCJpbWFnZSIsImFsdCIsInRpdGxlIiwiZGl2IiwiY29udGVudCIsImgxIiwiaWQiLCJpbmdyZWRpZW50cyIsInVsIiwibGlzdCIsIm1hcCIsIkFtb3VudCIsIk1lYXN1cmVtZW50IiwiaXNWYWxpZCIsImluc3RydWN0aW9ucyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/recipes/RecipeDetail.js\n"));

/***/ })

});