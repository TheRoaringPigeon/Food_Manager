"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/new-recipe",{

/***/ "./components/recipes/NewRecipeForm.js":
/*!*********************************************!*\
  !*** ./components/recipes/NewRecipeForm.js ***!
  \*********************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _swc_helpers_src_to_consumable_array_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @swc/helpers/src/_to_consumable_array.mjs */ \"./node_modules/@swc/helpers/src/_to_consumable_array.mjs\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _ui_Card__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ui/Card */ \"./components/ui/Card.js\");\n/* harmony import */ var _NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./NewRecipeForm.module.css */ \"./components/recipes/NewRecipeForm.module.css\");\n/* harmony import */ var _NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4__);\n\n\nvar _s = $RefreshSig$();\n\n\n\nfunction NewRecipeForm(props) {\n    var _this = this;\n    var handleFormChange = function handleFormChange(event, index) {\n        var data = (0,_swc_helpers_src_to_consumable_array_mjs__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(ingredientFields);\n        data[index][event.target.name] = event.target.value;\n        setIngredientFields(data);\n    };\n    var addFieldHandler = function addFieldHandler() {\n        var object = {\n            name: \"\",\n            amount: \"\"\n        };\n        setIngredientFields((0,_swc_helpers_src_to_consumable_array_mjs__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(ingredientFields).concat([\n            object\n        ]));\n    };\n    var removeFieldHandler = function removeFieldHandler(index) {\n        var data = (0,_swc_helpers_src_to_consumable_array_mjs__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(ingredientFields);\n        data.splice(index, 1);\n        setIngredientFields(data);\n    };\n    var submitHandler = function submitHandler(event) {\n        event.preventDefault();\n        var enteredTitle = titleInputRef.current.value;\n        var enteredImage = imageInputRef.current.value;\n        var enteredDescription = descriptionInputRef.current.value;\n        var enteredInstructions = instructionsInputRef.current.value;\n        var recipeData = {\n            id: enteredTitle,\n            image: enteredImage,\n            description: enteredDescription,\n            instructions: enteredInstructions,\n            ingredients: ingredientFields\n        };\n        console.log(recipeData);\n    };\n    _s();\n    var titleInputRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)();\n    var imageInputRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)();\n    var descriptionInputRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)();\n    var instructionsInputRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)();\n    var ref = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([\n        {\n            name: \"\",\n            amount: \"\",\n            measurement: \"\"\n        }, \n    ]), ingredientFields = ref[0], setIngredientFields = ref[1];\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_ui_Card__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"form\", {\n                className: (_NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4___default().form),\n                onSubmit: submitHandler,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: (_NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4___default().control),\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                htmlFor: \"title\",\n                                children: \"Recipe Name\"\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                lineNumber: 51,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                type: \"text\",\n                                required: true,\n                                id: \"title\",\n                                ref: titleInputRef\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                lineNumber: 52,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                        lineNumber: 50,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: (_NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4___default().control),\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                htmlFor: \"image\",\n                                children: \"Recipe Image\"\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                lineNumber: 55,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                type: \"url\",\n                                required: true,\n                                id: \"image\",\n                                ref: imageInputRef\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                lineNumber: 56,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                        lineNumber: 54,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: (_NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4___default().control),\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                htmlFor: \"description\",\n                                children: \"Short Description\"\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                lineNumber: 59,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                type: \"text\",\n                                required: true,\n                                id: \"description\",\n                                ref: descriptionInputRef\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                lineNumber: 60,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                        lineNumber: 58,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: (_NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4___default().control),\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                htmlFor: \"instructions\",\n                                children: \"Cooking Instructions\"\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                lineNumber: 68,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                type: \"text\",\n                                required: true,\n                                id: \"instructions\",\n                                ref: instructionsInputRef\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                lineNumber: 69,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                        lineNumber: 67,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: (_NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4___default().control),\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                htmlFor: \"ingredients\",\n                                children: \"Recipe Ingredients\"\n                            }, void 0, false, {\n                                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                lineNumber: 77,\n                                columnNumber: 11\n                            }, this),\n                            ingredientFields.map(function(form, index) {\n                                return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                    className: (_NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4___default().ingredientContainer),\n                                    children: [\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                            name: \"name\",\n                                            placeholder: \"Name (Ground Beef)\",\n                                            onChange: function(event) {\n                                                return handleFormChange(event, index);\n                                            },\n                                            value: form.name\n                                        }, void 0, false, {\n                                            fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                            lineNumber: 81,\n                                            columnNumber: 17\n                                        }, _this),\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                            name: \"amount\",\n                                            placeholder: \"Amount (1 lbs)\",\n                                            onChange: function(event) {\n                                                return handleFormChange(event, index);\n                                            },\n                                            value: form.amount,\n                                            type: \"number\"\n                                        }, void 0, false, {\n                                            fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                            lineNumber: 87,\n                                            columnNumber: 17\n                                        }, _this),\n                                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                            onClick: function() {\n                                                return removeFieldHandler(index);\n                                            },\n                                            children: \"Remove\"\n                                        }, void 0, false, {\n                                            fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                            lineNumber: 94,\n                                            columnNumber: 17\n                                        }, _this)\n                                    ]\n                                }, index, true, {\n                                    fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                                    lineNumber: 80,\n                                    columnNumber: 15\n                                }, _this);\n                            })\n                        ]\n                    }, void 0, true, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                        lineNumber: 76,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                lineNumber: 49,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: (_NewRecipeForm_module_css__WEBPACK_IMPORTED_MODULE_4___default().actions),\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        onClick: addFieldHandler,\n                        children: \"Add Ingredient\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                        lineNumber: 103,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        onClick: submitHandler,\n                        children: \"Add Recipe\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                        lineNumber: 104,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n                lineNumber: 102,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\woodw\\\\Documents\\\\GitHub\\\\Food_Planner\\\\Production\\\\components\\\\recipes\\\\NewRecipeForm.js\",\n        lineNumber: 48,\n        columnNumber: 5\n    }, this);\n}\n_s(NewRecipeForm, \"tohY0ZsI8IxSOBJ+N25HjJeamaA=\");\n_c = NewRecipeForm;\n/* harmony default export */ __webpack_exports__[\"default\"] = (NewRecipeForm);\nvar _c;\n$RefreshReg$(_c, \"NewRecipeForm\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QkFDL0M7Ozs7OztZQUNELENBQ1A7QUFDSixDQUFDO0dBdkdRaEIsYUFBYTtBQUFiQSxLQUFBQSxhQUFhO0FBd0d0QiwrREFBZUEsYUFBYSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL2NvbXBvbmVudHMvcmVjaXBlcy9OZXdSZWNpcGVGb3JtLmpzPzI5Y2IiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgQ2FyZCBmcm9tIFwiLi4vdWkvQ2FyZFwiO1xyXG5pbXBvcnQgc3R5bGVzIGZyb20gXCIuL05ld1JlY2lwZUZvcm0ubW9kdWxlLmNzc1wiO1xyXG5cclxuZnVuY3Rpb24gTmV3UmVjaXBlRm9ybShwcm9wcykge1xyXG4gIGNvbnN0IHRpdGxlSW5wdXRSZWYgPSB1c2VSZWYoKTtcclxuICBjb25zdCBpbWFnZUlucHV0UmVmID0gdXNlUmVmKCk7XHJcbiAgY29uc3QgZGVzY3JpcHRpb25JbnB1dFJlZiA9IHVzZVJlZigpO1xyXG4gIGNvbnN0IGluc3RydWN0aW9uc0lucHV0UmVmID0gdXNlUmVmKCk7XHJcbiAgY29uc3QgW2luZ3JlZGllbnRGaWVsZHMsIHNldEluZ3JlZGllbnRGaWVsZHNdID0gdXNlU3RhdGUoW1xyXG4gICAgeyBuYW1lOiBcIlwiLCBhbW91bnQ6IFwiXCIgLCBtZWFzdXJlbWVudDogJyd9LFxyXG4gIF0pO1xyXG4gIGZ1bmN0aW9uIGhhbmRsZUZvcm1DaGFuZ2UoZXZlbnQsIGluZGV4KSB7XHJcbiAgICBsZXQgZGF0YSA9IFsuLi5pbmdyZWRpZW50RmllbGRzXTtcclxuICAgIGRhdGFbaW5kZXhdW2V2ZW50LnRhcmdldC5uYW1lXSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcclxuICAgIHNldEluZ3JlZGllbnRGaWVsZHMoZGF0YSk7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIGFkZEZpZWxkSGFuZGxlcigpIHtcclxuICAgIGxldCBvYmplY3QgPSB7XHJcbiAgICAgIG5hbWU6IFwiXCIsXHJcbiAgICAgIGFtb3VudDogXCJcIixcclxuICAgIH07XHJcbiAgICBzZXRJbmdyZWRpZW50RmllbGRzKFsuLi5pbmdyZWRpZW50RmllbGRzLCBvYmplY3RdKTtcclxuICB9XHJcbiAgZnVuY3Rpb24gcmVtb3ZlRmllbGRIYW5kbGVyKGluZGV4KSB7XHJcbiAgICBsZXQgZGF0YSA9IFsuLi5pbmdyZWRpZW50RmllbGRzXTtcclxuICAgIGRhdGEuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIHNldEluZ3JlZGllbnRGaWVsZHMoZGF0YSk7XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHN1Ym1pdEhhbmRsZXIoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBjb25zdCBlbnRlcmVkVGl0bGUgPSB0aXRsZUlucHV0UmVmLmN1cnJlbnQudmFsdWU7XHJcbiAgICBjb25zdCBlbnRlcmVkSW1hZ2UgPSBpbWFnZUlucHV0UmVmLmN1cnJlbnQudmFsdWU7XHJcbiAgICBjb25zdCBlbnRlcmVkRGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbklucHV0UmVmLmN1cnJlbnQudmFsdWU7XHJcbiAgICBjb25zdCBlbnRlcmVkSW5zdHJ1Y3Rpb25zID0gaW5zdHJ1Y3Rpb25zSW5wdXRSZWYuY3VycmVudC52YWx1ZTtcclxuXHJcbiAgICBjb25zdCByZWNpcGVEYXRhID0ge1xyXG4gICAgICBpZDogZW50ZXJlZFRpdGxlLFxyXG4gICAgICBpbWFnZTogZW50ZXJlZEltYWdlLFxyXG4gICAgICBkZXNjcmlwdGlvbjogZW50ZXJlZERlc2NyaXB0aW9uLFxyXG4gICAgICBpbnN0cnVjdGlvbnM6IGVudGVyZWRJbnN0cnVjdGlvbnMsXHJcbiAgICAgIGluZ3JlZGllbnRzOiBpbmdyZWRpZW50RmllbGRzXHJcbiAgICB9O1xyXG4gICAgY29uc29sZS5sb2cocmVjaXBlRGF0YSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPENhcmQ+XHJcbiAgICAgIDxmb3JtIGNsYXNzTmFtZT17c3R5bGVzLmZvcm19IG9uU3VibWl0PXtzdWJtaXRIYW5kbGVyfT5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17c3R5bGVzLmNvbnRyb2x9PlxyXG4gICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJ0aXRsZVwiPlJlY2lwZSBOYW1lPC9sYWJlbD5cclxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHJlcXVpcmVkIGlkPVwidGl0bGVcIiByZWY9e3RpdGxlSW5wdXRSZWZ9IC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlcy5jb250cm9sfT5cclxuICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwiaW1hZ2VcIj5SZWNpcGUgSW1hZ2U8L2xhYmVsPlxyXG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ1cmxcIiByZXF1aXJlZCBpZD1cImltYWdlXCIgcmVmPXtpbWFnZUlucHV0UmVmfSAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtzdHlsZXMuY29udHJvbH0+XHJcbiAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cImRlc2NyaXB0aW9uXCI+U2hvcnQgRGVzY3JpcHRpb248L2xhYmVsPlxyXG4gICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgcmVxdWlyZWRcclxuICAgICAgICAgICAgaWQ9XCJkZXNjcmlwdGlvblwiXHJcbiAgICAgICAgICAgIHJlZj17ZGVzY3JpcHRpb25JbnB1dFJlZn1cclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlcy5jb250cm9sfT5cclxuICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwiaW5zdHJ1Y3Rpb25zXCI+Q29va2luZyBJbnN0cnVjdGlvbnM8L2xhYmVsPlxyXG4gICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgcmVxdWlyZWRcclxuICAgICAgICAgICAgaWQ9XCJpbnN0cnVjdGlvbnNcIlxyXG4gICAgICAgICAgICByZWY9e2luc3RydWN0aW9uc0lucHV0UmVmfVxyXG4gICAgICAgICAgLz5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17c3R5bGVzLmNvbnRyb2x9PlxyXG4gICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJpbmdyZWRpZW50c1wiPlJlY2lwZSBJbmdyZWRpZW50czwvbGFiZWw+XHJcbiAgICAgICAgICB7aW5ncmVkaWVudEZpZWxkcy5tYXAoKGZvcm0sIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e2luZGV4fSBjbGFzc05hbWU9e3N0eWxlcy5pbmdyZWRpZW50Q29udGFpbmVyfT5cclxuICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICBuYW1lPVwibmFtZVwiXHJcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTmFtZSAoR3JvdW5kIEJlZWYpXCJcclxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaGFuZGxlRm9ybUNoYW5nZShldmVudCwgaW5kZXgpfVxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17Zm9ybS5uYW1lfVxyXG4gICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICBuYW1lPVwiYW1vdW50XCJcclxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBbW91bnQgKDEgbGJzKVwiXHJcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGhhbmRsZUZvcm1DaGFuZ2UoZXZlbnQsIGluZGV4KX1cclxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2Zvcm0uYW1vdW50fVxyXG4gICAgICAgICAgICAgICAgICB0eXBlPSdudW1iZXInXHJcbiAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiByZW1vdmVGaWVsZEhhbmRsZXIoaW5kZXgpfT5cclxuICAgICAgICAgICAgICAgICAgUmVtb3ZlXHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0pfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Zvcm0+XHJcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtzdHlsZXMuYWN0aW9uc30+XHJcbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXthZGRGaWVsZEhhbmRsZXJ9PkFkZCBJbmdyZWRpZW50PC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtzdWJtaXRIYW5kbGVyfT5BZGQgUmVjaXBlPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9DYXJkPlxyXG4gICk7XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgTmV3UmVjaXBlRm9ybTtcclxuIl0sIm5hbWVzIjpbInVzZVJlZiIsInVzZVN0YXRlIiwiQ2FyZCIsInN0eWxlcyIsIk5ld1JlY2lwZUZvcm0iLCJwcm9wcyIsImhhbmRsZUZvcm1DaGFuZ2UiLCJldmVudCIsImluZGV4IiwiZGF0YSIsImluZ3JlZGllbnRGaWVsZHMiLCJ0YXJnZXQiLCJuYW1lIiwidmFsdWUiLCJzZXRJbmdyZWRpZW50RmllbGRzIiwiYWRkRmllbGRIYW5kbGVyIiwib2JqZWN0IiwiYW1vdW50IiwicmVtb3ZlRmllbGRIYW5kbGVyIiwic3BsaWNlIiwic3VibWl0SGFuZGxlciIsInByZXZlbnREZWZhdWx0IiwiZW50ZXJlZFRpdGxlIiwidGl0bGVJbnB1dFJlZiIsImN1cnJlbnQiLCJlbnRlcmVkSW1hZ2UiLCJpbWFnZUlucHV0UmVmIiwiZW50ZXJlZERlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb25JbnB1dFJlZiIsImVudGVyZWRJbnN0cnVjdGlvbnMiLCJpbnN0cnVjdGlvbnNJbnB1dFJlZiIsInJlY2lwZURhdGEiLCJpZCIsImltYWdlIiwiZGVzY3JpcHRpb24iLCJpbnN0cnVjdGlvbnMiLCJpbmdyZWRpZW50cyIsImNvbnNvbGUiLCJsb2ciLCJtZWFzdXJlbWVudCIsImZvcm0iLCJjbGFzc05hbWUiLCJvblN1Ym1pdCIsImRpdiIsImNvbnRyb2wiLCJsYWJlbCIsImh0bWxGb3IiLCJpbnB1dCIsInR5cGUiLCJyZXF1aXJlZCIsInJlZiIsIm1hcCIsImluZ3JlZGllbnRDb250YWluZXIiLCJwbGFjZWhvbGRlciIsIm9uQ2hhbmdlIiwiYnV0dG9uIiwib25DbGljayIsImFjdGlvbnMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./components/recipes/NewRecipeForm.js\n"));

/***/ })

});