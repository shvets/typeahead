/*var isOpera = navigator.userAgent.indexOf("Opera [3]") > -1;
 var isIE = navigator.userAgent.indexOf("MSIE [4]") > 1 && !isOpera;
 var isMoz = navigator.userAgent.indexOf("Mozilla/5.") == 0 && !isOpera;
 */

/**
 * Data class for holding pair information.
 *
 * @author Alexander Shvets
 * @version 1.0
 */
function AutoSuggestPair(key /*:String */, content /*:String */) {
  this.key = key;
  this.content = content;
}

/**
 * The implementation of Data provider.
 *
 * @author Alexander Shvets
 * @version 1.0
 */
function SuggesionsProvider(id, name) {
  this.id = id;
  this.name = name;

  this.previousPartialValue = "";
  this.previousPartialSuggestions = [];
}

SuggesionsProvider.prototype.getAllSuggestions = function () {
  return this.allSuggestions;
};

SuggesionsProvider.prototype.setAllSuggestions = function (allSuggestions) {
  this.allSuggestions = allSuggestions;
};

SuggesionsProvider.prototype.setPreviousPartialValue = function (previousPartialValue) {
  this.previousPartialValue = previousPartialValue;
};

SuggesionsProvider.prototype.setPreviousPartialSuggestions = function (previousPartialSuggestions) {
  this.previousPartialSuggestions = previousPartialSuggestions;
};

/**
 * This function will be defined ouside for AJAX-ready code.
 */
SuggesionsProvider.prototype.getSuggestions = function (partialValue) {
  var newSuggestions = [];

  if (!partialValue || partialValue.length == 0) {
    newSuggestions = this.getAllSuggestions();
  }
  else {
    var sTextboxValue = partialValue.toLowerCase();

    if (sTextboxValue.length > 0) {
      // Search for matching suggestions.
      var suggestions;

      if (this.previousPartialValue.length > 0 &&
          this.previousPartialValue.length < sTextboxValue.length &&
          sTextboxValue.toLowerCase().indexOf(this.previousPartialValue.toLowerCase()) != -1) {
        suggestions = this.previousPartialSuggestions;
      }
      else {
        suggestions = this.getAllSuggestions();
      }

      for (var i = 0; i < suggestions.length; i++) {
        var pair = suggestions[i];
        var content = pair.content.toLowerCase();

        if (content.indexOf(sTextboxValue) == 0) {
          newSuggestions.push(pair);
        }
      }
    }
  }

  return newSuggestions;
};

/**
 * An autosuggest textbox control.
 *
 * @author Alexander Shvets
 * @version 1.0
 */
function AutoSuggestControl(provider, textBoxId /*:String */, hiddenFieldId /*:String */, layerId,
                            isAjaxAware) {
  this.provider = provider;

  this.layer1 = document.getElementById(layerId);
  this.layer2 = document.createElement("div");

  this.textbox = this.findChildInputControl(this.layer1, textBoxId);
  this.hiddenField = this.findChildInputControl(this.layer1, hiddenFieldId);

  this.select = document.createElement("select");

  this.displayCompleteList = false;

  this.isAjaxAware = isAjaxAware;

  if (this.isAjaxAware == 'undefined') {
    this.isAjaxAware = false;
  }

  this.init();
}

/**
 * Initializes the control.
 */
