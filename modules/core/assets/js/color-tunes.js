	feather = function(pdata, width, x, y, p, color) {
		var idx;
		if (p < 0)
		  p = 0;
		if (p > 1)
		  p = 1;
		idx = (y * width + x) * 4;
		pdata[idx + 0] = p * pdata[idx + 0] + (1 - p) * color[0];
		pdata[idx + 1] = p * pdata[idx + 1] + (1 - p) * color[1];
		return pdata[idx + 2] = p * pdata[idx + 2] + (1 - p) * color[2];
	};
	
	var square = function(n) { return n * n; };
	var dist=function(a,b)
	{
		if(arguments.length>2)
		{
			var normalizedA=[];
			var normalizedB=[];
			for(var i=0;i<arguments.length;i++)
			{
				if(i>=arguments.length/2)
					normalizedB.push(arguments[i]);
				else
					normalizedA.push(arguments[i]);
			}
			a=normalizedA;
			b=normalizedB;
		}
		var result=0;
		for(var i=0;i<a.length;i++)
			result+=square(b[i] - a[i]);
		return Math.sqrt(result);
	} 
  var ColorTunes = {

    getColorMap : function(canvas, sx, sy, w, h, nc) {
      var index, indexBase, pdata, pixels, x, y, _i, _j, _ref, _ref1;
      if (nc == null) {
        nc = 8;
      }
      pdata = canvas.getContext("2d").getImageData(sx, sy, w, h).data;
      pixels = [];
      for (y = sy; y < sy + h; y++) {
        indexBase = y * w * 4;
        for (x = sx; x < sx + w; x++) {
          index = indexBase + (x * 4);
          pixels.push([pdata[index], pdata[index + 1], pdata[index + 2]]);
        }
      }
      return (new MMCQ).quantize(pixels, nc);
    },

    colorDist : function(a, b) {
      return dist(a,b);
    },

    fadeout : function(canvas, width, height, opa, color) {
      var idx, pdata, x, y, _i, _j;
      if (opa == null) {
        opa = 0.5;
      }
      if (color == null) {
        color = [0, 0, 0];
      }
      idata = canvas.getContext("2d").getImageData(0, 0, width, height);
      pdata = idata.data;
      for (y = _i = 0; 0 <= height ? _i < height : _i > height; y = 0 <= height ? ++_i : --_i) {
        for (x = _j = 0; 0 <= width ? _j < width : _j > width; x = 0 <= width ? ++_j : --_j) {
          idx = (y * width + x) * 4;
          pdata[idx + 0] = opa * pdata[idx + 0] + (1 - opa) * color[0];
          pdata[idx + 1] = opa * pdata[idx + 1] + (1 - opa) * color[1];
          pdata[idx + 2] = opa * pdata[idx + 2] + (1 - opa) * color[2];
        }
      }
      return canvas.getContext("2d").putImageData(idata, 0, 0);
    },

    feathering : function(canvas, width, height, size, color) {
      var idata, p, pdata, x, y;
      if (size == null) {
        size = 50;
      }
      if (color == null) {
        color = [0, 0, 0];
      }
	  
      idata = canvas.getContext("2d").getImageData(0, 0, width, height);
	  pdata=idata.data;
	  for(var y=0;y<height;y++)
	  {
		for (x = 0; x < width; x++)
		{
			if(y<size)
			{				
				p = y / size;
				if (x < size)
					p = 1 - dist(x, y, size, size) / size;
				else if(x>width-size)
					p = 1 - dist(x, y, width-size, size) / size;
				feather(pdata, width, x, y, p, color);
			}
			else if(x<size || x>width-size)
			{
				if(x<size)
					p = x / size;
				else
					p = (width-x)/size;
				feather(pdata, width, x, y, p, color);
			}
		  }
	  }
      return canvas.getContext("2d").putImageData(idata, 0, 0);
    },

    mirror : function(canvas, sy, height, color) {
      var idata, idx, idxu, p, pdata, width, x, y, _i, _j, _ref;
      if (color == null) {
        color = [0, 0, 0];
      }
      width = canvas.width;
      idata = canvas.getContext("2d").getImageData(0, sy - height, width, height * 2);
      pdata = idata.data;
      for (y = _i = height, _ref = height * 2; _i < _ref; y = _i += 1) {
        for (x = _j = 0; _j < width; x = _j += 1) {
          idx = (y * width + x) * 4;
          idxu = ((height * 2 - y) * width + x) * 4;
          p = (y - height) / height + 0.33;
          if (p > 1) {
            p = 1;
          }
          pdata[idx + 0] = (1 - p) * pdata[idxu + 0] + p * color[0];
          pdata[idx + 1] = (1 - p) * pdata[idxu + 1] + p * color[1];
          pdata[idx + 2] = (1 - p) * pdata[idxu + 2] + p * color[2];
          pdata[idx + 3] = 255;
        }
      }
      return canvas.getContext("2d").putImageData(idata, 0, sy - height);
    },

	redraw : function(image, canvas)
	{
		var bgColor, bgColorMap, bgPalette;
		canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.width);
		bgColorMap = ColorTunes.getColorMap(canvas, 0, 0, canvas.width, canvas.width, 4);
        bgPalette = bgColorMap.cboxes.map(function(cbox) {
          return {
            count: cbox.cbox.count(),
            rgb: cbox.color
          };
        });
        bgPalette.sort(function(a, b) {
          return b.count - a.count;
        });
        bgColor = bgPalette[0].rgb;
		if($(canvas).hasClass('artwork-fadeout'))
			ColorTunes.fadeout(canvas, canvas.width, canvas.height, 0.5, bgColor);
		if($(canvas).hasClass('artwork-mirror'))
			ColorTunes.mirror(canvas, canvas.width - 1, canvas.width, bgColor);
		if($(canvas).hasClass('artwork-feathering'))
			ColorTunes.feathering(canvas, canvas.width, canvas.height, canvas.width*0.1, bgColor);
		return bgColor;
	},
	
	rgbToCssString : function(color) {
	  return "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
	},
    launch : function(image, canvas, callback) {
      var bgColor, color, dist, fgColor, fgColor2, fgColorMap, fgPalette, maxDist, _i, _j, _len, _len1;
        bgColor = ColorTunes.redraw(image,canvas);
        fgColorMap = ColorTunes.getColorMap(canvas, 0, 0, canvas.width, canvas.height *0.8, 10);
        fgPalette = fgColorMap.cboxes.map(function(cbox) {
          return {
            count: cbox.cbox.count(),
            rgb: cbox.color
          };
        });
        fgPalette.sort(function(a, b) {
          return b.count - a.count;
        });
        maxDist = 0;
        for (_i = 0, _len = fgPalette.length; _i < _len; _i++) {
          color = fgPalette[_i];
          dist = ColorTunes.colorDist(bgColor, color.rgb);
          if (dist > maxDist) {
            maxDist = dist;
            fgColor = color.rgb;
          }
        }
        maxDist = 0;
        for (_j = 0, _len1 = fgPalette.length; _j < _len1; _j++) {
          color = fgPalette[_j];
          dist = ColorTunes.colorDist(bgColor, color.rgb);
          if (dist > maxDist && color.rgb !== fgColor) {
            maxDist = dist;
            fgColor2 = color.rgb;
          }
        }
		callback(ColorTunes.rgbToCssString(bgColor), ColorTunes.rgbToCssString(fgColor), ColorTunes.rgbToCssString(fgColor2));
    }
	};