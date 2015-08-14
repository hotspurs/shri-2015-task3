modules.define('slider', ['i-bem__dom'], function(provide, BEMDOM){

	provide(BEMDOM.decl(this.name, {
	    onSetMod : {
			js : {
		    	inited : function(){
					console.log('Slider inited');
		    		var self = this;
	        		this.filter = this.findBlockOutside('equalizer').filters[this.params.index];
	        		this.on('setValue', this._onSetValue);
	         		this.domElem.slider({
	        			orientation: "vertical",
	        			value : 0,
	        			min : -12,
	            		max : 12,
	            		step : 1,
			            change : function(event, ui){
			            	self.filter.gain.value = ui.value;
			            }
					});
		        }
		    }
		},
		_onSetValue : function(e, data){
			this.domElem.slider( "value", data.value );
		}
	}));

});