AutoSuggestControl.prototype.init = function () {
  this.clearOriginalValues();
  if (this.textbox.value == null) {
    this.textbox.value = '';
  }

  if (this.hiddenField.value == null) {
    this.hiddenField.value = '';
  }

  // Create the layer and assign styles.
  this.layer2.id = this.textbox.id + "_div2";
  this.layer2.className = "suggestions";
  this.layer2.style.visibility = "hidden";
  this.layer2.style.width = this.textbox.offsetWidth;
  this.layer2.style.position = "absolute";

  document.body.appendChild(this.layer2);

  this.layer2.appendChild(this.select);

  var oThis = this;

  // Assign onkeydown event handler.
  this.textbox.onkeydown = function (oEvent) {
    oThis.onKeyDownTextBox(oEvent);
  };

  // Assign the onkeyup event handler.
  this.textbox.onkeyup = function (oEvent) {
    oThis.onKeyUpTextBox(oEvent);
  };

  // Assign ondblclick event handler.
  this.textbox.ondblclick = function () {
    oThis.onDblClickTextBox();
  };

  this.textbox.onblur = function () {
    if (oThis.textbox.value != '') {
      var suggestions = oThis.provider.getSuggestions(oThis.textbox.value);

      var found = false;
      var foundKey;
      for (var i = 0; i < suggestions.length && !found; i++) {
        var pair = suggestions[i];

        if (pair.content == oThis.textbox.value) {
          found = true;
          foundKey = pair.key;
        }
      }

      if (found) {
        oThis.hiddenField.value = foundKey;
      }
      else {
        oThis.hiddenField.value = '';
      }
    }
    else {
      oThis.hiddenField.value = '';
    }

    /*    if (oThis.textbox.value != '') {
     var suggestions = oThis.provider.getSuggestions(oThis.textbox.value);

     var found = false;
     var foundKey;
     for (var i = 0; i < suggestions.length && !found; i++) {
     var pair = suggestions[i];

     if (pair.content == oThis.textbox.value) {
     found = true;
     foundKey = pair.key;
     }
     }

     if (found) {
     oThis.hiddenField.value = foundKey;
     }
     else if (!oThis.isSelectOpen()) {
     if (oThis.textbox.createTextRange) { // Internet Explorer
     alert("Please finish typing.");
     }

     oThis.textbox.focus();
     }
     }
     else if (oThis.hiddenField.value == '') {
     if (!oThis.isSelectOpen() && oThis.select.selectedIndex < 0) {
     oThis.restoreDefaultValues();
     }
     }
     else {
     if (oThis.textbox.value == '') {
     oThis.hiddenField.value = '';

     oThis.restoreDefaultValues();
     }
     else {
     if (!oThis.isSelectOpen() && oThis.select.selectedIndex < 0) {
     if (oThis.isAjaxAware) {
     Suggestions.search(oThis.provider.name, oThis.hiddenField.value, oThis.textbox.value,
     function(found) {
     if (!found) {
     oThis.restoreDefaultValues();
     }
     });
     }
     else {
     var suggestions = oThis.provider.getAllSuggestions();

     var found = false;
     for (var i = 0; i < suggestions.length && !found; i++) {
     var pair = suggestions[i];

     if (pair.content == oThis.textbox.value) {
     if (oThis.hiddenField.value == pair.key) {
     found = true;
     }
     }
     }

     if (!found) {
     oThis.restoreDefaultValues();
     }
     }
     }
     }
     }
     */
  };

  this.select.id = this.textbox.id + "_select";
  this.select.size = 8;
  this.select.className = "suggestions";
  this.select.style.width = this.layer2.style.width;
  this.select.style.height = this.layer2.style.height;
  this.select.selectedIndex = -1;

  // Assign onkeydown event handler.
  this.select.onkeydown = function (oEvent) {
    oThis.onKeyDownSelect(oEvent);
  };

  // Assign ondblclick event handler.
  this.select.onkeyup = function (oEvent) {
    oThis.onKeyUpSelect(oEvent);
  };

  this.select.onclick =
  function () {
    var selectedIndex = oThis.select.selectedIndex;

    if (selectedIndex >= 0) {
      oThis.textbox.value = oThis.select.options[selectedIndex].text;
    }
  };

  this.select.ondblclick =
  function () {
    var selectedIndex = oThis.select.selectedIndex;

    oThis.textbox.value = oThis.select.options[selectedIndex].text;
    oThis.hiddenField.value = oThis.select.options[selectedIndex].value;

    oThis.updateOriginalValues();

    if (oThis.isSelectOpen()) {
      oThis.hideSuggestions();
    }
  };

  var selectedIndex = this.select.selectedIndex;

  if (selectedIndex >= 0) {
    this.original_key = this.select.options[selectedIndex].value;
    this.original_value = this.select.options[selectedIndex].text;
    this.original_index = this.select.selectedIndex;
  }
  else {
    this.updateOriginalValues();
  }
};

