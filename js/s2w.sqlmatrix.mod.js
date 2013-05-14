if(s2w == null) var s2w = {};

s2w.SQLMatrix = function(jsonInput){		
		if(typeof jsonInput == "string"){
			if(!/^\[\{/.test(jsonInput)){
				s2w.error.trigger(this, 'bad formed, should start with \[\{');
				return null;
			}
			this._mainArray = eval('('+jsonInput+')');
		}else if(typeof jsonInput == "object"){
			this._mainArray = jsonInput;
		}else{
			s2w.error.trigger(this, 'unknown type. Cancel');
			return null;
		}
		
		this._keys = [];
		for(key in this._mainArray[0])
			this._keys.push(key);
		
		this.rows = this._mainArray.length;
		this.cols = this._keys.length;
		/**
		 * Getter for the elements
		 * 
		 * @param string column optional
		 * @param numeric row	optional. Number of row
		 * @return object if row is specified
		 * @return array if row is not specified
		 * @return array if neither row or column is specified
		 */
		this.get = function (column, row){
			if(row != null)
				return this._mainArray[row][column];
			else if(column != null){
				r= [];
				for(i in this._mainArray)
					r.push(this._mainArray[i][column]);
				return r;
			}
			return this._mainArray;
		}
		this.getKeys = function(){
			return this._keys;
		}
		/**
		 * Sort the array of objects by sorting ascending (or descending) the values
		 * of column.
		 * 
		 * @param string column name of column to be used as sort key propertie
		 * @param boolean desc optional. If true, the sort will be descendent
		 */
		this.sortBy = function(column, desc){
			this._mainArray.sort(function(b,a){
								if(desc == null || desc == false)
									return a[column] < b[column];
								
								return a[column] > b[column];
							});
		}
		this._toogle = {};
		this.toogledSortBy = function(column){
			if(column in this._toogle) this._toogle[column] = !this._toogle[column];
			else	this._toogle[column] = true;
			
			this.sortBy(column, this._toogle[column]);
		}
		/**
		 * @param object e Defined as general object with properties = columns of SQL query
		 * @return number position of insertion
		 */
		this.add = function(e){
			return this._mainArray.push(e);
		}
		/**
		 * @param function fun Function that will be called with each of the objects passed as parameter.
		 */
		this.walk = function(fun){
			for(i in this._mainArray){
				fun(this._mainArray[i]);
			}
		}
		/**
		 * @return string json encoded representation of _mainArray
		 */
		this.toJSONString = function(){
			return JSON.stringify(this._mainArray);	
		}
}