var OPERATOR_SYMBOLS=["+","-","*","/"],MAX_RANDOM_NUMBERS=4,MIN_TARGET_INTEGER=1,MAX_TARGET_INTEGER=20,RANDOM_MIN=1,RANDOM_MAX=9,model,view,overlord,Model=function(){function createOperatorsFCP(){for(var e=[],t=0;t<OPERATOR_SYMBOLS.length;t++)for(var n=0;n<OPERATOR_SYMBOLS.length;n++)for(var r=0;r<OPERATOR_SYMBOLS.length;r++){var i=[OPERATOR_SYMBOLS[t],OPERATOR_SYMBOLS[n],OPERATOR_SYMBOLS[r]];e.push(i)}return e}function newRandomNumbers(){function e(){return Math.floor(Math.random()*RANDOM_MAX)+RANDOM_MIN}for(var t=[],n=0;MAX_RANDOM_NUMBERS>n;n++)t.push(e());return t}function createDigitPermutations(e){function t(e,r){function i(t,n){var r=e[t];e[t]=e[n],e[n]=r}if(r===e.length)n[e.join("")]=!0;else for(var s=r;s<e.length;s++)i(r,s),t(e.slice(),r+1),i(r,s)}var n={};t(e,0);for(var r=Object.keys(n),i=[],s=0;s<r.length;s++)i.push(r[s].split(""));return i}function createExpressionsRPN(e){for(var t=[],n=0;n<e.length;n++)for(var r=e[n][0],i=e[n][1],s=e[n][2],o=e[n][3],a=0;a<arrOperatorsFCP.length;a++){var u=arrOperatorsFCP[a][0],l=arrOperatorsFCP[a][1],d=arrOperatorsFCP[a][2];t.push([r,i,s,o,u,l,d]),t.push([r,i,s,u,o,l,d]),t.push([r,i,u,s,o,l,d]),t.push([r,i,s,u,l,o,d]),t.push([r,i,u,s,l,o,d])}return t}function convertRPNtoInfix(e){function t(e,t){this.fnname=e,this.operands=t}function n(e){for(var n=[],i=0;i<e.length;i++){var o=e[i];o in s?n.push(new t(o,n.splice(n.length-r))):n.push(o)}return n[0]}var r=2,i={LEFT:0,BOTH:2},s={"+":{precedence:2,associativity:i.BOTH},"-":{precedence:2,associativity:i.LEFT},"*":{precedence:3,associativity:i.BOTH},"/":{precedence:3,associativity:i.LEFT}};t.prototype.toString=function(e){"undefined"==typeof e&&(e=0);var t=s[this.fnname],n=0,r=t.associativity===i.LEFT?.01:0,o=this.operands[0].toString(t.precedence+n)+" "+this.fnname+" "+this.operands[1].toString(t.precedence+r);return e>t.precedence?"("+o+")":o};for(var o=[],a=0;a<e.length;a++){var u=n(e[a]);o.push(u.toString())}return o}function findIntegerSolutions(arrExps){function evaluateSolution(e){return 1>e||e>MAX_TARGET_INTEGER?!1:Number.isInteger(e)?!0:!1}for(var arrAllTargets=[],i=0;i<arrExps.length;i++){var solution=eval(arrExps[i]);evaluateSolution(solution)&&arrAllTargets.push({integer:solution,expression:arrExps[i]})}return arrAllTargets}function sortSolutions(e){return e.sort(function(e,t){return e.integer-t.integer}),e}function findIndexRangeOfEachSolution(e){function t(){n=o-1,s.push({integer:r,begIndex:i,endIndex:n})}for(var n,r=e[0].integer,i=0,s=[],o=0;o<e.length;o++)r!==e[o].integer&&(t(),i=o,r=e[o].integer);return t(),s}function groupExpressionsBySolution(e,t){for(var n=[],r=0;r<t.length;r++){var i=e.slice(t[r].begIndex,t[r].endIndex+1),s=[];for(j=0;j<i.length;j++)s.push(i[j].expression);n.push({integer:t[r].integer,arrExpressions:s})}return n}function includeEmptySolutions(e){for(var t=0,n=1;t<e.length;){if(n<e[t].integer)for(n;n<e[t].integer;n++)e.splice(t,0,{integer:n,arrExpressions:[]});else n++;t++}for(n;MAX_TARGET_INTEGER>=n;n++)e.push({integer:n,arrExpressions:[]})}var self=this,arrOperatorsFCP,arrExpressionsRPN,arrRandomNumbers,arrSolutions;self.init=function(){arrOperatorsFCP=createOperatorsFCP(),self.newData()},self.newData=function(e){arrRandomNumbers="undefined"==typeof e?newRandomNumbers():e;for(var t=createDigitPermutations(arrRandomNumbers),n=createExpressionsRPN(t),r=convertRPNtoInfix(n),i={},s=0;s<r.length;s++)i[r[s]]=!0;r=Object.keys(i),arrSolutions=findIntegerSolutions(r),sortSolutions(arrSolutions);var o=findIndexRangeOfEachSolution(arrSolutions);arrSolutions=groupExpressionsBySolution(arrSolutions,o),includeEmptySolutions(arrSolutions)},self.getDigits=function(){return arrRandomNumbers},self.getArrSolutions=function(){return arrSolutions}},Overlord=function(){var e=this;e.init=function(){model.init(),view.init()},e.getDigits=function(){return model.getDigits()},e.getArrSolutions=function(){return model.getArrSolutions()},e.newRound=function(e){model.newData(e),view.refreshView()}},View=function(){function displayDigits(){var e=overlord.getDigits(),t=e.join(" ");h2Digits.innerHTML=t}function clearUserInput(){txtDigitsEntry.value="",txtExpressionEntry.value="",txtIntegerEntry.value=""}function createSolutionsChart(){var e=document.createElement("div");e.id="row-bar";var t=document.createElement("div");t.id="row-integers";for(var n=0;MAX_TARGET_INTEGER>n;n++){var r=document.createElement("div");r.className="bar-container spacing",r.id="c"+n;var i=document.createElement("div");i.id="b"+n,r.appendChild(i),e.appendChild(r),arrDivBars.push(i);var s=document.createElement("div");s.className="integer spacing",s.id="i"+n,s.innerHTML=n+1,t.appendChild(s)}var o=document.createDocumentFragment();o.appendChild(e),o.appendChild(t),divChart.appendChild(o)}function displayBars(){function e(){for(var e=0;MAX_TARGET_INTEGER>e;e++)arrDivBars[e].className="bar",arrDivBars[e].style.height=0;setTimeout(t,75)}function t(){for(var e=overlord.getArrSolutions(),t=0,n=10,r=0;r<e.length;r++)e[r].arrExpressions.length>t&&(t=e[r].arrExpressions.length);for(var r=0;r<e.length;r++){arrDivBars[r].innerHTML=e[r].arrExpressions.length,arrDivBars[r].className="bar bar-animate";var i=e[r].arrExpressions.length/t*89+n;i===n&&(arrDivBars[r].className+=" hide"),i+="%",arrDivBars[r].style.height=i}}e()}function displayInstructions(){h3ListHeader.innerHTML=magooshHeader,divSolutionList.innerHTML=htmlInstructions}function setUpEventListeners(){divChart.addEventListener("click",function(e){var t=e.target.id.replace(/b|c|i/,"");displaySolutions(t)}),btnNewRound.addEventListener("click",function(){overlord.newRound()}),btnChooseDigits.addEventListener("click",function(){if("hide"===txtDigitsEntry.className)txtDigitsEntry.className="",this.innerHTML="Use These Digits";else{var e=/[^1-9]/,t=txtDigitsEntry.value,n=e.test(t);n===!0||4!==t.length?txtDigitsEntry.value="":overlord.newRound(t.split(""))}}),txtDigitsEntry.addEventListener("input",function(){this.value.length>4&&(this.value="")}),txtDigitsEntry.addEventListener("keyup",function(e){e.preventDefault(),13===e.keyCode&&btnChooseDigits.click()}),btnSearch.addEventListener("click",searchForSolution),txtIntegerEntry.addEventListener("input",function(){this.value.length>2&&(this.value="")}),txtIntegerEntry.addEventListener("keyup",function(e){e.preventDefault(),13===e.keyCode&&btnSearch.click()}),txtExpressionEntry.addEventListener("keyup",function(e){e.preventDefault(),13===e.keyCode&&btnSearch.click()})}function displaySolutions(e){var t=overlord.getArrSolutions(),n="No solutions.";t[e].arrExpressions.length>0&&(n="<ol><li>"+t[e].arrExpressions.join("</li><li>")+"</li></ol>"),e++,h3ListHeader.innerHTML="Solutions for "+e+":",divSolutionList.innerHTML=n,divSolutionList.scrollTop="0"}function searchForSolution(){function validateIntegerInput(){var e=/[^0-9]/,t=e.test(strInteger);return t===!0||strInteger.length>2?(strOutput+="<p>Invalid integer on right-hand side.</p>",!1):""!==strInteger?(integerIndex=parseInt(strInteger),MIN_TARGET_INTEGER>integerIndex||integerIndex>MAX_TARGET_INTEGER?(strOutput+="<p>Invalid integer on right-hand side.</p>",!1):(integerIndex--,!0)):void(strOutput+="Missing integer on right-hand side.</p>")}function validateExpressionInput(){var e=/[^1-9+-\/\*\(\)\s]/,t=e.test(strExpression);return t===!0||strInteger.length>20?(strOutput+="<p>Invalid characters in expression.</p>",!1):""===strExpression?(strOutput+="<p>Missing expression.</p>",!1):(strExpression=strExpression.replace(/\s/g,""),strExpression=strExpression.split("").join(" "),strExpression=strExpression.replace(/\(\s/g,"("),strExpression=strExpression.replace(/\s\)/g,")"),!0)}function isSolutionFound(){for(var len=arrSolutions[integerIndex].arrExpressions.length,i=0;len>i;i++)if(arrSolutions[integerIndex].arrExpressions[i]===strExpression)return strOutput="<p>Solution found in list! &nbsp; =)</p>",!0;strOutput="<p>Not a solution in the list.</p>",strExpression=strExpression.replace(/\s/g,"");var testExpression=eval(strExpression);testExpression!==parseInt(strInteger)&&(strOutput+="<p>Also, that expression does not equal "+strInteger+".</p>")}var arrSolutions=overlord.getArrSolutions(),strInteger=txtIntegerEntry.value,strExpression=txtExpressionEntry.value,integerIndex=-1,strOutput="",boolValidExpression=validateExpressionInput(),boolValidInteger=validateIntegerInput();boolValidExpression&&boolValidInteger&&isSolutionFound(),h3ListHeader.innerHTML="Solution Check",divSolutionList.innerHTML=strOutput}var self=this,h2Digits=document.getElementById("digits"),btnNewRound=document.getElementById("new-round"),btnChooseDigits=document.getElementById("user-digits"),txtDigitsEntry=document.getElementById("digits-entry"),divChart=document.getElementById("chart"),arrDivBars=[],h3ListHeader=document.getElementById("list-header"),magooshHeader=h3ListHeader.innerHTML,divSolutionList=document.getElementById("list-container"),htmlInstructions=divSolutionList.innerHTML,txtExpressionEntry=document.getElementById("expression-entry"),txtIntegerEntry=document.getElementById("integer-entry"),btnSearch=document.getElementById("search");self.init=function(){displayDigits(),createSolutionsChart(),displayBars(),setUpEventListeners()},self.refreshView=function(){displayInstructions(),displayDigits(),displayBars(),clearUserInput()}};!function(){model=new Model,view=new View,overlord=new Overlord,overlord.init()}();