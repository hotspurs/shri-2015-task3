modules.define('equalizer', ['i-bem','i-bem__dom'], function(provide, BEM, BEMDOM){

	provide(BEMDOM.decl(this.name, {
		onSetMod : {
			js : {
				inited : function(){
					console.log('Equalizer inited');
					this.sliders = null;
					this.player = this.findBlockOutside('player');
					BEM.blocks.player.on('playerInited', this._initFilters, this);
					BEM.blocks.player.on('toggleEqualizer', this._onToggle, this);
					this.domElem.draggable({stack:'div'});
					this.bindTo( this.elem('close'), 'click', this._onClickClose );
					this.bindTo( this.elem('select'), 'change', this._onSelectChange );
					this.settings = {
						'normal' : [0,0,0,0,0,0,0,0,0,0],
						'pop' : [-2,-1,0,2,5,5,2,0,-1,-2],
						'rock' : [6,5,3,1,-1,-1,0,3,4,5],
						'jazz' : [5,3,1,3,-2,-2,0,1,3,4],
						'classic' : [6,4,3,2,-3,-3,-1,3,4,6]
					};
				}
			}
			},
			_onSelectChange : function(e){
			var value = e.target.value.toLowerCase(),
				self = this;

			if(!this.sliders){
				this.sliders = this.findBlocksInside('slider');
			}

			this.settings[value].map(function(value, index){
				self.sliders[index].emit('setValue', {value : value});
			});
			},
			_initFilters : function(){
		  var frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000],
		      filters = [],
		      self = this;

			frequencies.forEach(function(frequency, index){
				var filter = self.player._audioContext.createBiquadFilter();
				filter.type = 'peaking';
				filter.Q.value = 1;
				filter.frequency.value = frequency;
				filter.gain.value = 0;
				filter.index = index;
				filters.push( filter );
			});

			filters.reduce(function(prev, current){
				prev.connect(current);
				return current;
			});

			this.filters = filters;

			this.emit('equalizerInited');
			},
		_onToggle : function(){
			this.toggleMod('visible');
			this._setCords();
		},
		_onClickClose : function(){
			this.player._toggleEqualizer();
		},
		_setCords : function(){
			var playerElemWrapper = this.player.elem('wrapper'),
				playerElemWrapperOffset = playerElemWrapper.offset(),
				top = playerElemWrapperOffset.top,
				left = playerElemWrapperOffset.left + playerElemWrapper.width() + 10;

			this.domElem.css({ top : top, left : left});
		}
	}));
  
});