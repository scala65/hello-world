/*
	Model containing lines containing points along a curve.
	Part of the InguzEQ plugin, http://inguzaudio.com/EQ/
	This file is licensed to you under the terms described in "Plugin.pm"

	Portions of the XAML UI liberally modified from "Jelly" samples by Richard Zadorozny,
		http://blogs.msdn.com/jstegman/archive/2007/06/18/jelly-source-code.aspx

	Copyright (c) 2006-2009 by Hugh Pyle, inguzaudio.com, and contributors.
*/


// A point @(f,g) in line l

Point = function(id,i,f,g,l)
{
	this.Type = "Point";
	this._id = id;
	this.Index = i;
	this.Freq = f;
	this.Gain = g;
	this.Line = l;
	this._selected = false;
}

// X coordinate, px
Point.prototype.X = function()
{
	return this.Line.Model.FtoX( this.Freq );
}

// Y coordinate, px
Point.prototype.Y = function( offsetGain )
{
	var o = offsetGain ? offsetGain : 0;
	return this.Line.Model.GtoY( this.Gain + o );
}

// Select it
Point.prototype.Select = function(b)
{
	this._selected = b;
}

// Hover over it
Point.prototype.Hover = function(b)
{
	if(this._hover != b)
	{
		var an;
		if(b)
		{
			// Animate the bubble-show
			an = this.Line.Model._sl.findName( 'esg_' + this._id );
		}
		else
		{
			// Animate the bubble-hide
			an = this.Line.Model._sl.findName( 'ess_' + this._id );
		}
		if(an)
		{
			an.begin();
		}
	}
	this._hover = b;
}

