/*  Number Sense  */

/*  Constants  */
var OPERATOR_SYMBOLS = ['+', '-', '*', '/'];
var MAX_RANDOM_NUMBERS = 4;
var MIN_TARGET_INTEGER = 1;
var MAX_TARGET_INTEGER = 20;
var RANDOM_MIN = 1;
var RANDOM_MAX = 9;

/*  Globals  */
var model;
var view;
var overlord;

var Model = function() {
	var self = this;
	var arrOperatorsFCP;  //Looks like:  [[+*+], [/-*], [-/-], etc.]
	var arrExpressionsRPN;
	var arrRandomNumbers;
	var arrSolutions;  //A solution is:  {integer, arrExpressions}

	self.init = function() {
		arrOperatorsFCP = createOperatorsFCP();
		self.newData();
	};

	/*  createOperatorsFCP()
	 *
	 *  FCP = Fundamental Counting Principle. Num of different arrangments for 4 choices, 3 slots = 4 * 4 * 4 = 64
	 *  Ex: [[+,*,+], [+,+,*], etc.]
	 *
	 *  return: array of arrays
	*/
	function createOperatorsFCP() {
		var arrAll = [];

		for (var i = 0; i < OPERATOR_SYMBOLS.length; i++) {
			for (var j = 0; j < OPERATOR_SYMBOLS.length; j++) {
				for (var k = 0; k < OPERATOR_SYMBOLS.length; k++) {
					var arrSingle = [OPERATOR_SYMBOLS[i], OPERATOR_SYMBOLS[j], OPERATOR_SYMBOLS[k]];
					arrAll.push(arrSingle);
				}
			}
		}

		return arrAll;
	}

	/*  self.newData(array of numbers)
	 *
	 *  1a. Generate new random numbers
	 *  1b. Or use numbers provided by user
	 *  2. Find all the permutations (without repeats) for those numbers
	 		(Have to do this each time in case of duplicate digits.  Thus, can't just store once upon init)
	 *  3. Form a Reverse Polish Notation expression from every combination of digits/operators
	 *  4. Convert from RPN to standard infix notation (that is, include parentheses)
	 *  5. Remove duplicate expressions
	 *  6. Evaluate every standard infix expression
	 		(Possibly implement an RPN math algo if speed is an actual issue.  However, eval() appears fast enough)
	 *  7. Whittle expressions down to those with a successful integer solution
	 *  8. Organize and group those expressions by integer solution
	 */
	self.newData = function(digits) {
		//1a.
		if (typeof(digits) === 'undefined') {
			arrRandomNumbers = newRandomNumbers();
		}
		//1b.
		else {
			arrRandomNumbers = digits;
		}
		//2.
		var arrDigitPermutations = createDigitPermutations(arrRandomNumbers);
		//3.
		var arrExpressionsRPN = createExpressionsRPN(arrDigitPermutations);
		//4.
		var arrExpressionsInfix = convertRPNtoInfix(arrExpressionsRPN);

		//5.
		var objExp = {};
		for (var i = 0; i < arrExpressionsInfix.length; i++) {
			objExp[arrExpressionsInfix[i]] = true;
		}
		arrExpressionsInfix = Object.keys(objExp);

		//6 and 7.
		arrSolutions = findIntegerSolutions(arrExpressionsInfix);

		//8.
		sortSolutions(arrSolutions);
		var arrIndexRangeOfEachSolution = findIndexRangeOfEachSolution(arrSolutions);
		arrSolutions = groupExpressionsBySolution(arrSolutions, arrIndexRangeOfEachSolution);
		includeEmptySolutions(arrSolutions);	
	}

	/*  newRandomNumbers()
	 *
	 *  return: array of numbers
	*/
	function newRandomNumbers() {
		var tempArr = [];

		for (var i = 0; i < MAX_RANDOM_NUMBERS; i++) {
			tempArr.push(generateRandomNumber());
		}

		return tempArr;

		function generateRandomNumber() {
			return Math.floor(Math.random() * RANDOM_MAX) + RANDOM_MIN;
		}
	}

	/*  createDigitPermutations(array of integers)
	 *
	 *  Finds all the permutations WITHOUT repetitions.  Ex:  [4,2,2,3] appears only ONCE.
	 *
	 *  Ideas and pieces via:
	 *  http://www.geeksforgeeks.org/write-a-c-program-to-print-all-permutations-of-a-given-string/
	 *  https://www.reddit.com/r/dailyprogrammer/comments/164zvs/010713_challenge_116_easy_permutation_of_a_string/
	 *
	 *  return: array of arrays of chars
	*/
	function createDigitPermutations(arrInts) {
		var results = {};

		permute(arrInts, 0);

		//convert the object key strings back into an array of chars
		var arrKeyStrings = Object.keys(results);
		var permutations = [];
		for (var i = 0; i < arrKeyStrings.length; i++) {
			permutations.push(arrKeyStrings[i].split(''));
		}

		return permutations;

		function permute(arr, start) {
			if (start === arr.length) {
				results[arr.join('')] = true;	//turn the permuted array into an object key.  **THIS eliminates the duplicates
			}
			else {
				for (var i = start; i < arr.length; i++) {
					swap(start, i);
					permute(arr.slice(), start + 1);
					swap(start, i);
				}
			}

			function swap(x, y) {
				var temp = arr[x];
				arr[x] = arr[y];
				arr[y] = temp;
			}
		}
	}

	/*  createExpressionsRPN(array)
	 *
	 *  Create a Reverse Polish Notation expression from every combination of digits/operators.
	 *
	 *  Idea of RPN via:
	 *  http://lisperator.net/blog/find-all-expressions-that-evaluate-to-some-value/
	 *
	 *  return array of arrays of chars
	*/
	function createExpressionsRPN(arrPermutations) {
		var arrRPN = [];

		for (var pIndex = 0; pIndex < arrPermutations.length; pIndex++) {  //each set of digits
			var n0 = arrPermutations[pIndex][0];
			var n1 = arrPermutations[pIndex][1];
			var n2 = arrPermutations[pIndex][2];
			var n3 = arrPermutations[pIndex][3];

			for (var oIndex = 0; oIndex < arrOperatorsFCP.length; oIndex++) {  //each set of operators
				var o0 = arrOperatorsFCP[oIndex][0];
				var o1 = arrOperatorsFCP[oIndex][1];
				var o2 = arrOperatorsFCP[oIndex][2];

				//create each combination of RPN expression:
				arrRPN.push([n0, n1, n2, n3, o0, o1, o2]);
				arrRPN.push([n0, n1, n2, o0, n3, o1, o2]);
				arrRPN.push([n0, n1, o0, n2, n3, o1, o2]);
				arrRPN.push([n0, n1, n2, o0, o1, n3, o2]);
				arrRPN.push([n0, n1, o0, n2, o1, n3, o2]);
			}
		}

		return arrRPN;
	}

	/*  convertRPNtoInfix(array of arrays of string characters)
	 *  
	 *  Take each Reverse Polish Notation expression and turn it into a standard infix expression (also with
	 *  the necessary parentheses) as a string
	 *
	 *  Code adapted from:
	 *  https://rosettacode.org/wiki/Parsing/RPN_to_infix_conversion#JavaScript
	 *
	 *  return array of infix expression strings
	*/
	function convertRPNtoInfix(arrRPNs) {
		var ARITY = 2;  //'arity' definition is 'number of operands the function accepts'.  All these operators require 2 operands
		var ASSOCIATIVITY = {
		    LEFT: 0,  //  a / b / c = (a / b) / c
		    //RIGHT: 1,  //  a ^ b ^ c = a ^ (b ^ c)
		    BOTH: 2, //  a + b + c = (a + b) + c = a + (b + c)
		};
		var operators = {
		    '+': { precedence: 2, associativity: ASSOCIATIVITY.BOTH },
		    '-': { precedence: 2, associativity: ASSOCIATIVITY.LEFT },
		    '*': { precedence: 3, associativity: ASSOCIATIVITY.BOTH },
		    '/': { precedence: 3, associativity: ASSOCIATIVITY.LEFT }
		    //'^': { precedence: 4, associativity: ASSOCIATIVITY.RIGHT },
		};
		
	/*  Class InfixNode
	 *
	 *  Groups a RPN operator (char) together with its corresponding operands (array of chars)
	*/
		function InfixNode(fnname, operands) {
	        this.fnname = fnname;
	        this.operands = operands;
		}

		/*  InfixNode.toString(number)
		 *
		 *  Turns each InfixNode into a mini-expression with (if necessary) parentheses
		 *  Can condense a set of nested InfixNodes into a single string.
		 *
		 *  return string of infix expression (with necessary parens)
		*/
		InfixNode.prototype.toString = function(parentPrecedence) {
			if (typeof(parentPrecedence) === 'undefined') {
				parentPrecedence = 0;
			}

			var op = operators[this.fnname];
	        //var leftAdd = op.associativity === ASSOCIATIVITY.RIGHT ? 0.01 : 0;  //not using ^ operator
	        var leftAdd = 0;
	        var rightAdd = op.associativity === ASSOCIATIVITY.LEFT ? 0.01 : 0;
	        //^The decimals are to contain the precedence within the range of an integer.  (If you used 1, parentPrecedence could wrongly trump op.precedence)

	        //if (this.operands.length !== 2) throw Error("invalid operand count");  //won't happen

	        /* Original RosettaCode:
	        //So the ` and ${} are "template literals", ECMA-6th
	        const result = this.operands[0].toString(op.precedence + leftAdd)
	            +` ${this.fnname} ${this.operands[1].toString(op.precedence + rightAdd)}`;
	        if (parentPrecedence > op.precedence) return `(${result})`;
	        else return result;
	        */

	        var result = this.operands[0].toString(op.precedence + leftAdd) + ' ' + this.fnname + ' '
	        			+ this.operands[1].toString(op.precedence + rightAdd);
	        if (parentPrecedence > op.precedence) {
	        	return '(' + result + ')';
	        }
	        else {
	        	return result;
	        }
	        /*
	        Interesting, was wondering why this.operands[1].toString(op.precedence + rightAdd) worked on
	        a digit.  It's because the digits are NOT actually numbers; they're strings.  This is because
	        the permutation arrays are actually arrays of strings, not numbers.  And thus the RPN arrays
	        actually consist of only string characters.  So that's why this function works.  If the digits were
	        instead Number objects, Number.toString(value) would convert them to different bases...
	        */

	        /* Example:  Final result = (3 - (3 + 6)) / 7
	        Start with InfixNode0 fn: /, operands: InfixNode1, "7"
	        op = '/', precedence = 3, parentP = 0
	        rightAdd = .01
	        (0 > 3)
	        yields: _InfixNode1.toString(3)_ + / + "7".toString --> String.toString() just equals "7"

	        op = '-', precedence = 2, parentP = 3
	        rightAdd = .01
	        result = "3".toString + - + _InfixNode2.toString(2.01)_ + "/ 7"
	        (3 > 2)
	        yields (3 - _InfixNode2.toString(2.01)_) / 7

	        op = '+', precedence = 2, paretP = 2.01
	        rightAdd = 0
	        result = (3 - _3 + 6_) / 7
	        (2.01 > 2)
	        yields: (3 - (3 + 6)) / 7
	        Cool.
	        */
		}

	/*  End of InfixNode Class  */

		/*  rpnToTree(array of chars)
		 *
		 *  Groups an RPN's single operator with its two corresponding operands as an InfixNode.  Collects all
		 *  of these InfixNodes together into one big InfixNode which can later be turned into a string.  
		 *
		 *  return InfixNode object
		*/
		function rpnToTree(arrSingleRPN) {
		    var stack = [];

		    for (var index = 0; index < arrSingleRPN.length; index++) {
		    	var element = arrSingleRPN[index];

		        if (element in operators) {
		            //if (stack.length < arity) throw Error("stack error");  //This would be for wrongly input RPNs, doesn't apply in my case
		            stack.push(new InfixNode(element, stack.splice(stack.length - ARITY)));
		        	/*^So this associates an operator with the two previous operands on the stack
		        	   An InfixNode stores the operator, and an array of two operands
		        	   An operand can also be another InfixNode.
		        	   One InfixNode = fn: +, operands 3 and 5
		        	   Next InfixNode = fn: -, operands 7 and first InfixNode (that is: 3, 5 with +)
		        	   Hence 7 - (3 + 5)
		        	   (See full examples after end of this function)
		        	*/
		        }
		        else {	//it's a digit
		        	stack.push(element);
		        }
		    }
		    //if (stack.length !== 1) throw Error("stack error " + stack);  //This also won't happen.  I believe this would handle the case of too many digits
		    return stack[0];  //**This is an InfixNode object
		}
			/* Sample stack steps for 2 4 8 9 + + +:
			[2]
			[2,4]
			[2,4,8]
			[2,4,8,9]
			//now it's a plus, so make an infix node with that and the two preceeding operators in the array:
			[2,4,InfixNode]
			//now it's another plus, so make an infix node with the previous infixnode (now acting as an operand) and the preceding digit
			[2,InfixNode]
			//Same situation as above line:
			[InfixNode]
			return stack[0] = that infix node
			Changing to string = 2 + 4 + 8 + 9

			Sample stack steps for 2 3 3 + - 7 /
			[2]
			[2,3]
			[2,3,3]
			[2,InfixNode containing fn +, operands 3 and 3]  // +
			[InfixNode containing fn -, operands 2 and 3,3,+]  // -
			[InfixNode, 7]
			[InfixNode containing fn / operands (2,- and 3,3,+) and 7]  // /
			return stack[0] = that whole, complete infix node
			Changing to string = (2 - (3 + 3)) / 7
			*/

		//Convert all RPN arrays to Infix strings:
		var allInfixStrings = [];
		for (var i = 0; i < arrRPNs.length; i++) {
			var finalInfixNode = rpnToTree(arrRPNs[i]);
		    allInfixStrings.push(finalInfixNode.toString());
		}

		return allInfixStrings;
	}

	/*  findIntegerSolutions(array of strings)
	 *
	 *  Evaluate each string math expression
	 *
	 *  NOTE:  eval() seems fast/efficient enough.  An RPN algo is likely faster if the speed is needed.
	 *  Possible help:  https://www.thepolyglotdeveloper.com/2015/04/evaluate-a-reverse-polish-notation-equation-with-javascript/
	 *
	 *  return array of objects {integer, strExpression}
	*/
	function findIntegerSolutions(arrExps) {
		var arrAllTargets = [];

		for (var i = 0; i < arrExps.length; i++) {
			var solution = eval(arrExps[i]);

			if (evaluateSolution(solution)) {
				arrAllTargets.push({'integer': solution, 'expression': arrExps[i]});
			}
		}

		return arrAllTargets;

		/*  evaluateSolution(number)
		 *
		 *  Accept only integer solutions between 1 and 20
		 *
		 *  return true/false
		*/
		function evaluateSolution(solution) {
			if (solution < 1 || solution > MAX_TARGET_INTEGER) {
				return false;
			}

			if (!Number.isInteger(solution)) {
				return false;
			}

			return true;
		}
	}

	/*  sortSolutions(array)
	 *
	 *  return array
	*/
	function sortSolutions(array) {
		array.sort(function(a, b) {  //via:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
			return a.integer - b.integer;
		});

		return array;
	}

	/*  findIndexRangeOfEachSolution(array of solutions: {integer, expression})
	 *
	 *  In the giant list of solutions/expressions, find the starting index and final index of each expression
	 *  for a given integer.  Ex:  how many expressions are there that evaluate to 2?  Starting index = 37 to
	 *  final index = 88.  Used to later slice these expressions from the giant list and group them in arrays for each integer
	 *
	 *  return array of ranges {integer, begIndex, endIndex}
	*/
	function findIndexRangeOfEachSolution(arrSols) {
		var integer = arrSols[0].integer;
		var begIndex = 0, endIndex;
		var arrRanges = [];

		for (var i = 0; i < arrSols.length; i++) 
		{
			if (integer !== arrSols[i].integer) {
				handleEndOfRange();
				begIndex = i;
				integer = arrSols[i].integer;
			}
		}
		handleEndOfRange();

		return arrRanges;

		function handleEndOfRange() {
			endIndex = i - 1;
			arrRanges.push({'integer': integer, 'begIndex': begIndex, 'endIndex': endIndex});
		}
	}

	/*  groupExpressionsBySolution(array of solutions, array of ranges)
	 *
	 *  Take the giant list of {integer, expression} objects and turn them into {integer, [expressions]}
	 *
	 *  return array of {integer, [expressions]}
	*/
	function groupExpressionsBySolution(arrSols, arrRanges) {
		var arrFinalSols = [];

		for (var i = 0; i < arrRanges.length; i++) {
			var arrObjs = arrSols.slice(arrRanges[i].begIndex, arrRanges[i].endIndex + 1);

			var listOfExpressions = [];
			for (j = 0; j < arrObjs.length; j++) {
				listOfExpressions.push(arrObjs[j].expression);
			}

			arrFinalSols.push({'integer': arrRanges[i].integer, 'arrExpressions': listOfExpressions});
		}

		return arrFinalSols;
	}

	/*  includeEmptySolutions(array of solutions)
	 *
	 *  If there is no solution for a particular integer, add this information back into the final list of
	 *  {integer, [expressions]} objects.  Ex:  If no expression = 2, include a {2, [empty]} object in the list
	*/
	function includeEmptySolutions(arrSols) {
		var i = 0;
		var integer = 1;

		while (i < arrSols.length) {
			if (integer < arrSols[i].integer) {
				for (integer; integer < arrSols[i].integer; integer++) {
					arrSols.splice(i, 0, {'integer': integer, 'arrExpressions': []});
				}
			}
			else {
				integer++;
			}
			i++;
		}

		//In case there aren't solutions for the upper numbers (beyond the end of arrSols), add placeholders in, too
		for (integer; integer <= MAX_TARGET_INTEGER; integer++) {
			arrSols.push({'integer': integer, 'arrExpressions': []});
		}
	}

	/*  Getters for View
	*/
	self.getDigits = function() {
		return arrRandomNumbers;
	};

	self.getArrSolutions = function() {
		return arrSolutions;
	};
};


