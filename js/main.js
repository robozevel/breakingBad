$(function() {
  // http://stevenbenner.com/2010/03/javascript-regex-trick-parse-a-query-string-into-an-object/
  var parseQueryString = (function(rQueryString) {
    return function(url) {
      var queryString = {};
      String(url).replace(rQueryString, function($0, $1, $2, $3) {
        queryString[$1] = unescape($3);
      });
      return queryString
    };
  }(/([^?=&]+)(=([^&]*))?/g));

  var
    $output = $("#breakingBadOutput"),
    $input = $("#breakingBadInput"),
    formatChemicalElement = Handlebars.compile( $("#chemicalElementTemplate").html() ),
    rBadChars = /[&<>"'`]|\s(?=\s)/g,
    wikipedia;

  function setText(text) {
    var styledText, $words, words = [];

    text = String(text).replace(rBadChars, "").trim();

    if (text) {

      $input.val(text);

      // Style text in output
      styledText = breakingBad.styleText(text, {
        styleElement: formatChemicalElement,
        maxReplacements: 4,
      });

      $output.html(styledText);

      $words = $output.find(".word");

      $output[$words.length === 1 ? "addClass" : "removeClass"]("oneWord");

      $words.each(function(i) {
        var 
          $word = $(this),
          $previousWord = words[i-1],
          $previousWordFirstSymbol,
          wordOffset = $word.offset(),
          offset = {};

        words.push($word);

        if ($previousWord) {
          $previousWordFirstSymbol = $previousWord.find(".chemicalElement").first();
          offset = $previousWordFirstSymbol.offset();
          offset.top = $word.offset().top;
          offset.left += $previousWordFirstSymbol.outerWidth();
          offset.left -= ($word.find(".chemicalElement").first().offset().left - wordOffset.left);
          $word.offset(offset);
        };
      });

    }
  }

  wikipedia = {
    extracts: {},
    queryUrl: 'http://en.wikipedia.org/w/api.php?action=query&format=json&callback=?',
    fetchExtract: function(wikipediaPage, callback) {
      if (!wikipediaPage) return;

      callback = $.isFunction(callback) ? callback : wikipedia.handleResult;

      // http://www.mediawiki.org/wiki/API:Query
      $.getJSON(wikipedia.queryUrl, {
          titles: wikipediaPage,
          prop: 'extracts',
          exsentences: 20,
          uselang: 'en',
          redirects: true,
        }, callback);
    },
    handleResult: function(data) {
      var pages = data.query.pages;
      for (var pageId in pages) if (pageId === -1) return;
      return pages[pageId];
    },
    formatExtract: Handlebars.compile( $("#wikipediaExtractTemplate").html() ),
    appendExtract: function($chemicalElement, extract) {
      $chemicalElement
        .addClass("loaded")
        .find(".extract")
        .append(extract);
    },
    loadExtract: function(e) {
      var
        $chemicalElement = $(e.currentTarget),
        elementName = $chemicalElement.data("element"),
        $extract = wikipedia.extracts[elementName];

      if (!elementName || $chemicalElement.hasClass("loaded")) return;

      if ($extract) {
        wikipedia.appendExtract($chemicalElement, $extract.clone());
      } else {
        wikipedia.extracts[elementName] = $(null);
        wikipedia.fetchExtract(elementName, function(data) {
          var page = wikipedia.handleResult(data);
          $extract = $(wikipedia.formatExtract(page).trim());

          // Cache extract
          wikipedia.extracts[elementName] = $extract;

          wikipedia.appendExtract($chemicalElement, $extract);

        });
      }
    }
  };

  $("body").removeAttr("hidden");

  // style default text
  setText(parseQueryString(location.search).text || "Breaking Bad");

  // Handle events
  $output.on("mouseenter", ".chemicalElement", wikipedia.loadExtract);

  $input
    // Bind input to enter keypress
    .on("keypress", function(e) {
      if (e.keyCode === 13) {
        var value = String(e.currentTarget.value).trim();
        if (value) location.search = "?text=" + encodeURIComponent(value);
      }
    })
    // Focus on input
    .focus();

  $(".tryAlso").on("click", "a", function(e) {
    var text = $(e.target).text();
    location.search = "?text=" + text;
    e.preventDefault();
  });

  // if (Modernizr.history) $(window).on("popstate", function(e) {
  //   var state = e.originalEvent.state;
  //   if (state && state.text) {
  //     setText(state.text);
  //   }
  // });

});