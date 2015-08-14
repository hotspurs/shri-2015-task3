modules.define('id3parser', function(provide){

	var Reader = function(type) {
		this.type = type;
		this.size = null;
		this.file = null;
	};

	Reader.OPEN_FILE = 1;

	Reader.prototype.open = function(file, callback) {
		this.file = file;
		var self = this;
		this.size = this.file.size;
		callback();
	};

	Reader.prototype.read = function(length, position, callback) {
	  this.readFile(length, position, callback);
	};

	/*
	 * File API reader
	 */
	Reader.prototype.readFile = function(length, position, callback) {
		var slice = this.file.slice(position, position+length),
			fr = new FileReader();
		fr.onload = function(e) {
			callback(null, e.target.result);
		};
		fr.onerror = function(e) {
			callback('File read failed');
		};
		fr.readAsArrayBuffer(slice);
	};

	/*
	 * lib/dataview-extra.js
	 */
	DataView.prototype.getString = function(length, offset, raw) {
		offset = offset || 0;
		length = length || (this.byteLength - offset);
		if(length < 0) {
			length += this.byteLength;
		}
		var str = '';
		if(typeof Buffer !== 'undefined') {
			var data = [];
			for(var i = offset; i < (offset + length); i++) {
				data.push(this.getUint8(i));
			}
			return (new Buffer(data)).toString();
		} else {
			for(var i = offset; i < (offset + length); i++) {
				str += String.fromCharCode(this.getUint8(i));
			}
			if(raw) {
				return str;
			}
			return decodeURIComponent(unescape(str));
		}
	};

	DataView.prototype.getStringUtf16 = function(length, offset, bom) {
		offset = offset || 0;
		length = length || (this.byteLength - offset);
		var littleEndian = false,
			str = '',
			useBuffer = false;
		if(typeof Buffer !== 'undefined') {
			str = [];
			useBuffer = true;
		}
		if(length < 0) {
			length += this.byteLength;
		}
		if(bom) {
			var bomInt = this.getUint16(offset);
			if(bomInt === 0xFFFE) {
				littleEndian = true;
			}
			offset += 2;
			length -= 2;
		}
		for(var i = offset; i < (offset + length); i += 2) {
			var ch = this.getUint16(i, littleEndian);
			if((ch >= 0 && ch <= 0xD7FF) || (ch >= 0xE000 && ch <= 0xFFFF)) {
				if(useBuffer) {
					str.push(ch);
				} else {
					str += String.fromCharCode(ch);
				}
			} else if(ch >= 0x10000 && ch <= 0x10FFFF) {
				ch -= 0x10000;
				if(useBuffer) {
					str.push(((0xFFC00 & ch) >> 10) + 0xD800);
					str.push((0x3FF & ch) + 0xDC00);
				} else {
					str += String.fromCharCode(((0xFFC00 & ch) >> 10) + 0xD800) + String.fromCharCode((0x3FF & ch) + 0xDC00);
				}
			}
		}
		if(useBuffer) {
			return (new Buffer(str)).toString();
		} else {
			return decodeURIComponent(unescape(str));
		}
	};

	DataView.prototype.getSynch = function(num) {
		var out = 0,
			mask = 0x7f000000;
		while(mask) {
			out >>= 1;
			out |= num & mask;
			mask >>= 8;
		}
		return out;
	};

	DataView.prototype.getUint8Synch = function(offset) {
		return this.getSynch(this.getUint8(offset));
	};

	DataView.prototype.getUint32Synch = function(offset) {
		return this.getSynch(this.getUint32(offset));
	};

	/*
	 * Not really an int as such, but named for consistency
	 */
	DataView.prototype.getUint24 = function(offset, littleEndian) {
		if(littleEndian) {
			return this.getUint8(offset) + (this.getUint8(offset + 1) << 8) + (this.getUint8(offset + 2) << 16);
		}
		return this.getUint8(offset + 2) + (this.getUint8(offset + 1) << 8) + (this.getUint8(offset) << 16);
	};

	var id3 = function(opts, cb) {
		/*
		 * Initialise ID3
		 */
		var options = {
		};
		if(typeof window !== 'undefined' && window.File && opts instanceof window.File) {
			opts = {file: opts, type: id3.OPEN_FILE};
		}
		for(var k in opts) {
			options[k] = opts[k];
		}

		if(!options.file) {
			return cb('No file was set');
		}

		if(options.type === id3.OPEN_FILE) {
			if(typeof window === 'undefined' || !window.File || !window.FileReader || typeof ArrayBuffer === 'undefined') {
				return cb('Browser does not have support for the File API and/or ArrayBuffers');
			}
		}

		/*
		 * lib/genres.js
		 * Genre list
		 */

		var Genres = [
			'Blues',
			'Classic Rock',
			'Country',
			'Dance',
			'Disco',
			'Funk',
			'Grunge',
			'Hip-Hop',
			'Jazz',
			'Metal',
			'New Age',
			'Oldies',
			'Other',
			'Pop',
			'R&B',
			'Rap',
			'Reggae',
			'Rock',
			'Techno',
			'Industrial',
			'Alternative',
			'Ska',
			'Death Metal',
			'Pranks',
			'Soundtrack',
			'Euro-Techno',
			'Ambient',
			'Trip-Hop',
			'Vocal',
			'Jazz+Funk',
			'Fusion',
			'Trance',
			'Classical',
			'Instrumental',
			'Acid',
			'House',
			'Game',
			'Sound Clip',
			'Gospel',
			'Noise',
			'AlternRock',
			'Bass',
			'Soul',
			'Punk',
			'Space',
			'Meditative',
			'Instrumental Pop',
			'Instrumental Rock',
			'Ethnic',
			'Gothic',
			'Darkwave',
			'Techno-Industrial',
			'Electronic',
			'Pop-Folk',
			'Eurodance',
			'Dream',
			'Southern Rock',
			'Comedy',
			'Cult',
			'Gangsta Rap',
			'Top 40',
			'Christian Rap',
			'Pop / Funk',
			'Jungle',
			'Native American',
			'Cabaret',
			'New Wave',
			'Psychedelic',
			'Rave',
			'Showtunes',
			'Trailer',
			'Lo-Fi',
			'Tribal',
			'Acid Punk',
			'Acid Jazz',
			'Polka',
			'Retro',
			'Musical',
			'Rock & Roll',
			'Hard Rock',
			'Folk',
			'Folk-Rock',
			'National Folk',
			'Swing',
			'Fast  Fusion',
			'Bebob',
			'Latin',
			'Revival',
			'Celtic',
			'Bluegrass',
			'Avantgarde',
			'Gothic Rock',
			'Progressive Rock',
			'Psychedelic Rock',
			'Symphonic Rock',
			'Slow Rock',
			'Big Band',
			'Chorus',
			'Easy Listening',
			'Acoustic',
			'Humour',
			'Speech',
			'Chanson',
			'Opera',
			'Chamber Music',
			'Sonata',
			'Symphony',
			'Booty Bass',
			'Primus',
			'Porn Groove',
			'Satire',
			'Slow Jam',
			'Club',
			'Tango',
			'Samba',
			'Folklore',
			'Ballad',
			'Power Ballad',
			'Rhythmic Soul',
			'Freestyle',
			'Duet',
			'Punk Rock',
			'Drum Solo',
			'A Cappella',
			'Euro-House',
			'Dance Hall',
			'Goa',
			'Drum & Bass',
			'Club-House',
			'Hardcore',
			'Terror',
			'Indie',
			'BritPop',
			'Negerpunk',
			'Polsk Punk',
			'Beat',
			'Christian Gangsta Rap',
			'Heavy Metal',
			'Black Metal',
			'Crossover',
			'Contemporary Christian',
			'Christian Rock',
			'Merengue',
			'Salsa',
			'Thrash Metal',
			'Anime',
			'JPop',
			'Synthpop',
			'Rock/Pop'
		];


		/*
		 * lib/id3frame.js
		 * ID3Frame
		 */

		var ID3Frame = {};

		/*
		 * ID3v2.3 and later frame types
		 */
		ID3Frame.types = {
			/*
			 * Textual frames
			 */
			'TALB': 'album',
			'TBPM': 'bpm',
			'TCOM': 'composer',
			'TCON': 'genre',
			'TCOP': 'copyright',
			'TDEN': 'encoding-time',
			'TDLY': 'playlist-delay',
			'TDOR': 'original-release-time',
			'TDRC': 'recording-time',
			'TDRL': 'release-time',
			'TDTG': 'tagging-time',
			'TENC': 'encoder',
			'TEXT': 'writer',
			'TFLT': 'file-type',
			'TIPL': 'involved-people',
			'TIT1': 'content-group',
			'TIT2': 'title',
			'TIT3': 'subtitle',
			'TKEY': 'initial-key',
			'TLAN': 'language',
			'TLEN': 'length',
			'TMCL': 'credits',
			'TMED': 'media-type',
			'TMOO': 'mood',
			'TOAL': 'original-album',
			'TOFN': 'original-filename',
			'TOLY': 'original-writer',
			'TOPE': 'original-artist',
			'TOWN': 'owner',
			'TPE1': 'artist',
			'TPE2': 'band',
			'TPE3': 'conductor',
			'TPE4': 'remixer',
			'TPOS': 'set-part',
			'TPRO': 'produced-notice',
			'TPUB': 'publisher',
			'TRCK': 'track',
			'TRSN': 'radio-name',
			'TRSO': 'radio-owner',
			'TSOA': 'album-sort',
			'TSOP': 'performer-sort',
			'TSOT': 'title-sort',
			'TSRC': 'isrc',
			'TSSE': 'encoder-settings',
			'TSST': 'set-subtitle',
			/*
			 * Textual frames (<=2.2)
			 */
			'TAL': 'album',
			'TBP': 'bpm',
			'TCM': 'composer',
			'TCO': 'genre',
			'TCR': 'copyright',
			'TDY': 'playlist-delay',
			'TEN': 'encoder',
			'TFT': 'file-type',
			'TKE': 'initial-key',
			'TLA': 'language',
			'TLE': 'length',
			'TMT': 'media-type',
			'TOA': 'original-artist',
			'TOF': 'original-filename',
			'TOL': 'original-writer',
			'TOT': 'original-album',
			'TP1': 'artist',
			'TP2': 'band',
			'TP3': 'conductor',
			'TP4': 'remixer',
			'TPA': 'set-part',
			'TPB': 'publisher',
			'TRC': 'isrc',
			'TRK': 'track',
			'TSS': 'encoder-settings',
			'TT1': 'content-group',
			'TT2': 'title',
			'TT3': 'subtitle',
			'TXT': 'writer',
			/*
			 * URL frames
			 */
			'WCOM': 'url-commercial',
			'WCOP': 'url-legal',
			'WOAF': 'url-file',
			'WOAR': 'url-artist',
			'WOAS': 'url-source',
			'WORS': 'url-radio',
			'WPAY': 'url-payment',
			'WPUB': 'url-publisher',
			/*
			 * URL frames (<=2.2)
			 */
			'WAF': 'url-file',
			'WAR': 'url-artist',
			'WAS': 'url-source',
			'WCM': 'url-commercial',
			'WCP': 'url-copyright',
			'WPB': 'url-publisher',
			/*
			 * Comment frame
			 */
			'COMM': 'comments',
			/*
			 * Image frame
			 */
			'APIC': 'image',
			'PIC': 'image'
		};

		/*
		 * ID3 image types
		 */
		ID3Frame.imageTypes = [
			'other',
			'file-icon',
			'icon',
			'cover-front',
			'cover-back',
			'leaflet',
			'media',
			'artist-lead',
			'artist',
			'conductor',
			'band',
			'composer',
			'writer',
			'location',
			'during-recording',
			'during-performance',
			'screen',
			'fish',
			'illustration',
			'logo-band',
			'logo-publisher'
		];

		/*
		 * ID3v2.3 and later
		 */
		ID3Frame.parse = function(buffer, major, minor) {
			minor = minor || 0;
			major = major || 4;
			var result = {tag: null, value: null},
				dv = new DataView(buffer);
			if(major < 3) {
				return ID3Frame.parseLegacy(buffer);
			}
			var header = {
				id: dv.getString(4),
				type: dv.getString(1),
				size: dv.getUint32Synch(4),
				flags: [
					dv.getUint8(8),
					dv.getUint8(9)
				]
			};
			/*
			 * No support for compressed, unsychronised, etc frames
			 */
			if(header.flags[1] !== 0) {
				return false;
			}
			if(!header.id in ID3Frame.types) {
				return false;
			}
			result.tag = ID3Frame.types[header.id];
			if(header.type === 'T') {
				var encoding = dv.getUint8(10);
				/*
				 * TODO: Implement UTF-8, UTF-16 and UTF-16 with BOM properly?
				 */
				if(encoding === 0 || encoding === 3) {
					result.value = dv.getString(-11, 11);
				} else if(encoding === 1) {
					result.value = dv.getStringUtf16(-11, 11, true);
				} else if(encoding === 2) {
					result.value = dv.getStringUtf16(-11, 11);
				} else {
					return false;
				}
				if(header.id === 'TCON' && !!parseInt(result.value)) {
					result.value = Genres[parseInt(result.value)];
				}
			} else if(header.type === 'W') {
				result.value = dv.getString(-10, 10);
			} else if(header.id === 'COMM') {
				/*
				 * TODO: Implement UTF-8, UTF-16 and UTF-16 with BOM properly?
				 */
				var encoding = dv.getUint8(10),
					variableStart = 14, variableLength = 0;
				/*
				 * Skip the comment description and retrieve only the comment its self
				 */
				for(var i = variableStart;; i++) {
					if(encoding === 1 || encoding === 2) {
						if(dv.getUint16(i) === 0x0000) {
							variableStart = i + 2;
							break;
						}
						i++;
					} else {
						if(dv.getUint8(i) === 0x00) {
							variableStart = i + 1;
							break;
						}
					}
				}
				if(encoding === 0 || encoding === 3) {
					result.value = dv.getString(-1 * variableStart, variableStart);
				} else if(encoding === 1) {
					result.value = dv.getStringUtf16(-1 * variableStart, variableStart, true);
				} else if(encoding === 2) {
					result.value = dv.getStringUtf16(-1 * variableStart, variableStart);
				} else {
					return false;
				}
			} else if(header.id === 'APIC') {
				var encoding = dv.getUint8(10),
					image = {
						type: null,
						mime: null,
						description: null,
						data: null
					};
				var variableStart = 11, variableLength = 0;
				for(var i = variableStart;;i++) {
					if(dv.getUint8(i) === 0x00) {
						variableLength = i - variableStart;
						break;
					}
				}
				image.mime = dv.getString(variableLength, variableStart);
				image.type = ID3Frame.imageTypes[dv.getUint8(variableStart + variableLength + 1)] || 'other';
				variableStart += variableLength + 2;
				variableLength = 0;
				for(var i = variableStart;; i++) {
					if(dv.getUint8(i) === 0x00) {
						variableLength = i - variableStart;
						break;
					}
				}
				image.description = (variableLength === 0 ? null : dv.getString(variableLength, variableStart));
				image.data = buffer.slice(variableStart + 1);
				result.value = image;
			}
			return (result.tag ? result : false);
		};

		/*
		 * ID3v2.2 and earlier
		 */
		ID3Frame.parseLegacy = function(buffer) {
			var result = {tag: null, value: null},
				dv = new DataView(buffer),
				header = {
					id: dv.getString(3),
					type: dv.getString(1),
					size: dv.getUint24(3)
				};
			if(!header.id in ID3Frame.types) {
				return false;
			}
			result.tag = ID3Frame.types[header.id];
			if(header.type === 'T') {
				var encoding = dv.getUint8(7);
				/*
				 * TODO: Implement UTF-8, UTF-16 and UTF-16 with BOM properly?
				 */
				result.value = dv.getString(-7, 7);
				if(header.id === 'TCO' && !!parseInt(result.value)) {
					result.value = Genres[parseInt(result.value)];
				}
			} else if(header.type === 'W') {
				result.value = dv.getString(-7, 7);
			} else if(header.id === 'COM') {
				/*
				 * TODO: Implement UTF-8, UTF-16 and UTF-16 with BOM properly?
				 */
				var encoding = dv.getUint8(6);
				result.value = dv.getString(-10, 10);
				if(result.value.indexOf('\x00') !== -1) {
					result.value = result.value.substr(result.value.indexOf('\x00') + 1);
				}
			} else if(header.id === 'PIC') {
				var encoding = dv.getUint8(6),
					image = {
						type: null,
						mime: 'image/' + dv.getString(3, 7).toLowerCase(),
						description: null,
						data: null
					};
				image.type = ID3Frame.imageTypes[dv.getUint8(11)] || 'other';
				var variableStart = 11, variableLength = 0;
				for(var i = variableStart;; i++) {
					if(dv.getUint8(i) === 0x00) {
						variableLength = i - variableStart;
						break;
					}
				}
				image.description = (variableLength === 0 ? null : dv.getString(variableLength, variableStart));
				image.data = buffer.slice(variableStart + 1);
				result.value = image;
			}
			return (result.tag ? result : false);
		};

		/*
		 * lib/id3tag.js
		 * Parse an ID3 tag
		 */

		var ID3Tag = {};

		ID3Tag.parse = function(handle, callback) {
			var tags = {
					title: null,
					album: null,
					artist: null,
					year: null,
					v1: {
							title: null,
							artist: null,
							album: null,
							year: null,
							comment: null,
							track: null,
							version: 1.0
						},
					v2: {
							version: [null, null]
						}
				},
				processed = {
					v1: false,
					v2: false
				},
				process = function(err) {
					if(processed.v1 && processed.v2) {
						tags.title = tags.v2.title || tags.v1.title;
						tags.album = tags.v2.album || tags.v1.album;
						tags.artist = tags.v2.artist || tags.v1.artist;
						tags.year = tags.v1.year;
						callback(err, tags);
					}
				};
			/*
			 * Read the last 128 bytes (ID3v1)
			 */
			handle.read(128, handle.size - 128, function(err, buffer) {
				if(err) {
					return process('Could not read file');
				}
				var dv = new DataView(buffer);
				if(buffer.byteLength !== 128 || dv.getString(3, null, true) !== 'TAG') {
					processed.v1 = true;
					return process();
				}
				tags.v1.title = dv.getString(30, 3).replace(/(^\s+|\s+$)/, '') || null;
				tags.v1.artist = dv.getString(30, 33).replace(/(^\s+|\s+$)/, '') || null;
				tags.v1.album = dv.getString(30, 63).replace(/(^\s+|\s+$)/, '') || null;
				tags.v1.year = dv.getString(4, 93).replace(/(^\s+|\s+$)/, '') || null;
				/*
				 * If there is a zero byte at [125], the comment is 28 bytes and the remaining 2 are [0, trackno]
				 */
				if(dv.getUint8(125) === 0) {
					tags.v1.comment = dv.getString(28, 97).replace(/(^\s+|\s+$)/, '');
					tags.v1.version = 1.1;
					tags.v1.track = dv.getUint8(126);
				} else {
					tags.v1.comment = dv.getString(30, 97).replace(/(^\s+|\s+$)/, '');
				}
				/*
				 * Lookup the genre index in the predefined genres array
				 */
				tags.v1.genre = Genres[dv.getUint8(127)] || null;
				processed.v1 = true;
				process();
			});
			/*
			 * Read 14 bytes (10 for ID3v2 header, 4 for possible extended header size)
			 * Assuming the ID3v2 tag is prepended
			 */
			handle.read(14, 0, function(err, buffer) {
				if(err) {
					return process('Could not read file');
				}
				var dv = new DataView(buffer),
					headerSize = 10,
					tagSize = 0,
					tagFlags;
				/*
				 * Be sure that the buffer is at least the size of an id3v2 header
				 * Assume incompatibility if a major version of > 4 is used
				 */
				if(buffer.byteLength !== 14 || dv.getString(3, null, true) !== 'ID3' || dv.getUint8(3) > 4) {
					processed.v2 = true;
					return process();
				}
				tags.v2.version = [
					dv.getUint8(3),
					dv.getUint8(4)
				];
				tagFlags = dv.getUint8(5);
				/*
				 * Do not support unsynchronisation
				 */
				if((tagFlags & 0x80) !== 0) {
					processed.v2 = true;
					return process();
				}
				/*
				 * Increment the header size to offset by if an extended header exists
				 */
				if((tagFlags & 0x40) !== 0) {
					headerSize += dv.getUint32Synch(11);
				}
				/*
				 * Calculate the tag size to be read
				 */
				tagSize += dv.getUint32Synch(6);
				handle.read(tagSize, headerSize, function(err, buffer) {
					if(err) {
						processed.v2 = true;
						return process();
					}
					var dv = new DataView(buffer),
						position = 0;
					while(position < buffer.byteLength) {
						var frame,
							slice,
							frameBit,
							isFrame = true;
						for(var i = 0; i < 3; i++) {
							frameBit = dv.getUint8(position + i);
							if((frameBit < 0x41 || frameBit > 0x5A) && (frameBit < 0x30 || frameBit > 0x39)) {
								isFrame = false;
							}
						}
						if(!isFrame) break;
						/*
						 * < v2.3, frame ID is 3 chars, size is 3 bytes making a total size of 6 bytes
						 * >= v2.3, frame ID is 4 chars, size is 4 bytes, flags are 2 bytes, total 10 bytes
						 */
						if(tags.v2.version[0] < 3) {
							slice = buffer.slice(position, position + 6 + dv.getUint24(position + 3));
						} else {
							slice = buffer.slice(position, position + 10 + dv.getUint32Synch(position + 4));
						}
						frame = ID3Frame.parse(slice, tags.v2.version[0]);
						if(frame) {
							tags.v2[frame.tag] = frame.value;
						}
						position += slice.byteLength;
					}
					processed.v2 = true;
					process();
				});
			});
		};

		/*
		 * Read the file
		 */

		var handle = new Reader(options.type);

		handle.open(options.file, function(err) {
			if(err) {
				return cb('Could not open specified file');
			}
			ID3Tag.parse(handle, function(err, tags) {
				cb(err, tags);
			});
		});
	};

	id3.OPEN_FILE = Reader.OPEN_FILE;

	provide({
		getMetaData : id3
	})

});
modules.define('loader', ['i-bem__dom', 'id3parser'], function(provide, BEMDOM, id3parser){

    provide( BEMDOM.decl(this.name, {
        onSetMod : {
            js : {
                inited : function(){
                    console.log('loader inited');
                    this._checkSupportFormats();
                }
            }
        },
        _onFileChange : function(e){
            var files = e.target.files;
            this._loadFiles(files);
        },
        _onDropZoneDrop : function(e){
            var files = e.originalEvent.dataTransfer.files;
            e.stopPropagation();
            e.preventDefault();
            this._loadFiles(files);
        },
        _onDropZoneDragOver : function(e){
            e.stopPropagation();
            e.preventDefault();        
        },
        _checkSupportFormats : function(){
            var audioElem = document.createElement('audio'),
                formats = { mp3 : false, wav : false, ogg : false, mp4 : false };

            formats.mp3 = !!(audioElem.canPlayType && audioElem.canPlayType('audio/mp3;').replace(/no/, ''));
            formats.wav = !!(audioElem.canPlayType && audioElem.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
            formats.ogg = !!(audioElem.canPlayType && audioElem.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
            formats.mp4 = !!(audioElem.canPlayType && audioElem.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, ''));
            this.supportFormats = formats;
        },
        _getFileExtension : function(file){
            var arr = file.name.split('.');
            return arr[arr.length-1];
        },
        _loadFiles : function(files){
            var self = this;

            for(var i = 0; i < files.length; i++){
                
                (function(i){
                    var reader = new FileReader(),
                        title,
                        artist,
                        file = files[i];


                    if( !self.supportFormats[ self._getFileExtension(file) ]){
                        alert("Format is not supported");
                        return;
                    }

                    reader.onload = function(e){
                        var data = e.target.result;
                        self.emit('load', { buffer : data, artist : artist, title : title });
                    };

                    reader.onerror = function(e) {
                        callback('File read failed');
                    };

                    id3parser.getMetaData(file, function(err, tags){
                        title = tags.title || file.name;
                        artist = tags.artist || "";
                        reader.readAsArrayBuffer(file);
                    });

                })(i);
            }
        }
    },
    {
        live : function(){
            this.liveBindTo('file', 'change', function(e){
                this._onFileChange(e);
            });

            this.liveBindTo('drop-zone', 'drop', function(e){
                this._onDropZoneDrop(e);
                this.delMod(this.elem('drop-zone'), 'over');
            });

            this.liveBindTo('drop-zone', 'dragover', function(e){
                this._onDropZoneDragOver(e);
            });

            this.liveBindTo('drop-zone', 'dragenter', function(e){
                this.setMod(this.elem('drop-zone'), 'over');
            });

            this.liveBindTo('drop-zone', 'dragleave', function(e){
                this.delMod(this.elem('drop-zone'), 'over');
            });
        }
    }
    ));
});
modules.define('indicator', ['i-bem__dom'], function(provide, BEMDOM){

	provide( BEMDOM.decl(this.name, {
		onSetMod : {
			js : {
				inited : function(){

				}
			}
		},
		_onActive : function(){
			this.active = true;
			this.setMod('active');
		},
		_setCurrentWidth : function(value){
		    this.elem('current').width(value+'%');
		}
		},{
		live : function(){
			this.liveBindTo('click', function(e){
			    if(this.active)
			       this._onClick(e);
			});
			return false;
		}
	}));

});


modules.define('indicator', function(provide, indicator){

	provide(indicator.decl({ modName : 'type', modVal : 'time'}, {
		onSetMod : {
			js : {
				inited : function(){
					console.log('Init indicator time');
					this._width = this.domElem.width();
					this.value = 0;
					this.active = false;
					this.findBlockOutside('player').on('indicatorActive',this._onActive, this);
					this.findBlockOutside('player').on('onProgress', this._onProgress, this);
				}
			}
		},
		_onClick : function(e){
		    this.value = Math.round( (e.offsetX / this._width) * 100);
		    this._setCurrentWidth(this.value);
		    this.emit('changeTime', { value : this.value});
		},
		_onProgress : function(e, data){
			this._setCurrentWidth(data.value);
		}
	}));

});

modules.define('indicator', function(provide, indicator){

	provide(indicator.decl({ modName : 'type', modVal : 'volume'}, {
		onSetMod : {
			js : {
				inited : function(){
					console.log('Init indicator volume');
					this._width = this.domElem.width();
					this.value = 0;
					this.active = false;
					this.findBlockOutside('player').on('indicatorActive',this._onActive, this);
				}
			}
	},
	_onClick : function(e){
		this.value = Math.round( (e.offsetX / this._width) * 100);
		this._setCurrentWidth(this.value);
		this.emit('changeVolume', { value : this.value});
	},
	_onActive : function(){
		this.active = true;
		this.setMod('active');
		this.emit('changeVolume', { value : 50});
		this._setCurrentWidth(50);
	}
	}));

});


modules.define('player', ['i-bem','i-bem__dom'], function(provide, BEM, BEMDOM){

	function getAudioContext(){
		if(typeof AudioContext !== 'undefined'){
	  		return new AudioContext();
		}
		else if(typeof webkitAudioContext !== 'undefined'){
			return new webkitAudioContext();
		}
		else if(typeof mozAudioContext !== 'undefined'){
			return mozAudioContext();
		}
		else{
			throw new Error('AudioContext not supported');
		}
	}

	provide(BEMDOM.decl(this.name, {
		onSetMod: {
			js: {
                inited: function() {
					console.log('Player inited');
					this._audioContext = getAudioContext();
					this._analyser = this._audioContext.createAnalyser();
					this._gain = this._audioContext.createGain();
					this._settingAnalyser();
					this._playList = [];
					this._isPlaying = false;
					this.visualizator = this.findBlockInside('visualizator');
					this.equalizer = this.findBlockInside('equalizer');
					this.elem('wrapper').draggable({ cancel: '.player__action, .player__progress, .player__time, .player__volume, .player__icon', stack:'div'});
					this.elem('wrapper').css( { top : this.domElem.height() /2 - this.elem('wrapper').height() / 2, 
					left : this.domElem.width() /2 - this.elem('wrapper').width() / 2, opacity : 1} );
					this.findBlocksInside('indicator')[1].on('changeTime', this._onChangeProgress, this );
					this.findBlocksInside('indicator')[0].on('changeVolume', this._onChangeVolume, this );
					this.findBlockInside('equalizer').on('equalizerInited', this._onEqualizerInited, this);
					this.bindTo( this.elem('icon', 'visualizator'), 'click', this._toggleVisualizator );
					this.bindTo( this.elem('icon', 'equalizer'), 'click', this._toggleEqualizer );
					this.emit('playerInited');
				}
			}
		},
        _onChangeVolume : function(e, data){
			this._gain.gain.value = data.value/100;
			console.log('Volume ',this._gain.gain.value);
        },
        _onEqualizerInited : function(){
			this.equalizer.filters[this.equalizer.filters.length - 1].connect(this._analyser);
			this._analyser.connect(this._gain);
			this._gain.connect(this._audioContext.destination);
        },
        _settingAnalyser : function(){
			this._analyser.minDecibels = -140;
			this._analyser.maxDecibels = 0;
			this._analyser.smothngTimeConstant = 0;
			this._analyser.fftSize = 1024;
			this._freqs = new Uint8Array(this._analyser.frequencyBinCount);
        },
        _toggleVisualizator : function(){
			if( this.hasMod( this.elem('icon', 'visualizator'), 'inited' ) ){
				this.toggleMod( this.elem('icon', 'visualizator'), 'active' );
				this.emit('toggleVisualizator');
			}
        },
        _toggleEqualizer : function(){
			if(this.hasMod( this.elem('icon', 'equalizer'), 'inited' )){
				this.toggleMod( this.elem('icon', 'equalizer'), 'active' );
				this.emit('toggleEqualizer');            
			}
        },
        _onChangeProgress : function(e, data){
			this._currentSongTime =  this._playList[this._currentSong].buffer.duration / 100 * data.value;
			if(this._isPlaying){
				this.stop();
				this.play();
			}
        },
        _decodeAndSaveBuffer : function(data){
			console.log('DecodeAudioData.... ');
			var startDecodeTime = +new Date();
			var self = this;
			this.setMod(this.elem('spiner'), 'visible');

			this._audioContext.decodeAudioData(data.buffer, function(buffer){
				var endDecodeTime = +new Date();
				console.log('Total decode time', (endDecodeTime - startDecodeTime) / 1000 );
				self._playList.push( { title : data.title, artist : data.artist, buffer : buffer } );
				self.delMod(self.elem('spiner'), 'visible');
				if(!self._source && self._playList.length === 1){
					self._createBufferSource();
					self._setAtIndex(0);
					self.emit('indicatorActive');
					self.setMod(self.elem('icon'), 'inited');
				}
			},function(e){
				self.delMod(self.elem('spiner'), 'visible');
				alert('Error with decoding audio data. Try another file =(');
				console("Error with decoding audio data" + e.err);
			}
			);
        },
        _createBufferSource : function(){
			this._source = this._audioContext.createBufferSource();
			this._source.connect(this.equalizer.filters[0]);
        },
        _setTime : function(duration){
			var roudDuration = Math.round(duration),
			    minutes = Math.floor(roudDuration / 60),
			    seconds = roudDuration % 60;
			if(minutes < 10) minutes = '0'+minutes;
			if(seconds < 10) seconds = '0'+seconds; 
			this.elem('time').text(minutes+':'+seconds);
        },
        _setSongInfo : function(song){
			var separator = song.artist ? ' - ' : '';
			this.elem('song-info').text(song.title + separator + song.artist);
        },
        _onSongEnd : function(){
			this._isPlaying = false;
			this._source =  null;
			this.toggleMod(this.elem('action'),'stop');
			this._currentSongTime = 0.0;
			this.emit('onProgress', { value : 0 });
			setTimeout( this.visualizator.clear.bind(this.visualizator), 50 );
        },
        play : function(){
			console.log('PLAY');
			var self = this;
			this._isPlaying = true;
			this._currentSongStartTime = this._audioContext.currentTime;

			if(!this._source){
				this._createBufferSource();
				this._setAtIndex(this._currentSong);
			}

			this.rafTimer = requestAnimationFrame(this.visualizator.draw.bind(this.visualizator));

			this._source.start( this._audioContext.currentTime, this._currentSongTime );

			this.progressTimer = setInterval(function(){
				var currentTime = (self._audioContext.currentTime - self._currentSongStartTime ) + self._currentSongTime;
				var value = Math.round( (currentTime / self._playList[self._currentSong].buffer.duration)*100 );
				console.log('Value', value);
				self.emit('onProgress', { value : value });
			}, 1000);

			this.endOfSongTimer = setTimeout(function(){
				clearInterval(self.progressTimer);
				self._onSongEnd();
			}, Math.round( self._playList[self._currentSong].buffer.duration - self._currentSongTime)* 1000  );
           
        },
        stop : function(){
			console.log('STOP');
			cancelAnimationFrame(this.rafTimer);
			cancelAnimationFrame(this.visualizator.rAfTimer);
			this.rafTimer = null;
			clearInterval(this.progressTimer);
			clearTimeout(this.endOfSongTimer);
			this._currentSongTime += (this._audioContext.currentTime - this._currentSongStartTime);
			console.log('Текущие время песни ', this._currentSongTime);
			this._source.stop(0);
			this._isPlaying = false;
			this._source =  null;
        },
        _setAtIndex : function(index){
			var song = this._playList[index];
			this._source.buffer = song.buffer;
			this._currentSong = index;
			this._setTime(song.buffer.duration);
			this._setSongInfo(song);
        },
        _currentSongStartTime : 0.0,
        _currentSong : null,
        _currentSongTime : 0.0
    },
    {
      live : function(){
		var self = this;

		this.liveInitOnBlockInsideEvent('load', 'loader', function(e, data){
			this._decodeAndSaveBuffer(data);
		});

		this.liveBindTo('action', 'click', function(e){
			if(this._playList.length === 0) return;
			if(this._isPlaying) this.stop();
			else this.play();
			this.toggleMod(this.elem('action'),'stop');
		});

		return false; 
      }
    }
    ));

});
modules.define('visualizator', ['i-bem','i-bem__dom'], function(provide, BEM, BEMDOM){
  
	provide(BEMDOM.decl(this.name, {
			onSetMod : {
				js : {
					inited : function(){
						console.log('Visualizator inited');
						this.player = this.findBlockOutside('player');
						this._canvas = this.elem('canvas')[0];
						BEM.blocks.player.on('toggleVisualizator', this._onToggle, this);
						this.domElem.draggable({stack:'div'});
						this.bindTo( this.elem('close'), 'click', this._onClickClose );
						this.outerWidth = this.domElem.outerWidth();
					}
				}
		},
		draw : function(){
			var width,
				canvasheight,
				canvasWidth,
				drawContext = this._canvas.getContext('2d');
				canvasWidth = this._canvas.width = 220;
				canvasheight = this._canvas.height = 196;
				this.player._analyser.getByteFrequencyData(this.player._freqs);
				width = Math.floor(1/this.player._freqs.length,10);

			for(var i = 0; i < this.player._analyser.frequencyBinCount; i++){
				var value = this.player._freqs[i],
					percent = value / 256,
					height = canvasheight * percent,
					offset = canvasheight - height - 1,
					barWidth = canvasWidth / this.player._analyser.frequencyBinCount,
					hue = i / this.player._analyser.frequencyBinCount * 360;
					drawContext.fillStyle = 'hsl('+ hue + ', 100%, 50%)';
					drawContext.fillRect(i * barWidth, offset, barWidth, height);
			}
			
			if(this.player._isPlaying){
				this.rAfTimer = requestAnimationFrame(this.draw.bind(this));
			}
		},
		clear : function(){
			console.log('Clear');
			this._canvas.getContext('2d').clearRect(0, 0, this._canvas.width, this._canvas.height);
		},
		_onToggle : function(){
			this.toggleMod('visible');
			this._setCords();
		},
		_onClickClose : function(){
			this.player._toggleVisualizator();
		},
		_setCords : function(){
			var playerElemWrapper = this.player.elem('wrapper'),
			playerElemWrapperOffset = playerElemWrapper.offset(),
			top = playerElemWrapperOffset.top,
			left = playerElemWrapperOffset.left - this.outerWidth - 10;
			this.domElem.css({ top : top, left : left});
		}
	}));

});
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
modules.require(['i-bem__dom_init', 'jquery', 'next-tick'],  function(init, $, nextTick) {

	$(function() {
		nextTick(init);
	});
	
});