var Overlord = function() {
	var self = this;

	self.init = function() {
		model.init();
		view.init();
	};

	self.getDigits = function() {
		return model.getDigits();
	};

	self.getArrSolutions = function() {
		return model.getArrSolutions();
	};

	self.newRound = function(userDigits) {
		model.newData(userDigits);
		view.refreshView();
	};
};


var View = function() {
	var self = this;

	//Digits-related
	var h2Digits = document.getElementById('digits');
	var btnNewRound = document.getElementById('new-round');
	var btnChooseDigits = document.getElementById('user-digits');
	var txtDigitsEntry = document.getElementById('digits-entry');
	//Chart-related
	var divChart = document.getElementById('chart');
	var arrDivBars = [];
	//Solutions-related
	var h3ListHeader = document.getElementById('list-header');
	var magooshHeader = h3ListHeader.innerHTML;
	var divSolutionList = document.getElementById('list-container');
	var htmlInstructions = divSolutionList.innerHTML;
	//Search-related
	var txtExpressionEntry = document.getElementById('expression-entry');
	var txtIntegerEntry = document.getElementById('integer-entry');
	var btnSearch = document.getElementById('search');


	self.init = function() {
		displayDigits();
		createSolutionsChart();
		displayBars();

		setUpEventListeners();
	};

	/*  self.refreshView()
	 *
	 *  Update the digits and bar graph
	*/
	self.refreshView = function() {
		displayInstructions();
		displayDigits();
		displayBars();
		clearUserInput();
	};

	/*  displayDigits()
	 *
	 *  Update the view of the four random digits
	*/
	function displayDigits() {
		var arrDigits = overlord.getDigits();
		var strDigits = arrDigits.join(' ');

		h2Digits.innerHTML = strDigits;
	}

	/*  clearUserInput()
	 *
	 *  Reset the text input boxes
	*/
	function clearUserInput() {
		txtDigitsEntry.value = '';
		txtExpressionEntry.value = '';
		txtIntegerEntry.value = '';
	}

	/*  createSolutionsChart()
	 *
	 *  Create all the bar and integer cells
	*/
	function createSolutionsChart() {
		var divRowBar = document.createElement('div');
		divRowBar.id = 'row-bar';
		var divRowIntegers = document.createElement('div');
		divRowIntegers.id = 'row-integers';

		for (var i = 0; i < MAX_TARGET_INTEGER; i++) {
			//Bar-container cells
			var divBarContainer = document.createElement('div');
			divBarContainer.className = 'bar-container spacing';
			divBarContainer.id = 'c' + i;
			//Bar cells
			var divBar = document.createElement('div');
			divBar.id = 'b' + i;
			divBarContainer.appendChild(divBar);
			divRowBar.appendChild(divBarContainer);

			arrDivBars.push(divBar);

			//Integer cells
			var divInteger = document.createElement('div');
			divInteger.className = 'integer spacing';
			divInteger.id = 'i' + i;
			divInteger.innerHTML = i+1;
			divRowIntegers.appendChild(divInteger);
		}

		var fragment = document.createDocumentFragment();
		fragment.appendChild(divRowBar);
		fragment.appendChild(divRowIntegers);

		divChart.appendChild(fragment);
	}

	/*  displayBars()
	 *
	 *  Display the number of solutions per integer bars and animate them, rising from floor to ceiling
	 *  Integer with highest total is scaled to nearly 100% of the chart height, the rest as a percentage
	 *  of that integer's total.
	*/
	function displayBars() {
		resetBarsForAnimation();

		function resetBarsForAnimation() {
			for (var i = 0; i < MAX_TARGET_INTEGER; i++) {
				arrDivBars[i].className = 'bar';
				arrDivBars[i].style.height = 0;
			}

			setTimeout(display, 75);  //delay, otherwise doesn't animate from bottom
		}

		function display() {
			var arrSolutions = overlord.getArrSolutions();
			var highCount = 0;
			var MIN_HEIGHT = 10;

			for (var i = 0; i < arrSolutions.length; i++) {
				if (arrSolutions[i].arrExpressions.length > highCount) {
					highCount = arrSolutions[i].arrExpressions.length;
				}
			}

			for (var i = 0; i < arrSolutions.length; i++) {
				arrDivBars[i].innerHTML = arrSolutions[i].arrExpressions.length;
				arrDivBars[i].className = 'bar bar-animate';

				var height = arrSolutions[i].arrExpressions.length / highCount * 89 + MIN_HEIGHT;

				if (height === MIN_HEIGHT) {
					arrDivBars[i].className += ' hide';
				}

				height += '%';

				arrDivBars[i].style.height = height;
			}
		}
	}

	/*  displayInstructions()
	 *
	 *  For any new round, show instructions on how to play
	*/
	function displayInstructions() {
		h3ListHeader.innerHTML = magooshHeader;
		divSolutionList.innerHTML = htmlInstructions;
	}

	/*  setUpEventListeners()
	 *
	 *  Make touchable/clickable the bars and integers on the chart.  They display that integer's solutions
	 *  Make touchable/clickable the buttons
	 *
	 *  NOTE: Doesn't look like you need to do a separate touchevent nowadays.  Declaring a viewport in the
	 *  	HTML header is apparently sufficient to avoid the touch "click" delay.  
	*/
	function setUpEventListeners() {
		divChart.addEventListener('click', function(event) {
			var index = event.target.id.replace(/b|c|i/, '');

			displaySolutions(index);
		});

		btnNewRound.addEventListener('click', function() {
			overlord.newRound();
		});

		btnChooseDigits.addEventListener('click', function() {
			if (txtDigitsEntry.className === 'hide') {
				txtDigitsEntry.className = '';
				this.innerHTML = 'Use These Digits';
			}
			else {
				var regExp = /[^1-9]/;
				var strText = txtDigitsEntry.value;
				var hasNonDigits = regExp.test(strText);

				if (hasNonDigits === true || strText.length !== 4) {
					txtDigitsEntry.value = '';
				}
				else {
					overlord.newRound(strText.split(''));
				}
			}
		});

		txtDigitsEntry.addEventListener('input', function() {
			if (this.value.length > 4) {
				this.value = '';
			}
		});

		txtDigitsEntry.addEventListener('keyup', function(event) {
			event.preventDefault();
			if (event.keyCode === 13) {  //'Enter' key
				btnChooseDigits.click();
			}
		});

		btnSearch.addEventListener('click', searchForSolution);

		txtIntegerEntry.addEventListener('input', function() {
			if (this.value.length > 2) {
				this.value = '';
			}
		});

		txtIntegerEntry.addEventListener('keyup', function(event) {
			event.preventDefault();
			if (event.keyCode === 13) {  //'Enter' key
				btnSearch.click();
			}
		});

		txtExpressionEntry.addEventListener('keyup', function(event) {
			event.preventDefault();
			if (event.keyCode === 13) {  //'Enter' key
				btnSearch.click();
			}
		});
	}

	/*  displaySolutions(integer)
	 *
	 *  Take the clicked bar/integer and display all of that integer's solutions in an ordered list, if any
	*/
	function displaySolutions(integerIndex) {
		var arrSolutions = overlord.getArrSolutions();
		var strAllSolutions = "No solutions.";

		if (arrSolutions[integerIndex].arrExpressions.length > 0) {
			strAllSolutions = '<ol><li>' + arrSolutions[integerIndex].arrExpressions.join('</li><li>') + '</li></ol>';
		}

		integerIndex++;
		h3ListHeader.innerHTML = 'Solutions for ' + integerIndex + ':';
		divSolutionList.innerHTML = strAllSolutions;
		divSolutionList.scrollTop = '0';
	}

	/*  searchForSolution()
	 *
	 *  Validate user expression and integer input.  If fail, display error messages.
	 *
	 *  Searches provided integer's solution list to see if there's a match.
	 *    ^Handles missing or extra spaces 
	*/
	function searchForSolution() {
		var arrSolutions = overlord.getArrSolutions();
		var strInteger = txtIntegerEntry.value;
		var strExpression = txtExpressionEntry.value;
		var integerIndex = -1;
		var strOutput = '';

		var boolValidExpression = validateExpressionInput();
		var boolValidInteger = validateIntegerInput();

		if (boolValidExpression && boolValidInteger) {
			isSolutionFound();
		}

		h3ListHeader.innerHTML = 'Solution Check';
		divSolutionList.innerHTML = strOutput;

		function validateIntegerInput() {
			var regExp = /[^0-9]/;
			var hasNonDigits = regExp.test(strInteger);

			if (hasNonDigits === true || strInteger.length > 2) {
				strOutput += '<p>Invalid integer on right-hand side.</p>';
				return false;
			}
			else if (strInteger === '') {
				strOutput += 'Missing integer on right-hand side.</p>';
			}
			else {
				integerIndex = parseInt(strInteger);
				if (integerIndex < MIN_TARGET_INTEGER || integerIndex > MAX_TARGET_INTEGER) {
					strOutput += '<p>Invalid integer on right-hand side.</p>';
					return false;
				}
				integerIndex--;
				return true;
			}
		}

		function validateExpressionInput() {
			var regExp = /[^1-9+-\/\*\(\)\s]/;
			var hasNonValidInput = regExp.test(strExpression);

			if (hasNonValidInput === true || strInteger.length > 20) {
				strOutput += '<p>Invalid characters in expression.</p>';
				return false;
			}
			else if (strExpression === '') {
				strOutput += '<p>Missing expression.</p>';
				return false;
			}
			else {
				strExpression = strExpression.replace(/\s/g, '');
				strExpression = strExpression.split('').join(' ');
				strExpression = strExpression.replace(/\(\s/g, '(');
				strExpression = strExpression.replace(/\s\)/g, ')');
				return true;
			}
		}

		function isSolutionFound() {
			var len = arrSolutions[integerIndex].arrExpressions.length;

			for (var i = 0; i < len; i++) {
				if (arrSolutions[integerIndex].arrExpressions[i] === strExpression) {
					strOutput = '<p>Solution found in list! &nbsp; =)</p>';
					return true;
				}
			}

			strOutput = '<p>Not a solution in the list.</p>';

			//eval can't handle something like '2 2'.  The space followed by another number throws an error.
			//It must be expecting an operator.  Quick fix = remove all spaces from the expression:
			strExpression = strExpression.replace(/\s/g, '');
			var testExpression = eval(strExpression);
			if (testExpression !== parseInt(strInteger)) {
				strOutput += '<p>Also, that expression does not equal ' + strInteger + '.</p>';
			}
		}
	}
};

(function() {
	model = new Model();
	view = new View();
	overlord = new Overlord();

	overlord.init();
})();