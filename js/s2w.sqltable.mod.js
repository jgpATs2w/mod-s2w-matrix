if(s2w == null) var s2w = {};

/**
 * Styling: 
 * 		#s2w_sqltable for table element
 * 		.tr_header 		row with headers
 * 		.td_header 		cols with headers
 * 		.tr_data 		row with headers
 * 			.par 		filas pares
 * 			.impar 		filas pares
 * 		.td_data 		row with headers
 * 		
 * @param {Object} SQLMatrix
 * @param {String} divId the id of the div where the table will be appended
 */
s2w.SQLTable = function(divId){
	this._divId = divId || "s2w_table_div";
	this._table = null;
	this._matrix = null;
	this._headers = null;
	this._celledited = null;
	this._wait = false;
	
	window.onclick = function(e){//console.info('clicked in '+e.target.id);
		if(s2w.Table){//just if s2w.Table is registered
			if(s2w.Table._celledited && e.target.id != "s2w_table_edited" && !s2w.Table._wait)
				s2w.Table._uneditCell();
		}
		return true;
	}
	this.sortBy = function(column){
		this._matrix.toogledSortBy(column);
	}
	/**
	 * @param {SQLMatrix} matrix
	 * @param {string} [colum] column to sort the matrix
	 * @param {boolean} [desc] if true, sort descending
	 * @return boolean true if matrix is loaded
	 */
	this.render = function(matrix,column, desc){
		if(typeof matrix !== "object"){
			if(s2w.Matrix)
				this._matrix = s2w.Matrix;
			else{
				s2w.log.error(this,matrix+' must be an object, tryin.')
				return false;
			}
		}else{
			this._matrix = matrix;
		}
		
		this._headers = this._matrix.getKeys();
		
		if(column) this._matrix.toogledSortBy(column, desc);
		
		document.getElementById(this._divId).innerHTML = "";
		document.getElementById(this._divId).appendChild(s2w.Table.getTable());
		
		return true;
	}
	this.getMatrix = function(){return this._matrix;}
	
	/**
	 * @param {array} headers the headers to be rendered
	 */
	this.getTable = function (headers){
		if(typeof headers == "array") this._headers = headers;
		this._table = document.createElement('table');
			this._table.id = "s2w_sqltable";
			this._table.innerHTML ="";
		
		header_row = this._table.insertRow(0);
			header_row.className = "tr_header";
			for(col in this._headers){col = parseInt(col);
				if(this._headers[col] == "id") continue; //id is hidden
				c = header_row.insertCell(header_row.childNodes.length); 
					c.className = "td_header";
					c.innerHTML = this._headers[col];
					c.onclick = function(){
						s2w.Table.render(s2w.Table.getMatrix(), this.innerHTML);
						this.setAttribute('data-index', !this.getAttribute('data-index'));
					};
			}
			c = header_row.insertCell(header_row.childNodes.length); 
				c.innerHTML = "&nbsp;";

		
		Data = this._matrix.get();
		
		for(i in Data){i = parseInt(i);
				tableRow = this._table.rows.length;
				row = this._table.insertRow(tableRow); 
					row.className = "tr_data "+((i%2 ===0 )?'par':'impar');
				
				for(j in this._headers){j = parseInt(j);
					if(this._headers[j] == "id") continue;
					c = row.insertCell(row.childNodes.length); 
						c.className = "td_data";
						c.innerHTML = Data[i][this._headers[j]]; 
						c.id="cell_"+Data[i]["id"]+"_"+this._headers[j]; 
						c.onclick = _editCell;
				}
					
				c = row.insertCell(row.childNodes.length); 
					c.className = "td_supr";
					c.id = tableRow+"_"+Data[i]["id"];
					c.innerHTML = "suprimir";
					c.onclick = function(){ 
						s2w.Table._deleteClicked(this.id.split("_")); 
					}
		}
		return this._table;
	}
	function _editCell(){// console.info('clicked '+this.id);
		if(s2w.Table._celledited === this) return;
		else if(s2w.Table._celledited){
			s2w.Table._celledited.innerHTML = document.getElementById('s2w_table_edited').value;
			s2w.Table._celledited = null;
		}
		input = document.createElement('input');
			input.type = "text";
			input.id = "s2w_table_edited";
			input.value=this.innerHTML;
			input.style.width = input.value.length+"em";
			input.onchange = s2w.Table.cellChanged;
			input.onkeyup = function(e){ if(e.keyCode == 13) s2w.Table._cellChanged(); }
		
		this.innerHTML = "";
		this.appendChild(input);
		s2w.Table._celledited = this;
		s2w.Table._wait = true;
		setTimeout(function(){s2w.Table._wait = false;}, 500);
	}
	this._uneditCell = function(){
		this._celledited.innerHTML = document.getElementById('s2w_table_edited').value;
		this._celledited = null;
	}
	/**
	 * This function must be written outside
	 * @param {string} id column that uniquely identifies the row in the sql table
	 * @param {string} column name in the sql table
	 * @param {string} value to be updated in the sql table.
	 */
	this.onCellChanged = function(row,column,value){console.error('default fun, nothing to do with '+[row,column,value]); };
	this._cellChanged = function(){
		with(s2w.Table){
			_id = _celledited.id.split("_");
			onCellChanged(_id[1],_id[2],_celledited.childNodes[0].value);
			_celledited.innerHTML = _celledited.childNodes[0].value;
			_celledited = null;
		}
	}
	this._timeout = function(){
		s2w.Table._wait = true;
		setTimeout(function(){s2w.Table._wait = false;}, 500);
	}
	function inputKeyUp(){
		if(event.keyCode != 13) return;
		with(s2w.Table){
			_cellChanged();
			_timeout();
		}
	}
	/**
	 * @param {array} id array composed by [row in table, row in sql]
	 */
	this.onDelete = function(id){console.error('default onDelete, should be defined. Nothing to do with id '+id);}
	this._deleteClicked = function (id){
		if(!confirm('seguro que desea borrar la cuenta '+id+'?')) return;
		this.onDelete(id);
	}
	this.deleteRow = function(row){
		this._table.deleteRow(row);
	}
}
s2w.Table = new s2w.SQLTable();