// Get the xaml representation
Point.prototype.ToXaml = function()
{
	var id = this._id;
	var aX = [];
	aX.push( "<Canvas>" );
	
	var pc = this._selected ? "0087ff" : (this._hover ? "00baff" : this.Line.Color);
	var ps = (this._hover || this._selected) ? "1.5" : "1.0";
	var vis = (this._hover || this._selected) ? 1 : 0;
	
	// A circle
	aX.push( '<Ellipse Name="' + id + '" Canvas.ZIndex="1"' );
	aX.push( ' Canvas.Left="' + (this.X()-4) + '" Canvas.Top="' + (this.Y()-4) + '"' );
	aX.push( ' StrokeThickness="8" Width="1" Height="1">' );
	aX.push( '<Ellipse.Stroke><SolidColorBrush Name="vf_' + id + '" Color="#' + pc + '" /></Ellipse.Stroke>' );

	// Transform used for scaling up/down later
	aX.push( '<Ellipse.RenderTransform>' );
	aX.push( '<ScaleTransform Name="est_' + id + '" CenterX="4" CenterY="4" ScaleX="' + ps + '" ScaleY="' + ps + '"/>' );
	aX.push( '</Ellipse.RenderTransform>' );
	
	aX.push( '</Ellipse>' );
	
	// hostpot around the point for hit-testing
	aX.push( '<Rectangle Name="hs_' + id + '" Canvas.ZIndex="5"' );
	aX.push( ' Canvas.Left="' + (this.X()-12) + '" Canvas.Top="' + (this.Y()-12) + '"' );
	aX.push( ' Width="24" Height="24" Fill="#00000000" MouseEnter="onSceneMouseEnter" MouseLeave="onSceneMouseLeave" MouseLeftButtonDown="onSceneMouseDown">' );
	
	// Position the text bubble depending on the location of the point
	// - If x is near the canvas right edge, we show to the left of the point
	// - If the next point is higher gain, or y is near the canvas top edge, we show below the point
	var dirx = 1;
	if( this.Line.Model.DimX - this.X() < 160 )
	{
		dirx = -1;
	}
	var diry = -1;
	if( this.Y() < 45 )
	{
		diry = 1;
	}
	else if( this.Line.Model.DimY - this.Y() < 120 )
	{
		diry = -1;
	}
	else
	{
		var nextpt = this.Line.GetPoint( parseInt(this.Index,10) + dirx );
		if( nextpt && nextpt.Y() < this.Y() )
		{
			diry = 1;
		}
	}
	
	var cx = (this.X()+(dirx*20));
	var cy = (this.Y()+(diry*20));
	
	// Animations
	aX.push( '<Rectangle.Resources>' );
	// Bubble-show animation
	aX.push( '<Storyboard Name="esg_' + id + '">' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="est_' + id + '" Storyboard.TargetProperty="ScaleX" To="1.5" Duration="0:0:0.07" />' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="est_' + id + '" Storyboard.TargetProperty="ScaleY" To="1.5" Duration="0:0:0.07" />' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="t_' + id + '" Storyboard.TargetProperty="Opacity" To="1" Duration="0:0:0.07" />' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="t_' + id + '" Storyboard.TargetProperty="(Canvas.Left)" From="' + cx + '" To="' + this.X() + '" Duration="0:0:0.1" />' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="t_' + id + '" Storyboard.TargetProperty="(Canvas.Top)" From="' + cy + '" To="' + this.Y() + '" Duration="0:0:0.1" />' );
	aX.push( '<ColorAnimation Storyboard.TargetName="vf_' + id + '" Storyboard.TargetProperty="Color" To="#00baff" Duration="0:0:0.1" />' );
	aX.push( '</Storyboard>' );
	// Bubble-hide animation
	aX.push( '<Storyboard Name="ess_' + id + '" Completed="doneShrink">' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="est_' + id + '" Storyboard.TargetProperty="ScaleX" To="1.0" Duration="0:0:0.2" />' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="est_' + id + '" Storyboard.TargetProperty="ScaleY" To="1.0" Duration="0:0:0.2" />' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="t_' + id + '" Storyboard.TargetProperty="Opacity" To="0" Duration="0:0:0.2" />' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="t_' + id + '" Storyboard.TargetProperty="(Canvas.Left)" To="' + cx + '" Duration="0:0:0.1" />' );
	aX.push( '<DoubleAnimation Storyboard.TargetName="t_' + id + '" Storyboard.TargetProperty="(Canvas.Top)" To="' + cy + '" Duration="0:0:0.1" />' );
	aX.push( '<ColorAnimation Storyboard.TargetName="vf_' + id + '" Storyboard.TargetProperty="Color" To="#' + this.Line.Color + '" Duration="0:0:0.1" />' );
	aX.push( '</Storyboard>' );
	aX.push( '</Rectangle.Resources>' );
	aX.push( '</Rectangle>' );


	// This is the bubble and text block
	var w = 42;
	var h = 16;
	var tc = "ffffff";
	var labelF = Math.round(this.Freq) + "Hz";
	var labelG = (this.Gain>0 ? "+" : "") + Math.round(this.Gain*100)/100 + "dB";
	aX.push( '<Canvas Name="t_' + id + '" Canvas.ZIndex="2" Canvas.Left="' + this.X() + '" Canvas.Top="' + this.Y() + '" Opacity="' + vis + '">' );
	
	aX.push( '<Path Name="p_' + id + '" Canvas.ZIndex="2" Stroke="#3a3a3a" StrokeThickness="1" Fill="#4a4a4a"' );
	aX.push( ' Data="M ' + (dirx*4) + ',' + (diry*4) + ' L ' + (dirx*10) + ' ' + (diry*10) );	// callout line
	aX.push( 'h ' + (dirx*(w+10)) + ' ' );
	aX.push( 'a 10,10 90 0 ' + ((dirx*diry)>0?1:0) + ' ' + (dirx*10) + ',' + (diry*10) + ' ' );
	aX.push( 'v ' + (diry*h) + ' ' );
	aX.push( 'a 10,10 90 0 ' + ((dirx*diry)>0?1:0) + ' ' + (-dirx*10) + ',' + (diry*10) + ' ' );
	aX.push( 'h ' + (-dirx*w) + ' ' );
	aX.push( 'a 10,10 90 0 ' + ((dirx*diry)>0?1:0) + ' ' + (-dirx*10) + ',' + (-diry*10) + ' ' );
	aX.push( 'v ' + (-diry*(h+10)) + ' ' );
	aX.push( 'z" />' );

	var tx  = (dirx > 0 ? 13 : -(w+27));
	var ty1 = (diry > 0 ? 27 : -(h+12));
	var ty2 = (diry > 0 ? 13 : -(h+26));
	aX.push( '<TextBlock Name="tf_' + id + '" FontSize="11" Text=" ' + labelF + '" Foreground="#' + tc + '"' );
	aX.push( ' Canvas.Left="' + tx + '" Canvas.Top="' + ty1 + '" Canvas.ZIndex="3" Opacity="1" />' );

	aX.push( '<TextBlock Name="tg_' + id + '" FontSize="11" Text=" ' + labelG + '" Foreground="#' + tc + '"' );
	aX.push( ' Canvas.Left="' + tx + '" Canvas.Top="' + ty2 + '" Canvas.ZIndex="3" Opacity="1" />' );
	aX.push( "</Canvas>" );
	
	aX.push( "</Canvas>" );
	return aX.join("");
}





// A line of points

Line = function(m,c,n,doPoints,data)
{
	this.Type = "Line";
	this.Model = m;
	this.Color = c;
	this.Name = n;
	this._data = [];
	this._doPoints = doPoints;
	
	// Walk the data
	var i = 0;
	for(var i in data)
	{
		var lfg = data[i];
		for(var j in lfg)
		{
			// F=frequency, g=gain
			var f = parseFloat(j);
			var g = parseFloat(lfg[j]);
			if( !isNaN(f) && !isNaN(g) )
			{
				var id = 'pt_' + this.Name + '_' + i;
				var pt = new Point(id, i, f, g, this);
				i++;
				this._data.push( pt );
			}
		}
	}
}

// Average gain (tbd: fix this, stupid idea)
Line.prototype.AverageG = function()
{
	var avg = 0;
	for( var p in this._data )
	{
		var pt = this._data[p];
		if( pt.Type && pt.Type=="Point" )
		{
			avg += pt.Gain;
		}
	}
	return avg / this._data.length;
}

// Max gain
Line.prototype.MaxG = function()
{
	var maxg = 0;
	for( var p in this._data )
	{
		var pt = this._data[p];
		if( pt.Type && pt.Type=="Point" )
		{
			var g = Math.abs(pt.Gain);
			if( g > maxg ) { maxg = g; }
		}
	}
	return maxg;
}

// Get the xaml representation
Line.prototype.ToXaml = function(offsetGain)
{
	var aX = [];
	
	aX.push( '<Canvas Name="line_' + this.Name + '" Canvas.ZIndex="' + (this._doPoints ? 10 : 0) + '">' );
	
	// Approximate the line segment using a cubic bezier
	// with control points halfway along the curve
	var path = [];
	var x = this.Model.FtoX(0);
	var y = 0;
	var xp = 0;
	var yp = 0;
	var x0 = 0;
	var first = true;
	for( var p in this._data )
	{
		var pt = this._data[p];
		if( pt.Type && pt.Type=="Point" )
		{
			xp = pt.X();
			yp = pt.Y(offsetGain);
			if(first)
			{
				y = yp;
				path.push( "M " + x + "," + y );
				first = false;
			}
			x0 =  x + ( (xp - x)/2 );
			path.push( "C " + x0 + "," + y + " " + x0 + "," + yp + " " + xp + "," + yp );
			x = xp;
			y = yp;
		}
	}
	// Add the last path-segment
	xp = this.Model.FtoX(100000);
	x0 =  x + ( (xp - x)/2 );
	path.push( "C " + x0 + "," + y + " " + x0 + "," + yp + " " + xp + "," + yp );
	// Make the path XML
	aX.push( '   <Path Stroke="#' + this.Color + '" StrokeThickness="1" Data="' + path.join(" ") + '" />' );
   
	if( this._doPoints )
	{
		// All my points
		for( var p in this._data )
		{
			var pt = this._data[p];
			if( pt.Type && pt.Type=="Point" )
			{
				aX.push( pt.ToXaml() );
			}
		}
	}

	// Put it all together
	aX.push( '</Canvas>' );
	return aX.join("\n");
}

// Get the number of points on the line
Line.prototype.GetLength = function()
{
	return this._data.length;
}

// Get the nth point
Line.prototype.GetPoint = function(n)
{
	if(n<0) return null;
	if(n>=this._data.length) return null;
	return this._data[n];
}

// Set the nth point
Line.prototype.SetPoint = function(n,pt)
{
	if(n<0) return false;
	if(n>=this._data.length) return false;
	this._data[n] = pt;

	// update the HTML
	var ctrl;
	ctrl = document.getElementById("gain_"+this.Name+"_"+n);
	if( ctrl )
	{
		ctrl.innerHTML = pt.Gain;
	}
	ctrl = document.getElementById("freq_"+this.Name+"_"+n);
	if( ctrl )
	{
		ctrl.innerHTML = pt.Freq;
	}

	return true;
}


// util: generic property-setter-factory for the Model class.
// If bPersist, this sets the property at the server too.
function setter( propname, minval, maxval )
{
	return function( val, bPersist, fnCallback )
	{
		if(typeof(maxval)=="number" && val>maxval) val=maxval;
		if(typeof(minval)=="number" && val<minval) val=minval;
		this["_"+propname] = val;
		// update the HTML
		var ctrl = document.getElementById("val_"+propname);
		if( ctrl )
		{
			ctrl.innerHTML = val;
		}
		// For combo-boxes
		ctrl = document.getElementById("sel_"+propname);
		if( ctrl )
		{
			for( var j=0; j<ctrl.options.length; j++ )
			{
				var el = ctrl.options[j];
				if( el.value==val && !el.selected )
				{
					el.selected = true;
				}
			}
		}
		if( bPersist )
		{
			// Save this value (async)
			new Ajax.Request('/jsonrpc.js', {
				method: 'post',
				asynchronous: true,
				postBody: Object.toJSON({
					id: 1, 
					method: 'slim.request', 
					params: [
						_scene._player, 
						[
							'inguzeq.setval',
							'key:'+propname,
							'val:'+val
						]
					]
				}),
				onFailure: function(response) { if( typeof fnCallback=="function" ) { fnCallback(false); } },
				onSuccess: function(response) { if( typeof fnCallback=="function" ) { fnCallback(true); } }
			});
		}
	}
}
// util: generic property-getter-factory for the Model class
function getter(propname)
{
	return function()
	{
		return this["_"+propname];
	}
}
// util: floating-point property-getter-factory for the Model class
function floatgetter(propname)
{
	return function()
	{
		return parseFloat(this["_"+propname]);
	}
}




// The whole model

Model = function(sl, scene)
{
	this._sl = sl;
	this._scene = scene;
	this.DimX = 800;
	this._offX = 20;
	this.DimY = 600;
	this._offY = 30;
	this._minF = 20;	// hertz
	this._maxF = 20000; // hertz
	this._log1 = Math.log(this._maxF);
	this._log0 = Math.log(this._minF);
	this._mulY = 1;
	this._y0 = ( this.DimY-this._offY )/2;
	this._G = 0;
	this._lines = {};

	// Dictionary of lists (rc & matrix filters, presets)
	this._Lists = {};

	this._Bands = 2;
	this._Matrix = "";
	this._Filter = "";
	this._Preset = "";
	this._Width = 0;
	this._Balance = 0;
	this._Skew = 0;
	this._Quietness = 0;
	this._Flatness = 10;

	this._nUpdates = 0;
}

// Number of bands of EQ
Model.prototype.GetBands     = getter("Bands");
Model.prototype.SetBands     = function( val, bPersist, fnCallback )
{
	// Set the value
	setter("Bands", 2, 31).apply(this, arguments);
	// Show/hide the HTML
	for(var j=0; j<31; j++)
	{
		var ctrl = document.getElementById("control_EQ_"+j);
		if(ctrl)
		{
			ctrl.style.display = (j<val) ? "" : "none";
		}
	}
}

// Filename of the matrix (crossfeed) filter
Model.prototype.GetMatrix    = getter("Matrix");
Model.prototype.SetMatrix    = setter("Matrix");

// Filename of the room-correction filter
Model.prototype.GetFilter    = getter("Filter");
Model.prototype.SetFilter    = function( val, bPersist, fnCallback )
{
	setter("Filter").apply(this, arguments);

	// Show flatness if there is a room-correction filter
	var ctrl = document.getElementById("control_Flatness");
	if(ctrl)
	{
		ctrl.style.display = (val==null || val=="" ||val=="-") ? "none" : "";
	}
}

// Load a preset
Model.prototype.SetPreset = setter("Preset");

// Save current settings as a new preset
Model.prototype.SetNewPreset = function(val, bPersist /* ignored, only for spurious consistency */, fnCallback )
{
	// Save this value (async)
	new Ajax.Request('/jsonrpc.js', {
		method: 'post',
		asynchronous: true,
		postBody: Object.toJSON({
			id: 1, 
			method: 'slim.request', 
			params: [
				_scene._player, 
				[
					'inguzeq.saveas',
					'preset:' + val,
				],
			]
		}),
		onFailure: function(response) { if( typeof fnCallback=="function" ) { fnCallback(false); } },
		onSuccess: function(response) { if( typeof fnCallback=="function" ) { fnCallback(true); } }
	});
}

// Ambisonic decode style
Model.prototype.GetAmb    = getter("Amb");
Model.prototype.SetAmb    = function( val, bPersist, fnCallback )
{
	setter("Amb").apply(this, arguments);

	// Show angle and directivity if this is Crossed or Crossed+jW
	var ctrl = document.getElementById("control_AmbAngle");
	if(ctrl)
	{
		ctrl.style.display = (val=="Crossed" || val=="Crossed+jW") ? "" : "none";
	}
	ctrl = document.getElementById("control_AmbDirect");
	if(ctrl)
	{
		ctrl.style.display = (val=="Crossed" || val=="Crossed+jW") ? "" : "none";
	}
	ctrl = document.getElementById("control_AmbjW");
	if(ctrl)
	{
		ctrl.style.display = (val=="Crossed+jW") ? "" : "none";
	}
}

// Array of filenames of all filters & presets
Model.prototype.GetLists = function(listType)
{
	return this._Lists[listType];
}
Model.prototype.SetList = function(listType, filterArray)
{
	this._Lists[listType] = filterArray;

	var currentValue = "";
	var getfn = "Get" + listType;
	if(typeof(this[getfn])=="function")
	{
		currentValue = this[getfn]();
	}

	// Set the HTML
	var ctrl = document.getElementById("sel_"+listType);
	if( ctrl )
	{
		ctrl.options.length = 0;
		var el = document.createElement('option');
		el.text = 'None';
		el.value = '-';
		try { ctrl.add(el, null); } catch(e) { ctrl.add(el); }
		for( var j=0; j<filterArray.length; j++ )
		{
			var s = filterArray[j];
			var el = document.createElement('option');
			el.value = s;
			el.text = s.replace(".wav", "", "i");
			el.selected = ( s==currentValue );
			try { ctrl.add(el, null); } catch(e) { ctrl.add(el); }
		}
	}

}

// The oher simple EQ properties
Model.prototype.GetWidth      = floatgetter("Width");
Model.prototype.SetWidth      = setter("Width", -9, 9);
Model.prototype.GetBalance    = floatgetter("Balance");
Model.prototype.SetBalance    = setter("Balance", -9, 9);
Model.prototype.GetSkew       = floatgetter("Skew");
Model.prototype.SetSkew       = setter("Skew", -100, 100);
Model.prototype.GetQuietness  = floatgetter("Quietness");
Model.prototype.SetQuietness  = setter("Quietness", 0, 10);
Model.prototype.GetFlatness   = floatgetter("Flatness");
Model.prototype.SetFlatness   = setter("Flatness", 0, 10);
Model.prototype.GetAmbAngle   = floatgetter("AmbAngle");
Model.prototype.SetAmbAngle   = setter("AmbAngle", 45, 150);
Model.prototype.GetAmbDirect  = floatgetter("AmbDirect");
Model.prototype.SetAmbDirect  = setter("AmbDirect", 0, 1);
Model.prototype.GetAmbjW      = floatgetter("AmbjW");
Model.prototype.SetAmbjW      = setter("AmbjW", 0, 1);
Model.prototype.GetAmbRotateZ = floatgetter("AmbRotateZ");
Model.prototype.SetAmbRotateZ = setter("AmbRotateZ", -90, 90);
Model.prototype.GetAmbRotateY = floatgetter("AmbRotateY");
Model.prototype.SetAmbRotateY = setter("AmbRotateY", -90, 90);
Model.prototype.GetAmbRotateX = floatgetter("AmbRotateX");
Model.prototype.SetAmbRotateX = setter("AmbRotateX", -90, 90);

// Bounds of the silverlight model (px)
Model.prototype.SetBounds = function(w, h)
{
	this.DimX = w;
	this.DimY = h;
	this._y0 = ( this.DimY-this._offY )/2;
}

// Add a new line to the model
Model.prototype.AddLine = function( linename, color, doPoints, data )
{
	if( data )
	{
		// Make a list for the data
		var line = new Line(this, color, linename, doPoints, data);
		this._lines[linename] = line;

		if( linename=="EQ" )
		{
			// set the HTML for the EQ values
			for( var j=0; j<line.GetLength(); j++ )
			{
				var pt = line.GetPoint(j);
				line.SetPoint( j, pt );
			}
		}

		return line;
	}
	return null;
}

// Get a single point, by ID
Model.prototype.GetPoint = function(id)
{
	var a = id.split("_");
	if( a.length==3 )
	{
		var s = a[1];
		var n = a[2];
		var line = this._lines[s];
		if(line)
		{
			return line.GetPoint(n);
		}
	}
	return null;
}

// Set a point
Model.prototype.SetPoint = function( id, pt, bPersist, fnCallback )
{
	var a = id.split("_");
	if( a.length==3 )
	{
		var s = a[1];
		var n = a[2];
		var line = this._lines[s];
		if(line)
		{
			if(s != "EQ")
			{
				alert("Can't SetPoint unless EQ"); return false;
			}
			var ok = line.SetPoint(n, pt);
			if(ok)
			{
				// Paint
				this.Refresh( line.Name );
			}

			if(ok && bPersist)
			{
				// Save this value (async)
				new Ajax.Request('/jsonrpc.js', {
					method: 'post',
					asynchronous: true,
					postBody: Object.toJSON({
						id: 1, 
						method: 'slim.request', 
						params: [
							_scene._player, 
							[
								'inguzeq.seteq',
								'band:'+pt.Index,
								'freq:'+pt.Freq,
								'gain:'+pt.Gain
							]
						]
					}),
					onFailure: function(response) { if( typeof fnCallback=="function" ) { fnCallback(false); } },
					onSuccess: function(response) { if( typeof fnCallback=="function" ) { fnCallback(true); } }
				});
			}
		}
	}
	return false;
}


// X axis is logarithmic.  Helpers convert Hz to px and vice versa
Model.prototype.XtoF = function(x)
{
	var logF = this._log0 + ((this._log1-this._log0) * (x - this._offX - 10) / (this.DimX-this._offX-20));
	return Math.round(Math.exp(logF));
}
Model.prototype.FtoX = function(f)
{
	if( f<this._minF ) return this._offX;
	if( f>this._maxF ) return this.DimX;
	var logF = Math.log(f);
	return this._offX + 10 + Math.round( (logF-this._log0) * (this.DimX-this._offX-20) / (this._log1-this._log0) );
}

// Y axis is linear (decibels).  Helpers convert dB to px and vice versa
// this._mulY is dB per px
Model.prototype.YtoG = function(y)
{
	return (this._y0 - y) * this._mulY;
}
Model.prototype.GtoY = function(g)
{
	return Math.round( this._y0 - (g / this._mulY) );
}

// Re-scale the axes to fit the data
Model.prototype.ScaleAxes = function()
{
	// - default X axis: logarithmic from 20 to 20000 (fixed)
	// - default Y axis: from -3 to +3 (may be pushed further, but always symmetrical about 0)
	// Return true if the axis scales changed
	var needRedraw = false;
	
	var eqGain = 0;
	var lieq = this._lines["EQ"];
	if( lieq ) eqGain = lieq.AverageG();

	var G = 3;
	for( var ln in this._lines )
	{
		var li = this._lines[ln];
		if( li.Type && li.Type=="Line" )
		{
			var g = li.MaxG() + ( ln=="EQ" ? 0 : eqGain - li.AverageG() );
			if(g > G)  { G = g; }
		}
	}
	G = Math.round(G+0.4999);
	if( G != this._G )
	{
		needRedraw = true;
		this._G = G;
	}
	return needRedraw;
}

// Get the xaml representation of the axes
Model.prototype.AxesXaml = function()
{
	if(!this._scene) return("");
	var xaml = "";
	var aX = [];
	
	this.ScaleAxes();
	
	var nTicks = 3;
	if( this._G>=8 ) nTicks = 4;
	var dTick = this._G / nTicks;		 // dB per tick
	var yTick = ( this._y0 - 10 ) / nTicks;  // px per tick. NB we add some leeway so the bounds don't quite hit the edges of our visible area
	this._mulY = dTick / yTick;	 // dB per px

	aX.push( '<Canvas Name="axes">' );
	aX.push( '   <Rectangle Width="' + this.DimX + '" Height="' + this.DimY + '" Fill="' + this._scene._colors["background"] + '" />' );
	
	// The vertical axis, +/-G, with ticks every one or few dB
	
	aX.push( '<Canvas Name="axisG">' );
	aX.push( '   <Rectangle Width="' + this._offX + '" Height="' + this.DimY + '" Fill="' + this._scene._colors["background"] + '" />' );
	aX.push( '   <Line X1="' + (this._offX-1) + '" X2="' + (this._offX-1) + '" Y1="0" Y2="' + this.DimY + '" Stroke="' + this._scene._colors["foreground"] + '" StrokeThickness="2" />' );
	for(var i=-nTicks; i<=nTicks; i++)
	{
		var dbY = i * dTick;	// dB represented by this tick
		var y = this.GtoY( dbY );
		dbY = Math.round(dbY*100)/100;
		var x1 = this._offX;
		var st = "0.2";
		var fi = this._scene._colors["lolight"];
		if(i==0)
		{
			// This center line doubles as the horizontal axis; make it heavier
			st = 1;
			fi = this._scene._colors["foreground"];
		}
		aX.push('   <Canvas Name="GLabel' + dbY + '" Canvas.Top="' + y + '">' );
		aX.push('   	<TextBlock Name="GLabelText' + dbY + '" Text="' + dbY + '" FontFamily="Verdana" FontSize="11" Canvas.Top="-6" Canvas.Left="' + (this._offX-8) +'" Foreground="' + this._scene._colors["foreground"] + '"/>' );
		aX.push('   	<Line X1="' + x1 + '" X2="' + this.DimX + '" Y1="0" Y2="0" Stroke="' + fi + '" StrokeThickness="' + st + '" />' );
		aX.push('   	<Path Fill="' + this._scene._colors["hilight"] + '" Data="M ' + (this._offX-1) + ',-4 l -4,4 4,4" />' );
		aX.push('   </Canvas>' );
	}
	aX.push( '</Canvas>' );
	
	// The horizontal axis, from 20Hz to 20kHz,
	// with lines at 20, 30, 40.. 100, 200, 300, ... 1000, 2000, 3000, ... 10000, 20000
	// (logarithmic scale)
	
	aX.push( '<Canvas Name="axisF">' );
	aX.push( '   <Rectangle Canvas.Top="' + (this.DimY-this._offY) + '" Width="' + this.DimX + '" Height="' + this._offY + '" Fill="' + this._scene._colors["background"] +'" />' );
	for(var n=1; n<5; n++)
	{
		for(var i=1; i<10; i++)
		{
		   var f = Math.round(i * Math.exp(n*Math.log(10)));
		   if(f>=this._minF && f<=this._maxF)
		   {
				var x = this.FtoX( f );
				var fl = f;
				if(fl>=1000) { fl=(fl/1000) + "k"; }
				aX.push('   <Canvas Name="FLabel' + f + '" Canvas.Left="' + x + '">' );
				if( i<=5 )
				{
					aX.push('   	<TextBlock Name="FLabelText' + f + '" Text="' + fl + '" FontFamily="Verdana" FontSize="11" Canvas.Top="' + ( this.DimY-this._offY+6 ) + '" Canvas.Left="8" Foreground="' + this._scene._colors["foreground"] + '">' );
					aX.push('   		<TextBlock.RenderTransform>');
					aX.push('   			<RotateTransform Angle="90" />');
					aX.push('   		</TextBlock.RenderTransform>');
					aX.push('   	</TextBlock>');
				}
				aX.push('   	<Line X1="0" X2="0" Y1="0" Y2="' + ( this.DimY-this._offY ) + '" Stroke="' + this._scene._colors["lolight"] + '" StrokeThickness="0.2" />' );
				aX.push('   	<Path Fill="' + this._scene._colors["hilight"] + '" Data="M -4,' + ( this.DimY-this._offY ) + ' l 4,4 4,-4" />' );
				aX.push('   </Canvas>' );
		   }
		}
	}
	aX.push( '</Canvas>' );

	// Put it all together
	aX.push( '</Canvas>' );
	
	xaml = aX.join("\n");
	return xaml;
}

// Fix the text alignment for the vertical axis (silverlight 1.0 doesn't have declarative text-alignment, need to fix it up after the text is drawn)
Model.prototype.CleanAxes = function( o )
{
	if( o.Name && o.Name.indexOf("GLabelText")==0 )
	{
		o["Canvas.Left"] = o["Canvas.Left"] - o.ActualWidth;
	}
	
	// Recurse
	if(o.ToString()=="Canvas")
	{
		for( var i=0; i<o.children.count; i++ )
		{
			this.CleanAxes( o.children.getItem(i) );
		}
	}
}

// Get the xaml for one line, wrapped in a canvas
Model.prototype.LineXaml = function(lineName, offsetGain)
{
	var aX = [];
	var line = this._lines[lineName];
	if(line)
	{
		aX.push( '<Canvas Name="data_' + lineName + '">' );
		aX.push( line.ToXaml(offsetGain) );
		aX.push( '</Canvas>' );
	}
	return aX.join("\n");
}

// Get the xaml for all lines
Model.prototype.LinesXaml = function()
{
	// Draw each line
	var eqGain = 0;
	var lieq = this._lines["EQ"];
	if( lieq ) eqGain = lieq.AverageG();
	var aX = [];
	aX.push( '<Canvas Name="data">' );
	for( var ln in this._lines )
	{
		var li = this._lines[ln];
		if( li.Type && li.Type=="Line" )
		{
			aX.push( this.LineXaml( ln, ln=="EQ" ? 0 : eqGain - li.AverageG() ) );
		}
	}
	
	// Put it all together
	aX.push( '</Canvas>' );
	
	xaml = aX.join("\n");
	return xaml;
}

// Draw the axes
Model.prototype.DrawAxes = function()
{
	if(!this._sl) return;
	if(!this._scene) return;
	var xaml;

	// Set colors
	var el;
	el = this._sl.findName( 'box' ); if(el) { el["Fill"]=this._scene._colors["background"]; el["Stroke"]=this._scene._colors["foreground"]; }
	el = this._sl.findName( 'ng1' ); if(el) { el["Stroke"]=this._scene._colors["foreground"]; }
	el = this._sl.findName( 'ng2' ); if(el) { el["Stroke"]=this._scene._colors["foreground"]; }
	el = this._sl.findName( 'tb1' ); if(el) { el["Foreground"]=this._scene._colors["foreground"]; }
	el = this._sl.findName( 'tb2' ); if(el) { el["Foreground"]=this._scene._colors["foreground"]; }

	// Move the logo
	var logo = this._sl.findName( 'inguzLogo' );
	if(logo)
	{
		logo["Canvas.Left"] = this.DimX - 45;
	}
	
	var axisArea = this._sl.findName( 'axisArea' );
	axisArea.children.clear();

	// Draw the axes
	xaml = this.AxesXaml();
	var axes = _control.content.createFromXaml( xaml );
	this.CleanAxes( axes );
	axisArea.children.add( axes );
}

// Draw the lines
Model.prototype.DrawLines = function()
{
	if( this.ScaleAxes() )
	{
		// Scale has changed; need to redraw the axes
		this.DrawAxes();
	}
	this.DrawLinesNoRescale();
}

Model.prototype.DrawLinesNoRescale = function()
{
	if(!this._sl) return;
	var graphArea = this._sl.findName( 'graphArea' );
	graphArea.children.clear();
	
	// Draw the lines (if we have any)
	var xaml = this.LinesXaml();
	var graph = _control.content.createFromXaml( xaml );
	graphArea.children.add( graph );
}

// Re-draw a line
Model.prototype.Refresh = function(lineName)
{
	if( !this._sl ) return;
	var eqGain = 0;
	if( lineName!="EQ" )
	{
		var lieq = this._lines["EQ"];
		if( lieq ) eqGain = lieq.AverageG();
	}
	var lx = this._sl.findName( 'data_' + lineName );
	if( lx )
	{
		lx.children.clear();
		var li = this._lines[lineName];
		if( li )
		{
			var xaml = li.ToXaml( lineName=="EQ" ? 0 : eqGain - li.AverageGain() );
			var line = _control.content.createFromXaml( xaml );
			lx.children.add( line );
		}
	}
}

// Paint
Model.prototype.Draw = function()
{
	this.DrawAxes();
	this.DrawLines();
}


// Refresh the list of filters, presets by ajax call to the server
Model.prototype.UpdateLists = function()
{
	var that = this;
	var updateList = function(listType, data)
	{
		var loop = data.result[ listType + "_loop" ];
		if( typeof loop=="object" )
		{
			var a = [];
			for( var j=0; j<loop.length; j++ )
			{
				a.push( loop[j][0] );
			}
			that.SetList( listType, a );
		}
	};

	new Ajax.Request('/jsonrpc.js', {
		method: 'post',
		asynchronous: false,
		postBody: Object.toJSON({
			id: 1, 
			method: 'slim.request', 
			params: [
				_scene._player, 
				[
					'inguzeq.filters'
				]
			]
		}),

		onFailure: function() { /* ignore */ },

		onSuccess: function(response) {
			// debugger;
			var data = response.responseText.evalJSON();
			updateList( "Filter", data );
			updateList( "Matrix", data );
			updateList( "Preset", data );
		}
	});
}

// Refresh the list of lines and points by ajax call to the server
Model.prototype.Update = function(fnCallback)
{
	// Occasionally, update the list of filters known to the server
	if( this._nUpdates % 10 == 1 )
	{
		this.UpdateLists();
	}

	this._nUpdates++;

	var that = this;
	new Ajax.Request('/jsonrpc.js', {
		method: 'post',
		asynchronous: true,
		postBody: Object.toJSON({
			id: 1, 
			method: 'slim.request', 
			params: [
				_scene._player, 
				[
					'inguzeq.current'
				]
			]
		}),

		onFailure: function() {
			// debugger;
			if( typeof(fnCallback)=="function" )
			{
				fnCallback();
			}
		},

		onSuccess: function(response) {
			// debugger;
			var data = response.responseText.evalJSON();

			// Set the model's values
			for(var d in data.result)
			{
				var setfn = "Set"+d;
				if(typeof(that[setfn])=="function")
				{
					var v = data.result[d];
					that[setfn](v);
				}
			}

// tbd: get all lines/loops and label them

			// The points loop
			that.AddLine( "Points", "30b020", false, data.result.Points_loop );

			// The EQ loop (last)
			var lineEQ = that.AddLine( "EQ", "192873", true, data.result.EQ_loop );

			that.DrawLines();

			if( typeof(fnCallback)=="function" )
			{
				fnCallback();
			}
		}
	});
}
