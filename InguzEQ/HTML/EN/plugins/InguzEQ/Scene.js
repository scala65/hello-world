/*
	Silverlight and HTML UI for displaying and editing curves
	Part of the InguzEQ plugin, http://inguzaudio.com/EQ/
	This file is licensed to you under the terms described in "Plugin.pm"

	Copyright (c) 2006-2009 by Hugh Pyle, inguzaudio.com, and contributors.
*/



var _sl = null;
var _control = null;
var _scene = null;
var _model = new Model();

var _s = null;
var _mX = 0;
var _mY = 0;
var _m = null;
var _logo = false;

// misc

var stdcolors = { "aliceblue": "#F0F8FF", "antiquewhite": "#FAEBD7", "aqua": "#00FFFF", "aquamarine": "#7FFFD4", "azure": "#F0FFFF", "beige": "#F5F5DC", "bisque": "#FFE4C4", "black": "#000000", "blanchedalmond": "#FFEBCD", "blue": "#0000FF", "blueviolet": "#8A2BE2", "brown": "#A52A2A", "burlywood": "#DEB887", "cadetblue": "#5F9EA0", "chartreuse": "#7FFF00", "chocolate": "#D2691E", "coral": "#FF7F50", "cornflower": "#6495ED", "cornsilk": "#FFF8DC", "crimson": "#DC143C", "cyan": "#00FFFF", "darkblue": "#00008B", "darkcyan": "#008B8B", "darkgoldenrod": "#B8860B", "darkgray": "#A9A9A9", "darkgreen": "#006400", "darkkhaki": "#BDB76B", "darkmagenta": "#8B008B", "darkolivegreen": "#556B2F", "darkorange": "#FF8C00", "darkorchid": "#9932CC", "darkred": "#8B0000", "darksalmon": "#E9967A", "darkseagreen": "#8FBC8B", "darkslateblue": "#483D8B", "darkslategray": "#2F4F4F", "darkturquoise": "#00CED1", "darkviolet": "#9400D3", "deeppink": "#FF1493", "deepskyblue": "#00BFFF", "dimgray": "#696969", "dodgerblue": "#1E90FF", "firebrick": "#B22222", "floralwhite": "#FFFAF0", "forestgreen": "#228B22", "fuchsia": "#FF00FF", "gainsboro": "#DCDCDC", "ghostwhite": "#F8F8FF", "gold": "#FFD700", "goldenrod": "#DAA520", "gray": "#808080", "green": "#008000", "greenyellow": "#ADFF2F", "honeydew": "#F0FFF0", "hotpink": "#FF69B4", "indianred": "#CD5C5C", "indigo": "#4B0082", "ivory": "#FFFFF0", "khaki": "#F0E68C", "lavender": "#E6E6FA", "lavenderblush": "#FFF0F5", "lawngreen": "#7CFC00", "lemonchiffon": "#FFFACD", "lightblue": "#ADD8E6", "lightcoral": "#F08080", "lightcyan": "#E0FFFF", "lightgoldenrodyellow": "#FAFAD2", "lightgreen": "#90EE90", "lightgray": "#D3D3D3", "lightpink": "#FFB6C1", "lightsalmon": "#FFA07A", "lightseagreen": "#20B2AA", "lightskyblue": "#87CEFA", "lightslategray": "#778899", "lightsteelblue": "#B0C4DE", "lightyellow": "#FFFFE0", "lime": "#00FF00", "limegreen": "#32CD32", "linen": "#FAF0E6", "magenta": "#FF00FF", "maroon": "#800000", "mediumaquamarine": "#66CDAA", "mediumblue": "#0000CD", "mediumorchid": "#BA55D3", "mediumpurple": "#9370DB", "mediumseagreen": "#3CB371", "mediumslateblue": "#7B68EE", "mediumspringgreen": "#00FA9A", "mediumturquoise": "#48D1CC", "mediumvioletred": "#C71585", "midnightblue": "#191970", "mintcream": "#F5FFFA", "mistyrose": "#FFE4E1", "moccasin": "#FFE4B5", "navajowhite": "#FFDEAD", "navy": "#000080", "oldlace": "#FDF5E6", "olive": "#808000", "olivedrab": "#6B8E23", "orange": "#FFA500", "orangered": "#FF4500", "orchid": "#DA70D6", "palegoldenrod": "#EEE8AA", "palegreen": "#98FB98", "paleturquoise": "#AFEEEE", "palevioletred": "#DB7093", "papayawhip": "#FFEFD5", "peachpuff": "#FFDAB9", "peru": "#CD853F", "pink": "#FFC0CB", "plum": "#DDA0DD", "powderblue": "#B0E0E6", "purple": "#800080", "red": "#FF0000", "rosybrown": "#BC8F8F", "royalblue": "#4169E1", "saddlebrown": "#8B4513", "salmon": "#FA8072", "sandybrown": "#F4A460", "seagreen": "#2E8B57", "seashell": "#FFF5EE", "sienna": "#A0522D", "silver": "#C0C0C0", "skyblue": "#87CEEB", "slateblue": "#6A5ACD", "slategray": "#708090", "snow": "#FFFAFA", "springgreen": "#00FF7F", "steelblue": "#4682B4", "tan": "#D2B48C", "teal": "#008080", "thistle": "#D8BFD8", "tomato": "#FF6347", "turquoise": "#40E0D0", "violet": "#EE82EE", "wheat": "#F5DEB3", "white": "#FFFFFF", "whitesmoke": "#F5F5F5", "yellow": "#FFFF00", "yellowgreen": "#9ACD32" };