/**
 * The handler for textbox control element when the user presses the key down.
 */
AutoSuggestControl.prototype.onKeyDownTextBox = function (oEvent) {
  // Check for the proper location of the event object.
  if (!oEvent) {
    oEvent = window.event;
  }

  var iKeyCode = oEvent.keyCode;

  switch (iKeyCode) {
    case 9: // tab key
      if (this.isSelectOpen()) {
        this.hideSuggestions();
      }
      break;
    case 16: // shift key
      break;

    case 38: // up arrow key
      break;
    case 40: // down arrow key
      this.focusSelect();
      break;
    case 33: // page up arrow key
      break;
    case 34: // page down arrow key
      this.focusSelect();
      break;
    case 35: // end arrow key
      break;
    case 36: // home arrow key
      break;
    case 37: // left arrow key
      break;
    case 39: // right arrow key
      break;
    case 13: // enter key
      if (this.textbox.value == '') {
        this.hiddenField.value = '';
        this.updateOriginalValues();

        if (this.isSelectOpen()) {
          this.hideSuggestions();
        }
        else if (this.displayCompleteList) {
          this.requestSuggestions(true);
        }
      }
      else {
        if (this.isSelectOpen()) {
          var selectedIndex = this.select.selectedIndex;

          this.textbox.value = this.select.options[selectedIndex].text;
          this.hiddenField.value = this.select.options[selectedIndex].value;

          this.updateOriginalValues();

          if (this.textbox.value != '') {
            this.hideSuggestions();
          }
        }
        else {
          this.requestSuggestions(true);
        }
      }
      break;
    case 27: // esc key
      if (this.isSelectOpen()) {
        this.hideSuggestions();
      }

      this.restoreDefaultValues();
      break;
  }
};

/**
 * The handler for textbox control element when the user releases the key.
 */
AutoSuggestControl.prototype.onKeyUpTextBox = function (oEvent) {
  // Check for the proper location of the event object.
  if (!oEvent) {
    oEvent = window.event;
  }

  var iKeyCode = oEvent.keyCode;

  switch (iKeyCode) {
    case 8:
    case 46: // For backspace (8) and delete (46), shows suggestions without typeahead.
      if (this.trimAll(this.hiddenField.value).length == 0) {
        this.highlightTextField();
      }

      if (this.isSelectOpen()) {
        this.hideSuggestions();
      }

      if (this.trimAll(this.textbox.value).length > 0 || this.displayCompleteList) {
        this.requestSuggestions(false);
      }

      break;
    case 40: // down arrow key
      this.focusSelect();
      break;

    case 27: // esc key
      this.restoreDefaultValues();
      break;

    default:
      // Make sure not to interfere with non-character keys.
      if (iKeyCode < 32 ||
          (iKeyCode >= 33 && iKeyCode < 46) ||
          (iKeyCode >= 112 && iKeyCode <= 123) ||
          iKeyCode == 145 // Scroll-Lock
          ) {
        // Ignore the key.
      }
      else { // characters
        if (this.isSelectOpen()) {
          this.hideSuggestions();
        }

        this.textboxReplaceSelect(/*this.getCharacter(oEvent)*/"");

        // Request suggestions from the suggestion provider with typeahead.
        this.requestSuggestions(true);
      }
  }
};

