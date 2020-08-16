(function() {
    let sheetData = [],
      rows = 0,
      cols = 0;

    /**
     * Create sheet
     */ 
    createSheet = () => {
      rows = parseInt(document.getElementById('xl-rows').value, 10);
      cols = parseInt(document.getElementById('xl-cols').value, 10);
      createData();
      createGrid();
    }

    /**
     * Create a transposed array for saving data
     * Each child array will correspond to one column
     * This will simplify sorting and insert/delete operations
     * Although cost of looping is tremendous
     */
    createData = () => {
        sheetData = new Array(cols);
        for(let i = 0; i < sheetData.length; i++) {
            sheetData[i] = new Array(rows);
        }
    }

    /**
     * Draw the table, attach event handlers
     */
    createGrid = () => {
      let parent = document.getElementById('xl-workspace');
      clearSheet(parent);

      // Create table
      let tbl = elementFactory('table', { 
        id: 'xl-sheet'
      });

      // Create header row with the sort handles
      createHeader(tbl);

      // Table will be created based on rows and cols count
      for(let i = 0; i < rows; i++) {
        let row = tbl.insertRow();
        for(let j = 0; j < cols; j++) {
          let col = row.insertCell();

          elementFactory(col,
            null,
            null,
            {
              click: enableField,
              contextmenu: renderMenu
            }
          );

          let field = elementFactory('input', {
            disabled: true
          });

          // Position required for data manipulation in data object
          field.setAttribute('data-pos', `${i}-${j}`);

          // If re-rendering, use values from data object
          if(sheetData[j][i]) {
            field.value = sheetData[j][i];
          }
          col.appendChild(field);
        }
      }
      parent.appendChild(tbl);
    }

    /**
     * Clear the content of the workspace
     */
    clearSheet = (source) => {
      source.innerHTML = "";
    }

    /**
     * Header row will have as many cols as total cols
     */
    createHeader = (ele) => {
      let row = ele.insertRow();
      for(let i = 0; i < cols; i++) {
        let col = row.insertCell();
        let sortButton = elementFactory('button',
          {
            textContent: 'Sort',
            type: 'button'
          },
          ['xl-sort'],
          {
            click: () => {
              sortColumn(i);
            }
          }
        );

        col.appendChild(sortButton);
      }
    }

    /**
     * Enable field on clicking and attach event handler
     */
    enableField = e => {
      let field = e.srcElement;

      elementFactory(field,
        { disabled: false },
        null,
        {
          keyup: populateData,
          blur: disableField
        },
        null
      );
      field.focus();
    }

    /**
     * Disable text field on focus leave
     */
    disableField = e => {
      e.target.disabled = true;
    }

    /**
     * Puts data inside the data object based on the position of the cell
     */
    populateData = e => {
      let val = e.target.value;
      let pos = e.target.getAttribute('data-pos').split('-');
      sheetData[pos[1]][pos[0]] = val;
    }

    /**
     * Sorts the column or the child array
     */
    sortColumn = i => {
      sheetData[i].sort((a, b) => {
        return a - b;
      });
      createGrid();
    }

    /**
     * Element creator
     * Can be used to attach styles, attributes, event handlers and classes
     */
    elementFactory = (param, attrs, classList, eventHandlers, styles) => {
      let element;
      if(typeof param === 'string') {
        element = document.createElement(param);
      } else {
        element = param;
      }

      if(attrs) {
        for(attr in attrs) {
          element[attr] = attrs[attr];
        }
      }

      if(classList) {
        element.classList.add(classList);
      }

      if(eventHandlers) {
        for(event in eventHandlers) {
          element.addEventListener(event, eventHandlers[event]);
        }
      }

      if(styles) {
        for(style in styles) {
          element.style[style] = styles[style];
        }
      }

      return element;
    }

    /**
     * Render context menu
     */
    renderMenu = e => {
      e.preventDefault();
      let ctxMenu = document.getElementById("xl-menu");
      elementFactory(ctxMenu,
        null,
        null,
        {
          mouseleave: e => {
            e.target.style.display = 'none';
          }
        },
        {
          display: 'block',
          left: (e.pageX - 2)+"px",
          top: (e.pageY - 2)+"px"
        }
      );

      // Menu will hold the meta information about the current cell it is active on
      ctxMenu.setAttribute('data-current', e.srcElement.getAttribute('data-pos'));
    }

    /**
     * Gets the current cell position from the context menu
     * Used for insertion, deletion
     */
    getCurrentCellPosition = (e) => {
      return e.target.parentNode.parentNode.getAttribute('data-current').split('-');
    }

    /**
     * Inserts row in the current rows place
     */
    insertRow = e => {
      let currentCell = getCurrentCellPosition(e);
      rows += 1;
      for(let i = 0; i < cols; i++) {
        sheetData[i].splice(currentCell[0], 0, undefined);
      }
      createGrid();
    }

    /**
     * Inserts col in the current cols place
     */
    insertCol = e => {
      let currentCell = getCurrentCellPosition(e);
      cols += 1;
      sheetData.splice(currentCell[1], 0, new Array(rows));
      createGrid();
    }

    /**
     * Deletes the current row
     */
    deleteRow = e => {
      let currentCell = getCurrentCellPosition(e);
      rows -= 1;
      for(let i = 0; i < cols; i++) {
        sheetData[i].splice(currentCell[0], 1);
      }
      createGrid();
    }

    /**
     * Deletes the current col
     */
    deleteCol = e => {
      let currentCell = getCurrentCellPosition(e);
      cols -= 1;
      sheetData.splice(currentCell[1], 1);
      createGrid();
    }
  })();
  
  
  