function rgb(r,g,b)
{
	return "#" + (r+256).toString(16).substr(1) + (g+256).toString(16).substr(1) + (b+256).toString(16).substr(1);
}

function createDelegate(instance, method)
{
	return function()
	{
		return method.apply(instance, arguments);
	}
}


// Initialization


AgScene = function() 
{
	if(playerid && typeof(playerid)=="string")
	{
		this._player = playerid;
	}
	else
	{
		var p = document.getElementById('player');
		if(p) { this._player = p.value; }
	}
	this._colors = {};
	this.setColor("background", "#FFFFFF");
	this.setColor("foreground", "#000000");
	this.setColor("lolight", "#343434");
	this.setColor("hilight", "#7a7a7a");
};

AgScene.prototype.setColor = function(colorname, val)
{
	// validate the color
	var ok = false;
	if( typeof(val)!="string" ) return ok;
	if( val.charAt(0)=="#" )
	{
		ok = true;
	}
	else
	{
		if( stdcolors[val.toLowerCase()] )
		{
			val = stdcolors[val.toLowerCase()];
			ok = true;
		}
		else if(val.match(/^rgb\([0123456789,\.\s\t]*\)$/))
		{
			val = eval(val);
			ok = true;
		}
	}
	if(ok)
	{
		this._colors[colorname] = val;
	}
	else
	{
		// debugger;
	}
}

AgScene.prototype.onLoad = function(plugIn, userContext, rootElement)
{
	this.plugIn = plugIn;
	_control = plugIn;
	if( _control && _control.content )
	{
		_control.content.onResize = this.onResize;
	}
}
	
AgScene.prototype.onError = function(plugIn, userContext, rootElement)
{
	alert("oops");
}
	
AgScene.prototype.onResize =  function()
{
	if( _control && _control.content && _model )
	{
		var w = _control.content.ActualWidth;
		var h = _control.content.ActualHeight;
		_model.SetBounds(w,h);
		_model.Draw()
	}
}


function createSilverlightControl()
{
	_scene = new AgScene();
	var host = document.getElementById('SilverlightPlugInHost');
	if(host)
	{
		Silverlight.createObjectEx({
			source: 'Scene.xaml',
			parentElement: host,
			id: 'SilverlightPlugIn',
			properties: {
				width: '100%',
				height: '100%',
				isWindowless: 'false',
				version: '1.0'
			},
			events: {
				onError: createDelegate(_scene, _scene.onError),
				onLoad: createDelegate(_scene, _scene.onLoad)
			},		
			context: null 
		});
	}
}


function actualStyle(el,att)
{
	var s = "";
	if(el)
	{
		if( document.defaultView && document.defaultView.getComputedStyle )
		{
			// non-IE
			s = document.defaultView.getComputedStyle(el, "").getPropertyValue(att);
		}
		else if( el.currentStyle )
		{
			// IE
			s = el.currentStyle[att];
		}
	}
	return s;

}