/*AutoSuggestControl.prototype.getCharacter = function(oEvent) {
 var code;

 if (this.textbox.createTextRange) { // Internet Explorer
 code = String.fromCharCode(oEvent.keyCode);
 }
 else if (this.textbox.setSelectionRange) { // Mozilla
 code = String.fromCharCode(oEvent.charCode);
 }

 return String.fromCharCode(code);
 }
 */

/**
 * The handler for text-box control element when the user double clicks the mouse.
 */
AutoSuggestControl.prototype.onDblClickTextBox = function() {
  if (this.textbox.value == null || this.trimAll(this.textbox.value).length == 0) {
    this.original_index = -1;
  }

  if (this.displayCompleteList &&
      (this.textbox.value == null || this.trimAll(this.textbox.value).length == 0)) {
    this.requestSuggestions(true, this.displayCompleteList);
  }
  else {
    if (this.isSelectOpen()) {
      this.hideSuggestions();
    }
  }
};

/**
 * The handler for select control element when the user presses the key down.
 */
AutoSuggestControl.prototype.onKeyDownSelect = function (oEvent) {
  // Check for the proper location of the event object.
  if (!oEvent) {
    oEvent = window.event;
  }

  switch (oEvent.keyCode) {
    case 9: // tab key
      if (this.isSelectOpen()) {
        this.hideSuggestions();
      }
      break;
    case 38: // up arrow key
    case 33: // page up arrow key
      if (this.select.selectedIndex == 0) {
        this.textbox.focus();
      }
      break;
    case 40: // down arrow key
    case 34: // page down arrow key
    case 35: // end arrow key
    case 36: // home arrow key
      break;
    case 37: // left arrow key
      if (this.isSelectOpen() && this.textbox.createTextRange) { // Fix IE problem
        var selectedIndex = this.select.selectedIndex;
        if (selectedIndex > 0) {
          this.select.selectedIndex = selectedIndex - 1;
        }
      }
      break;
    case 39: // right arrow key
      if (this.isSelectOpen() && this.textbox.createTextRange) { // Fix IE problem
        if (this.isAjaxAware) {
          var selectedIndex = this.select.selectedIndex;

          if (selectedIndex < this.select.options.length - 1) {
            this.select.selectedIndex = selectedIndex + 1;
          }
        }
        else {
          var selectedIndex = this.select.selectedIndex;

          if (selectedIndex < this.select.options.length - 1) {
            this.select.selectedIndex = selectedIndex + 1;
          }
        }
      }

      break;
    case 13: // enter key
      var selectedIndex = this.select.selectedIndex;

      this.textbox.value = this.select.options[selectedIndex].text;
      this.hiddenField.value = this.select.options[selectedIndex].value;

      this.updateOriginalValues();

      if (this.isSelectOpen()) {
        if (this.textbox.value != '') {
          this.hideSuggestions();
        }
      }
      else {
        this.requestSuggestions(true);
      }
      break;
    case 27: // esc key
      if (this.textbox.value != '') {
        if (this.isSelectOpen()) {
          this.hideSuggestions();
        }
      }

      this.restoreDefaultValues();
      break;
  }
};

/**
 * The handler for select control element when the user releases the key.
 */
AutoSuggestControl.prototype.onKeyUpSelect = function (oEvent) {
  // Check for the proper location of the event object.
  if (!oEvent) {
    oEvent = window.event;
  }

  var iKeyCode = oEvent.keyCode;

  // For backspace (8) and delete (46), shows suggestions without typeahead.
  if (iKeyCode == 8 || iKeyCode == 46) {
    if (this.isSelectOpen()) {
      this.hideSuggestions();
    }

    this.requestSuggestions(false);
  }
  else if (iKeyCode == 13) {
    if (!this.isSelectOpen()) {
      this.requestSuggestions(true);
    }
  }
  else if (iKeyCode == 27) {
    // Ignore it.
  }
  // Make sure not to interfere with non-character keys.
  else if (iKeyCode < 32 || (iKeyCode >= 33 && iKeyCode < 46) || (iKeyCode >= 112 && iKeyCode <= 123)) {
    var selectedIndex = this.select.selectedIndex;

    if (selectedIndex >= 0 && selectedIndex <= this.select.options.length) {
      this.textbox.value = this.select.options[selectedIndex].text;
    }
    //this.hiddenField.value = this.select.options[this.select.selectedIndex].value;
  }
};

