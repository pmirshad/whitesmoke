/**
 * openLinkOverlay.js - Javascript code for openLink Firefox extension
 * Copyright (C) 2006  Xit
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Library General Public
 * License as published by the Free Software Foundation; either
 * version 2 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Library General Public License for more details.
 *
 * You should have received a copy of the GNU Library General Public
 * License along with this library; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin St, Fifth Floor,
 * Boston, MA  02110-1301, USA.
 */

var WS = {
  onLoad: function() {
    // initialization code
    var contextMenu = document.getElementById('contentAreaContextMenu');
    contextMenu.addEventListener("popupshowing", WS.onPopupShowing, false);
  },

  onPopupShowing: function() {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                        getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.whitesmoke.");

    // enable/disable contextMenu items
    var ws_text  = document.getElementById("context-whitesmoke-teXT");
    var ws_dict  = document.getElementById("context-whitesmoke-diCT");
    var ws_aru   = document.getElementById("context-whitesmoke-aru");
    var ws_aria  = document.getElementById("context-whitesmoke-aria");
    var ws_bugdb = document.getElementById("context-whitesmoke-bugDB");
    var ws_tar   = document.getElementById("context-whitesmoke-tar");

    ws_text.hidden  = !(prefs.getBoolPref("enable-text"));
    ws_dict.hidden  = !(prefs.getBoolPref("enable-dict"));
    ws_aru.hidden   = !(prefs.getBoolPref("enable-aru"));
    ws_aria.hidden  = !(prefs.getBoolPref("enable-aria"));
    ws_bugdb.hidden = !(prefs.getBoolPref("enable-bugdb"));
    ws_tar.hidden   = !(prefs.getBoolPref("enable-tar"));
  },

  getSelectedText: function(concationationChar) {
    var node = document.popupNode;
    var selection = "";

    if((node instanceof HTMLTextAreaElement) || (node instanceof HTMLInputElement && node.type == "text")) {
      selection = node.value.substring(node.selectionStart, node.selectionEnd);
    } else {
      var focusedWindow = new XPCNativeWrapper(document.commandDispatcher.focusedWindow, 'document', 'getSelection()');
      selection = focusedWindow.getSelection().toString();
    }

    // Limit length to 150 to optimize performance. Longer does not make sense
    if(selection.length >= 150) {
      selection = selection.substring(0, 149);
    }

    selection = selection.replace(/(\n|\r|\t)+/g, " ");
    selection = selection.replace(/(^\s+)|(\s+$)/g, "");
    selection = selection.split(" ");

    // Remove certain characters at the beginning and end of every word
    for(i=0; i < selection.length; i++) {
      selection[i] = selection[i].replace(/^(\&|\(|\)|\[|\]|\{|\}|"|,|\.|!|\?|'|:|;)+/, "");
      selection[i] = selection[i].replace(/(\&|\(|\)|\[|\]|\{|\}|"|,|\.|!|\?|'|:|;)+$/, "");
    }

    selection = selection.join(concationationChar);

    return selection;
  },

  get_element: function(id) {
    return document.getElementById(id);
  },

  onteXT: function() {
    var selectedText = 'selectedText';

    if(gContextMenu) {
      selectedText = WS.getSelectedText(" ");

      if(selectedText != "") {
        // Open link in new tab
        var browser = top.document.getElementById("content");
        if(browser) {
          browser.loadOneTab(selectedText, null, null, null, true);
        }
      }
    }
  },

  openService: function(service) {
    var selectedText = 'selectedText';

    if(gContextMenu) {
      selectedText = WS.getSelectedText(" ");

      if(selectedText != "") {
        // Open link in new tab
        var browser = top.document.getElementById("content");
        var targetURL = 'http://www.google.com/';

        switch(service) {
          case 'diCT':
            targetURL = 'http://dictionary.reference.com/browse/' + selectedText;
            break;
          case 'bugDB':
            targetURL = 'https://bug.oraclecorp.com/pls/bug/webbug_edit.edit_info_top?rptno=' + selectedText;
            break;
          case 'aru':
            targetURL = 'http://aru.us.oracle.com:8080/ARU/QuickQuery/process_form?qq_val=' + selectedText;
            break;
          case 'aria':
            targetURL = 'http://people.us.oracle.com/pls/oracle/find_person?p_string=' + selectedText;
            break;
          case 'tar':
            targetURL = 'http://bugpriority.oraclecorp.com/pls/bugpriority/TOOLS.its.tar_detail?p_tar=' + selectedText;
            break;
          default:
            targetURL = 'http://www.google.com/';
            break;
        }

        if(browser) {
          browser.loadOneTab(targetURL, null, null, null, true);
        }
      }
    }
  }
};

/**
 * Add an EventListener for the window so that the extension is also loaded
 * whenever a browser window is loaded.
 */
window.addEventListener("load", function(e) { WS.onLoad(e); }, false);
