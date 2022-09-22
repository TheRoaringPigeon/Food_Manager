"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/new-recipe";
exports.ids = ["pages/api/new-recipe"];
exports.modules = {

/***/ "mongodb":
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("mongodb");

/***/ }),

/***/ "(api)/./pages/api/new-recipe.js":
/*!*********************************!*\
  !*** ./pages/api/new-recipe.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongodb */ \"mongodb\");\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongodb__WEBPACK_IMPORTED_MODULE_0__);\n\nasync function handler(req, res) {\n    if (req.method === \"POST\") {\n        const data = req.body;\n        const client = await mongodb__WEBPACK_IMPORTED_MODULE_0__.MongoClient.connect(\"mongodb+srv://DataBaseAdmin:0uZANKDJSNJeBh0t@cluster0.g3ysge4.mongodb.net/FoodOrganizer?retryWrites=true&w=majority\");\n        const db = client.db();\n        const recipeCollection = db.collection(\"Recipe\");\n        const result = await recipeCollection.insertOne(data);\n        const ingredientCollection = db.collection(\"Ingredient\");\n        const ingredientsInCollection = await ingredientCollection.find().toArray();\n        const missingIngredients = data.ingredients.filter((ingredient)=>!ingredientsInCollection.includes(ingredient.Ingredient));\n        if (missingIngredients.length > 0) {\n            let ingredientsToAdd = missingIngredients.map((ingredient)=>({\n                    _id: ingredient.Ingredient,\n                    MeasureType: ingredient.Measurement,\n                    MeasureAmount: 0\n                }));\n            let temp = await ingredientCollection.insertMany(ingredientsToAdd);\n        }\n        client.close();\n        res.status(201).json({\n            message: \"Recipe added to DB.\"\n        });\n    }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (handler);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvbmV3LXJlY2lwZS5qcy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBc0M7QUFFdEMsZUFBZUMsT0FBTyxDQUFDQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtJQUMvQixJQUFJRCxHQUFHLENBQUNFLE1BQU0sS0FBSyxNQUFNLEVBQUU7UUFDekIsTUFBTUMsSUFBSSxHQUFHSCxHQUFHLENBQUNJLElBQUk7UUFDckIsTUFBTUMsTUFBTSxHQUFHLE1BQU1QLHdEQUFtQixDQUN0QyxxSEFBcUgsQ0FDdEg7UUFDRCxNQUFNUyxFQUFFLEdBQUdGLE1BQU0sQ0FBQ0UsRUFBRSxFQUFFO1FBQ3RCLE1BQU1DLGdCQUFnQixHQUFHRCxFQUFFLENBQUNFLFVBQVUsQ0FBQyxRQUFRLENBQUM7UUFFaEQsTUFBTUMsTUFBTSxHQUFHLE1BQU1GLGdCQUFnQixDQUFDRyxTQUFTLENBQUNSLElBQUksQ0FBQztRQUNqRCxNQUFNUyxvQkFBb0IsR0FBR0wsRUFBRSxDQUFDRSxVQUFVLENBQUMsWUFBWSxDQUFDO1FBQ3hELE1BQU1JLHVCQUF1QixHQUFHLE1BQU1ELG9CQUFvQixDQUFDRSxJQUFJLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFO1FBQzNFLE1BQU1DLGtCQUFrQixHQUFHYixJQUFJLENBQUNjLFdBQVcsQ0FBQ0MsTUFBTSxDQUFDQyxDQUFBQSxVQUFVLEdBQUksQ0FBQ04sdUJBQXVCLENBQUNPLFFBQVEsQ0FBQ0QsVUFBVSxDQUFDRSxVQUFVLENBQUMsQ0FBQztRQUMxSCxJQUFJTCxrQkFBa0IsQ0FBQ00sTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMvQixJQUFJQyxnQkFBZ0IsR0FBR1Asa0JBQWtCLENBQUNRLEdBQUcsQ0FBQyxDQUFDTCxVQUFVLEdBQU07b0JBQzNETSxHQUFHLEVBQUVOLFVBQVUsQ0FBQ0UsVUFBVTtvQkFDMUJLLFdBQVcsRUFBRVAsVUFBVSxDQUFDUSxXQUFXO29CQUNuQ0MsYUFBYSxFQUFFLENBQUM7aUJBQ25CLEVBQUU7WUFDSCxJQUFJQyxJQUFJLEdBQUcsTUFBTWpCLG9CQUFvQixDQUFDa0IsVUFBVSxDQUFDUCxnQkFBZ0IsQ0FBQztRQUN0RSxDQUFDO1FBQ0xsQixNQUFNLENBQUMwQixLQUFLLEVBQUUsQ0FBQztRQUNmOUIsR0FBRyxDQUFDK0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDQyxJQUFJLENBQUM7WUFBRUMsT0FBTyxFQUFFLHFCQUFxQjtTQUFFLENBQUMsQ0FBQztJQUMzRCxDQUFDO0FBQ0gsQ0FBQztBQUNELGlFQUFlbkMsT0FBTyxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmV4dGpzLWNvdXJzZS8uL3BhZ2VzL2FwaS9uZXctcmVjaXBlLmpzP2VlMDkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9uZ29DbGllbnQgfSBmcm9tIFwibW9uZ29kYlwiO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xyXG4gIGlmIChyZXEubWV0aG9kID09PSBcIlBPU1RcIikge1xyXG4gICAgY29uc3QgZGF0YSA9IHJlcS5ib2R5O1xyXG4gICAgY29uc3QgY2xpZW50ID0gYXdhaXQgTW9uZ29DbGllbnQuY29ubmVjdChcclxuICAgICAgXCJtb25nb2RiK3NydjovL0RhdGFCYXNlQWRtaW46MHVaQU5LREpTTkplQmgwdEBjbHVzdGVyMC5nM3lzZ2U0Lm1vbmdvZGIubmV0L0Zvb2RPcmdhbml6ZXI/cmV0cnlXcml0ZXM9dHJ1ZSZ3PW1ham9yaXR5XCJcclxuICAgICk7XHJcbiAgICBjb25zdCBkYiA9IGNsaWVudC5kYigpO1xyXG4gICAgY29uc3QgcmVjaXBlQ29sbGVjdGlvbiA9IGRiLmNvbGxlY3Rpb24oXCJSZWNpcGVcIik7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVjaXBlQ29sbGVjdGlvbi5pbnNlcnRPbmUoZGF0YSk7XHJcbiAgICAgICAgY29uc3QgaW5ncmVkaWVudENvbGxlY3Rpb24gPSBkYi5jb2xsZWN0aW9uKFwiSW5ncmVkaWVudFwiKTtcclxuICAgICAgICBjb25zdCBpbmdyZWRpZW50c0luQ29sbGVjdGlvbiA9IGF3YWl0IGluZ3JlZGllbnRDb2xsZWN0aW9uLmZpbmQoKS50b0FycmF5KCk7XHJcbiAgICAgICAgY29uc3QgbWlzc2luZ0luZ3JlZGllbnRzID0gZGF0YS5pbmdyZWRpZW50cy5maWx0ZXIoaW5ncmVkaWVudCA9PiAhaW5ncmVkaWVudHNJbkNvbGxlY3Rpb24uaW5jbHVkZXMoaW5ncmVkaWVudC5JbmdyZWRpZW50KSk7XHJcbiAgICAgICAgaWYgKG1pc3NpbmdJbmdyZWRpZW50cy5sZW5ndGggPiAwICl7XHJcbiAgICAgICAgICAgIGxldCBpbmdyZWRpZW50c1RvQWRkID0gbWlzc2luZ0luZ3JlZGllbnRzLm1hcCgoaW5ncmVkaWVudCkgPT4gKHtcclxuICAgICAgICAgICAgICAgIF9pZDogaW5ncmVkaWVudC5JbmdyZWRpZW50LFxyXG4gICAgICAgICAgICAgICAgTWVhc3VyZVR5cGU6IGluZ3JlZGllbnQuTWVhc3VyZW1lbnQsXHJcbiAgICAgICAgICAgICAgICBNZWFzdXJlQW1vdW50OiAwXHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgbGV0IHRlbXAgPSBhd2FpdCBpbmdyZWRpZW50Q29sbGVjdGlvbi5pbnNlcnRNYW55KGluZ3JlZGllbnRzVG9BZGQpO1xyXG4gICAgICAgIH1cclxuICAgIGNsaWVudC5jbG9zZSgpO1xyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBtZXNzYWdlOiBcIlJlY2lwZSBhZGRlZCB0byBEQi5cIiB9KTtcclxuICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgaGFuZGxlcjtcclxuIl0sIm5hbWVzIjpbIk1vbmdvQ2xpZW50IiwiaGFuZGxlciIsInJlcSIsInJlcyIsIm1ldGhvZCIsImRhdGEiLCJib2R5IiwiY2xpZW50IiwiY29ubmVjdCIsImRiIiwicmVjaXBlQ29sbGVjdGlvbiIsImNvbGxlY3Rpb24iLCJyZXN1bHQiLCJpbnNlcnRPbmUiLCJpbmdyZWRpZW50Q29sbGVjdGlvbiIsImluZ3JlZGllbnRzSW5Db2xsZWN0aW9uIiwiZmluZCIsInRvQXJyYXkiLCJtaXNzaW5nSW5ncmVkaWVudHMiLCJpbmdyZWRpZW50cyIsImZpbHRlciIsImluZ3JlZGllbnQiLCJpbmNsdWRlcyIsIkluZ3JlZGllbnQiLCJsZW5ndGgiLCJpbmdyZWRpZW50c1RvQWRkIiwibWFwIiwiX2lkIiwiTWVhc3VyZVR5cGUiLCJNZWFzdXJlbWVudCIsIk1lYXN1cmVBbW91bnQiLCJ0ZW1wIiwiaW5zZXJ0TWFueSIsImNsb3NlIiwic3RhdHVzIiwianNvbiIsIm1lc3NhZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./pages/api/new-recipe.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/new-recipe.js"));
module.exports = __webpack_exports__;

})();