/**
 * Sets the number of items to be displayed in the combo-box.
 */
AutoSuggestControl.prototype.setSize = function (size) {
  this.select.size = size;
};

/**
 * Sets the flag whether to display full list when: text-box is empty and
 * the user double clicks the mouse.
 */
AutoSuggestControl.prototype.setDisplayCompleteList = function (displayCompleteList) {
  this.displayCompleteList = displayCompleteList;
};

/**
 * Sets the flag whether to use Ajax for transport or not.
 */
AutoSuggestControl.prototype.setAjaxAware = function (isAjaxAware) {
  this.isAjaxAware = isAjaxAware;
};

AutoSuggestControl.prototype.setHighlightColor = function (highlightColor) {
  this.highlightColor = highlightColor;

  this.highlightTextField();
};

AutoSuggestControl.prototype.findChildInputControl = function (parent, childId) {
  var childNode = null;

  var children = parent.getElementsByTagName("input");

  for (var i = 0; i < children.length; i++) {
    var currentChild = children[i];
    if (currentChild.id == childId || currentChild.name == childId) {
      childNode = currentChild;
      break;
    }
  }

  return childNode;
};

AutoSuggestControl.prototype.clearOriginalValues = function () {
  this.original_index = -1;
  this.original_key = "";
  this.original_value = "";

  this.highlightTextField();
};

/**
 * In case of ESC key the original values should be restored.
 */
AutoSuggestControl.prototype.restoreDefaultValues = function () {
  this.textbox.value = this.original_value;
  this.hiddenField.value = this.original_key;
  this.select.selectedIndex = this.original_index;

  this.highlightTextField();
};

/**
 * Original values should be updated after each user new selection.
 */
AutoSuggestControl.prototype.updateOriginalValues = function () {
  this.original_key = this.hiddenField.value;
  this.original_value = this.textbox.value;

  //this.original_index = this.select.selectedIndex;

  if (this.isAjaxAware) {
    Suggestions.indexOf(this.provider.name, this.hiddenField.value,
                       function(index) {
                         if (index != -1) {
                           this.original_index = index;
                         }
                       });
  }
  else {
    var suggestions = this.provider.getAllSuggestions();

    var ok = false;

    for (var i = 0; i < suggestions.length && !ok; i++) {
      var pair = suggestions[i];

      if (pair.key == this.hiddenField.value) {
        this.original_index = i;
        ok = true;
      }
    }
  }

  this.highlightTextField();
};

AutoSuggestControl.prototype.setDefaults = function (id, value) {
  this.hiddenField.value = id;
  this.textbox.value = value;
};

AutoSuggestControl.prototype.focusSelect = function () {
  if (this.isSelectOpen()) {
    if (this.select.selectedIndex == -1) {
      this.select.selectedIndex = 0;
    }

    this.select.focus();
  }
};

/**
 * The textfield is required field and is highlighted in yellow background color
 * when it's empty.
 */
AutoSuggestControl.prototype.highlightTextField = function () {
  if (this.highlightColor) {
    if (this.hiddenField.value == null || this.hiddenField.value == '') {
      this.textbox.style.backgroundColor = this.highlightColor;
    }
    else {
      this.textbox.style.backgroundColor = "white";
    }
  }
};

/**
 * Service function to remove all the spaces from both sides of the string.
 */
