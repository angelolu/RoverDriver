/*! For license information please see 5.3100af0d.chunk.js.LICENSE.txt */
(this.webpackJsonproverdriverweb=this.webpackJsonproverdriverweb||[]).push([[5],{236:function(e,n,t){"use strict";function r(e,n){(null==n||n>e.length)&&(n=e.length);for(var t=0,r=new Array(n);t<n;t++)r[t]=e[t];return r}function o(e){return function(e){if(Array.isArray(e))return r(e)}(e)||function(e){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,n){if(e){if("string"===typeof e)return r(e,n);var t=Object.prototype.toString.call(e).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?r(e,n):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}t.d(n,"a",(function(){return o}))},240:function(e,n,t){"use strict";t.r(n);var r=t(8),o=t(236),i=t(15);n.default=Object(i.a)(r.mark((function e(){var n,t=arguments;return r.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.length>0&&void 0!==t[0]?t[0]:{},e.abrupt("return",new Promise((function(e,t){var r=document.createElement("input");r.type="file";var i=[].concat(Object(o.a)(n.mimeTypes?n.mimeTypes:[]),[n.extensions?n.extensions:[]]).join();r.multiple=n.multiple||!1,r.accept=i||"";var a=function e(){window.removeEventListener("pointermove",e),window.removeEventListener("pointerdown",e),window.removeEventListener("keydown",e),t(new DOMException("The user aborted a request.","AbortError"))};window.addEventListener("pointermove",a),window.addEventListener("pointerdown",a),window.addEventListener("keydown",a),r.addEventListener("change",(function(){window.removeEventListener("pointermove",a),window.removeEventListener("pointerdown",a),window.removeEventListener("keydown",a),e(r.multiple?r.files:r.files[0])})),r.click()})));case 2:case"end":return e.stop()}}),e)})))}}]);
//# sourceMappingURL=5.3100af0d.chunk.js.map