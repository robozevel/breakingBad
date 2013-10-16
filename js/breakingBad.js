(function(root) {
  "use strict";
  // https://gist.github.com/570522 (Sorted by symbol length + alphabetically)
  var
    PERIODIC_TABLE = [[116,"Ununhexium","Uuh"],[118,"Ununoctium","Uuo"],[115,"Ununpentium","Uup"],[114,"Ununquadium","Uuq"],[117,"Ununseptium","Uus"],[113,"Ununtrium","Uut"],[89,"Actinium","Ac"],[47,"Silver","Ag"],[13,"Aluminium","Al"],[95,"Americium","Am"],[18,"Argon","Ar"],[33,"Arsenic","As"],[85,"Astatine","At"],[79,"Gold","Au"],[56,"Barium","Ba"],[4,"Beryllium","Be"],[107,"Bohrium","Bh"],[83,"Bismuth","Bi"],[97,"Berkelium","Bk"],[35,"Bromine","Br"],[20,"Calcium","Ca"],[48,"Cadmium","Cd"],[58,"Cerium","Ce"],[98,"Californium","Cf"],[17,"Chlorine","Cl"],[96,"Curium","Cm"],[112,"Copernicium","Cn"],[27,"Cobalt","Co"],[24,"Chromium","Cr"],[55,"Caesium","Cs"],[29,"Copper","Cu"],[105,"Dubnium","Db"],[110,"Darmstadtium","Ds"],[66,"Dysprosium","Dy"],[68,"Erbium","Er"],[99,"Einsteinium","Es"],[63,"Europium","Eu"],[26,"Iron","Fe"],[100,"Fermium","Fm"],[87,"Francium","Fr"],[31,"Gallium","Ga"],[64,"Gadolinium","Gd"],[32,"Germanium","Ge"],[2,"Helium","He"],[72,"Hafnium","Hf"],[80,"Mercury","Hg"],[67,"Holmium","Ho"],[108,"Hassium","Hs"],[49,"Indium","In"],[77,"Iridium","Ir"],[36,"Krypton","Kr"],[57,"Lanthanum","La"],[3,"Lithium","Li"],[103,"Lawrencium","Lr"],[71,"Lutetium","Lu"],[101,"Mendelevium","Md"],[12,"Magnesium","Mg"],[25,"Manganese","Mn"],[42,"Molybdenum","Mo"],[109,"Meitnerium","Mt"],[11,"Sodium","Na"],[41,"Niobium","Nb"],[60,"Neodymium","Nd"],[10,"Neon","Ne"],[28,"Nickel","Ni"],[102,"Nobelium","No"],[93,"Neptunium","Np"],[76,"Osmium","Os"],[91,"Protactinium","Pa"],[82,"Lead","Pb"],[46,"Palladium","Pd"],[61,"Promethium","Pm"],[84,"Polonium","Po"],[59,"Praseodymium","Pr"],[78,"Platinum","Pt"],[94,"Plutonium","Pu"],[88,"Radium","Ra"],[37,"Rubidium","Rb"],[75,"Rhenium","Re"],[104,"Rutherfordium","Rf"],[111,"Roentgenium","Rg"],[45,"Rhodium","Rh"],[86,"Radon","Rn"],[44,"Ruthenium","Ru"],[51,"Antimony","Sb"],[21,"Scandium","Sc"],[34,"Selenium","Se"],[106,"Seaborgium","Sg"],[14,"Silicon","Si"],[62,"Samarium","Sm"],[50,"Tin","Sn"],[38,"Strontium","Sr"],[73,"Tantalum","Ta"],[65,"Terbium","Tb"],[43,"Technetium","Tc"],[52,"Tellurium","Te"],[90,"Thorium","Th"],[22,"Titanium","Ti"],[81,"Thallium","Tl"],[69,"Thulium","Tm"],[54,"Xenon","Xe"],[70,"Ytterbium","Yb"],[30,"Zinc","Zn"],[40,"Zirconium","Zr"],[5,"Boron","B"],[6,"Carbon","C"],[9,"Fluorine","F"],[1,"Hydrogen","H"],[53,"Iodine","I"],[19,"Potassium","K"],[7,"Nitrogen","N"],[8,"Oxygen","O"],[15,"Phosphorus","P"],[16,"Sulfur","S"],[92,"Uranium","U"],[23,"Vanadium","V"],[74,"Tungsten","W"],[39,"Yttrium","Y"]],
    periodicTable = {},
    rChemicalSymbols,
    defaultOptions = {
        maxReplacements: 50,
        maxWordReplacements: 1,
        styleElement: function(chemicalElement) {
          return [
            "<span class='chemicalElement symbol" + chemicalElement.symbol +"' data-element='" + chemicalElement.name +"' >",
            chemicalElement.symbol,
            "<sup>" + chemicalElement.number + "</sup>",
            "</span>"
          ].join("");
        },
        wrapWord: function(wordMarkup) {
          return [
            "<div class='word'>",
            wordMarkup,
            "</div>"
          ].join("");
        }
    };

  function ChemicalElement(elementArray) {
    return {
      number: elementArray[0],
      name: elementArray[1],
      symbol: elementArray[2]
    };
  }

  function styleText(text, options) {
    var
      // Create replacements counter
      replacements = 0,
      wordReplacements = 0,

      // Set default replacements limit
      maxReplacements = options.maxReplacements || defaultOptions.maxReplacements,
      maxWordReplacements = options.maxWordReplacements || defaultOptions.maxWordReplacements,

      // Set default styling functions
      styleElement = options.styleElement || defaultOptions.styleElement,
      wrapWord = options.wrapWord || defaultOptions.wrapWord;

    function replaceSymbols(symbol) {
      // Find chemical symbol in periodic table
      var chemicalElement = periodicTable[symbol.toLowerCase()];

      if (chemicalElement
        && replacements < maxReplacements
        && wordReplacements < maxWordReplacements) {

        // Increase replacements count
        replacements += 1;
        wordReplacements += 1;

        // Return formatted element view
        return styleElement(chemicalElement);
      } else {
        // Maximum replacements reached
        return symbol;
      }
    }

    return text
      // Split text to words
      .split(" ")
      // Find matches in each word
      .map(function(word) {
        // Reset word replacements counter
        wordReplacements = 0;
        // Wrap matched chemical symbols in word
        return wrapWord(word.replace(rChemicalSymbols, replaceSymbols));
      })
      // Concat words
      .join(" ");
  }

  // Initialize
  (function() {
    var chemicalSymbols = [];

    PERIODIC_TABLE.forEach(function(element) {
      // Create ChemicalElement instance from element array
      var chemicalElement = new ChemicalElement(element);

      // Add symbols array
      chemicalSymbols.push(chemicalElement.symbol);

      // Add to periodicTable to enable lookup by symbol
      periodicTable[chemicalElement.symbol.toLowerCase()] = chemicalElement;
    });

    // Crate regex (join all chemical symbols)
    rChemicalSymbols = new RegExp(chemicalSymbols.join("|"), "ig");
  }());

  // Expose methods
  root.breakingBad = {
    styleText: function(text, options) {

      // Verify text is a String
      text = (typeof text === "string") ? text : "";

      // Verify options is an object
      options = (typeof options === "object") ? options : {};

      return styleText(text, options);
    },
    options: defaultOptions,
    PERIODIC_TABLE: PERIODIC_TABLE,
  };

}(this));