AutoSuggestControl.prototype.trimAll = function(sString) {
  while (sString.substring(0, 1) == ' ') {
    sString = sString.substring(1, sString.length);
  }

  while (sString.substring(sString.length - 1, sString.length) == ' ') {
    sString = sString.substring(0, sString.length - 1);
  }

  return sString;
};

/**
 * Gets the left coordinate of the textbox.
 * @scope private
 * @return The left coordinate of the textbox in pixels.
 */
AutoSuggestControl.prototype.getLeft = function () /*:int*/ {
  var oNode = this.textbox;
  var iLeft = 0;

  while (oNode.tagName != "BODY") {
    iLeft += oNode.offsetLeft;
    oNode = oNode.offsetParent;
  }

  return iLeft;
};

/**
 * Gets the top coordinate of the textbox.
 * @scope private
 * @return The top coordinate of the textbox in pixels.
 */
AutoSuggestControl.prototype.getTop = function () /*:int*/ {
  var oNode = this.textbox;
  var iTop = 0;

  while (oNode.tagName != "BODY") {
    iTop += oNode.offsetTop;
    oNode = oNode.offsetParent;
  }

  return iTop;
};

/**
 * Selects a range of text in the textbox.
 * @scope public
 * @param iStart The start index (base 0) of the selection.
 * @param iLength The number of characters to select.
 */
AutoSuggestControl.prototype.textboxSelect = function (iStart /*:int*/, iLength /*:int*/) {
  switch (arguments.length) {
    case 0:
      this.textbox.select();
      break;

    case 1:
      iEnd = this.textbox.value.length;
    /* falls through */

    case 2:
      if (this.textbox.createTextRange) { // Internet Explorer
        var oRange = this.textbox.createTextRange();
        oRange.moveStart("character", iStart);
        oRange.moveEnd("character", iLength - this.textbox.value.length);
        oRange.select();
      }
      else if (this.textbox.setSelectionRange) { // Mozilla
        this.textbox.setSelectionRange(iStart, iLength);
      }
  }

  // Set focus back to the textbox;so that when a user types, it will replace the selected text
  this.textbox.focus();
};

AutoSuggestControl.prototype.textboxReplaceSelect = function (sText) {
  if (this.textbox.createTextRange) { // Internet Explorer
    var oRange = document.selection.createRange();
    //var oRange = this.textbox.createTextRange();
    oRange.text = sText;
    oRange.collapse(true);
    oRange.select();
  }
  else if (this.textbox.setSelectionRange) { // Mozilla
    var iStart = this.textbox.selectionStart;
    var iEnd = this.textbox.selectionEnd;
    var iLen = this.textbox.value.length;

    this.textbox.value = this.textbox.value.substring(0, iStart) + sText +
        this.textbox.value.substring(iEnd, iLen);
    this.textbox.setSelectionRange(iStart + sText.length, iStart + sText.length);
  }

  this.textbox.focus();
};

/**
 * Checks if the select control is visible.
 */
AutoSuggestControl.prototype.isSelectOpen = function () {
  return (this.select.style.visibility == "visible");
};

/**
 * Builds the suggestion layer contents, moves it into position,
 * and displays the layer.
 * @scope private
 * @param aSuggestions An array of suggestions for the control.
 */
AutoSuggestControl.prototype.showSuggestions = function (aSuggestions /*:Array*/) {
  var oThis = this;

  for (var i = 0; i < aSuggestions.length; i++) {
    var oOption = null;

    if (this.textbox.createTextRange) { // Internet Explorer
      oOption = new Option(aSuggestions[i].key);

      oOption.appendChild(document.createTextNode(aSuggestions[i].value));
    }
    else {
      oOption = document.createElement("option");
    }

    oOption.value = aSuggestions[i].key;
    oOption.text = aSuggestions[i].content;

    oOption.onmouseover =
    function () {
      oThis.highlightSuggestion(this, true);
    };

    this.select.appendChild(oOption);
  }

  this.layer2.style.left = this.getLeft() + "px";
  this.layer2.style.top = (this.getTop() + this.textbox.offsetHeight) + "px";
  this.layer2.style.visibility = "visible";

  this.select.style.visibility = this.layer2.style.visibility;

  if (this.select.selectedIndex == -1 && aSuggestions.length > 0) {
    this.select.selectedIndex = 0;
  }
};