function slLoaded(sender, eventArgs)
{
	// The silverlight model is loaded now
	_sl = sender;

	_scene.setColor("background", actualStyle(document.body, "backgroundColor"));
	_scene.setColor("foreground", actualStyle(document.body, "color"));
	_scene.setColor("lolight", actualStyle(document.getElementById("csniff1"), "backgroundColor"));
	_scene.setColor("hilight", actualStyle(document.getElementById("csniff1"), "color"));

	_model._sl = _sl;
	_model._scene = _scene;

	kickTimer();
}

function kickTimer()
{
	// Re-hover the previously hovered point, if any
	if(_s)
	{
		var id = _s.substr(_s.indexOf("_")+1); // pt_EQ_2, etc
		var pt = _model.GetPoint(id);
		if(pt)
		{
			pt.Hover(true);
		}
	}

	// start a timer to get data
	window.setTimeout( updateCurves, 2500);
}



// Timer loop


function updateCurves()
{
	if(_m)
	{
		// Dragging - don't refresh yet
		window.setTimeout( updateCurves, 1000 );
		return;
	}
	_model.Update( kickTimer );
}
	

// Event handlers



function onHTMLMouseOverBody()
{
	onSceneMouseUp();
}



function onSceneMouseEnter(sender, eventArgs)
{
	var s = sender.Name;
	var id = s.substr(s.indexOf("_")+1); // pt_EQ_2, etc
	var pt = _model.GetPoint(id);
	if(pt)
	{
		_s = s;
		pt.Hover(true);
	}
}

function onSceneMouseLeave(sender, eventArgs)
{
	if(_s)
	{
		var id = _s.substr(_s.indexOf("_")+1); // pt_EQ_2, etc
		var pt = _model.GetPoint(id);
		if(pt)
		{
			pt.Hover(false);
		}
	}
	_s = null;
}



function onSceneMouseDown(sender, eventArgs)
{
	_mX = eventArgs.getPosition(null).x;
	_mY = eventArgs.getPosition(null).y;
	_m = sender.Name;
	var id = _m.substr(_m.indexOf("_")+1); // pt_EQ_2, etc
	var pt = _model.GetPoint(id);
	if(pt)
	{
		pt.Select(true);
		_model.Refresh( pt.Line.Name );
	}
	if( _control && _control.content )
	{
		_control.content.Root.captureMouse();
	}
}

function onSceneMouseUp(sender, eventArgs)
{
	if(_m)
	{
		var id = _m.substr(_m.indexOf("_")+1); // pt_EQ_2, etc
		var a = id.split("_");
		var n = a[a.length-1];
		var pt = _model.GetPoint(id);
		if(pt)
		{
			pt.Select(false);
			// Round gain to tenths of a dB
			pt.Gain = Math.round(pt.Gain*10)/10;
			// Round freq to Hz
			pt.Freq = Math.round(pt.Freq);

			// Set the point,
			// and return status into the HTML element
			var el = document.getElementById( "control_EQ_" + n );
			_model.SetPoint( id, pt, true, function(bOK){highlightSetting(el, bOK)} );
		}
	}
	_m = null;
	if( _control && _control.content )
	{
		_control.content.Root.releaseMouseCapture();
	}
}

function onSceneMouseMove(sender, eventArgs)
{
	if(_m)
	{
		var id = _m.substr(_m.indexOf("_")+1); // pt_EQ_2, etc
		var pt = _model.GetPoint(id);
		var x = eventArgs.getPosition(null).x;
		var y = eventArgs.getPosition(null).y;
		_mX = x;
		_mY = y;
		if(pt)
		{
			if(eventArgs.Ctrl)
			{
				var f = _model.XtoF(x);
				// Validate bounds
				var n = parseInt(pt.Index,10);
				var p1 = pt.Line.GetPoint(n-1);
				var f1 = p1 ? (p1.Freq+5) : 20;
				var p2 = pt.Line.GetPoint(n+1);
				var f2 = p2 ? (p2.Freq-5) : 20000;
				if(f>=f1 && f<=f2)
				{
					pt.Freq = f;
				}
			}
			var g = _model.YtoG(y);
			pt.Gain = g<-20 ? -20 : ( g>20 ? 20 : g );
			_model.Refresh( pt.Line.Name );
		}
	}
}


function logoclick(sender, eventArgs)
{
	_logo = !_logo;
	_sl.findName( _logo ? 'anim1' : 'anim2' ).begin();
}