/**
 * Hides the suggestion drop-down.
 * @scope private
 */
AutoSuggestControl.prototype.hideSuggestions = function () {
  this.layer2.style.visibility = "hidden";
  this.select.style.visibility = this.layer2.style.visibility;

  if (this.select.options) {
    for (var i = 0; i < this.select.options.length; i++) {
      this.select.removeChild(this.select.options[i]);
    }
  }

  this.select.options.length = 0;
  this.select.selectedIndex = -1;

  this.textbox.focus();
};

/**
 * Highlights the given node in the suggestions drop-down.
 * @scope private
 * @param oSuggestionNode The node representing a suggestion in the drop-down.
 */
AutoSuggestControl.prototype.highlightSuggestion = function (oSuggestionNode, highlight) {
  for (var i = 0; i < this.select.options.length; i++) {
    var oNode = this.select.options[i];

    if (!highlight) {
      oNode.style.color = "black";
    }
    else {
      if (oNode == oSuggestionNode) {
        oNode.style.color = "red";
      }
      else {
        oNode.style.color = "black";
      }
    }
  }
};

/**
 * Inserts a suggestion into the text-box, highlighting the
 * suggested part of the text.
 *
 * @scope private
 * @param sSuggestion The suggestion for the text-box.
 */
AutoSuggestControl.prototype.typeAhead = function (sSuggestion /*:String*/) {
  // Check for support of type-ahead functionality.
  if (this.textbox.createTextRange || this.textbox.setSelectionRange) {
    var iLen = this.textbox.value.length;
    this.textbox.value = sSuggestion.content;
    this.textboxSelect(iLen, sSuggestion.content.length);
  }
};

/**
 * Request suggestions for the given auto-suggest control.
 * Reads user input and, based on it, makes next suggestion.
 *
 * @param bTypeAhead whether to display drop-down list or not.
 */
AutoSuggestControl.prototype.requestSuggestions = function (bTypeAhead /*:boolean*/,
                                                            displayCompleteList) {
  if (this.isAjaxAware) {
    if (displayCompleteList) {
      Suggestions.getSuggestions(this.provider.name, this.processResponse(bTypeAhead));
    }
    else {
      Suggestions.getPartialSuggestions(this.provider.name, this.textbox.value, this.processResponse(bTypeAhead));
    }
  }
  else {
    var aSuggestions = [];

    if (displayCompleteList) {
      aSuggestions = this.provider.getAllSuggestions();
    }
    else {
      aSuggestions = this.provider.getSuggestions(this.textbox.value);
    }

    this.provider.setPreviousPartialValue(this.textbox.value);
    this.provider.setPreviousPartialSuggestions(aSuggestions);

    // Make sure there's at least one suggestion.
    if (aSuggestions.length > 0) {
      if (bTypeAhead) {
        this.typeAhead(aSuggestions[0]);
      }

      this.select.selectedIndex = 0;

      this.showSuggestions(aSuggestions);
    }
  }
};

AutoSuggestControl.prototype.processResponse = function (bTypeAhead) {
  var oThis = this;

  return function(suggestions) {
    if (suggestions != null && typeof suggestions == 'object') {
      oThis.select.length = 0;

      if (suggestions.length > 0) {
        if (bTypeAhead) {
          oThis.typeAhead(suggestions[0]);
        }

        oThis.select.selectedIndex = 0;

        oThis.showSuggestions(suggestions);
      }
    }
    else {
      DWRUtil.setValue('d0', DWRUtil.toDescriptiveString(data, 1));
    }
  };
};

